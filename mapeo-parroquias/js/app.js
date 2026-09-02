/**
 * Controlador Principal — Plataforma de Mapeo Parroquial y Malla Hexagonal
 */
import { PARROQUIAS_MUESTRA } from "./dataParroquias5.js";
import { HexagonEngine } from "./hexagonEngine.js";
import { KmlParserService } from "./kmlParser.js";
import { MapEditor } from "./mapEditor.js";

class ParishMappingApp {
  constructor() {
    this.currentParish = PARROQUIAS_MUESTRA[0]; // San Simón por defecto
    this.currentRadiusM = 600; // 600m por defecto
    this.currentHexagons = [];
    this.selectedHexagon = null;
    this.mapEditor = null;

    this.init();
  }

  init() {
    // 1. Inicializar Editor de Mapa
    this.mapEditor = new MapEditor("map-container", (hex) => {
      this.onHexagonClicked(hex);
    });

    // 2. Llenar Selectores
    this.populateParishSelector();

    // 3. Configurar Eventos
    this.setupEventListeners();
    this.setupDragAndDrop();

    // 4. Cargar Parroquia Inicial
    this.loadParish(this.currentParish.id);

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  populateParishSelector() {
    const select = document.getElementById("select-parroquia");
    if (!select) return;

    select.innerHTML = "";
    PARROQUIAS_MUESTRA.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nombre} (${p.municipio})`;
      select.appendChild(opt);
    });
  }

  loadParish(parishId) {
    const found = PARROQUIAS_MUESTRA.find(p => p.id === parishId);
    if (!found) return;

    this.currentParish = found;
    this.selectedHexagon = null;

    // Actualizar Encabezado y Badges
    const lblNombre = document.getElementById("lbl-parroquia-nombre");
    const lblMun = document.getElementById("lbl-parroquia-mun");
    const lblTipo = document.getElementById("lbl-parroquia-tipo");
    const sectoresList = document.getElementById("list-sectores-referencia");

    if (lblNombre) lblNombre.textContent = this.currentParish.nombre;
    if (lblMun) lblMun.textContent = `Municipio ${this.currentParish.municipio}`;
    if (lblTipo) lblTipo.textContent = this.currentParish.tipo;

    if (sectoresList) {
      sectoresList.innerHTML = this.currentParish.sectoresReferencia
        .map(s => `<span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium">${s}</span>`)
        .join("");
    }

    // Dibujar Perímetro en Mapa
    this.mapEditor.setParishBoundary(this.currentParish);

