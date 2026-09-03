/**
 * Controlador Principal — Diagnóstico y Segmentación Vial La Puente
 */
import { TRAMOS_LA_PUENTE, ESTADOS_VIALES, TIPOLOGIAS_FALLA } from "./dataTramos.js";
import { RoadStorageService } from "./storage.js";
import { RoadMapViewer } from "./mapViewer.js";

class VialidadLaPuenteApp {
  constructor() {
    this.tramos = [...TRAMOS_LA_PUENTE];
    this.inspections = RoadStorageService.getInspections();
    this.currentSelectedTramo = null;
    this.tempFotos = [];
    this.mapViewer = null;

    this.init();
  }

  init() {
    // 1. Inicializar Mapa
    this.mapViewer = new RoadMapViewer("map-vialidad", (tramo, insp) => {
      this.openInspectionModal(tramo, insp);
    });

    // 2. Renderizar Tramos y Métricas
    this.refreshView();

    // 3. Configurar Eventos de la Interfaz
    this.setupEventListeners();
    this.populateFallasCheckboxes();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  refreshView() {
    this.inspections = RoadStorageService.getInspections();
    this.mapViewer.renderTramos(this.tramos, this.inspections);
    this.updateKpis();
    this.renderTramosList();
  }

  updateKpis() {
    let totalMetros = 0;
    let evaluadosMetros = 0;
    let criticoMetros = 0;
    let maloMetros = 0;
    let regularMetros = 0;
    let buenoMetros = 0;

    this.tramos.forEach(t => {
      totalMetros += t.longitudM;
      const insp = this.inspections[t.id];
      if (insp && insp.estado && insp.estado !== "sin_inspeccionar") {
        evaluadosMetros += t.longitudM;
        if (insp.estado === "rojo") criticoMetros += t.longitudM;
        else if (insp.estado === "naranja") maloMetros += t.longitudM;
        else if (insp.estado === "amarillo") regularMetros += t.longitudM;
        else if (insp.estado === "verde") buenoMetros += t.longitudM;
      }
    });

    const pctEvaluado = totalMetros > 0 ? Math.round((evaluadosMetros / totalMetros) * 100) : 0;
    const metrosBacheo = criticoMetros + maloMetros + (regularMetros * 0.4);

    const elTotal = document.getElementById("kpi-total-longitud");
    const elEvaluado = document.getElementById("kpi-avance-pct");
    const elCritico = document.getElementById("kpi-critico-pct");
    const elBacheo = document.getElementById("kpi-bacheo-metros");

    if (elTotal) elTotal.textContent = `${(totalMetros / 1000).toFixed(1)} km (${this.tramos.length} tramos)`;
    if (elEvaluado) elEvaluado.textContent = `${pctEvaluado}% (${evaluadosMetros} m)`;
    if (elCritico) {
      const pctCritico = evaluadosMetros > 0 ? Math.round(((criticoMetros + maloMetros) / evaluadosMetros) * 100) : 0;
      elCritico.textContent = `${pctCritico}% Crítico / Malo`;
    }
    if (elBacheo) elBacheo.textContent = `${Math.round(metrosBacheo)} m lineales`;

    // Actualizar barras de semáforo
    const barRojo = document.getElementById("bar-rojo");
    const barNaranja = document.getElementById("bar-naranja");
    const barAmarillo = document.getElementById("bar-amarillo");
    const barVerde = document.getElementById("bar-verde");

    if (barRojo && evaluadosMetros > 0) barRojo.style.width = `${(criticoMetros / evaluadosMetros) * 100}%`;
    if (barNaranja && evaluadosMetros > 0) barNaranja.style.width = `${(maloMetros / evaluadosMetros) * 100}%`;
    if (barAmarillo && evaluadosMetros > 0) barAmarillo.style.width = `${(regularMetros / evaluadosMetros) * 100}%`;
    if (barVerde && evaluadosMetros > 0) barVerde.style.width = `${(buenoMetros / evaluadosMetros) * 100}%`;
  }

  renderTramosList() {
    const listContainer = document.getElementById("tramos-sidebar-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    this.tramos.forEach((t, idx) => {
      const insp = this.inspections[t.id] || {};
      const estadoId = insp.estado || "sin_inspeccionar";
      const estado = ESTADOS_VIALES[estadoId] || ESTADOS_VIALES.sin_inspeccionar;

      const item = document.createElement("div");
      item.className = "p-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 cursor-pointer transition flex items-center justify-between gap-2 group";
      item.onclick = () => {
        this.mapViewer.selectTramo(t.id);
        this.openInspectionModal(t, insp);
      };

      item.innerHTML = `
        <div class="flex items-center gap-2.5 overflow-hidden">
          <span class="w-3 h-3 rounded-full shrink-0 shadow-sm" style="background-color: ${estado.color}"></span>
          <div class="overflow-hidden">
            <h4 class="text-xs font-bold text-slate-200 truncate group-hover:text-white transition">${t.nombre}</h4>
            <p class="text-[10px] text-slate-400 font-mono">${t.longitudM} metros • ${estado.nombre}</p>
          </div>
        </div>
        <div class="shrink-0 text-right">
          ${(insp.fotos || []).length > 0 ? `<span class="text-[10px] text-amber-400 font-bold">📷 ${insp.fotos.length}</span>` : ''}
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-slate-300"></i>
        </div>
      `;

      listContainer.appendChild(item);
    });

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  populateFallasCheckboxes() {
    const container = document.getElementById("fallas-checkboxes-container");
    if (!container) return;

    container.innerHTML = TIPOLOGIAS_FALLA.map((falla, idx) => `
      <label class="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
        <input type="checkbox" name="falla_tipo" value="${falla}" class="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0">
        <span>${falla}</span>
      </label>
    `).join("");
  }

  openInspectionModal(tramo, insp = {}) {
    this.currentSelectedTramo = tramo;
    this.tempFotos = [...(insp.fotos || [])];

    const modal = document.getElementById("modal-inspect-tramo");
    if (!modal) return;

    document.getElementById("modal-tramo-title").textContent = tramo.nombre;
    document.getElementById("modal-tramo-meta").textContent = `${tramo.longitudM} metros de longitud • Ancho de calzada: ${tramo.anchoM} m`;
    document.getElementById("modal-tramo-refs").textContent = `Puntos de Referencia: ${tramo.puntosReferencia.join(" • ")}`;

    // Seleccionar color de estado
    const currentEstado = insp.estado || "sin_inspeccionar";
    document.querySelectorAll(".btn-select-estado").forEach(btn => {
      const isSelected = btn.dataset.estado === currentEstado;
      btn.classList.toggle("ring-4", isSelected);
      btn.classList.toggle("ring-white/80", isSelected);
    });

    // Marcar fallas
    const fallasSet = new Set(insp.fallas || []);
    document.querySelectorAll("input[name='falla_tipo']").forEach(chk => {
      chk.checked = fallasSet.has(chk.value);
    });

    // Observaciones y evaluador
    document.getElementById("input-tramo-obs").value = insp.observaciones || "";
    document.getElementById("input-tramo-evaluador").value = insp.evaluador || "";

    // Miniaturas de fotos
    this.renderPhotoPreviews();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  renderPhotoPreviews() {
    const container = document.getElementById("tramo-photos-preview");
    if (!container) return;

    if (this.tempFotos.length === 0) {
      container.innerHTML = `<p class="text-[11px] text-slate-500 italic col-span-full">Sin fotos adjuntas para este tramo.</p>`;
      return;
    }

    container.innerHTML = this.tempFotos.map((fUrl, idx) => `
      <div class="relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-700 group">
        <img src="${fUrl}" class="w-full h-full object-cover">
        <button type="button" onclick="window.vialidadApp.removeTempPhoto(${idx})" class="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg opacity-80 group-hover:opacity-100 transition shadow" title="Eliminar foto">
          <i data-lucide="x" class="w-3 h-3"></i>
        </button>
      </div>
    `).join("");

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  removeTempPhoto(idx) {
    this.tempFotos.splice(idx, 1);
    this.renderPhotoPreviews();
  }

  setupEventListeners() {
    // Botones de Selección de Estado (Verde, Amarillo, Naranja, Rojo)
    document.querySelectorAll(".btn-select-estado").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-select-estado").forEach(b => {
          b.classList.remove("ring-4", "ring-white/80");
        });
        btn.classList.add("ring-4", "ring-white/80");
        btn.dataset.selected = "true";
      });
    });

    // Carga de Fotos
    const fileInput = document.getElementById("input-photo-file");
    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const files = Array.from(e.target.files);
        for (let file of files) {
          try {
            const compressed = await RoadStorageService.compressImage(file, 1000, 0.75);
            this.tempFotos.push(compressed);
          } catch(err) {
            console.error("Error comprimiendo foto:", err);
          }
        }
        this.renderPhotoPreviews();
      });
    }

    // Guardar Tramo
    const form = document.getElementById("form-tramo-inspection");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!this.currentSelectedTramo) return;

        let selectedEstado = "sin_inspeccionar";
        document.querySelectorAll(".btn-select-estado").forEach(btn => {
          if (btn.classList.contains("ring-4")) {
            selectedEstado = btn.dataset.estado;
          }
        });

        const selectedFallas = [];
        document.querySelectorAll("input[name='falla_tipo']:checked").forEach(chk => {
          selectedFallas.push(chk.value);
        });

        const inspectionData = {
          estado: selectedEstado,
          fallas: selectedFallas,
          observaciones: document.getElementById("input-tramo-obs").value,
          evaluador: document.getElementById("input-tramo-evaluador").value,
          fotos: [...this.tempFotos]
        };

        RoadStorageService.updateTramo(this.currentSelectedTramo.id, inspectionData);
        this.closeInspectionModal();
        this.refreshView();
      });
    }

    // Botones de Tramo Siguiente / Anterior para inspección secuencial
    const btnNext = document.getElementById("btn-tramo-siguiente");
    const btnPrev = document.getElementById("btn-tramo-anterior");

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (!this.currentSelectedTramo) return;
        const currentIdx = this.tramos.findIndex(t => t.id === this.currentSelectedTramo.id);
        if (currentIdx < this.tramos.length - 1) {
          const nextTramo = this.tramos[currentIdx + 1];
          this.mapViewer.selectTramo(nextTramo.id);
          this.openInspectionModal(nextTramo, this.inspections[nextTramo.id]);
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        if (!this.currentSelectedTramo) return;
        const currentIdx = this.tramos.findIndex(t => t.id === this.currentSelectedTramo.id);
        if (currentIdx > 0) {
          const prevTramo = this.tramos[currentIdx - 1];
          this.mapViewer.selectTramo(prevTramo.id);
          this.openInspectionModal(prevTramo, this.inspections[prevTramo.id]);
        }
      });
    }

    // Botón GPS en Vivo ("Mi Ubicación")
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
              alert("No se pudo obtener la ubicación GPS: " + err.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          alert("Tu navegador no soporta geolocalización GPS.");
        }
      });
    }

    // Exportar KML para Google Earth
    const btnExportKml = document.getElementById("btn-export-kml-road");
    if (btnExportKml) {
      btnExportKml.addEventListener("click", () => this.exportKml());
    }

    // Imprimir Reporte
    const btnPrint = document.getElementById("btn-print-road-report");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => window.print());
    }

    const btnCloseModal = document.getElementById("btn-close-inspect-modal");
    if (btnCloseModal) {
      btnCloseModal.addEventListener("click", () => this.closeInspectionModal());
    }
  }

  closeInspectionModal() {
    const modal = document.getElementById("modal-inspect-tramo");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  exportKml() {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Diagnóstico Vial — Carretera Principal de La Puente</name>
    <description>Inspección por tramos coloreados y georreferenciados (Maturín, Monagas)</description>

    <!-- Estilos de Color -->
    <Style id="styleVerde"><LineStyle><color>ff10b981</color><width>6</width></LineStyle></Style>
    <Style id="styleAmarillo"><LineStyle><color>fff59e0b</color><width>6</width></LineStyle></Style>
    <Style id="styleNaranja"><LineStyle><color>fff97316</color><width>6</width></LineStyle></Style>
    <Style id="styleRojo"><LineStyle><color>ffef4444</color><width>7</width></LineStyle></Style>
    <Style id="styleGris"><LineStyle><color>ff64748b</color><width>4</width></LineStyle></Style>

    <Folder>
      <name>Tramos Inspeccionados</name>
`;

    this.tramos.forEach(t => {
      const insp = this.inspections[t.id] || {};
      const estado = insp.estado || "sin_inspeccionar";
      let styleId = "#styleGris";

      if (estado === "verde") styleId = "#styleVerde";
      else if (estado === "amarillo") styleId = "#styleAmarillo";
      else if (estado === "naranja") styleId = "#styleNaranja";
      else if (estado === "rojo") styleId = "#styleRojo";

      const coordsStr = t.coordenadas.map(([lat, lng]) => `${lng},${lat},0`).join(" ");

      kml += `
      <Placemark>
        <name>${t.nombre}</name>
        <description><![CDATA[
          <h3>${t.nombre}</h3>
          <p><strong>Longitud:</strong> ${t.longitudM} m</p>
          <p><strong>Estado:</strong> ${estado.toUpperCase()}</p>
          <p><strong>Fallas reportadas:</strong> ${(insp.fallas || []).join(", ") || "Ninguna"}</p>
          <p><strong>Observaciones:</strong> ${insp.observaciones || "Sin observaciones"}</p>
          <p><strong>Evaluador:</strong> ${insp.evaluador || "N/A"}</p>
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
    a.download = `Vialidad_LaPuente_${new Date().toISOString().split("T")[0]}.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function startApp() {
  if (!window.vialidadApp) {
    window.vialidadApp = new VialidadLaPuenteApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
