/**
 * Controlador Principal — Atlas Territorial & Sala Situacional de Monagas
 */
import { CATALOGO_MONAGAS } from "./catalogoMonagas.js";
import { AtlasStorage } from "./storageAtlas.js";
import { AtlasMapEngine } from "./mapEngine.js";

class AtlasMonagasApp {
  constructor() {
    this.currentMun = null;
    this.currentParish = null;
    this.mapEngine = null;
    this.selectedPolygon = null;

    this.init();
  }

  init() {
    this.renderPortalMunicipios();
    this.updateGlobalKPIs();
    this.setupPortalEvents();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  updateGlobalKPIs() {
    const stats = AtlasStorage.getGlobalStats(CATALOGO_MONAGAS);

    const elMun = document.getElementById("kpi-mun-total");
    const elParroq = document.getElementById("kpi-parroq-total");
    const elCuad = document.getElementById("kpi-cuad-total");
    const elCob = document.getElementById("kpi-cob-global");

    if (elMun) elMun.textContent = stats.totalMunicipios;
    if (elParroq) elParroq.textContent = stats.totalParroquias;
    if (elCuad) elCuad.textContent = stats.totalCuadrantes;
    if (elCob) elCob.textContent = `${stats.pctGlobal}%`;
  }

  renderPortalMunicipios(filterQuery = "") {
    const grid = document.getElementById("grid-municipios");
    if (!grid) return;

    grid.innerHTML = "";

    const filtered = CATALOGO_MONAGAS.filter(mun => {
      if (!filterQuery) return true;
      const q = filterQuery.toLowerCase();
      const matchMun = mun.nombre.toLowerCase().includes(q) || mun.capital.toLowerCase().includes(q);
      const matchParroq = mun.parroquias.some(p => p.nombre.toLowerCase().includes(q));
      return matchMun || matchParroq;
    });

    filtered.forEach(mun => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition group cursor-pointer flex flex-col justify-between";
      card.onclick = () => this.openMunicipalityParroquias(mun);

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow" style="background-color: ${mun.color}">
              <i data-lucide="${mun.icon || 'map-pin'}" class="w-5 h-5"></i>
            </span>
            <span class="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
              ${mun.parroquias.length} Parroquias
            </span>
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-sky-300 transition">${mun.nombre}</h3>
          <p class="text-xs text-slate-400 mt-0.5">Capital: <span class="text-slate-200 font-semibold">${mun.capital}</span></p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span class="text-[11px] font-medium">Ver mapa y cuadrantes</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition"></i>
        </div>
      `;

      grid.appendChild(card);
    });

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  openMunicipalityParroquias(mun) {
    this.currentMun = mun;

    const modal = document.getElementById("modal-parroquias-selector");
    const title = document.getElementById("modal-mun-title");
    const count = document.getElementById("modal-mun-count");
    const list = document.getElementById("modal-parroquias-list");

    if (title) title.textContent = mun.nombre;
    if (count) count.textContent = `${mun.parroquias.length} Parroquias Oficiales`;

    if (list) {
      list.innerHTML = mun.parroquias.map(p => `
        <div onclick="window.atlasApp.launchParishMap('${mun.id}', '${p.id}')" class="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-sky-500/50 cursor-pointer transition flex items-center justify-between group">
          <div>
            <h4 class="text-sm font-bold text-white group-hover:text-sky-300 transition">${p.nombre}</h4>
            <p class="text-xs text-slate-400 font-mono">${p.tipo} • Código: ${p.codigo}</p>
            <p class="text-[10px] text-slate-500 mt-0.5 italic truncate max-w-xs">${p.sectores.join(", ")}</p>
          </div>
          <button class="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold group-hover:bg-sky-500 group-hover:text-slate-950 transition flex items-center gap-1">
            <span>Abrir Mapa</span>
            <i data-lucide="map" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join("");
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  launchParishMap(munId, parishId) {
    // Cerrar modal de parroquias
    const selectorModal = document.getElementById("modal-parroquias-selector");
    if (selectorModal) selectorModal.classList.add("hidden");

    this.currentMun = CATALOGO_MONAGAS.find(m => m.id === munId);
    this.currentParish = this.currentMun.parroquias.find(p => p.id === parishId);

    // Cambiar a Vista Mapa
    document.getElementById("view-portal").classList.add("hidden");
    document.getElementById("view-mapa").classList.remove("hidden");
    document.getElementById("view-mapa").classList.add("flex");

    // Actualizar Breadcrumbs y Títulos
    document.getElementById("nav-mun-name").textContent = this.currentMun.nombre;
    document.getElementById("nav-parish-name").textContent = this.currentParish.nombre;
    document.getElementById("side-parish-title").textContent = this.currentParish.nombre;
    document.getElementById("side-parish-badge").textContent = `${this.currentMun.nombre} • ${this.currentParish.tipo}`;

    // Cargar Sectores
    const secContainer = document.getElementById("side-parish-sectors");
    if (secContainer) {
      secContainer.innerHTML = this.currentParish.sectores.map(s => `
        <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">${s}</span>
      `).join("");
    }

    // Inicializar Mapa si no existe
    if (!this.mapEngine) {
      this.mapEngine = new AtlasMapEngine("atlas-map-canvas", (poly) => this.openPolygonModal(poly));
    }

    // Cargar Datos Guardados de la Parroquia
    const savedData = AtlasStorage.getParishData(munId, parishId);
    this.mapEngine.loadParish(this.currentParish, savedData.poligonos || []);

    this.updateParishSidebarStats();

    // Redimensionar Leaflet
    setTimeout(() => {
      if (this.mapEngine && this.mapEngine.map) {
        this.mapEngine.map.invalidateSize();
      }
    }, 200);
  }

  updateParishSidebarStats() {
    const total = this.mapEngine.poligonos.length;
    const cubiertos = this.mapEngine.poligonos.filter(p => p.estado === "cubierto").length;
    const despliegue = this.mapEngine.poligonos.filter(p => p.estado === "en_despliegue").length;
    const alerta = this.mapEngine.poligonos.filter(p => p.estado === "alerta").length;

    const elTotal = document.getElementById("side-stat-total");
    const elCub = document.getElementById("side-stat-cubiertos");
    const elDesp = document.getElementById("side-stat-despliegue");
    const elCob = document.getElementById("side-stat-cobertura");

    if (elTotal) elTotal.textContent = total;
    if (elCub) elCub.textContent = cubiertos;
    if (elDesp) elDesp.textContent = despliegue;
    if (elCob) {
      const pct = total > 0 ? Math.round(((cubiertos + despliegue * 0.5) / total) * 100) : 0;
      elCob.textContent = `${pct}%`;
    }
  }

  openPolygonModal(poly) {
    this.selectedPolygon = poly;
    const modal = document.getElementById("modal-edit-polygon");
    if (!modal) return;

    document.getElementById("modal-poly-id").textContent = poly.id;
    document.getElementById("modal-poly-area").textContent = `${poly.areaHa || 0} Ha`;
    document.getElementById("input-poly-responsable").value = poly.responsable || "";
    document.getElementById("input-poly-telefono").value = poly.telefono || "";
    document.getElementById("input-poly-sector").value = poly.sector || "";
    document.getElementById("select-poly-estado").value = poly.estado || "disponible";
    document.getElementById("input-poly-obs").value = poly.observaciones || "";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  setupPortalEvents() {
    // Buscador
    const searchInput = document.getElementById("input-search-territorio");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.renderPortalMunicipios(e.target.value.trim());
      });
    }

    // Botón Volver a Municipios
    const btnVolver = document.getElementById("btn-back-to-portal");
    if (btnVolver) {
      btnVolver.addEventListener("click", () => {
        document.getElementById("view-mapa").classList.add("hidden");
        document.getElementById("view-mapa").classList.remove("flex");
        document.getElementById("view-portal").classList.remove("hidden");
        this.updateGlobalKPIs();
      });
    }

    // Modal Selector Cerrar
    const btnCloseMunModal = document.getElementById("btn-close-mun-modal");
    if (btnCloseMunModal) {
      btnCloseMunModal.addEventListener("click", () => {
        document.getElementById("modal-parroquias-selector").classList.add("hidden");
      });
    }

    // Selector de Tamaño / Resolución de Cuadrícula
    document.querySelectorAll(".btn-grid-res").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-grid-res").forEach(b => {
          b.classList.remove("bg-sky-500", "text-slate-950", "font-black");
          b.classList.add("bg-slate-800", "text-slate-300");
        });
        btn.classList.add("bg-sky-500", "text-slate-950", "font-black");
        btn.classList.remove("bg-slate-800", "text-slate-300");

