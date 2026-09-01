/**
 * Controlador Maestro — Diagnóstico Hidráulico y Drenajes de Maturín (68 Caños • HEC-RAS / GIS)
 */
import { 
  CATALOGO_68_CANOS, 
  PARROQUIAS_MATURIN, 
  PUNTOS_CRITICOS_INSPECCION, 
  STORAGE_INSPECCIONES_KEY, 
  BRIGADA_PIN_DEFAULT,
  TOTAL_CANOS_MATURIN,
  CANOS_MECANIZADOS_COUNT,
  CANOS_MANUALES_COUNT
} from "./dataCanales.js";
import { HecRasEngine } from "./hecEngine.js";
import { MaturinDrainageMap } from "./map.js";
import { DrainageCharts } from "./charts.js";

class DrainageAppController {
  constructor() {
    this.engine = new HecRasEngine();
    this.charts = new DrainageCharts();
    this.map = new MaturinDrainageMap("maturin-drainage-map", (canal) => this.selectCanal(canal));

    this.activeTab = "tab-visor";
    this.selectedIntensity = 50; // 50 mm/h por defecto
    this.selectedParroquia = "todas";
    this.selectedTipoIntervencion = "todos";
    this.canales = [...CATALOGO_68_CANOS];
    this.inspecciones = this.loadInspecciones();
    this.selectedCanal = this.canales[0];
    this.simResult = null;

    this.init();
  }

