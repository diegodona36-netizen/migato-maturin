/**
 * Controlador Principal — Google Earth Pro Web (Edición Estado Monagas)
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

    this.mapEngine = new EarthMapEngine("earth-canvas", (lat, lng, eyeAlt) => {
      this.updateStatusBar(lat, lng, eyeAlt);
    });

    this.propDialog = new PropertiesDialog((type, itemId, updated) => {
      this.handleSaveProperties(type, itemId, updated);
    });

    this.toolsManager = new ToolsManager(this.mapEngine, (type, newItem) => {
      this.handleFinishedDrawing(type, newItem);
    });

    this.renderPlacesTree();
    this.setupToolbarEvents();
    this.setupDragAndDrop();
    this.setupOverlayModal();

    // Cargar parroquia inicial por defecto (La Puente / Alto de Los Godos en Maturín)
    this.selectParish("maturin", "alto-de-los-godos");

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
      coordEl.textContent = `${latDMS}   ${lngDMS}  (${lat.toFixed(5)}°, ${lng.toFixed(5)}°)`;
    }

    if (altEl) {
      altEl.textContent = `Ojo alt.: ${eyeAlt}`;
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

    // Actualizar miga de pan superior
    const munObj = CATALOGO_MONAGAS.find(m => m.id === munId);
    document.getElementById("nav-current-location").textContent = `${munObj.nombre} > ${parish.nombre}`;

    // Mostrar perímetro oficial y elementos de la parroquia
    this.mapEngine.showParishBoundary(parish.limite);
    this.mapEngine.renderParishItems(parish, (type, item) => {
      this.propDialog.open(type, item);
    });

    this.renderPlacesTree();
  }

  renderPlacesTree(filterQuery = "") {
    const container = document.getElementById("places-tree-content");
    if (!container) return;

    const q = filterQuery.toLowerCase().trim();
    const munList = CATALOGO_MONAGAS;

    container.innerHTML = munList.map(mun => {
      const munData = this.store.state.municipios[mun.id];
      const isMunActive = this.selectedMunId === mun.id;

      // Filtrar parroquias si hay búsqueda
      const visibleParishes = mun.parroquias.filter(p => {
        if (!q) return true;
        return p.nombre.toLowerCase().includes(q) || mun.nombre.toLowerCase().includes(q);
      });

      if (q && visibleParishes.length === 0) return "";

      const parishesHtml = visibleParishes.map(p => {
        const pData = munData?.parroquias[p.id];
        const isParishActive = this.selectedMunId === mun.id && this.selectedParishId === p.id;
        const totalItems = (pData?.poligonos?.length || 0) + (pData?.rutas?.length || 0) + (pData?.marcas?.length || 0);

        // Subitems (Polígonos y Rutas)
        let subItemsHtml = "";
        if (pData) {
          (pData.poligonos || []).forEach(poly => {
            subItemsHtml += `
              <div class="flex items-center justify-between py-1 pl-8 pr-2 hover:bg-slate-800/80 rounded group text-xs">
                <div class="flex items-center gap-1.5 truncate">
                  <input type="checkbox" ${poly.visible !== false ? 'checked' : ''} 
                    onchange="window.earthApp.toggleItemVisibility('${mun.id}', '${p.id}', 'poligono', '${poly.id}')"
                    class="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer">
                  <span class="w-2.5 h-2.5 rounded-sm border shrink-0" style="background-color: ${poly.colorRelleno || '#38bdf8'}; border-color: ${poly.colorBorde || '#ffffff'};"></span>
                  <span class="truncate text-slate-300 group-hover:text-white cursor-pointer" onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}')">${poly.nombre}</span>
                </div>
                <button onclick="window.earthApp.deleteItem('${mun.id}', '${p.id}', 'poligono', '${poly.id}')" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-0.5" title="Eliminar">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
              </div>
            `;
          });

          (pData.rutas || []).forEach(r => {
            subItemsHtml += `
              <div class="flex items-center justify-between py-1 pl-8 pr-2 hover:bg-slate-800/80 rounded group text-xs">
                <div class="flex items-center gap-1.5 truncate">
                  <input type="checkbox" ${r.visible !== false ? 'checked' : ''} 
                    onchange="window.earthApp.toggleItemVisibility('${mun.id}', '${p.id}', 'ruta', '${r.id}')"
                    class="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer">
                  <span class="w-3 h-0.5 shrink-0" style="background-color: ${r.color || '#10b981'};"></span>
                  <span class="truncate text-slate-300 group-hover:text-white cursor-pointer" onclick="window.earthApp.focusAndEdit('ruta', '${r.id}')">${r.nombre}</span>
                </div>
                <button onclick="window.earthApp.deleteItem('${mun.id}', '${p.id}', 'ruta', '${r.id}')" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-0.5" title="Eliminar">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
              </div>
            `;
          });
        }

        return `
          <div class="mb-0.5">
            <div class="flex items-center justify-between py-1 pl-5 pr-2 rounded-lg cursor-pointer transition ${isParishActive ? 'bg-sky-900/40 text-sky-300 font-bold border border-sky-700/40' : 'hover:bg-slate-800/60 text-slate-300'}">
              <div class="flex items-center gap-1.5 truncate" onclick="window.earthApp.selectParish('${mun.id}', '${p.id}')">
                <input type="checkbox" ${pData?.visible !== false ? 'checked' : ''} 
                  onchange="event.stopPropagation(); window.earthApp.toggleParishVisibility('${mun.id}', '${p.id}')"
                  class="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer">
                <i data-lucide="folder" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
                <span class="truncate text-xs">${p.nombre}</span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">${totalItems > 0 ? totalItems : ''}</span>
            </div>
            ${subItemsHtml}
          </div>
        `;
      }).join("");

      return `
        <div class="mb-1">
          <div class="flex items-center justify-between py-1.5 px-2 bg-slate-950/70 hover:bg-slate-800/70 rounded-lg cursor-pointer transition border border-slate-800/60">
            <div class="flex items-center gap-1.5 truncate">
              <input type="checkbox" ${munData?.visible !== false ? 'checked' : ''} 
                onchange="window.earthApp.toggleMunicipalityVisibility('${mun.id}')"
                class="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer">
              <i data-lucide="folder-tree" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>
              <strong class="text-xs font-bold text-white truncate">${mun.nombre}</strong>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">${mun.parroquias.length}p</span>
          </div>
          <div class="mt-0.5 space-y-0.5">
            ${parishesHtml}
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
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
    // Agregar elemento a la parroquia activa
    this.store.addItemToParish(this.selectedMunId, this.selectedParishId, type === "poligono" ? "poligonos" : "rutas", newItem);

    // Renderizar en mapa
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));

    // Abrir ventana de propiedades de Google Earth Pro
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

  toggleParishVisibility(munId, parishId) {
    this.store.toggleParishVisibility(munId, parishId);
    const parish = this.store.getParish(munId, parishId);
    this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));
  }

  toggleMunicipalityVisibility(munId) {
    this.store.toggleMunicipalityVisibility(munId);
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it));
  }

  setupToolbarEvents() {
    // 1. Herramientas de Dibujo
    document.getElementById("btn-tool-polygon").addEventListener("click", () => {
      this.toolsManager.setActiveTool("poligono");
    });

    document.getElementById("btn-tool-path").addEventListener("click", () => {
      this.toolsManager.setActiveTool("ruta");
    });

    document.getElementById("btn-tool-placemark").addEventListener("click", () => {
      this.toolsManager.setActiveTool("marca");
    });

    document.getElementById("btn-tool-ruler").addEventListener("click", () => {
      this.toolsManager.setActiveTool("regla");
    });

    // Finalizar / Cancelar dibujo desde el banner flotante
    document.getElementById("btn-banner-finish").addEventListener("click", () => {
      this.toolsManager.finishCurrentDrawing();
    });

    document.getElementById("btn-banner-cancel").addEventListener("click", () => {
      this.toolsManager.cancelActiveTool();
    });

    // 2. Buscador en árbol de lugares
    document.getElementById("input-search-places").addEventListener("input", (e) => {
      this.renderPlacesTree(e.target.value);
    });

    // 3. Exportar KML nativo
    document.getElementById("btn-export-kml").addEventListener("click", () => {
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

    // 4. Brújula / Reset Norte
    document.getElementById("btn-compass-north").addEventListener("click", () => {
      const p = this.store.getParish(this.selectedMunId, this.selectedParishId);
      if (p) this.mapEngine.flyTo(p.centro[0], p.centro[1], p.zoom || 14);
    });

    // 5. Toggle sidebar en móvil
    const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
    const sidebar = document.getElementById("earth-sidebar");
    if (btnToggleSidebar && sidebar) {
      btnToggleSidebar.addEventListener("click", () => {
        sidebar.classList.toggle("hidden");
        sidebar.classList.toggle("flex");
      });
    }
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

    if (btnOpen) btnOpen.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    });

    if (btnClose) btnClose.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });

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
          modal.classList.add("hidden");
          modal.classList.remove("flex");
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
