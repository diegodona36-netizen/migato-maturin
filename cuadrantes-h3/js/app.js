/**
 * Controlador Principal — Sistema de Cuadrantes y Hexágonos H3 (Monagas)
 */
import { TERRITORIO_MONAGAS } from "./dataTerritorio.js";
import { H3GridEngine } from "./h3Engine.js";
import { KmlExportService } from "./kmlExport.js";

class CuadrantesH3App {
  constructor() {
    this.map = null;
    this.currentParish = null;
    this.currentRadiusM = 450; // Resolución estándar urbana
    this.hexagons = [];
    this.parishLayer = null;
    this.hexLayer = null;
    this.selectedHex = null;
    this.savedState = this.loadSavedState();

    this.init();
  }

  loadSavedState() {
    try {
      const data = localStorage.getItem("monagas_cuadrantes_h3_v1");
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveState() {
    try {
      localStorage.setItem("monagas_cuadrantes_h3_v1", JSON.stringify(this.savedState));
    } catch (e) {}
  }

  init() {
    this.initMap();
    this.populateSelectors();
    this.setupEventListeners();

    // Cargar San Simón por defecto
    const defaultMun = TERRITORIO_MONAGAS.municipios[0];
    const defaultParish = defaultMun.parroquias[0];
    this.selectParish(defaultParish);

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  initMap() {
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Esri Satellite" }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "OpenStreetMap" }
    );

    this.map = L.map("h3-map-container", {
      center: [9.7469, -63.1812],
      zoom: 14,
      zoomControl: false,
      layers: [esriSatellite]
    });

    L.control.zoom({ position: "topright" }).addTo(this.map);
    L.control.layers({ "Satélite Esri": esriSatellite, "Calles OSM": osmStreets }, null, { position: "topright" }).addTo(this.map);

    this.parishLayer = L.layerGroup().addTo(this.map);
    this.hexLayer = L.layerGroup().addTo(this.map);
  }

  populateSelectors() {
    const select = document.getElementById("select-parroquia-h3");
    if (!select) return;

    select.innerHTML = "";
    TERRITORIO_MONAGAS.municipios.forEach(mun => {
      const optGroup = document.createElement("optgroup");
      optGroup.label = mun.nombre;

      mun.parroquias.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nombre} (${p.tipo})`;
        optGroup.appendChild(opt);
      });

      select.appendChild(optGroup);
    });

    select.addEventListener("change", (e) => {
      const parishId = e.target.value;
      for (let mun of TERRITORIO_MONAGAS.municipios) {
        const found = mun.parroquias.find(p => p.id === parishId);
        if (found) {
          this.selectParish(found, mun.nombre);
          break;
        }
      }
    });
  }

  selectParish(parishData, munNombre = "Municipio Maturín") {
    this.currentParish = { ...parishData, municipio: munNombre };
    this.selectedHex = null;

    // Actualizar Encabezados
    const title = document.getElementById("parish-title");
    const badge = document.getElementById("parish-badge");
    const sectoresEl = document.getElementById("parish-sectors");

    if (title) title.textContent = this.currentParish.nombre;
    if (badge) badge.textContent = `${this.currentParish.municipio} • ${this.currentParish.tipo}`;
    if (sectoresEl) {
      sectoresEl.innerHTML = this.currentParish.sectores
        .map(s => `<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium">${s}</span>`)
        .join("");
    }

    // Dibujar Límite Oficial
    this.parishLayer.clearLayers();
    const poly = L.polygon(this.currentParish.poligono, {
      color: "#ffffff",
      weight: 3.5,
      opacity: 0.95,
      fillColor: this.currentParish.color,
      fillOpacity: 0.08,
      dashArray: "8, 6"
    });
    this.parishLayer.addLayer(poly);

    this.map.flyToBounds(poly.getBounds(), { padding: [40, 40], duration: 1.2 });

    // Generar Cuadrícula H3
    this.generateH3Grid();
  }

  generateH3Grid() {
    this.hexagons = H3GridEngine.generateHexagons(
      this.currentParish.poligono,
      this.currentRadiusM,
      this.currentParish.codigo
    );

    // Recuperar estados guardados
    this.hexagons.forEach(hex => {
      if (this.savedState[hex.id]) {
        Object.assign(hex, this.savedState[hex.id]);
      }
    });

    this.renderHexagons();
    this.updateStats();
  }

  renderHexagons() {
    this.hexLayer.clearLayers();

    this.hexagons.forEach(hex => {
      let strokeColor = "#38bdf8";
      let fillColor = "#0284c7";
      let fillOpacity = 0.18;
      let weight = 1.5;

      if (hex.estado === "cubierto") {
        strokeColor = "#10b981";
        fillColor = "#10b981";
        fillOpacity = 0.5;
        weight = 2.5;
      } else if (hex.estado === "en_despliegue") {
        strokeColor = "#f59e0b";
        fillColor = "#f59e0b";
        fillOpacity = 0.45;
        weight = 2;
      }

      const hexPoly = L.polygon(hex.vertices, {
        color: strokeColor,
        weight: weight,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        className: "h3-hex-cell"
      });

      const estadoLabel = hex.estado === "cubierto" ? "🟢 CUBIERTO" : (hex.estado === "en_despliegue" ? "🟡 EN DESPLIEGUE" : "⚪ SIN ASIGNAR");

      hexPoly.bindTooltip(
        `<div class="text-xs font-mono font-bold leading-tight">
          <div class="text-white">${hex.id}</div>
          <div class="text-[10px] text-slate-300 font-normal">${hex.areaHa} Ha • ${hex.metaCasas} casas</div>
          <div class="text-[10px] font-bold mt-0.5">${estadoLabel}</div>
        </div>`,
        { direction: "center", permanent: false, sticky: true }
      );

      hexPoly.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        this.openHexagonModal(hex);
      });

      this.hexLayer.addLayer(hexPoly);
    });
  }

