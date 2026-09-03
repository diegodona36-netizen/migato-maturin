/**
 * Controlador Principal — Atlas Territorial Monagas (Enfocado en LÍNEAS y Carga de KML/KMZ)
 */
import { CATALOGO_MONAGAS } from "./catalogoMonagas.js";
import { AtlasStorage } from "./storageAtlas.js";
import { AtlasMapEngine } from "./mapEngine.js";
import { KmlImporter } from "./kmlImporter.js";

class AtlasMonagasApp {
  constructor() {
    this.currentMun = null;
    this.currentParish = null;
    this.mapEngine = null;

    // Líneas de la parroquia activa
    this.parishLines = [];

    // Estado temporal de trazado
    this.tempPoints = null;
    this.tempLongitudM = 0;
    this.selectedColor = "verde";
    this.editingLineId = null;

    this.init();
  }

  init() {
    this.renderPortalMunicipios();
    this.updateGlobalKPIs();
    this.setupEventListeners();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  updateGlobalKPIs() {
    const stats = AtlasStorage.getGlobalStats(CATALOGO_MONAGAS);

    const elMun = document.getElementById("kpi-mun-total");
    const elParroq = document.getElementById("kpi-parroq-total");
    const elLineas = document.getElementById("kpi-lineas-total");
    const elMetros = document.getElementById("kpi-metros-total");

    if (elMun) elMun.textContent = stats.totalMunicipios;
    if (elParroq) elParroq.textContent = stats.totalParroquias;
    if (elLineas) elLineas.textContent = stats.totalLineas;
    if (elMetros) elMetros.textContent = `${(stats.totalMetros / 1000).toFixed(1)} km`;
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
      card.className = "bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition group cursor-pointer flex flex-col justify-between";
      card.onclick = () => this.openMunicipalityParroquias(mun);

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow" style="background-color: ${mun.color}">
              <i data-lucide="${mun.icon || 'map-pin'}" class="w-5 h-5"></i>
            </span>
            <span class="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              ${mun.parroquias.length} Parroquias
            </span>
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-amber-300 transition">${mun.nombre}</h3>
          <p class="text-xs text-slate-400 mt-0.5">Capital: <span class="text-slate-200 font-semibold">${mun.capital}</span></p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span class="text-[11px] font-medium">Trazar calles y cargar planos</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition"></i>
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
        <div onclick="window.atlasApp.launchParishMap('${mun.id}', '${p.id}')" class="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between group">
          <div>
            <h4 class="text-sm font-bold text-white group-hover:text-amber-300 transition">${p.nombre}</h4>
            <p class="text-xs text-slate-400 font-mono">${p.tipo} • Código: ${p.codigo}</p>
            <p class="text-[10px] text-slate-500 mt-0.5 italic truncate max-w-xs">${p.sectores.join(", ")}</p>
          </div>
          <button class="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition flex items-center gap-1">
            <span>Trazar Calles</span>
            <i data-lucide="pencil-ruler" class="w-3.5 h-3.5"></i>
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
    const selectorModal = document.getElementById("modal-parroquias-selector");
    if (selectorModal) selectorModal.classList.add("hidden");

    this.currentMun = CATALOGO_MONAGAS.find(m => m.id === munId);
    this.currentParish = this.currentMun.parroquias.find(p => p.id === parishId);

    // Cambiar a Vista Mapa
    document.getElementById("view-portal").classList.add("hidden");
    document.getElementById("view-mapa").classList.remove("hidden");
    document.getElementById("view-mapa").classList.add("flex");

    // Breadcrumbs
    document.getElementById("nav-mun-name").textContent = this.currentMun.nombre;
    document.getElementById("nav-parish-name").textContent = this.currentParish.nombre;
    document.getElementById("side-parish-title").textContent = this.currentParish.nombre;
    document.getElementById("side-parish-badge").textContent = `${this.currentMun.nombre} • ${this.currentParish.tipo}`;

    // Cargar Líneas Guardadas
    this.parishLines = AtlasStorage.getParishLines(munId, parishId);

    // Inicializar Mapa si no existe
    if (!this.mapEngine) {
      this.mapEngine = new AtlasMapEngine(
        "atlas-map-canvas",
        (points, longitudM) => this.onFinishDrawing(points, longitudM),
        (lineData) => this.openEditLineModal(lineData)
      );
    }

    this.mapEngine.loadParish(this.currentParish, this.parishLines);
    this.refreshParishView();

    setTimeout(() => {
      if (this.mapEngine && this.mapEngine.map) {
        this.mapEngine.map.invalidateSize();
      }
    }, 200);
  }

  refreshParishView() {
    this.mapEngine.renderLines(this.parishLines);
    this.updateParishStats();
    this.renderParishSidebarList();
  }

  updateParishStats() {
    const total = this.parishLines.length;
    let totalMetros = 0;
    let buenoM = 0;
    let regularM = 0;
    let maloM = 0;
    let criticoM = 0;

    this.parishLines.forEach(l => {
      const m = l.longitudM || 0;
      totalMetros += m;
      if (l.color === "verde") buenoM += m;
      else if (l.color === "amarillo") regularM += m;
      else if (l.color === "naranja") maloM += m;
      else if (l.color === "rojo") criticoM += m;
    });

    const elTotal = document.getElementById("side-stat-total-lineas");
    const elMetros = document.getElementById("side-stat-metros");
    const elPctDanada = document.getElementById("side-stat-danada-pct");

    if (elTotal) elTotal.textContent = total;
    if (elMetros) elMetros.textContent = `${totalMetros} m`;

    const danadoM = maloM + criticoM;
    const pctDanado = totalMetros > 0 ? Math.round((danadoM / totalMetros) * 100) : 0;
    if (elPctDanada) elPctDanada.textContent = `${pctDanado}% en mal estado`;

    // Barras de progreso
    const barRojo = document.getElementById("bar-rojo");
    const barNaranja = document.getElementById("bar-naranja");
    const barAmarillo = document.getElementById("bar-amarillo");
    const barVerde = document.getElementById("bar-verde");

    if (barRojo) barRojo.style.width = totalMetros > 0 ? `${(criticoM / totalMetros) * 100}%` : "0%";
    if (barNaranja) barNaranja.style.width = totalMetros > 0 ? `${(maloM / totalMetros) * 100}%` : "0%";
    if (barAmarillo) barAmarillo.style.width = totalMetros > 0 ? `${(regularM / totalMetros) * 100}%` : "0%";
    if (barVerde) barVerde.style.width = totalMetros > 0 ? `${(buenoM / totalMetros) * 100}%` : "0%";
  }

  renderParishSidebarList() {
    const container = document.getElementById("side-parish-lines-list");
    if (!container) return;

    if (this.parishLines.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 space-y-2">
          <i data-lucide="pencil" class="w-7 h-7 mx-auto text-slate-600"></i>
          <p class="text-xs font-bold text-slate-400">Sin calles trazadas en esta parroquia.</p>
          <p class="text-[10px]">Toca "+ Trazar Nueva Calle" o "Cargar Plano" para importar KML/KMZ.</p>
        </div>
      `;
      if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
      return;
    }

    const colorBadge = {
      verde: "bg-emerald-500",
      amarillo: "bg-amber-500",
      naranja: "bg-orange-500",
      rojo: "bg-red-500"
    };

    container.innerHTML = this.parishLines.map((l, idx) => `
      <div class="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 cursor-pointer transition flex items-center justify-between gap-2 group" onclick="window.atlasApp.focusAndEditLine('${l.id}')">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow ${colorBadge[l.color] || 'bg-slate-500'}"></span>
          <div class="overflow-hidden">
            <h4 class="text-xs font-bold text-slate-200 truncate group-hover:text-white">${l.nombre}</h4>
            <p class="text-[10px] text-slate-400 font-mono">${l.longitudM} m • <span class="capitalize text-slate-300 font-bold">${l.color}</span></p>
          </div>
        </div>
        <button type="button" onclick="event.stopPropagation(); window.atlasApp.deleteLine('${l.id}')" class="p-1 text-slate-500 hover:text-red-400 rounded opacity-70 group-hover:opacity-100 transition" title="Borrar línea">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join("");

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  focusAndEditLine(lineId) {
    const line = this.parishLines.find(l => l.id === lineId);
    if (!line) return;

    if (line.puntos && line.puntos.length > 0) {
      const mid = line.puntos[Math.floor(line.puntos.length / 2)];
      this.mapEngine.focusOn(mid[0], mid[1]);
    }
    this.openEditLineModal(line);
  }

  onFinishDrawing(points, longitudM) {
    this.tempPoints = points;
    this.tempLongitudM = longitudM;
    this.editingLineId = null;
    this.selectedColor = "verde";

    this.setDrawingUiState(false);

    const modal = document.getElementById("modal-edit-line");
    document.getElementById("modal-line-length").textContent = `${longitudM} metros`;
    document.getElementById("input-line-name").value = `Tramo ${this.parishLines.length + 1}`;
    document.getElementById("input-line-obs").value = "";

    document.getElementById("box-split-line").classList.add("hidden");
    this.selectColorButton("verde");

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  openEditLineModal(line) {
    this.editingLineId = line.id;
    this.tempPoints = line.puntos;
    this.tempLongitudM = line.longitudM;
    this.selectedColor = line.color || "amarillo";

    const modal = document.getElementById("modal-edit-line");
    document.getElementById("modal-line-length").textContent = `${line.longitudM} metros`;
    document.getElementById("input-line-name").value = line.nombre;
    document.getElementById("input-line-obs").value = line.detalle || "";

    const boxSplit = document.getElementById("box-split-line");
    if (line.puntos && line.puntos.length >= 2) {
      boxSplit.classList.remove("hidden");
    } else {
      boxSplit.classList.add("hidden");
    }

    this.selectColorButton(this.selectedColor);

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  selectColorButton(color) {
    this.selectedColor = color;
    document.querySelectorAll(".btn-line-color").forEach(btn => {
      const isSelected = btn.dataset.color === color;
      btn.classList.toggle("ring-4", isSelected);
      btn.classList.toggle("ring-white/90", isSelected);
    });
  }


  loadSampleParishLines() {
    if (!this.currentParish) return;
    const [cLat, cLng] = this.currentParish.centro;

    const sampleLines = [
      {
        id: "DEMO-" + Date.now() + "-1",
        nombre: "Av. Principal (Tramo Óptimo)",
        color: "verde",
        longitudM: 520,
        detalle: "Capa asfáltica en excelente estado",
        puntos: [
          [cLat - 0.0025, cLng - 0.0035],
          [cLat - 0.0010, cLng - 0.0015],
          [cLat + 0.0005, cLng + 0.0008]
        ],
        fecha: new Date().toISOString()
      },
      {
        id: "DEMO-" + Date.now() + "-2",
        nombre: "Av. Principal (Continuación con Baches)",
        color: "amarillo",
        longitudM: 340,
        detalle: "Desgaste superficial y baches menores",
        puntos: [
          [cLat + 0.0005, cLng + 0.0008],
          [cLat + 0.0020, cLng + 0.0025],
          [cLat + 0.0032, cLng + 0.0038]
        ],
        fecha: new Date().toISOString()
      },
      {
        id: "DEMO-" + Date.now() + "-3",
        nombre: "Calle Transversal 1 (Sector Centro)",
        color: "naranja",
        longitudM: 280,
        detalle: "Huecos profundos, bacheo prioritario",
        puntos: [
          [cLat - 0.0010, cLng - 0.0015],
          [cLat + 0.0012, cLng - 0.0028],
          [cLat + 0.0025, cLng - 0.0038]
        ],
        fecha: new Date().toISOString()
      },
      {
        id: "DEMO-" + Date.now() + "-4",
        nombre: "Callejón Sur (Punto Crítico)",
        color: "rojo",
        longitudM: 210,
        detalle: "Falla de borde severa e intransitable",
        puntos: [
          [cLat + 0.0020, cLng + 0.0025],
          [cLat + 0.0035, cLng + 0.0012],
          [cLat + 0.0042, cLng + 0.0002]
        ],
        fecha: new Date().toISOString()
      }
    ];

    this.parishLines = sampleLines;
    this.saveParishLines();
    this.refreshParishView();

    const allCoords = sampleLines.flatMap(l => l.puntos);
    if (allCoords.length > 0) {
      this.mapEngine.map.fitBounds(L.polyline(allCoords).getBounds(), { padding: [60, 60] });
    }
  }

  deleteLine(lineId) {
    if (confirm("¿Deseas eliminar esta calle?")) {
      this.parishLines = this.parishLines.filter(l => l.id !== lineId);
      this.saveParishLines();
      this.refreshParishView();
    }
  }

  splitLine() {
    if (!this.editingLineId) return;
    const line = this.parishLines.find(l => l.id === this.editingLineId);
    if (!line || !line.puntos || line.puntos.length < 2) return;

    const midIdx = Math.floor(line.puntos.length / 2);
    let ptsA, ptsB;

    if (line.puntos.length === 2) {
      const pMid = [
        (line.puntos[0][0] + line.puntos[1][0]) / 2,
        (line.puntos[0][1] + line.puntos[1][1]) / 2
      ];
      ptsA = [line.puntos[0], pMid];
      ptsB = [pMid, line.puntos[1]];
    } else {
      ptsA = line.puntos.slice(0, midIdx + 1);
      ptsB = line.puntos.slice(midIdx);
    }

    const lenA = this.mapEngine.calculateLengthMeters(ptsA);
    const lenB = this.mapEngine.calculateLengthMeters(ptsB);

    line.nombre = `${line.nombre} (Parte A)`;
    line.puntos = ptsA;
    line.longitudM = lenA;

    const lineB = {
      id: `LINE-${Date.now()}`,
      nombre: `${line.nombre.replace(' (Parte A)', '')} (Parte B)`,
      color: "rojo",
      longitudM: lenB,
      puntos: ptsB,
      detalle: "Sección dividida para asignar color independiente",
      fecha: new Date().toISOString()
    };

    this.parishLines.push(lineB);
    this.saveParishLines();
    this.closeModal();
    this.refreshParishView();
  }

  setDrawingUiState(isDrawing) {
    const btnActivar = document.getElementById("btn-draw-street");
    const btnFinalizar = document.getElementById("btn-finish-street");
    const btnCancelar = document.getElementById("btn-cancel-street");
    const btnDeshacer = document.getElementById("btn-undo-point");
    const banner = document.getElementById("banner-drawing-live");

    if (isDrawing) {
      btnActivar.classList.add("hidden");
      btnFinalizar.classList.remove("hidden");
      btnFinalizar.classList.add("flex");
      btnCancelar.classList.remove("hidden");
      btnCancelar.classList.add("flex");
      btnDeshacer.classList.remove("hidden");
      btnDeshacer.classList.add("flex");
      banner.classList.remove("hidden");
      banner.classList.add("flex");
    } else {
      btnActivar.classList.remove("hidden");
      btnFinalizar.classList.add("hidden");
      btnFinalizar.classList.remove("flex");
      btnCancelar.classList.add("hidden");
      btnCancelar.classList.remove("flex");
      btnDeshacer.classList.add("hidden");
      btnDeshacer.classList.remove("flex");
      banner.classList.add("hidden");
      banner.classList.remove("flex");
    }
  }

  saveCurrentFormData() {
    const name = document.getElementById("input-line-name").value.trim();
    const obs = document.getElementById("input-line-obs").value.trim();

    let item = null;

    if (this.editingLineId) {
      const idx = this.parishLines.findIndex(l => l.id === this.editingLineId);
      if (idx !== -1) {
        this.parishLines[idx].nombre = name;
        this.parishLines[idx].color = this.selectedColor;
        this.parishLines[idx].detalle = obs;
        item = this.parishLines[idx];
      }
    } else {
      item = {
        id: `LINE-${Date.now()}`,
        nombre: name || `Tramo ${this.parishLines.length + 1}`,
        color: this.selectedColor,
        longitudM: this.tempLongitudM,
        puntos: this.tempPoints,
        detalle: obs,
        fecha: new Date().toISOString()
      };
      this.parishLines.push(item);
    }

    this.saveParishLines();
    return item;
  }

  saveParishLines() {
    if (!this.currentMun || !this.currentParish) return;
    AtlasStorage.saveParishLines(this.currentMun.id, this.currentParish.id, this.parishLines);
  }

  closeModal() {
    const modal = document.getElementById("modal-edit-line");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  setupEventListeners() {
    // 1. Buscador Portal
    const searchInput = document.getElementById("input-search-territorio");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.renderPortalMunicipios(e.target.value.trim());
      });
    }

    // 2. Volver a Portal
    const btnVolver = document.getElementById("btn-back-to-portal");
    if (btnVolver) {
      btnVolver.addEventListener("click", () => {
        document.getElementById("view-mapa").classList.add("hidden");
        document.getElementById("view-mapa").classList.remove("flex");
        document.getElementById("view-portal").classList.remove("hidden");
        this.updateGlobalKPIs();
      });
    }

    // 3. Cerrar selector parroquias
    const btnCloseMunModal = document.getElementById("btn-close-mun-modal");
    if (btnCloseMunModal) {
      btnCloseMunModal.addEventListener("click", () => {
        document.getElementById("modal-parroquias-selector").classList.add("hidden");
      });
    }

    // 4. Iniciar Trazo
    const btnDraw = document.getElementById("btn-draw-street");
    if (btnDraw) {
      btnDraw.addEventListener("click", () => {
        this.setDrawingUiState(true);
        this.mapEngine.startDrawing();
      });
    }

    // 5. Finalizar Trazo
    const btnFinish = document.getElementById("btn-finish-street");
    if (btnFinish) {
      btnFinish.addEventListener("click", () => {
        this.mapEngine.finishDrawing();
      });
    }

    // 6. Deshacer Punto
    const btnUndo = document.getElementById("btn-undo-point");
    if (btnUndo) {
      btnUndo.addEventListener("click", () => {
        this.mapEngine.undoLastPoint();
      });
    }

    // 7. Cancelar Trazo
    const btnCancel = document.getElementById("btn-cancel-street");
    if (btnCancel) {
      btnCancel.addEventListener("click", () => {
        this.setDrawingUiState(false);
        this.mapEngine.cancelDrawing();
      });
    }

    // 8. Botones de Color
    document.querySelectorAll(".btn-line-color").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectColorButton(btn.dataset.color);
      });
    });

