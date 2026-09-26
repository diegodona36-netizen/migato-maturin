/**
 * MIGATO AudioIntel - Procesador DSP de Audio en Navegador (Web Audio API)
 * Filtra saturación, de-clipping, elimina zumbidos y calcula métricas de salud del audio.
 */

class MigatoAudioFilter {
  constructor() {
    this.audioCtx = null;
    this.sourceNode = null;
    this.compressorNode = null;
    this.highpassNode = null;
    this.gainNode = null;
    this.analyserNode = null;
    this.audioBuffer = null;
    this.filteredBuffer = null;
    this.isPlaying = false;
    this.saturationStats = {
      clippedSamples: 0,
      totalSamples: 0,
      saturationPercentage: 0,
      peakDb: -Infinity,
      rmsDb: -Infinity
    };
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  async loadAudioFile(file) {
    this.initContext();
    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    this.analyzeSaturation();
    return this.saturationStats;
  }

  analyzeSaturation() {
    if (!this.audioBuffer) return;
    const channelData = this.audioBuffer.getChannelData(0);
    const total = channelData.length;
    let clipped = 0;
    let sumSquares = 0;
    let maxPeak = 0;

    for (let i = 0; i < total; i++) {
      const val = Math.abs(channelData[i]);
      if (val > maxPeak) maxPeak = val;
      if (val >= 0.96) {
        clipped++;
      }
      sumSquares += val * val;
    }

    const rms = Math.sqrt(sumSquares / total);
    this.saturationStats = {
      clippedSamples: clipped,
      totalSamples: total,
      saturationPercentage: Number(((clipped / total) * 100).toFixed(2)),
      peakDb: maxPeak > 0 ? Number((20 * Math.log10(maxPeak)).toFixed(1)) : -60,
      rmsDb: rms > 0 ? Number((20 * Math.log10(rms)).toFixed(1)) : -60,
      durationSeconds: Math.round(this.audioBuffer.duration),
      channels: this.audioBuffer.numberOfChannels,
      sampleRate: this.audioBuffer.sampleRate
    };
    return this.saturationStats;
  }

  setupFilterPipeline(destination = null) {
    this.initContext();
    const dest = destination || this.audioCtx.destination;

    // 1. Filtro Pasa-Altos (85 Hz) para eliminar golpes de mesa y zumbidos de baja frecuencia
    this.highpassNode = this.audioCtx.createBiquadFilter();
    this.highpassNode.type = 'highpass';
    this.highpassNode.frequency.value = 85;
    this.highpassNode.Q.value = 0.707;

    // 2. Compresor y Limitador Dinámico (De-Clipping & Anti-Saturación)
    this.compressorNode = this.audioCtx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -18; // dB
    this.compressorNode.knee.value = 12; // dB
    this.compressorNode.ratio.value = 10; // Rango de compresión fuerte para picos
    this.compressorNode.attack.value = 0.003; // Segundos (ultrarrápido para frenar distorsión)
    this.compressorNode.release.value = 0.15; // Segundos

    // 3. Normalizador de Ganancia
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 1.35; // Compensación de ganancia para voces lejanas

    // 4. Analizador de Espectro para Visualizador Canvas
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 512;

    // Conexión en cadena: Highpass -> Compressor -> Gain -> Analyser -> Dest
    this.highpassNode.connect(this.compressorNode);
    this.compressorNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(dest);
  }

  playFiltered(onEndedCallback) {
    if (!this.audioBuffer) return;
    this.stop();
    this.setupFilterPipeline();

    this.sourceNode = this.audioCtx.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.highpassNode);
    this.sourceNode.onended = () => {
      this.isPlaying = false;
      if (onEndedCallback) onEndedCallback();
    };
    this.sourceNode.start(0);
    this.isPlaying = true;
  }

  stop() {
    if (this.sourceNode && this.isPlaying) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch (e) {}
    }
    this.isPlaying = false;
  }

  drawWaveform(canvas) {
    if (!canvas || !this.analyserNode) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!this.isPlaying) return;
      requestAnimationFrame(render);
      this.analyserNode.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  }
}

window.MigatoAudioFilter = MigatoAudioFilter;
