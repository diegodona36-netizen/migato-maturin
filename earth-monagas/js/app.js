/**
 * Controlador Principal — Google Earth Pro Web (Edición Estado Monagas)
 * Robusto, 100% Operativo y Totalmente Individualizado
 */
import { CATALOGO_MONAGAS } from "./catalogoMonagas.js";
import { EarthStore } from "./earthStore.js";
import { EarthMapEngine } from "./mapEngine.js";
import { PropertiesDialog } from "./propertiesDialog.js";
import { ToolsManager } from "./toolsManager.js";

class EarthMonagasApp {
  constructor() {
    this.store = null;
    this.mapEngine = null;
    this.propDialog = null;
    this.toolsManager = null;

    this.selectedMunId = "maturin";
    this.selectedParishId = "alto-de-los-godos";

    this.init();
  }

  init() {
    this.store = new EarthStore(CATALOGO_MONAGAS);

    // Leer parámetro URL para individualización (?p=caicara o ?p=alto-de-los-godos)
    const urlParams = new URLSearchParams(window.location.search);
    const paramParish = urlParams.get("p") || urlParams.get("parroquia");
    if (paramParish) {
      const pNorm = paramParish.toLowerCase().trim();
      for (const mun of CATALOGO_MONAGAS) {
        const match = mun.parroquias.find(p => 
          p.id.toLowerCase() === pNorm || 
          p.id.toLowerCase().includes(pNorm) ||
          p.nombre.toLowerCase().replace(/\s+/g, '-').includes(pNorm)
        );
        if (match) {
          this.selectedMunId = mun.id;
          this.selectedParishId = match.id;
          break;
        }
      }
    }

    this.mapEngine = new EarthMapEngine("earth-canvas", (lat, lng, eyeAlt) => {
      this.updateStatusBar(lat, lng, eyeAlt);
    });

    this.propDialog = new PropertiesDialog((type, itemId, updated) => {
      this.handleSaveProperties(type, itemId, updated);
    });

    this.toolsManager = new ToolsManager(this.mapEngine, (type, newItem) => {
      this.handleFinishedDrawing(type, newItem);
    });

    this.setupToolbarEvents();
    this.setupDragAndDrop();
    this.setupOverlayModal();
    this.setupParishSelectorModal();

    // Cargar parroquia activa inicial
    this.selectParish(this.selectedMunId, this.selectedParishId);

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  updateStatusBar(lat, lng, eyeAlt) {
    const coordEl = document.getElementById("status-coords");
    const altEl = document.getElementById("status-eye-alt");

    if (coordEl) {
      const latDMS = this.toDMS(lat, true);
      const lngDMS = this.toDMS(lng, false);
      coordEl.textContent = `${latDMS} ${lngDMS}`;
    }

    if (altEl) {
      altEl.textContent = `Ojo: ${eyeAlt}`;
    }
  }

  toDMS(deg, isLat) {
    const dir = deg >= 0 ? (isLat ? "N" : "E") : (isLat ? "S" : "W");
    const absDeg = Math.abs(deg);
    const d = Math.floor(absDeg);
    const m = Math.floor((absDeg - d) * 60);
    const s = ((absDeg - d - m / 60) * 3600).toFixed(1);
    return `${d}°${m}'${s}"${dir}`;
  }

  selectParish(munId, parishId) {
    this.selectedMunId = munId;
    this.selectedParishId = parishId;

    const parish = this.store.getParish(munId, parishId);
    if (!parish) return;

    const munObj = CATALOGO_MONAGAS.find(m => m.id === munId);
    const navLoc = document.getElementById("nav-current-location");
    if (navLoc) {
      if (window.innerWidth < 640) {
        navLoc.textContent = parish.nombre;
      } else {
        navLoc.textContent = `${parish.nombre} (${munObj.nombre})`;
      }
      navLoc.parentElement.title = `${parish.nombre} - Municipio ${munObj.nombre}`;
    }

    // Actualizar título de pestaña
    document.title = `${parish.nombre} (${munObj.nombre}) • Google Earth Pro`;

    // Mostrar perímetro y elementos de esta parroquia
    this.mapEngine.showParishBoundary(parish.limite);
    this.mapEngine.renderParishItems(parish, (type, item) => {
      this.propDialog.open(type, item);
    });

    this.renderPlacesTree();

    // En pantallas móviles, replegar el sidebar para ver el mapa 100%
    if (window.innerWidth < 768) {
      const sidebar = document.getElementById("earth-sidebar");
      const backdrop = document.getElementById("sidebar-backdrop");
      if (sidebar) {
        sidebar.classList.add("hidden");
        sidebar.classList.remove("flex");
      }
      if (backdrop) backdrop.classList.add("hidden");
    }
  }

  /**
   * Renderiza el Árbol de Lugares de manera individualizada pero permitiendo
   * gestionar perfectamente todos los sectores y calles de la parroquia activa.
   */
  renderPlacesTree(filterQuery = "") {
    const container = document.getElementById("places-tree-content");
    if (!container) return;

    const munObj = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
    const pData = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!pData) return;

    const q = filterQuery.toLowerCase().trim();

    const filteredPolys = (pData.poligonos || []).filter(p => !q || p.nombre.toLowerCase().includes(q));
    const filteredRoutes = (pData.rutas || []).filter(r => !q || r.nombre.toLowerCase().includes(q));
    const filteredMarks = (pData.marcas || []).filter(m => !q || m.nombre.toLowerCase().includes(q));

    let html = `
      <!-- Tarjeta de Parroquia Activa -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-sky-500/40 mb-3 shadow-lg">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider">${munObj?.nombre || 'Municipio'}</span>
          <button onclick="window.earthApp.openParishSelector()" class="text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30 active:scale-95 transition">
            Cambiar ▾
          </button>
        </div>
        <h4 class="text-sm font-black text-white truncate">${pData.nombre}</h4>
        <div class="flex items-center gap-2 mt-2">
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-800/40">
            <i data-lucide="layers" class="w-3 h-3"></i>
            <span>${pData.poligonos?.length || 0} sectores</span>
          </span>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40">
            <i data-lucide="git-commit" class="w-3 h-3"></i>
            <span>${pData.rutas?.length || 0} calles</span>
          </span>
        </div>
      </div>

      <!-- SECCIÓN: POLÍGONOS DE SECTORES -->
      <div class="mb-3">
        <div class="flex items-center justify-between px-2 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800/60 mb-1.5">
          <span class="flex items-center gap-1.5 text-xs font-black text-sky-400 uppercase tracking-wide">
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>Sectores / Polígonos (${filteredPolys.length})</span>
          </span>
          <button onclick="document.getElementById('btn-tool-polygon').click()" class="text-[10px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 active:scale-95 transition" title="Trazar nuevo sector">
            + Nuevo
          </button>
        </div>
        <div class="space-y-1 mt-1">
    `;

    if (filteredPolys.length === 0) {
      html += `
        <div class="text-[11px] text-slate-500 px-3 py-2.5 italic bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
          No hay sectores trazados aún.<br>Usa el botón <strong>Polígono</strong> arriba para marcar uno.
        </div>
      `;
    } else {
      filteredPolys.forEach(poly => {
        html += `
          <div class="flex items-center justify-between py-2 px-2.5 bg-slate-950/70 hover:bg-slate-800 rounded-xl group text-xs border border-slate-800/60 transition shadow-sm">
            <div class="flex items-center gap-2 truncate">
              <input type="checkbox" ${poly.visible !== false ? 'checked' : ''} 
                onchange="window.earthApp.toggleItemVisibility('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')"
                class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer">
              <span class="w-3 h-3 rounded-sm border shrink-0" style="background-color: ${poly.colorRelleno || '#38bdf8'}; border-color: ${poly.colorBorde || '#ffffff'};"></span>
              <div class="truncate cursor-pointer" onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}')">
                <span class="text-slate-200 font-bold block truncate group-hover:text-sky-400">${poly.nombre}</span>
                <span class="text-[10px] text-slate-500 font-mono">${poly.areaHa || 0} Ha • ${poly.perimetroM || 0} m</span>
              </div>
            </div>
            <button onclick="window.earthApp.deleteItem('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Eliminar sector">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>

      <!-- SECCIÓN: RUTAS Y CALLES -->
      <div class="mb-3">
        <div class="flex items-center justify-between px-2 py-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
          <span class="flex items-center gap-1.5 text-emerald-300">
            <i data-lucide="git-commit" class="w-3.5 h-3.5"></i>
            <span>Vialidad / Calles (${filteredRoutes.length})</span>
          </span>
        </div>
        <div class="space-y-1 mt-1">
    `;

    if (filteredRoutes.length === 0) {
      html += `
        <div class="text-[11px] text-slate-500 px-3 py-2.5 italic bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
          No hay calles trazadas aún.<br>Usa el botón <strong>Ruta</strong> arriba para marcar una.
        </div>
      `;
    } else {
      filteredRoutes.forEach(r => {
        html += `
          <div class="flex items-center justify-between py-2 px-2.5 bg-slate-950/70 hover:bg-slate-800 rounded-xl group text-xs border border-slate-800/60 transition shadow-sm">
            <div class="flex items-center gap-2 truncate">
              <input type="checkbox" ${r.visible !== false ? 'checked' : ''} 
                onchange="window.earthApp.toggleItemVisibility('${this.selectedMunId}', '${this.selectedParishId}', 'ruta', '${r.id}')"
                class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer">
              <span class="w-3.5 h-1 shrink-0 rounded" style="background-color: ${r.color || '#10b981'};"></span>
              <div class="truncate cursor-pointer" onclick="window.earthApp.focusAndEdit('ruta', '${r.id}')">
                <span class="text-slate-200 font-bold block truncate group-hover:text-emerald-400">${r.nombre}</span>
                <span class="text-[10px] text-slate-500 font-mono">${r.longitudM || 0} metros</span>
              </div>
            </div>
            <button onclick="window.earthApp.deleteItem('${this.selectedMunId}', '${this.selectedParishId}', 'ruta', '${r.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Eliminar calle">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  setupParishSelectorModal() {
    const modal = document.getElementById("modal-select-parish");
    const btnOpen = document.getElementById("btn-open-parish-modal");
    const btnClose = document.getElementById("btn-close-parish-modal");

    if (btnOpen) {
      btnOpen.addEventListener("click", () => this.openParishSelector());
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        if (modal) {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }
      });
    }
  }

  openParishSelector() {
    const modal = document.getElementById("modal-select-parish");
    if (!modal) return;
    this.renderParishesCatalog();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  renderParishesCatalog() {
    const catalog = document.getElementById("modal-parishes-catalog");
    if (!catalog) return;

    catalog.innerHTML = CATALOGO_MONAGAS.map(mun => {
      const isCurrentMun = mun.id === this.selectedMunId;
      const parishesButtons = mun.parroquias.map(p => {
        const isCurrent = isCurrentMun && p.id === this.selectedParishId;
        return `
          <button onclick="window.earthApp.selectParishFromModal('${mun.id}', '${p.id}')" class="px-3 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between ${isCurrent ? 'bg-sky-600 text-white font-black shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}">
            <span>${p.nombre}</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
          </button>
        `;
      }).join("");

      return `
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div class="flex items-center justify-between">
            <strong class="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
              <span>${mun.nombre}</span>
            </strong>
            <span class="text-[10px] text-slate-500 font-mono">${mun.parroquias.length} parroquias</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            ${parishesButtons}
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  selectParishFromModal(munId, parishId) {
    const modal = document.getElementById("modal-select-parish");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    this.selectParish(munId, parishId);
  }

  focusAndEdit(type, itemId) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish || !parish[type === "poligono" ? "poligonos" : "rutas"]) return;

    const list = type === "poligono" ? parish.poligonos : parish.rutas;
    const item = list.find(i => i.id === itemId);
    if (!item) return;

    if (type === "poligono" && item.vertices.length > 0) {
      this.mapEngine.map.fitBounds(L.polygon(item.vertices).getBounds(), { padding: [40, 40] });
    } else if (type === "ruta" && item.puntos.length > 0) {
      this.mapEngine.map.fitBounds(L.polyline(item.puntos).getBounds(), { padding: [40, 40] });
    }

    this.propDialog.open(type, item);
  }

  handleFinishedDrawing(type, newItem) {
    this.store.addItemToParish(this.selectedMunId, this.selectedParishId, type === "poligono" ? "poligonos" : "rutas", newItem);

    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));

    this.propDialog.open(type, newItem);
    this.renderPlacesTree();
  }

  handleSaveProperties(type, itemId, updatedFields) {
    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : "marcas");
    this.store.updateItem(this.selectedMunId, this.selectedParishId, key, itemId, updatedFields);

    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));
    this.renderPlacesTree();
  }

