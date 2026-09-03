/**
 * Controlador Principal — Trazado Tramo a Tramo Continuo y División de Tramos
 */
import { RoadMapViewer } from "./mapViewer.js";
import { RoadStorageService } from "./storage.js";

const STORAGE_KEY_CALLES = "vialidad_lapuente_calles_trazadas_v2";

class TrazadorVialApp {
  constructor() {
    this.tramos = this.loadTramos();
    this.mapViewer = null;

    this.tempPoints = null;
    this.tempLongitudM = 0;
    this.tempFoto = null;
    this.selectedColor = "amarillo";
    this.editingTramoId = null;
    this.nextStartAnchor = null;

    this.init();
  }

  loadTramos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CALLES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveTramos() {
    try {
      localStorage.setItem(STORAGE_KEY_CALLES, JSON.stringify(this.tramos));
    } catch (e) {
      console.error("Error guardando tramos:", e);
    }
  }

  init() {
    this.mapViewer = new RoadMapViewer(
      "map-vialidad",
      (points, longitudM) => this.onFinishDrawing(points, longitudM),
      (tramo) => this.openEditModal(tramo)
    );

    this.refreshView();
    this.setupEventListeners();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  refreshView() {
    this.mapViewer.renderSavedTramos(this.tramos);
    this.updateStats();
    this.renderSidebarList();
  }

  updateStats() {
    const total = this.tramos.length;
    let totalMetros = 0;
    let criticoM = 0;
    let maloM = 0;
    let regularM = 0;
    let buenoM = 0;

    this.tramos.forEach(t => {
      totalMetros += t.longitudM || 0;
      if (t.color === "rojo") criticoM += t.longitudM;
      else if (t.color === "naranja") maloM += t.longitudM;
      else if (t.color === "amarillo") regularM += t.longitudM;
      else if (t.color === "verde") buenoM += t.longitudM;
    });

    const contadorEl = document.getElementById("kpi-contador-calles");
    const longitudEl = document.getElementById("txt-longitud-total");
    const danadaEl = document.getElementById("txt-danada-pct");

    if (contadorEl) contadorEl.textContent = `${total} tramo(s)`;
    if (longitudEl) longitudEl.textContent = `${totalMetros} m trazados`;

    const metrosDanados = criticoM + maloM;
    const pctDanada = totalMetros > 0 ? Math.round((metrosDanados / totalMetros) * 100) : 0;
    if (danadaEl) danadaEl.textContent = `${pctDanada}% en mal estado`;

    const barRojo = document.getElementById("bar-rojo");
    const barNaranja = document.getElementById("bar-naranja");
    const barAmarillo = document.getElementById("bar-amarillo");
    const barVerde = document.getElementById("bar-verde");

    if (barRojo) barRojo.style.width = totalMetros > 0 ? `${(criticoM / totalMetros) * 100}%` : "0%";
    if (barNaranja) barNaranja.style.width = totalMetros > 0 ? `${(maloM / totalMetros) * 100}%` : "0%";
    if (barAmarillo) barAmarillo.style.width = totalMetros > 0 ? `${(regularM / totalMetros) * 100}%` : "0%";
    if (barVerde) barVerde.style.width = totalMetros > 0 ? `${(buenoM / totalMetros) * 100}%` : "0%";
  }

  renderSidebarList() {
    const container = document.getElementById("lista-tramos-trazados");
    if (!container) return;

    if (this.tramos.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 space-y-2">
          <i data-lucide="edit-3" class="w-8 h-8 mx-auto text-slate-600"></i>
          <p class="text-xs font-bold text-slate-400">Aún no has trazado tramos en La Puente.</p>
          <p class="text-[10px]">Toca "+ Trazar Nuevo Tramo" para empezar cuadra por cuadra.</p>
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

    container.innerHTML = this.tramos.map((t, idx) => `
      <div class="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 cursor-pointer transition flex items-center justify-between gap-2 group" onclick="window.trazadorApp.focusAndEdit('${t.id}')">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow ${colorBadge[t.color] || 'bg-slate-500'}"></span>
          <div class="overflow-hidden">
            <h4 class="text-xs font-bold text-slate-200 truncate group-hover:text-white">${t.nombre}</h4>
            <p class="text-[10px] text-slate-400 font-mono">${t.longitudM} m • <span class="capitalize text-slate-300 font-bold">${t.color}</span></p>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          ${t.foto ? `<span class="text-xs" title="Tiene foto">📷</span>` : ''}
          <button type="button" onclick="event.stopPropagation(); window.trazadorApp.deleteTramo('${t.id}')" class="p-1 text-slate-500 hover:text-red-400 rounded opacity-70 group-hover:opacity-100 transition" title="Borrar tramo">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  focusAndEdit(tramoId) {
    const tramo = this.tramos.find(t => t.id === tramoId);
    if (!tramo) return;

    if (tramo.puntos && tramo.puntos.length > 0) {
      const center = tramo.puntos[Math.floor(tramo.puntos.length / 2)];
      this.mapViewer.focusOn(center[0], center[1]);
    }
    this.openEditModal(tramo);
  }

  onFinishDrawing(points, longitudM) {
    this.tempPoints = points;
    this.tempLongitudM = longitudM;
    this.editingTramoId = null;
    this.tempFoto = null;
    this.selectedColor = "verde";

    this.setDrawingUiState(false);

    const modal = document.getElementById("modal-asignar-tramo");
    document.getElementById("modal-tramo-longitud").textContent = `${longitudM} metros`;
    document.getElementById("input-tramo-nombre").value = `Tramo ${this.tramos.length + 1}`;
    document.getElementById("input-tramo-detalle").value = "";

    // Ocultar botón dividir en nuevo tramo
    document.getElementById("box-dividir-tramo").classList.add("hidden");

    this.selectColorButton("verde");
    this.resetPhotoPreview();

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  openEditModal(tramo) {
    this.editingTramoId = tramo.id;
    this.tempPoints = tramo.puntos;
    this.tempLongitudM = tramo.longitudM;
    this.tempFoto = tramo.foto || null;
    this.selectedColor = tramo.color || "amarillo";

    const modal = document.getElementById("modal-asignar-tramo");
    document.getElementById("modal-tramo-longitud").textContent = `${tramo.longitudM} metros`;
    document.getElementById("input-tramo-nombre").value = tramo.nombre;
    document.getElementById("input-tramo-detalle").value = tramo.detalle || "";

    // Mostrar botón dividir si el tramo tiene más de 50 metros o más de 2 puntos
    const boxDividir = document.getElementById("box-dividir-tramo");
    if (tramo.puntos && tramo.puntos.length >= 2) {
      boxDividir.classList.remove("hidden");
    } else {
      boxDividir.classList.add("hidden");
    }

    this.selectColorButton(this.selectedColor);

    if (this.tempFoto) {
      this.showPhotoPreview(this.tempFoto);
    } else {
      this.resetPhotoPreview();
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  selectColorButton(color) {
    this.selectedColor = color;
    document.querySelectorAll(".btn-color-pick").forEach(btn => {
      const isSelected = btn.dataset.color === color;
      btn.classList.toggle("ring-4", isSelected);
      btn.classList.toggle("ring-white/90", isSelected);
    });
  }

  showPhotoPreview(url) {
    const previewBox = document.getElementById("preview-foto-tramo");
    const img = document.getElementById("img-preview-tag");
    if (previewBox && img) {
      img.src = url;
      previewBox.classList.remove("hidden");
    }
  }

  resetPhotoPreview() {
    const previewBox = document.getElementById("preview-foto-tramo");
    const img = document.getElementById("img-preview-tag");
    if (previewBox && img) {
      img.src = "";
      previewBox.classList.add("hidden");
    }
  }

  deleteTramo(tramoId) {
    if (confirm("¿Deseas eliminar este tramo?")) {
      this.tramos = this.tramos.filter(t => t.id !== tramoId);
      this.saveTramos();
      this.refreshView();
    }
  }

  splitCurrentTramo() {
    if (!this.editingTramoId) return;
    const tramo = this.tramos.find(t => t.id === this.editingTramoId);
    if (!tramo || !tramo.puntos || tramo.puntos.length < 2) return;

    const midIndex = Math.floor(tramo.puntos.length / 2);
    // Si solo tiene 2 puntos, interpolamos un punto intermedio
    let puntosA, puntosB;
    if (tramo.puntos.length === 2) {
      const pMid = [
        (tramo.puntos[0][0] + tramo.puntos[1][0]) / 2,
        (tramo.puntos[0][1] + tramo.puntos[1][1]) / 2
      ];
      puntosA = [tramo.puntos[0], pMid];
      puntosB = [pMid, tramo.puntos[1]];
    } else {
      puntosA = tramo.puntos.slice(0, midIndex + 1);
      puntosB = tramo.puntos.slice(midIndex);
    }

    const lenA = this.mapViewer.calculateLengthMeters(puntosA);
    const lenB = this.mapViewer.calculateLengthMeters(puntosB);

    // Reemplazar el tramo original por Tramo A y agregar Tramo B
    tramo.nombre = `${tramo.nombre} (Parte A)`;
    tramo.puntos = puntosA;
    tramo.longitudM = lenA;

    const tramoB = {
      id: `PUENTE-${Date.now()}`,
      nombre: `${tramo.nombre.replace(' (Parte A)', '')} (Parte B)`,
      color: "rojo", // Sugerido en rojo para diferenciarlo de inmediato
      longitudM: lenB,
      puntos: puntosB,
      detalle: "Sección dividida para asignar color independiente",
      foto: null,
      fecha: new Date().toISOString()
    };

    this.tramos.push(tramoB);
    this.saveTramos();
    this.closeModal();
    this.refreshView();
    alert(`¡Tramo dividido con éxito!\nAhora tienes:\n- ${tramo.nombre} (${lenA}m)\n- ${tramoB.nombre} (${lenB}m en Rojo)\nPuedes tocar cualquiera de los dos para cambiarle el color.`);
  }

  setDrawingUiState(isDrawing) {
    const btnActivar = document.getElementById("btn-activar-trazo");
    const btnFinalizar = document.getElementById("btn-finalizar-trazo");
    const btnCancelar = document.getElementById("btn-cancelar-trazo");
    const btnDeshacer = document.getElementById("btn-deshacer-punto");
    const banner = document.getElementById("banner-trazando");

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
    const nombre = document.getElementById("input-tramo-nombre").value.trim();
    const detalle = document.getElementById("input-tramo-detalle").value.trim();

    let savedItem = null;

    if (this.editingTramoId) {
      const index = this.tramos.findIndex(t => t.id === this.editingTramoId);
      if (index !== -1) {
        this.tramos[index].nombre = nombre;
        this.tramos[index].color = this.selectedColor;
        this.tramos[index].detalle = detalle;
        this.tramos[index].foto = this.tempFoto;
        savedItem = this.tramos[index];
      }
    } else {
      savedItem = {
        id: `PUENTE-${Date.now()}`,
        nombre: nombre || `Tramo ${this.tramos.length + 1}`,
        color: this.selectedColor,
        longitudM: this.tempLongitudM,
        puntos: this.tempPoints,
        detalle: detalle,
        foto: this.tempFoto,
        fecha: new Date().toISOString()
      };
      this.tramos.push(savedItem);
    }

    this.saveTramos();
    return savedItem;
  }

  setupEventListeners() {
    // 1. Botón Iniciar Trazo
    const btnActivar = document.getElementById("btn-activar-trazo");
    if (btnActivar) {
      btnActivar.addEventListener("click", () => {
        this.setDrawingUiState(true);
        this.mapViewer.startDrawing();
      });
    }

    // 2. Botón Deshacer Punto
    const btnDeshacer = document.getElementById("btn-deshacer-punto");
    if (btnDeshacer) {
      btnDeshacer.addEventListener("click", () => {
        this.mapViewer.undoLastPoint();
      });
    }

    // 3. Botón Finalizar Trazo
    const btnFinalizar = document.getElementById("btn-finalizar-trazo");
    if (btnFinalizar) {
      btnFinalizar.addEventListener("click", () => {
        this.mapViewer.finishDrawing();
      });
    }

    // 4. Botón Cancelar Trazo
    const btnCancelar = document.getElementById("btn-cancelar-trazo");
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => {
        this.setDrawingUiState(false);
        this.mapViewer.cancelDrawing();
      });
    }

    // 5. Selector de Color
    document.querySelectorAll(".btn-color-pick").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectColorButton(btn.dataset.color);
      });
    });

    // 6. Carga de Foto
    const cameraInput = document.getElementById("input-camera-file");
    if (cameraInput) {
      cameraInput.addEventListener("change", async (e) => {
        if (e.target.files.length > 0) {
          try {
            const file = e.target.files[0];
            const compressed = await RoadStorageService.compressImage(file, 1000, 0.75);
            this.tempFoto = compressed;
            this.showPhotoPreview(compressed);
          } catch(err) {
            console.error("Error comprimiendo foto:", err);
          }
        }
      });
    }

    const btnRemoveFoto = document.getElementById("btn-remove-foto");
    if (btnRemoveFoto) {
      btnRemoveFoto.addEventListener("click", () => {
        this.tempFoto = null;
        this.resetPhotoPreview();
      });
    }

    // 7. Guardar Solo Tramo
    const form = document.getElementById("form-guardar-tramo");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveCurrentFormData();
        this.closeModal();
        this.refreshView();
      });
    }

    // 8. Guardar y Continuar Trazando el Siguiente Tramo
    const btnContinuar = document.getElementById("btn-guardar-y-continuar");
    if (btnContinuar) {
      btnContinuar.addEventListener("click", () => {
        const savedItem = this.saveCurrentFormData();
        this.closeModal();
        this.refreshView();

        if (savedItem && savedItem.puntos && savedItem.puntos.length > 0) {
          // Iniciar de inmediato el siguiente tramo desde la última coordenada
          const lastCoord = savedItem.puntos[savedItem.puntos.length - 1];
          this.setDrawingUiState(true);
          this.mapViewer.startDrawing(lastCoord);
        }
      });
    }

    // 9. Dividir Tramo en Dos
    const btnDividir = document.getElementById("btn-dividir-tramo-en-dos");
    if (btnDividir) {
      btnDividir.addEventListener("click", () => {
        this.splitCurrentTramo();
      });
    }

    // 10. Cerrar Modal
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelModal = document.getElementById("btn-cancelar-modal");
    const closeModalFn = () => this.closeModal();

    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModalFn);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModalFn);

    // 11. Borrar Todo
    const btnBorrarTodo = document.getElementById("btn-borrar-todas");
    if (btnBorrarTodo) {
      btnBorrarTodo.addEventListener("click", () => {
        if (confirm("¿Estás seguro de borrar todos los tramos para comenzar de cero?")) {
          this.tramos = [];
          this.saveTramos();
          this.refreshView();
        }
      });
    }

    // 12. GPS
    const btnGps = document.getElementById("btn-gps-locate");
    if (btnGps) {
      btnGps.addEventListener("click", () => {
        if ("geolocation" in navigator) {
          btnGps.classList.add("animate-pulse");
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              btnGps.classList.remove("animate-pulse");
              this.mapViewer.updateUserLocation(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
              btnGps.classList.remove("animate-pulse");
              alert("No se pudo obtener el GPS: " + err.message);
            },
            { enableHighAccuracy: true }
          );
        } else {
          alert("Tu navegador no soporta geolocalización GPS.");
        }
      });
    }

    // 13. Exportar KML
    const btnExportKml = document.getElementById("btn-export-kml-road");
    if (btnExportKml) {
      btnExportKml.addEventListener("click", () => this.exportKml());
    }
  }

  closeModal() {
    const modal = document.getElementById("modal-asignar-tramo");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  exportKml() {
    if (this.tramos.length === 0) {
      alert("No hay tramos trazados para exportar.");
      return;
    }

    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Diagnóstico Vial — Sector La Puente (Maturín)</name>
    <description>Tramos de vialidad coloreados por condición física</description>

    <Style id="color_verde"><LineStyle><color>ff10b981</color><width>6</width></LineStyle></Style>
    <Style id="color_amarillo"><LineStyle><color>fff59e0b</color><width>6</width></LineStyle></Style>
    <Style id="color_naranja"><LineStyle><color>fff97316</color><width>6</width></LineStyle></Style>
    <Style id="color_rojo"><LineStyle><color>ffef4444</color><width>7</width></LineStyle></Style>

    <Folder>
      <name>Tramos Evaluados</name>
`;

    this.tramos.forEach(t => {
      const coordsStr = t.puntos.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
      const styleId = `#color_${t.color || "amarillo"}`;

      kml += `
      <Placemark>
        <name>${t.nombre}</name>
        <description><![CDATA[
          <h3>${t.nombre}</h3>
          <p><strong>Longitud:</strong> ${t.longitudM} m</p>
          <p><strong>Estado:</strong> ${t.color.toUpperCase()}</p>
          <p><strong>Detalle:</strong> ${t.detalle || "Sin observaciones"}</p>
        ]]></description>
        <styleUrl>${styleId}</styleUrl>
        <LineString>
          <coordinates>${coordsStr}</coordinates>
        </LineString>
      </Placemark>`;
    });

    kml += `
    </Folder>
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vialidad_LaPuente_Tramos_${new Date().toISOString().split("T")[0]}.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function startApp() {
  if (!window.trazadorApp) {
    window.trazadorApp = new TrazadorVialApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