    // 9. Guardar Solo Línea
    const formLine = document.getElementById("form-edit-line");
    if (formLine) {
      formLine.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveCurrentFormData();
        this.closeModal();
        this.refreshParishView();
      });
    }

    // 10. Guardar y Trazar Siguiente Tramo Continuo
    const btnContinuar = document.getElementById("btn-save-and-continue");
    if (btnContinuar) {
      btnContinuar.addEventListener("click", () => {
        const item = this.saveCurrentFormData();
        this.closeModal();
        this.refreshParishView();

        if (item && item.puntos && item.puntos.length > 0) {
          const lastPoint = item.puntos[item.puntos.length - 1];
          this.setDrawingUiState(true);
          this.mapEngine.startDrawing(lastPoint);
        }
      });
    }

    // 11. Dividir Tramo en Dos
    const btnSplit = document.getElementById("btn-split-line");
    if (btnSplit) {
      btnSplit.addEventListener("click", () => {
        this.splitLine();
      });
    }

    // 12. Modal Cerrar
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelModal = document.getElementById("btn-cancel-modal");
    const closeModalFn = () => this.closeModal();

    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModalFn);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModalFn);

    // 13. Cargar Archivos KML / KMZ (Planos de Mañana)
    const fileInput = document.getElementById("input-kml-file");
    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const importedLines = await KmlImporter.parseFile(file);
          if (importedLines.length === 0) {
            alert("No se encontraron líneas o vías en el archivo.");
            return;
          }

          this.parishLines.push(...importedLines);
          this.saveParishLines();
          this.refreshParishView();

          // Ajustar mapa a las nuevas líneas
          const allCoords = importedLines.flatMap(l => l.puntos);
          if (allCoords.length > 0) {
            this.mapEngine.map.fitBounds(L.polyline(allCoords).getBounds(), { padding: [50, 50] });
          }

          alert(`¡Éxito! Se cargaron ${importedLines.length} líneas de calles desde ${file.name}`);
        } catch (err) {
          alert("Error cargando plano KML/KMZ: " + err.message);
        }
      });
    }

    // 14. Exportar KML para Google Earth
    const btnExportKml = document.getElementById("btn-export-parish-kml");
    if (btnExportKml) {
      btnExportKml.addEventListener("click", () => {
        const kmlContent = AtlasStorage.exportParishKml(
          this.currentMun.nombre,
          this.currentParish,
          this.parishLines
        );
        const fileName = `${this.currentParish.codigo}_${this.currentParish.nombre.replace(/\s+/g, '_')}_Vias.kml`;
        AtlasStorage.downloadText(kmlContent, fileName, "application/vnd.google-earth.kml+xml");
      });
    }

    // Botón Ver Ejemplo / Demo de Calles
    const btnDemo = document.getElementById('btn-load-sample-lines');
    if (btnDemo) {
      btnDemo.addEventListener('click', () => {
        this.loadSampleParishLines();
      });
    }

    // 15. Borrar todas las líneas de la parroquia
    const btnBorrarTodo = document.getElementById("btn-clear-parish-lines");
    if (btnBorrarTodo) {
      btnBorrarTodo.addEventListener("click", () => {
        if (confirm("¿Deseas borrar todas las calles trazadas en esta parroquia para comenzar de cero?")) {
          this.parishLines = [];
          this.saveParishLines();
          this.refreshParishView();
        }
      });
    }
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