    // Generar Cuadrícula de Hexágonos
    this.regenerateHexagons();
  }

  regenerateHexagons() {
    this.currentHexagons = HexagonEngine.generateGrid(
      this.currentParish.limitePoligono,
      this.currentRadiusM,
      this.currentParish.codigoPrefijo
    );

    this.mapEditor.renderHexagons(this.currentHexagons, this.currentParish.color);
    this.updateStats();
  }

  updateStats() {
    const totalHex = this.currentHexagons.length;
    const activeHex = this.currentHexagons.filter(h => h.activo).length;
    const totalAreaHa = Math.round(this.currentHexagons.reduce((acc, h) => acc + h.areaHa, 0));

    const elTotal = document.getElementById("stat-total-hex");
    const elActivos = document.getElementById("stat-activos-hex");
    const elArea = document.getElementById("stat-area-ha");
    const elCobertura = document.getElementById("stat-cobertura-pct");

    if (elTotal) elTotal.textContent = totalHex;
    if (elActivos) elActivos.textContent = activeHex;
    if (elArea) elArea.textContent = `${totalAreaHa.toLocaleString()} Ha`;
    if (elCobertura) {
      const pct = totalHex > 0 ? Math.round((activeHex / totalHex) * 100) : 0;
      elCobertura.textContent = `${pct}%`;
    }
  }

  onHexagonClicked(hex) {
    this.selectedHexagon = hex;
    this.updateStats();

    const panel = document.getElementById("panel-selected-hex");
    const lblId = document.getElementById("selected-hex-id");
    const lblArea = document.getElementById("selected-hex-area");
    const lblEstado = document.getElementById("selected-hex-estado");

    if (panel) panel.classList.remove("hidden");
    if (lblId) lblId.textContent = hex.id;
    if (lblArea) lblArea.textContent = `${hex.areaHa} Hectáreas`;
    if (lblEstado) {
      lblEstado.textContent = hex.activo ? "ASIGNADO / ACTIVO" : "DISPONIBLE";
      lblEstado.className = `font-bold text-xs ${hex.activo ? 'text-emerald-400' : 'text-amber-400'}`;
    }
  }

  setupEventListeners() {
    // Selector de Parroquia
    const select = document.getElementById("select-parroquia");
    if (select) {
      select.addEventListener("change", (e) => {
        this.loadParish(e.target.value);
      });
    }

    // Botones de Tamaño de Hexágonos
    const densityButtons = document.querySelectorAll(".btn-hex-size");
    densityButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        densityButtons.forEach(b => {
          b.classList.remove("bg-amber-500", "text-slate-950", "font-black");
          b.classList.add("bg-slate-800", "text-slate-300");
        });
        btn.classList.add("bg-amber-500", "text-slate-950", "font-black");
        btn.classList.remove("bg-slate-800", "text-slate-300");

        this.currentRadiusM = parseInt(btn.dataset.size);
        this.regenerateHexagons();
      });
    });

    // Toggle Mostrar/Ocultar Hexágonos
    const toggleHex = document.getElementById("toggle-show-hex");
    if (toggleHex) {
      toggleHex.addEventListener("change", (e) => {
        this.mapEditor.toggleHexagonLayer(e.target.checked);
      });
    }

    // Exportar KML para Google Earth
    const btnExportKml = document.getElementById("btn-export-kml");
    if (btnExportKml) {
      btnExportKml.addEventListener("click", () => this.exportKml());
    }

    // Exportar GeoJSON
    const btnExportGeoJson = document.getElementById("btn-export-geojson");
    if (btnExportGeoJson) {
      btnExportGeoJson.addEventListener("click", () => this.exportGeoJson());
    }

    // Limpiar Capas KML
    const btnClearKml = document.getElementById("btn-clear-kml");
    if (btnClearKml) {
      btnClearKml.addEventListener("click", () => {
        this.mapEditor.clearKmlLayers();
        this.showToast("Capa KML limpiada del mapa.");
      });
    }

    // Limpiar Dibujos
    const btnClearDraw = document.getElementById("btn-clear-draw");
    if (btnClearDraw) {
      btnClearDraw.addEventListener("click", () => {
        this.mapEditor.clearDrawings();
        this.showToast("Dibujos manuales limpiados.");
      });
    }
  }

  setupDragAndDrop() {
    const dropzone = document.getElementById("kml-dropzone");
    const fileInput = document.getElementById("kml-file-input");

    if (!dropzone || !fileInput) return;

    ["dragenter", "dragover"].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add("border-amber-400", "bg-amber-500/10");
      });
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove("border-amber-400", "bg-amber-500/10");
      });
    });

    dropzone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleKmlFile(files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        this.handleKmlFile(e.target.files[0]);
      }
    });
  }

  async handleKmlFile(file) {
    this.showToast(`Procesando archivo: ${file.name}...`);
    try {
      const features = await KmlParserService.parseFile(file);
      this.mapEditor.addKmlFeatures(features, file.name);
      this.showToast(`✅ ${features.length} zonas cargadas con éxito desde ${file.name}`);
      
      const kmlInfo = document.getElementById("kml-file-status");
      if (kmlInfo) {
        kmlInfo.innerHTML = `<span class="text-emerald-400 font-bold font-mono text-[11px]">✓ ${file.name} (${features.length} zonas)</span>`;
      }
    } catch (err) {
      console.error("Error leyendo KML:", err);
      this.showToast(`❌ Error: ${err.message}`, true);
    }
  }

  exportKml() {
    if (this.currentHexagons.length === 0) {
      this.showToast("No hay hexágonos para exportar.", true);
      return;
    }

    const kmlText = KmlParserService.generateKmlFromHexagons(this.currentHexagons, this.currentParish.nombre);
    const blob = new Blob([kmlText], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cuadricula_Hexagonal_${this.currentParish.codigoPrefijo}_${new Date().toISOString().split("T")[0]}.kml`;
    link.click();
    this.showToast("📥 Archivo KML descargado (Listo para abrir en Google Earth)");
  }

  exportGeoJson() {
    if (this.currentHexagons.length === 0) {
      this.showToast("No hay hexágonos para exportar.", true);
      return;
    }

    const geoJsonText = KmlParserService.generateGeoJson(this.currentHexagons, this.currentParish.nombre);
    const blob = new Blob([geoJsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Hexagonos_${this.currentParish.codigoPrefijo}.geojson`;
    link.click();
    this.showToast("📥 Archivo GeoJSON descargado");
  }

  showToast(message, isError = false) {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white transition-all transform duration-200 border ${
      isError ? 'bg-red-600 border-red-500' : 'bg-slate-900 border-slate-700 text-amber-400'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

function startApp() {
  if (!window.parishMappingApp) {
    window.parishMappingApp = new ParishMappingApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