        const r = parseInt(btn.dataset.radius);
        this.mapEngine.generateAutomaticGrid(r);
        this.saveCurrentParish();
        this.updateParishSidebarStats();
      });
    });

    // Guardar Ficha de Cuadrante
    const formPoly = document.getElementById("form-edit-poly");
    if (formPoly) {
      formPoly.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!this.selectedPolygon) return;

        this.selectedPolygon.responsable = document.getElementById("input-poly-responsable").value;
        this.selectedPolygon.telefono = document.getElementById("input-poly-telefono").value;
        this.selectedPolygon.sector = document.getElementById("input-poly-sector").value;
        this.selectedPolygon.estado = document.getElementById("select-poly-estado").value;
        this.selectedPolygon.observaciones = document.getElementById("input-poly-obs").value;

        this.saveCurrentParish();
        this.mapEngine.renderPolygons();
        this.updateParishSidebarStats();
        document.getElementById("modal-edit-polygon").classList.add("hidden");
      });
    }

    const btnClosePolyModal = document.getElementById("btn-close-poly-modal");
    if (btnClosePolyModal) {
      btnClosePolyModal.addEventListener("click", () => {
        document.getElementById("modal-edit-polygon").classList.add("hidden");
      });
    }

    // Exportar KML para Google Earth
    const btnKml = document.getElementById("btn-export-parish-kml");
    if (btnKml) {
      btnKml.addEventListener("click", () => {
        const kmlContent = AtlasStorage.exportParishKml(
          this.currentMun.nombre,
          this.currentParish,
          this.mapEngine.poligonos
        );
        const fileName = `${this.currentParish.codigo}_${this.currentParish.nombre.replace(/\s+/g, '_')}_GoogleEarth.kml`;
        AtlasStorage.downloadText(kmlContent, fileName, "application/vnd.google-earth.kml+xml");
      });
    }
  }

  saveCurrentParish() {
    if (!this.currentMun || !this.currentParish || !this.mapEngine) return;
    AtlasStorage.saveParishData(this.currentMun.id, this.currentParish.id, {
      poligonos: this.mapEngine.poligonos
    });
  }
}

function startAtlas() {
  if (!window.atlasApp) {
    window.atlasApp = new AtlasMonagasApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAtlas);
} else {
  startAtlas();
}