  updateStats() {
    const total = this.hexagons.length;
    const cubiertos = this.hexagons.filter(h => h.estado === "cubierto").length;
    const despliegue = this.hexagons.filter(h => h.estado === "en_despliegue").length;
    const totalCasas = this.hexagons.reduce((acc, h) => acc + h.metaCasas, 0);

    const elTotal = document.getElementById("stat-total-h3");
    const elCubiertos = document.getElementById("stat-cubiertos-h3");
    const elDespliegue = document.getElementById("stat-despliegue-h3");
    const elCasas = document.getElementById("stat-casas-h3");
    const elCobertura = document.getElementById("stat-cobertura-h3");

    if (elTotal) elTotal.textContent = total;
    if (elCubiertos) elCubiertos.textContent = cubiertos;
    if (elDespliegue) elDespliegue.textContent = despliegue;
    if (elCasas) elCasas.textContent = totalCasas.toLocaleString();
    if (elCobertura) {
      const pct = total > 0 ? Math.round(((cubiertos + despliegue * 0.5) / total) * 100) : 0;
      elCobertura.textContent = `${pct}%`;
    }
  }

  openHexagonModal(hex) {
    this.selectedHex = hex;
    const modal = document.getElementById("hex-modal");
    if (!modal) return;

    document.getElementById("modal-hex-id").textContent = hex.id;
    document.getElementById("modal-hex-area").textContent = `${hex.areaHa} Hectáreas`;
    document.getElementById("modal-hex-casas").textContent = `${hex.metaCasas} viviendas aprox.`;

    document.getElementById("input-hex-responsable").value = hex.responsable || "";
    document.getElementById("input-hex-telefono").value = hex.telefono || "";
    document.getElementById("input-hex-sector").value = hex.sectorReferencia || "";
    document.getElementById("select-hex-estado").value = hex.estado || "sin_asignar";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  setupEventListeners() {
    // Selector de Tamaño / Resolución
    const btnSizes = document.querySelectorAll(".btn-h3-res");
    btnSizes.forEach(btn => {
      btn.addEventListener("click", () => {
        btnSizes.forEach(b => {
          b.classList.remove("bg-amber-500", "text-slate-950", "font-black");
          b.classList.add("bg-slate-800", "text-slate-300");
        });
        btn.classList.add("bg-amber-500", "text-slate-950", "font-black");
        btn.classList.remove("bg-slate-800", "text-slate-300");

        this.currentRadiusM = parseInt(btn.dataset.radius);
        this.generateH3Grid();
      });
    });

    // Guardar Cuadrante en Modal
    const form = document.getElementById("form-hex-assignment");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!this.selectedHex) return;

        this.selectedHex.responsable = document.getElementById("input-hex-responsable").value;
        this.selectedHex.telefono = document.getElementById("input-hex-telefono").value;
        this.selectedHex.sectorReferencia = document.getElementById("input-hex-sector").value;
        this.selectedHex.estado = document.getElementById("select-hex-estado").value;

        this.savedState[this.selectedHex.id] = {
          responsable: this.selectedHex.responsable,
          telefono: this.selectedHex.telefono,
          sectorReferencia: this.selectedHex.sectorReferencia,
          estado: this.selectedHex.estado
        };
        this.saveState();

        this.renderHexagons();
        this.updateStats();
        this.closeHexModal();
      });
    }

    const btnCloseModal = document.getElementById("btn-close-hex-modal");
    if (btnCloseModal) btnCloseModal.addEventListener("click", () => this.closeHexModal());

    // Exportar KML para Google Earth
    const btnExportKml = document.getElementById("btn-export-h3-kml");
    if (btnExportKml) {
      btnExportKml.addEventListener("click", () => {
        const kmlString = KmlExportService.exportToKml(this.hexagons, this.currentParish);
        const fileName = `Cuadrantes_H3_${this.currentParish.codigo}_${this.currentParish.nombre.replace(/\s+/g, '_')}.kml`;
        KmlExportService.downloadFile(kmlString, fileName, "application/vnd.google-earth.kml+xml");
      });
    }
  }

  closeHexModal() {
    const modal = document.getElementById("hex-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }
}

function startApp() {
  if (!window.cuadrantesH3App) {
    window.cuadrantesH3App = new CuadrantesH3App();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