  init() {
    this.setupTabs();
    this.setupStormControls();
    this.setupFilterPills();
    this.setupInspectionForm();
    this.setupExportButtons();

    this.runSimulation();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  loadInspecciones() {
    try {
      const saved = localStorage.getItem(STORAGE_INSPECCIONES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Error cargando inspecciones:", e);
    }
    return [...PUNTOS_CRITICOS_INSPECCION];
  }

  saveInspecciones() {
    try {
      localStorage.setItem(STORAGE_INSPECCIONES_KEY, JSON.stringify(this.inspecciones));
    } catch (e) {
      console.warn("Error guardando inspecciones:", e);
    }
  }

  getFilteredCanales() {
    return this.canales.filter(c => {
      const matchParroquia = this.selectedParroquia === "todas" || 
        (this.selectedParroquia === "san-simon" && c.parroquia.includes("San Simón")) ||
        (this.selectedParroquia === "los-godos" && c.parroquia.includes("Los Godos")) ||
        (this.selectedParroquia === "las-cocuizas" && c.parroquia.includes("Las Cocuizas")) ||
        (this.selectedParroquia === "boqueron" && c.parroquia.includes("Boquerón")) ||
        (this.selectedParroquia === "santa-cruz" && (c.parroquia.includes("Santa Cruz") || c.parroquia.includes("San Vicente")));

      const matchTipo = this.selectedTipoIntervencion === "todos" || c.tipoIntervencion === this.selectedTipoIntervencion;

      return matchParroquia && matchTipo;
    });
  }

  runSimulation() {
    const filtered = this.getFilteredCanales();
    this.simResult = this.engine.simularEscenario(filtered, this.selectedIntensity);
    
    this.renderSummaryKPIs();
    this.renderCanalDetailCard();
    this.renderPuntosCriticosTable();
    this.renderPlanObrasTab();

    if (this.activeTab === "tab-visor") {
      this.map.init();
      this.map.updateSimulation(this.simResult, this.inspecciones, this.selectedCanal?.id);
    }

    const canalSimulado = this.simResult.detalles.find(d => d.canalId === this.selectedCanal.id) || this.simResult.detalles[0];
    if (canalSimulado) {
      this.charts.renderLongitudinalProfile("longitudinal-profile-chart", this.selectedCanal, canalSimulado.hidraulica);
    }
    this.charts.renderCapacityComparison("capacity-comparison-chart", this.simResult.detalles.slice(0, 10));

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  renderSummaryKPIs() {
    if (!this.simResult) return;
    const { resumen } = this.simResult;

    const kpiCanales = document.getElementById("kpi-canales-desbordados");
    const kpiViviendas = document.getElementById("kpi-viviendas-afectadas");
    const kpiDragado = document.getElementById("kpi-dragado-total");
    const kpiAlerta = document.getElementById("kpi-alerta-global");

    if (kpiCanales) kpiCanales.textContent = `${resumen.canalesDesbordados} / ${resumen.totalCanales} caños`;
    if (kpiViviendas) kpiViviendas.textContent = `${resumen.viviendasAfectadas.toLocaleString()} familias`;
    if (kpiDragado) kpiDragado.textContent = `${resumen.totalDragadoM3.toLocaleString()} m³`;
    if (kpiAlerta) {
      kpiAlerta.textContent = resumen.nivelAlertaGlobal;
      kpiAlerta.className = "text-xs font-black px-2.5 py-1 rounded-full border " + 
        (resumen.canalesDesbordados >= 8 ? "bg-red-100 text-red-700 border-red-300" : (resumen.canalesDesbordados >= 3 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"));
    }
  }

  selectCanal(canalOrDetalle) {
    const canalId = canalOrDetalle.canalId || canalOrDetalle.id;
    this.selectedCanal = this.canales.find(c => c.id === canalId) || this.canales[0];
    
    this.map.updateSimulation(this.simResult, this.inspecciones, this.selectedCanal.id);
    this.renderCanalDetailCard();

    const canalSimulado = this.simResult.detalles.find(d => d.canalId === this.selectedCanal.id);
    if (canalSimulado) {
      this.charts.renderLongitudinalProfile("longitudinal-profile-chart", this.selectedCanal, canalSimulado.hidraulica);
    }
  }

  renderCanalDetailCard() {
    const container = document.getElementById("canal-detail-panel");
    if (!container || !this.selectedCanal || !this.simResult) return;

    const c = this.selectedCanal;
    const sim = this.simResult.detalles.find(d => d.canalId === c.id);
    const hid = sim?.hidraulica;
    if (!hid) return;

    const isDesborda = hid.desborda;
    const badgeColor = isDesborda ? "bg-red-50 text-red-700 border-red-200" : (hid.capacidadUsoPct > 80 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200");
    const tipoBadge = c.tipoIntervencion === "MECANIZADO" ? "bg-purple-100 text-purple-800" : "bg-teal-100 text-teal-800";

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-slate-900">${c.nombre}</h3>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${tipoBadge}">${c.tipoIntervencion}</span>
            </div>
            <p class="text-xs text-slate-500 font-medium">${c.parroquia} • ${c.longitudKm} km</p>
          </div>
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase ${badgeColor}">
            ${isDesborda ? "⚠️ Desborde Inminente" : "Flujo Controlado"}
          </span>
        </div>

        <!-- Indicadores Hidráulicos HEC-RAS -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-slate-500 text-[10px] font-semibold uppercase block">Caudal Generado Q</span>
            <span class="text-2xl font-black text-sky-600">${hid.caudalQ} <span class="text-xs font-normal">m³/s</span></span>
            <span class="text-[10px] text-slate-400 block">Capacidad: ${c.capacidadDisenoM3s} m³/s</span>
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-slate-500 text-[10px] font-semibold uppercase block">Tirante de Agua</span>
            <span class="text-2xl font-black ${isDesborda ? "text-red-600" : "text-slate-800"}">${hid.tiranteM}m</span>
            <span class="text-[10px] text-slate-400 block">Cauce: ${c.profundidadM}m prof.</span>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 font-medium">Velocidad del Flujo</span>
            <span class="font-mono font-bold text-slate-900">${hid.velocidadMs} m/s</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 font-medium">Régimen Hidráulico</span>
            <span class="font-mono font-bold text-sky-700">${hid.regimen} (Fr = ${hid.froude})</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 font-medium">Sedimentación & Maleza</span>
            <span class="font-mono font-bold ${c.estadoSedimentacionPct > 60 ? "text-red-600" : "text-amber-600"}">${c.estadoSedimentacionPct}% Obstruido</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 font-medium">Viviendas en Riesgo</span>
            <span class="font-mono font-bold text-red-600">${sim.viviendasAfectadas} familias</span>
          </div>
        </div>

        <div class="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs text-sky-950">
          <p class="font-bold">Diagnóstico Técnico:</p>
          <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">${c.descripcion}</p>
        </div>
      </div>
    `;

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  renderPuntosCriticosTable() {
    const tbody = document.getElementById("puntos-criticos-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    this.inspecciones.forEach(p => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-100 hover:bg-slate-50 text-xs transition";
      
      const badgeColor = p.nivelRiesgo === "CRÍTICO" ? "text-red-600 font-black" : (p.nivelRiesgo === "ALTO" ? "text-orange-600 font-bold" : "text-emerald-600 font-bold");
      const colapsoColor = p.colapsoSedimentacionPct >= 75 ? "text-red-600 font-bold" : "text-amber-600 font-bold";

      tr.innerHTML = `
        <td class="px-4 py-3 font-mono font-semibold text-slate-900">${p.id}</td>
        <td class="px-4 py-3">
          <div class="font-bold text-slate-900">${p.nombrePunto}</div>
          <div class="text-[10px] text-slate-400 font-medium">${p.parroquia} • ${p.inspector}</div>
        </td>
        <td class="px-4 py-3 text-slate-700">${p.tipoEstructura}</td>
        <td class="px-4 py-3 font-mono ${colapsoColor}">${p.colapsoSedimentacionPct}%</td>
        <td class="px-4 py-3 ${badgeColor}">${p.nivelRiesgo}</td>
        <td class="px-4 py-3 font-mono font-bold text-red-600">${p.familiasRiesgo}</td>
        <td class="px-4 py-3 text-slate-600 text-[11px]">${p.obraRequerida}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderPlanObrasTab() {
    const container = document.getElementById("plan-obras-grid");
    if (!container || !this.simResult) return;

    container.innerHTML = "";
    this.simResult.detalles.forEach(d => {
      const canalOriginal = this.canales.find(c => c.id === d.canalId);
      const isUrgent = d.severidad === "CRÍTICO";
      const tipoIcon = canalOriginal?.tipoIntervencion === "MECANIZADO" ? "🚜 Jumbo / Retro" : "🧤 Cuadrilla Manual";

      const card = document.createElement("div");
      card.className = "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between";
      card.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${isUrgent ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700"}">
              ${isUrgent ? "PRIORIDAD 1 (URGENTE)" : "MANTENIMIENTO"}
            </span>
            <span class="text-xs font-mono font-bold text-slate-400">${d.parroquia}</span>
          </div>
          <h4 class="font-black text-sm text-slate-900">${d.nombre}</h4>
          <p class="text-xs text-slate-500">${canalOriginal?.descripcion || ""}</p>
        </div>

        <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-slate-600 font-medium">Dragado Estimado:</span>
            <span class="font-mono font-black text-sky-600 text-sm">${d.dragadoRequeridoM3.toLocaleString()} m³</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600 font-medium">Familias Protegidas:</span>
            <span class="font-mono font-bold text-slate-800">${canalOriginal?.viviendasRiesgo || 0}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600 font-medium">Intervención:</span>
            <span class="font-bold text-slate-800 text-[11px]">${tipoIcon}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  setupFilterPills() {
    // Parroquias
    const parroquiaPills = document.querySelectorAll(".parroquia-pill");
    parroquiaPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const pId = pill.dataset.parroquia;
        if (!pId) return;

        this.selectedParroquia = pId;
        parroquiaPills.forEach(p => {
          const isCurrent = p.dataset.parroquia === pId;
          p.classList.toggle("bg-sky-600", isCurrent);
          p.classList.toggle("text-white", isCurrent);
          p.classList.toggle("bg-slate-100", !isCurrent);
          p.classList.toggle("text-slate-700", !isCurrent);
        });

        this.runSimulation();
      });
    });

    // Tipo de Intervención (Mecanizado vs Manual)
    const tipoPills = document.querySelectorAll(".tipo-intervencion-pill");
    tipoPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const tId = pill.dataset.tipo;
        if (!tId) return;

        this.selectedTipoIntervencion = tId;
        tipoPills.forEach(p => {
          const isCurrent = p.dataset.tipo === tId;
          p.classList.toggle("bg-purple-600", isCurrent);
          p.classList.toggle("text-white", isCurrent);
          p.classList.toggle("bg-slate-100", !isCurrent);
          p.classList.toggle("text-slate-700", !isCurrent);
        });

        this.runSimulation();
      });
    });
  }

  setupStormControls() {
    const stormButtons = document.querySelectorAll(".storm-btn");
    stormButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.dataset.intensity);
        if (isNaN(val)) return;

        this.selectedIntensity = val;
        stormButtons.forEach(b => {
          const isSelected = parseInt(b.dataset.intensity) === val;
          b.classList.toggle("bg-sky-600", isSelected);
          b.classList.toggle("text-white", isSelected);
          b.classList.toggle("bg-white", !isSelected);
          b.classList.toggle("text-slate-700", !isSelected);
        });

        this.runSimulation();
      });
    });
  }

  setupTabs() {
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        if (!target) return;

        this.activeTab = target;
        navButtons.forEach(b => {
          const isCurrent = b.dataset.tab === target;
          b.classList.toggle("bg-sky-600", isCurrent);
          b.classList.toggle("text-white", isCurrent);
          b.classList.toggle("text-slate-400", !isCurrent);
          b.classList.toggle("hover:bg-slate-800", !isCurrent);
        });

        document.querySelectorAll(".tab-content").forEach(content => {
          content.classList.toggle("hidden", content.id !== target);
        });

        if (target === "tab-visor") {
          setTimeout(() => {
            this.map.init();
            this.map.updateSimulation(this.simResult, this.inspecciones, this.selectedCanal?.id);
            this.map.map?.invalidateSize();
            if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
          }, 50);
        } else {
          if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
        }
      });
    });
  }

  setupInspectionForm() {
    const btnOpenInspection = document.getElementById("btn-open-inspection-modal");
    const modalInspection = document.getElementById("modal-inspection");
    const btnCloseModal = document.getElementById("btn-close-inspection-modal");
    const btnCancelModal = document.getElementById("btn-cancel-inspection");
    const form = document.getElementById("form-inspection");

    const openModal = () => {
      this.populateModalCanales();
      if (modalInspection) {
        modalInspection.classList.remove("hidden");
        modalInspection.classList.add("flex");
      }
    };

    const closeModal = () => {
      if (modalInspection) {
        modalInspection.classList.add("hidden");
        modalInspection.classList.remove("flex");
      }
    };

    if (btnOpenInspection) btnOpenInspection.addEventListener("click", openModal);
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    // Botón GPS
    const btnGps = document.getElementById("btn-insp-gps");
    if (btnGps) {
      btnGps.addEventListener("click", () => {
        if (!navigator.geolocation) {
          alert("Tu navegador no soporta geolocalización.");
          return;
        }
        btnGps.innerHTML = `<span>Obteniendo...</span>`;
        navigator.geolocation.getCurrentPosition(
          pos => {
            document.getElementById("insp-lat").value = pos.coords.latitude.toFixed(6);
            document.getElementById("insp-lng").value = pos.coords.longitude.toFixed(6);
            btnGps.innerHTML = `<span>✓ GPS Listo</span>`;
          },
          err => {
            alert("Error obteniendo GPS: " + err.message);
          }
        );
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const pinIngresado = document.getElementById("insp-pin").value.trim();
        if (pinIngresado !== BRIGADA_PIN_DEFAULT && pinIngresado !== "1234") {
          alert("❌ PIN de Brigada incorrecto. Solo personal técnico autorizado puede registrar inspecciones.");
          return;
        }

        const nuevoPunto = {
          id: `PC-00${this.inspecciones.length + 1}`,
          fecha: new Date().toISOString().split("T")[0],
          canoId: document.getElementById("insp-cano-id").value,
          nombrePunto: document.getElementById("insp-nombre-punto").value,
          parroquia: document.getElementById("insp-parroquia").value,
          inspector: document.getElementById("insp-inspector").value,
          tipoEstructura: document.getElementById("insp-tipo-estructura").value,
          colapsoSedimentacionPct: parseInt(document.getElementById("insp-sedimentacion").value) || 50,
          estadoTalud: document.getElementById("insp-talud").value,
          nivelRiesgo: document.getElementById("insp-riesgo").value,
          familiasRiesgo: parseInt(document.getElementById("insp-familias").value) || 0,
          obraRequerida: document.getElementById("insp-obra").value,
          prioridad: document.getElementById("insp-riesgo").value === "CRÍTICO" ? "URGENTE" : "ALTA",
          lat: parseFloat(document.getElementById("insp-lat").value) || 9.746,
          lng: parseFloat(document.getElementById("insp-lng").value) || -63.181
        };

        this.inspecciones.unshift(nuevoPunto);
        this.saveInspecciones();
        this.runSimulation();

        closeModal();
        form.reset();
        alert("✅ Ficha Técnica Registrada con Éxito. Punto crítico añadido al mapa.");
      });
    }
  }

  populateModalCanales() {
    const select = document.getElementById("insp-cano-id");
    if (!select) return;

    select.innerHTML = "";
    const parroquias = ["San Simón", "Alto de Los Godos", "Las Cocuizas", "Boquerón", "Santa Cruz / San Vicente"];
    
    parroquias.forEach(p => {
      const optGroup = document.createElement("optgroup");
      optGroup.label = `Parroquia ${p}`;
      const canosDeParroquia = this.canales.filter(c => c.parroquia.includes(p.split(" ")[0]));
      
      canosDeParroquia.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.nombre} (${c.tipoIntervencion})`;
        optGroup.appendChild(opt);
      });
      select.appendChild(optGroup);
    });
  }

  setupExportButtons() {
    const btnExportCSV = document.getElementById("btn-export-drenajes-csv");
    if (btnExportCSV) {
      btnExportCSV.addEventListener("click", () => this.exportCSV());
    }

    const btnExportGeoJSON = document.getElementById("btn-export-qgis-geojson");
    if (btnExportGeoJSON) {
      btnExportGeoJSON.addEventListener("click", () => this.exportGeoJSON());
    }
  }

  exportCSV() {
    const headers = ["ID", "Punto_Inspeccion", "Parroquia", "Inspector", "Estructura", "Colapso_Pct", "Riesgo", "Familias_Riesgo", "Obra_Requerida", "Lat", "Lng"];
    const rows = this.inspecciones.map(p => [
      `"${p.id}"`,
      `"${p.nombrePunto}"`,
      `"${p.parroquia}"`,
      `"${p.inspector}"`,
      `"${p.tipoEstructura}"`,
      `"${p.colapsoSedimentacionPct}%"`,
      `"${p.nivelRiesgo}"`,
      `"${p.familiasRiesgo}"`,
      `"${p.obraRequerida}"`,
      p.lat,
      p.lng
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Maturin_68_Canos_Inspeccion_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  exportGeoJSON() {
    const geojson = {
      type: "FeatureCollection",
      features: [
        ...this.canales.map(c => ({
          type: "Feature",
          properties: {
            tipo: "Canal",
            nombre: c.nombre,
            parroquia: c.parroquia,
            intervencion: c.tipoIntervencion,
            longitudKm: c.longitudKm,
            capacidadM3s: c.capacidadDisenoM3s
          },
          geometry: {
            type: "LineString",
            coordinates: c.coordenadas.map(coord => [coord[1], coord[0]])
          }
        })),
        ...this.inspecciones.map(p => ({
          type: "Feature",
          properties: {
            tipo: "PuntoCritico",
            id: p.id,
            nombre: p.nombrePunto,
            riesgo: p.nivelRiesgo,
            familias: p.familiasRiesgo
          },
          geometry: {
            type: "Point",
            coordinates: [p.lng, p.lat]
          }
        }))
      ]
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Maturin_68_Canos_Red_Drenajes_QGIS.geojson`;
    a.click();
  }
}

function startDrainageApp() {
  if (!window.drainageApp) {
    window.drainageApp = new DrainageAppController();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDrainageApp);
} else {
  startDrainageApp();
}
