/**
 * Whiteboard.js — Pizarra Táctica Digital para Pantallas Táctiles y Televisores de Sala Situacional
 * Movimiento Independiente Ganamos Todos (MIGATO) • Monagas 2026
 * 
 * Permite realizar anotaciones, trazos tácticos a mano alzada, círculos y flechas
 * con dedos o stylus sobre el mapa satelital sin alterar las capas base.
 */

export class Whiteboard {
  constructor(options = {}) {
    this.canvas = document.getElementById(options.canvasId || "whiteboard-canvas");
    this.toolbar = document.getElementById(options.toolbarId || "whiteboard-toolbar");
    this.toggleBtn = document.getElementById(options.toggleBtnId || "btn-toggle-whiteboard");
    this.map = options.map || null;

    this.ctx = null;
    this.isActive = false;
    this.isDrawing = false;
    this.currentTool = "pen"; // "pen" | "eraser"
    this.currentColor = "#facc15"; // Amarillo neón táctico por defecto
    this.currentLineWidth = 5; // Grosor medio táctil
    this.history = [];
    this.maxHistory = 20;

    this.dpr = window.devicePixelRatio || 1;
    this.lastX = 0;
    this.lastY = 0;

    this.init();
  }

  init() {
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.resizeCanvas();

    window.addEventListener("resize", () => this.handleResize());

    // Eventos de Puntero (Soporta Stylus, Touch y Mouse de forma unificada)
    this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.canvas.addEventListener("pointermove", (e) => this.onPointerMove(e));
    this.canvas.addEventListener("pointerup", (e) => this.onPointerUp(e));
    this.canvas.addEventListener("pointercancel", (e) => this.onPointerUp(e));

    // Permitir zoom fluido con la rueda del ratón directamente sobre el lienzo de dibujo
    this.canvas.addEventListener("wheel", (e) => {
      if (this.map) {
        if (e.deltaY < 0) {
          this.map.zoomIn();
        } else if (e.deltaY > 0) {
          this.map.zoomOut();
        }
      }
    }, { passive: true });

    // Atajo global de teclado: Ctrl + Z / Cmd + Z para Deshacer trazos inmediatamente
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (this.isActive || this.hasDrawings()) {
          e.preventDefault();
          this.undo();
        }
      }
    });

    // Prevenir gestos predeterminados del navegador al tocar el canvas
    this.canvas.addEventListener("touchstart", (e) => {
      if (this.isActive && this.currentTool !== "pan") e.preventDefault();
    }, { passive: false });
    this.canvas.addEventListener("touchmove", (e) => {
      if (this.isActive && this.currentTool !== "pan") e.preventDefault();
    }, { passive: false });

    this.saveState();
  }

  setMap(mapInstance) {
    this.map = mapInstance;
  }

  resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    this.dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Guardar contenido anterior si existe
    let tempCanvas = null;
    if (this.canvas.width > 0 && this.canvas.height > 0) {
      tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tCtx = tempCanvas.getContext("2d");
      tCtx.drawImage(this.canvas, 0, 0);
    }

    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (tempCanvas) {
      this.ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, w, h);
    }
  }

  handleResize() {
    this.resizeCanvas();
  }

  /* ========================================================================
     CONTROL DE ESTADO Y BLOQUEO DE MAPA
     ======================================================================== */

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    this.isActive = true;
    if (this.canvas) {
      this.canvas.classList.remove("pointer-events-none");
      this.canvas.classList.add("pointer-events-auto");
      this.canvas.style.cursor = "crosshair";
    }
    if (this.toolbar) {
      this.toolbar.classList.remove("hidden");
      this.toolbar.classList.add("flex");
    }
    if (this.toggleBtn) {
      this.toggleBtn.classList.add("bg-slate-300", "text-slate-950", "border-slate-400");
      this.toggleBtn.classList.remove("bg-slate-100", "text-slate-600", "border-slate-300");
    }

    // Mantener zoom del mapa siempre desbloqueado. Solo bloquear arrastre cuando se está en modo lápiz
    if (this.map) {
      if (this.currentTool !== "pan") {
        this.map.dragging.disable();
      }
      this.map.scrollWheelZoom.enable();
      this.map.doubleClickZoom.enable();
      this.map.touchZoom.enable();
    }
  }

  deactivate() {
    this.isActive = false;
    this.isDrawing = false;
    if (this.canvas) {
      this.canvas.classList.add("pointer-events-none");
      this.canvas.classList.remove("pointer-events-auto");
      this.canvas.style.cursor = "default";
    }
    if (this.toolbar) {
      this.toolbar.classList.add("hidden");
      this.toolbar.classList.remove("flex");
    }
    if (this.toggleBtn) {
      this.toggleBtn.classList.remove("bg-slate-300", "text-slate-950", "border-slate-400");
      this.toggleBtn.classList.add("bg-slate-100", "text-slate-600", "border-slate-300");
    }

    // Reactivar mapa para navegación normal completa
    if (this.map) {
      this.map.dragging.enable();
      this.map.touchZoom.enable();
      this.map.doubleClickZoom.enable();
      this.map.scrollWheelZoom.enable();
      this.map.boxZoom.enable();
    }
  }

  setTool(tool) {
    this.currentTool = tool; // "pen" | "eraser" | "pan"
    if (tool === "pan") {
      // Modo Mover / Ajustar Mapa: el lienzo no intercepta clics para permitir arrastre
      if (this.canvas) {
        this.canvas.classList.remove("pointer-events-auto");
        this.canvas.classList.add("pointer-events-none");
      }
      if (this.map) {
        this.map.dragging.enable();
      }
    } else {
      // Modo Dibujo o Borrador
      if (this.canvas) {
        this.canvas.classList.remove("pointer-events-none");
        this.canvas.classList.add("pointer-events-auto");
        this.canvas.style.cursor = tool === "eraser" ? "cell" : "crosshair";
      }
      if (this.map) {
        this.map.dragging.disable();
      }
    }
    this.updateToolUI();
  }

  setColor(color) {
    this.currentColor = color;
    this.currentTool = "pen";
    if (this.canvas) {
      this.canvas.classList.remove("pointer-events-none");
      this.canvas.classList.add("pointer-events-auto");
      this.canvas.style.cursor = "crosshair";
    }
    if (this.map) {
      this.map.dragging.disable();
    }
    this.updateToolUI();
  }

  setLineWidth(width) {
    this.currentLineWidth = width;
    this.updateToolUI();
  }

  updateToolUI() {
    // Actualizar botones de color
    document.querySelectorAll(".wb-color-btn").forEach(btn => {
      const c = btn.getAttribute("data-color");
      if (c === this.currentColor && this.currentTool === "pen") {
        btn.classList.add("scale-125", "ring-2", "ring-white");
      } else {
        btn.classList.remove("scale-125", "ring-2", "ring-white");
      }
    });

    // Actualizar botón de borrador
    const eraserBtn = document.getElementById("wb-btn-eraser");
    if (eraserBtn) {
      if (this.currentTool === "eraser") {
        eraserBtn.classList.add("bg-amber-500", "text-slate-950");
        eraserBtn.classList.remove("bg-white/10", "text-slate-200");
      } else {
        eraserBtn.classList.remove("bg-amber-500", "text-slate-950");
        eraserBtn.classList.add("bg-white/10", "text-slate-200");
      }
    }

    // Actualizar botón de mover/ajustar mapa
    const panBtn = document.getElementById("wb-btn-pan");
    if (panBtn) {
      if (this.currentTool === "pan") {
        panBtn.classList.add("bg-sky-500", "text-slate-950");
        panBtn.classList.remove("bg-white/10", "text-slate-200");
      } else {
        panBtn.classList.remove("bg-sky-500", "text-slate-950");
        panBtn.classList.add("bg-white/10", "text-slate-200");
      }
    }
  }

  /* ========================================================================
     DIBUJO DE TRAZOS EN CANVAS
     ======================================================================== */

  getCanvasCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  onPointerDown(e) {
    if (!this.isActive) return;
    this.canvas.setPointerCapture(e.pointerId);
    this.isDrawing = true;

    const coords = this.getCanvasCoordinates(e);
    this.lastX = coords.x;
    this.lastY = coords.y;

    // Iniciar trazo inmediatamente
    this.ctx.beginPath();
    this.setupContextStyle();
    this.ctx.arc(this.lastX, this.lastY, this.currentLineWidth / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  onPointerMove(e) {
    if (!this.isDrawing || !this.isActive) return;

    const coords = this.getCanvasCoordinates(e);
    this.setupContextStyle();

    // Dibujado suave de línea con interpolación
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  onPointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch (err) {}
    this.saveState();
  }

  setupContextStyle() {
    if (this.currentTool === "eraser") {
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = this.currentLineWidth * 2.5; // Borrador más amplio para dedos
    } else {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.fillStyle = this.currentColor;
      this.ctx.lineWidth = this.currentLineWidth;
    }
  }

  /* ========================================================================
     HISTORIAL, DESHACER Y LIMPIAR
     ======================================================================== */

  saveState() {
    if (!this.canvas || !this.ctx) return;
    try {
      if (this.history.length >= this.maxHistory) {
        this.history.shift();
      }
      const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.history.push(data);
    } catch (err) {
      console.warn("No se pudo guardar el estado de la pizarra:", err);
    }
  }

  undo() {
    if (this.history.length <= 1) {
      this.clear();
      return;
    }
    // Descartar estado actual
    this.history.pop();
    const previousState = this.history[this.history.length - 1];
    if (previousState) {
      this.ctx.putImageData(previousState, 0, 0);
    }
  }

  clear() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.history = [];
    this.saveState();
  }

  hasDrawings() {
    // Retorna true si hay trazos registrados en la pizarra
    return this.history.length > 1;
  }
}