  deleteItem(munId, parishId, type, itemId) {
    if (confirm("¿Deseas eliminar este elemento de Google Earth?")) {
      const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : "marcas");
      this.store.deleteItem(munId, parishId, key, itemId);

      const parish = this.store.getParish(munId, parishId);
      this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));
      this.renderPlacesTree();
    }
  }

  toggleItemVisibility(munId, parishId, type, itemId) {
    const key = type === "poligono" ? "poligonos" : "rutas";
    this.store.toggleItemVisibility(munId, parishId, key, itemId);

    const parish = this.store.getParish(munId, parishId);
    this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));
  }

  setupToolbarEvents() {
    // 1. Botones de herramientas principales
    const btnPoly = document.getElementById("btn-tool-polygon");
    if (btnPoly) {
      btnPoly.addEventListener("click", () => {
        this.toolsManager.setActiveTool("poligono");
      });
    }

    const btnPath = document.getElementById("btn-tool-path");
    if (btnPath) {
      btnPath.addEventListener("click", () => {
        this.toolsManager.setActiveTool("ruta");
      });
    }

    const btnPlacemark = document.getElementById("btn-tool-placemark");
    if (btnPlacemark) {
      btnPlacemark.addEventListener("click", () => {
        this.toolsManager.setActiveTool("marca");
      });
    }

    // 2. Banner Flotante (Deshacer, Listo, Cancelar)
    const btnUndo = document.getElementById("btn-banner-undo");
    if (btnUndo) {
      btnUndo.addEventListener("click", () => {
        this.toolsManager.undoLastPoint();
      });
    }

    const btnFinish = document.getElementById("btn-banner-finish");
    if (btnFinish) {
      btnFinish.addEventListener("click", () => {
        this.toolsManager.finishCurrentDrawing();
      });
    }

    const btnCancel = document.getElementById("btn-banner-cancel");
    if (btnCancel) {
      btnCancel.addEventListener("click", () => {
        this.toolsManager.cancelActiveTool();
      });
    }

    // 3. Buscador en árbol de lugares
    const searchPlaces = document.getElementById("input-search-places");
    if (searchPlaces) {
      searchPlaces.addEventListener("input", (e) => {
        this.renderPlacesTree(e.target.value);
      });
    }

    // 4. Abrir KML
    const btnOpenKmlTrigger = document.getElementById("btn-open-kml-trigger");
    const inputFileKml = document.getElementById("input-file-kml");
    if (btnOpenKmlTrigger && inputFileKml) {
      btnOpenKmlTrigger.addEventListener("click", () => inputFileKml.click());
    }

    // 5. Exportar KML nativo (Individual de la Parroquia Activa)
    const btnExport = document.getElementById("btn-export-kml");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const kmlStr = this.store.exportToKml(this.selectedMunId, this.selectedParishId);
        const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
        const fileName = `${parish.nombre.replace(/\s+/g, '_')}_GoogleEarthPro.kml`;

        const blob = new Blob([kmlStr], { type: "application/vnd.google-earth.kml+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // 6. Brújula / Reset Norte
    const btnCompass = document.getElementById("btn-compass-north");
    if (btnCompass) {
      btnCompass.addEventListener("click", () => {
        const p = this.store.getParish(this.selectedMunId, this.selectedParishId);
        if (p) this.mapEngine.flyTo(p.centro[0], p.centro[1], p.zoom || 14);
      });
    }

    // 7. Toggle y cierre ergonómico del sidebar en móvil
    const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
    const btnCloseSidebar = document.getElementById("btn-close-sidebar");
    const sidebar = document.getElementById("earth-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    const toggleSidebar = (open = null) => {
      if (!sidebar) return;
      const willOpen = open !== null ? open : sidebar.classList.contains("hidden");
      if (willOpen) {
        sidebar.classList.remove("hidden");
        sidebar.classList.add("flex");
        if (backdrop) backdrop.classList.remove("hidden");
      } else {
        sidebar.classList.add("hidden");
        sidebar.classList.remove("flex");
        if (backdrop) backdrop.classList.add("hidden");
      }
    };

    if (btnToggleSidebar) btnToggleSidebar.addEventListener("click", () => toggleSidebar());
    if (btnCloseSidebar) btnCloseSidebar.addEventListener("click", () => toggleSidebar(false));
    if (backdrop) backdrop.addEventListener("click", () => toggleSidebar(false));
  }

  setupDragAndDrop() {
    const dropZone = window;

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        await this.importKmlFile(files[i]);
      }
    });

    const fileInput = document.getElementById("input-file-kml");
    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) await this.importKmlFile(file);
      });
    }
  }

  async importKmlFile(file) {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      const placemarks = xmlDoc.getElementsByTagName("Placemark");
      let count = 0;

      for (let i = 0; i < placemarks.length; i++) {
        const pm = placemarks[i];
        const name = pm.getElementsByTagName("name")[0]?.textContent || `Elemento ${i+1}`;
        const polygon = pm.getElementsByTagName("Polygon")[0];
        const line = pm.getElementsByTagName("LineString")[0];

        if (polygon) {
          const coords = polygon.getElementsByTagName("coordinates")[0]?.textContent || "";
          const vertices = this.parseCoords(coords);
          if (vertices.length >= 3) {
            this.store.addItemToParish(this.selectedMunId, this.selectedParishId, "poligonos", {
              id: `IMP-POLY-${Date.now()}-${i}`,
              nombre: name,
              colorBorde: "#f59e0b",
              anchoBorde: 2,
              colorRelleno: "#f59e0b",
              opacidad: 0.35,
              vertices,
              areaHa: this.toolsManager.calculatePolygonAreaHa(vertices),
              perimetroM: this.toolsManager.calculatePerimeterMeters(vertices),
              visible: true,
              fecha: new Date().toISOString()
            });
            count++;
          }
        } else if (line) {
          const coords = line.getElementsByTagName("coordinates")[0]?.textContent || "";
          const puntos = this.parseCoords(coords);
          if (puntos.length >= 2) {
            this.store.addItemToParish(this.selectedMunId, this.selectedParishId, "rutas", {
              id: `IMP-ROUTE-${Date.now()}-${i}`,
              nombre: name,
              color: "#10b981",
              ancho: 4,
              puntos,
              longitudM: this.toolsManager.calculatePerimeterMeters(puntos),
              visible: true,
              fecha: new Date().toISOString()
            });
            count++;
          }
        }
      }

      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));
      this.renderPlacesTree();
      alert(`Google Earth Pro: Se importaron ${count} elementos KML en ${parish.nombre}`);
    } catch (err) {
      alert("Error importando archivo KML: " + err.message);
    }
  }

  parseCoords(str) {
    return str.trim().split(/\s+/).map(pt => {
      const parts = pt.split(",");
      return [parseFloat(parts[1]), parseFloat(parts[0])];
    }).filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
  }

  setupOverlayModal() {
    const modal = document.getElementById("modal-image-overlay");
    const btnOpen = document.getElementById("btn-tool-overlay");
    const btnClose = document.getElementById("btn-close-overlay");
    const form = document.getElementById("form-image-overlay");
    const inputOpacity = document.getElementById("overlay-opacity");
    const labelOpacity = document.getElementById("overlay-opacity-val");

    if (btnOpen) {
      btnOpen.addEventListener("click", () => {
        if (modal) {
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        if (modal) {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }
      });
    }

    if (inputOpacity && labelOpacity) {
      inputOpacity.addEventListener("input", (e) => {
        labelOpacity.textContent = `${Math.round(e.target.value * 100)}%`;
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fileInput = document.getElementById("input-overlay-file");
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target.result;
          const bounds = this.mapEngine.map.getBounds();
          const op = parseFloat(inputOpacity.value) || 0.65;
          this.mapEngine.addImageOverlay(imgUrl, bounds, op);
          if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          alert("Plano superpuesto con éxito sobre el satélite. Ya puedes calcar polígonos y calles encima.");
        };
        reader.readAsDataURL(file);
      });
    }
  }
}

function startEarth() {
  if (!window.earthApp) {
    window.earthApp = new EarthMonagasApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startEarth);
} else {
  startEarth();
}
