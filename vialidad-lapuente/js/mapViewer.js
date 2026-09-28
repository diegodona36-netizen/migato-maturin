/**
 * Visor Cartográfico Ultralimpio con Motor HTML5 Canvas Acelerado por GPU
 * Elimina completamente el 'salto', 'encogimiento' y distorsión de líneas durante el zoom
 */

export class RoadMapViewer {
  constructor(containerId, onFinishDrawingCallback, onSelectTramoCallback) {
    this.containerId = containerId;
    this.onFinishDrawingCallback = onFinishDrawingCallback;
    this.onSelectTramoCallback = onSelectTramoCallback;

    this.map = null;
    this.canvasRenderer = null;
    this.tramosLayerGroup = null;
    this.drawingLayerGroup = null;
    this.userLocationLayer = null;

    this.isDrawingMode = false;
    this.currentDrawingPoints = [];
    this.drawingLine = null;
    this.drawingMarkers = [];

    this.init();
  }

  init() {
    // 1. Renderizador Canvas Nativo (Acelerado por GPU)
    // Dibuja todas las líneas en un único lienzo gráfico sin elementos SVG que se deformen al hacer zoom
    this.canvasRenderer = L.canvas({
      padding: 0.5,
      tolerance: 14 // Área de clic táctil generosa para celulares
    });

    // 2. Capas Satelitales y de Calles
    const googleHybrid = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      {
        maxZoom: 21,
        maxNativeZoom: 20,
        attribution: "Google Satélite"
      }
    );

    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 21,
        maxNativeZoom: 17,
        attribution: "Esri Satellite"
      }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
        maxNativeZoom: 19,
        attribution: "OpenStreetMap"
      }
    );

    // 3. Inicialización del Mapa con Zoom Sincronizado y Rígido
    this.map = L.map(this.containerId, {
      center: [9.7185, -63.2120],
      zoom: 16,
      maxZoom: 21,
      preferCanvas: true, // Motor Canvas activado
      renderer: this.canvasRenderer,
      zoomSnap: 1, // Pasos enteros de zoom para evitar difuminados o saltos raros
      zoomDelta: 1,
      wheelPxPerZoomLevel: 100,
      zoomAnimation: true,
      fadeAnimation: true,
      zoomControl: false,
      layers: [googleHybrid]
    });

    L.control.zoom({ position: "topright" }).addTo(this.map);

    L.control.layers(
      {
        "Satélite Google": googleHybrid,
        "Satélite Esri": esriSatellite,
        "Calles (OSM)": osmStreets
      },
      null,
      { position: "topright" }
    ).addTo(this.map);

    this.tramosLayerGroup = L.layerGroup().addTo(this.map);
    this.drawingLayerGroup = L.layerGroup().addTo(this.map);
    this.userLocationLayer = L.layerGroup().addTo(this.map);

    // Hito de Referencia La Puente
    const hito = L.circleMarker([9.7185, -63.2120], {
      radius: 6,
      fillColor: "#f59e0b",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
      renderer: this.canvasRenderer
    }).bindTooltip("<strong>📍 Sector La Puente</strong>", { permanent: false, direction: "top" });
    this.map.addLayer(hito);

    this.map.on("click", (e) => this.handleMapClick(e));
  }

  startDrawing(startPoint = null) {
    this.isDrawingMode = true;
    this.currentDrawingPoints = [];
    this.drawingMarkers = [];
    this.drawingLayerGroup.clearLayers();
    this.drawingLine = null;
    this.map.getContainer().style.cursor = "crosshair";

    if (startPoint && Array.isArray(startPoint)) {
      this.addDrawingPoint(startPoint, true);
    }
  }

  cancelDrawing() {
    this.isDrawingMode = false;
    this.currentDrawingPoints = [];
    this.drawingMarkers = [];
    this.drawingLayerGroup.clearLayers();
    this.drawingLine = null;
    this.map.getContainer().style.cursor = "";
  }

  undoLastPoint() {
    if (this.currentDrawingPoints.length === 0) return;

    this.currentDrawingPoints.pop();
    const lastMarker = this.drawingMarkers.pop();
    if (lastMarker) {
      this.drawingLayerGroup.removeLayer(lastMarker);
    }

    if (this.drawingLine) {
      if (this.currentDrawingPoints.length > 0) {
        this.drawingLine.setLatLngs(this.currentDrawingPoints);
      } else {
        this.drawingLayerGroup.removeLayer(this.drawingLine);
        this.drawingLine = null;
      }
    }

    const liveCounter = document.getElementById("live-drawing-length");
    if (liveCounter) {
      const len = this.calculateLengthMeters(this.currentDrawingPoints);
      liveCounter.textContent = `${len} m`;
    }
  }

  finishDrawing() {
    if (this.currentDrawingPoints.length < 2) {
      alert("Debes marcar al menos dos puntos sobre la calle para guardar el tramo.");
      return null;
    }

    const points = [...this.currentDrawingPoints];
    const longitudM = this.calculateLengthMeters(points);

    this.isDrawingMode = false;
    this.map.getContainer().style.cursor = "";
    this.drawingLayerGroup.clearLayers();
    this.drawingLine = null;

    if (this.onFinishDrawingCallback) {
      this.onFinishDrawingCallback(points, longitudM);
    }
    return { points, longitudM };
  }

  handleMapClick(e) {
    if (!this.isDrawingMode) return;
    this.addDrawingPoint([e.latlng.lat, e.latlng.lng]);
  }

  addDrawingPoint(latlng, isAnchor = false) {
    this.currentDrawingPoints.push(latlng);

    const marker = L.circleMarker(latlng, {
      radius: isAnchor ? 6 : 4,
      fillColor: isAnchor ? "#10b981" : "#f59e0b",
      color: "#ffffff",
      weight: 1.5,
      fillOpacity: 1,
      renderer: this.canvasRenderer
    });

    this.drawingLayerGroup.addLayer(marker);
    this.drawingMarkers.push(marker);

    if (this.drawingLine) {
      this.drawingLine.setLatLngs(this.currentDrawingPoints);
    } else if (this.currentDrawingPoints.length > 1) {
      this.drawingLine = L.polyline(this.currentDrawingPoints, {
        color: "#f59e0b",
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        dashArray: "6, 8",
        renderer: this.canvasRenderer
      });
      this.drawingLayerGroup.addLayer(this.drawingLine);
    }

    const liveCounter = document.getElementById("live-drawing-length");
    if (liveCounter) {
      const len = this.calculateLengthMeters(this.currentDrawingPoints);
      liveCounter.textContent = `${len} m`;
    }
  }

  calculateLengthMeters(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = L.latLng(points[i][0], points[i][1]);
      const p2 = L.latLng(points[i + 1][0], points[i + 1][1]);
      total += p1.distanceTo(p2);
    }
    return Math.round(total);
  }

  /**
   * Formateador estándar de Progresivas de Ingeniería Vial (PK X+XXX)
   */
  static formatPK(meters) {
    const m = Math.round(meters || 0);
    const km = Math.floor(m / 1000);
    const rem = m % 1000;
    return `PK ${km}+${rem.toString().padStart(3, "0")}`;
  }

  /**
   * Divide un conjunto de puntos geodésicos en una distancia acumulada exacta en metros
   */
  splitPointsAtDistance(points, targetDistanceMeters) {
    if (!points || points.length < 2) return null;
    const totalLen = this.calculateLengthMeters(points);
    if (targetDistanceMeters <= 0 || targetDistanceMeters >= totalLen) {
      // Si la distancia está fuera de rango, dividir por la mitad
      targetDistanceMeters = totalLen / 2;
    }

    let accumulated = 0;
    const pointsA = [points[0]];
    const pointsB = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = L.latLng(points[i][0], points[i][1]);
      const p2 = L.latLng(points[i + 1][0], points[i + 1][1]);
      const segLen = p1.distanceTo(p2);

      if (accumulated + segLen < targetDistanceMeters) {
        accumulated += segLen;
        pointsA.push(points[i + 1]);
      } else {
        // El punto de corte está en este segmento entre i e i+1
        const remaining = targetDistanceMeters - accumulated;
        const ratio = segLen > 0 ? remaining / segLen : 0.5;
        const splitLat = points[i][0] + (points[i + 1][0] - points[i][0]) * ratio;
        const splitLng = points[i][1] + (points[i + 1][1] - points[i][1]) * ratio;
        const splitCoord = [splitLat, splitLng];

        pointsA.push(splitCoord);
        pointsB.push(splitCoord);

        for (let j = i + 1; j < points.length; j++) {
          pointsB.push(points[j]);
        }
        break;
      }
    }

    if (pointsB.length === 0) {
      pointsB.push(points[points.length - 1]);
    }

    return {
      pointsA,
      pointsB,
      lenA: this.calculateLengthMeters(pointsA),
      lenB: this.calculateLengthMeters(pointsB)
    };
  }

  /**
   * Renderizado Ultra Limpio en Canvas de Corredores y Sub-Tramos Multi-Estado
   * Permite que una autopista o avenida posea tramos contiguos con distintos colores y patologías
   */
  renderSavedTramos(corredores) {
    this.tramosLayerGroup.clearLayers();

    const colorMap = {
      verde: "#10b981",
      amarillo: "#f59e0b",
      naranja: "#f97316",
      rojo: "#ef4444"
    };

    if (!Array.isArray(corredores)) return;

    corredores.forEach(corredor => {
      // Manejar formato legacy (tramo individual simple) o nuevo formato de Corredor con Subtramos
      const subtramos = (corredor.subtramos && corredor.subtramos.length > 0)
        ? corredor.subtramos
        : [{
            id: corredor.id,
            nombre: corredor.nombre,
            color: corredor.color || "amarillo",
            longitudM: corredor.longitudM || 0,
            pkInicioM: 0,
            pkFinM: corredor.longitudM || 0,
            puntos: corredor.puntos,
            canalesAfectados: corredor.canalesAfectados || "ambos",
            jerarquia: corredor.jerarquia,
            puenteCritico: corredor.puenteCritico || "ninguno",
            patologias: corredor.patologias || [],
            bombeoTecnico: corredor.bombeoTecnico || "adecuado_2pct",
            tipoSuperficie: corredor.tipoSuperficie || "asfalto_3_capas",
            drenajeUrbano: corredor.drenajeUrbano || "bocas_sapo_operativas",
            cloacasSubterraneas: corredor.cloacasSubterraneas || "estables",
            demarcacionVial: corredor.demarcacionVial || "optima",
            detalle: corredor.detalle || "",
            foto: corredor.foto || null
          }];

      subtramos.forEach((sub, sIdx) => {
        if (!sub.puntos || sub.puntos.length < 2) return;

        const color = colorMap[sub.color] || "#64748b";
        const pkIni = RoadMapViewer.formatPK(sub.pkInicioM || 0);
        const pkFin = RoadMapViewer.formatPK(sub.pkFinM || (sub.pkInicioM + sub.longitudM));

        // 1. Contorno oscuro suave para contraste sobre satélite o mapa
        const casing = L.polyline(sub.puntos, {
          color: "#070a14",
          weight: 9,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
          renderer: this.canvasRenderer
        });

        // 2. Línea de calzada con color de estado técnico
        const line = L.polyline(sub.puntos, {
          color: color,
          weight: 6,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
          dashArray: sub.canalesAfectados === "canal_lento_pesado" ? "12, 6" : null,
          renderer: this.canvasRenderer
        });

        // Tooltip enriquecido de ingeniería vial
        const canalLabel = {
          ambos: "Ambos Canales",
          canal_lento_pesado: "⚠️ Canal Lento (Carga Pesada)",
          canal_rapido: "Canal Rápido",
          hombrillo: "Hombrillo / Berma",
          isla_central: "Isla Central / Separador"
        }[sub.canalesAfectados] || "Calzada Completa";

        const tooltipContent = `
          <div class="p-2 text-xs space-y-1.5 min-w-[210px]">
            <div class="border-b border-[#2d1f85] pb-1">
              <span class="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">${corredor.nombre || "Corredor Vial"}</span>
              <strong class="text-white block font-black text-sm">${sub.nombre}</strong>
            </div>
            
            <div class="flex items-center justify-between font-mono text-[11px] text-slate-300">
              <span class="bg-[#100b33] px-1.5 py-0.5 rounded border border-[#2d1f85] text-amber-300 font-bold">${pkIni} ➔ ${pkFin}</span>
              <span class="font-black uppercase" style="color: ${color}">● ${sub.color.toUpperCase()}</span>
            </div>

            <div class="text-[11px] text-slate-300">
              <span class="text-slate-400">Longitud:</span> <strong>${sub.longitudM} m</strong>
              <span class="mx-1">•</span>
              <span class="text-amber-200">${canalLabel}</span>
            </div>

            ${corredor.jerarquia ? `<div class="text-[10px] text-slate-400 font-medium">${corredor.jerarquia}</div>` : ''}

            ${sub.puenteCritico && sub.puenteCritico !== 'ninguno' ? `
              <div class="p-1 rounded bg-red-950/90 border border-red-600 text-red-300 font-bold text-[11px] flex items-center gap-1">
                <span>⚠️</span>
                <span>${sub.puenteCritico.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
            ` : ''}

            ${sub.patologias && sub.patologias.length > 0 ? `
              <div class="text-[10px] text-amber-400 font-mono">
                🔧 ${sub.patologias.length} patología(s) de ingeniería
              </div>
            ` : ''}

            ${sub.bombeoTecnico && sub.bombeoTecnico !== 'adecuado_2pct' ? `
              <div class="text-[10px] text-rose-300 font-medium">
                💧 Bombeo: ${sub.bombeoTecnico === 'deficiente_plano' ? 'Deficiente (Plano / Sin caída)' : 'Invertido (Laguna)'}
              </div>
            ` : ''}

            ${sub.detalle ? `<p class="text-slate-300 italic text-[11px] border-t border-[#2d1f85]/60 pt-1">${sub.detalle}</p>` : ''}
            ${sub.foto ? `<p class="text-amber-300 font-bold text-[10px]">📷 Evidencia fotográfica georreferenciada</p>` : ''}
          </div>
        `;

        line.bindTooltip(tooltipContent, { sticky: true, className: "tramo-tooltip" });

        const handleClick = (e) => {
          L.DomEvent.stopPropagation(e);
          if (this.onSelectTramoCallback) {
            this.onSelectTramoCallback(corredor, sub);
          }
        };

        casing.on("click", handleClick);
        line.on("click", handleClick);

        // Hito Visual de Progresiva (PK) en el inicio del subtramo
        const startPoint = sub.puntos[0];
        const pkMarker = L.circleMarker(startPoint, {
          radius: 4.5,
          fillColor: color,
          color: "#ffffff",
          weight: 1.5,
          fillOpacity: 1,
          renderer: this.canvasRenderer
        }).bindTooltip(`<span class="font-mono text-[10px] font-bold">${pkIni}</span>`, {
          permanent: false,
          direction: "top"
        });
        pkMarker.on("click", handleClick);

        // Alerta Destacada si hay Puente Crítico en el subtramo
        let bridgeLayer = null;
        if (sub.puenteCritico && sub.puenteCritico !== 'ninguno') {
          const midPoint = sub.puntos[Math.floor(sub.puntos.length / 2)];
          bridgeLayer = L.circleMarker(midPoint, {
            radius: 8,
            fillColor: "#ef4444",
            color: "#ffffff",
            weight: 2,
            fillOpacity: 0.95,
            renderer: this.canvasRenderer
          }).bindTooltip(`<strong>⚠️ ALERTA: ${sub.puenteCritico.replace(/_/g, ' ').toUpperCase()}</strong>`, {
            permanent: false,
            direction: "top"
          });
          bridgeLayer.on("click", handleClick);
        }

        const layers = [casing, line, pkMarker];
        if (bridgeLayer) layers.push(bridgeLayer);

        const group = L.featureGroup(layers);
        this.tramosLayerGroup.addLayer(group);
      });
    });
  }

  updateUserLocation(lat, lng) {
    this.userLocationLayer.clearLayers();

    const dot = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: "#38bdf8",
      color: "#ffffff",
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.95,
      renderer: this.canvasRenderer
    });

    dot.bindTooltip("<strong>📍 Tu Posición</strong>", { permanent: true, direction: "top" });
    this.userLocationLayer.addLayer(dot);
    this.map.setView([lat, lng], 17, { animate: true });
  }

  focusOn(lat, lng) {
    this.map.setView([lat, lng], 17, { animate: true });
  }
}

