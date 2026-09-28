/**
 * Controlador Principal — Sistema de Inspección Vial Avanzado con Autopistas Multi-Estado
 * Incorpora:
 * - Modelado de Corredores Viales y Sub-Tramos Progresivos (PK 0+000)
 * - Múltiples condiciones físicas por vía (heterogeneidad de pavimentos y canales)
 * - Diferenciación de calzadas (Canal Lento de carga pesada, Canal Rápido, Hombrillos)
 * - Formulario condicional dinámico por jerarquía (10 categorías oficiales)
 * - Diagrama de Cinta Progresiva (Strip Map) interactivo
 * - Herramienta de corte y sub-tramificación geométrica
 * - Doctrina de ingeniería vial MIGATO Monagas 2026
 */

import { RoadMapViewer } from "./mapViewer.js";
import { RoadStorageService } from "./storage.js";

const STORAGE_KEY_CORREDORES = "vialidad_monagas_corredores_v3";
const STORAGE_KEY_LEGACY = "vialidad_lapuente_calles_trazadas_v2";

class TrazadorVialApp {
  constructor() {
    this.corredores = this.loadCorredores();
    this.mapViewer = null;

    // Estado temporal del trazador
    this.tempPoints = null;
    this.tempLongitudM = 0;
    this.tempFoto = null;
    this.selectedColor = "verde";

    // Punteros de edición activa
    this.activeCorredorId = null;
    this.editingCorredorId = null;
    this.editingSubtramoId = null;

    this.init();
  }

  /**
   * Carga y migración automática transparente desde formatos previos
   */
  loadCorredores() {
    try {
      const dataV3 = localStorage.getItem(STORAGE_KEY_CORREDORES);
      if (dataV3) {
        return JSON.parse(dataV3);
      }

      // Migración desde legacy (v2)
      const dataV2 = localStorage.getItem(STORAGE_KEY_LEGACY);
      if (dataV2) {
        const legacyList = JSON.parse(dataV2);
        const migrated = legacyList.map((item, idx) => {
          const len = item.longitudM || 0;
          return {
            id: `CORR-${item.id || Date.now() + idx}`,
            codigo: `CV-${idx + 1}`,
            nombre: item.nombre || `Corredor ${idx + 1}`,
            jerarquia: item.jerarquia || "Sector Popular / Barrio",
            longitudTotalM: len,
            subtramos: [
              {
                id: `SUB-${item.id || Date.now() + idx}-1`,
                nombre: `${item.nombre || 'Tramo'} (Sub-Tramo Único)`,
                pkInicioM: 0,
                pkFinM: len,
                longitudM: len,
                color: item.color || "amarillo",
                puntos: item.puntos || [],
                canalesAfectados: item.canalesAfectados || "ambos",
                patologias: item.patologias || [],
                puenteCritico: item.puenteCritico || "ninguno",
                drenaje: item.drenaje || "intactos",
                bombeoTecnico: item.bombeoTecnico || "adecuado_2pct",
                superficieAgricola: "arena_sabana",
                detalle: item.detalle || "",
                foto: item.foto || null,
                fecha: item.fecha || new Date().toISOString()
              }
            ]
          };
        });

        localStorage.setItem(STORAGE_KEY_CORREDORES, JSON.stringify(migrated));
        return migrated;
      }

      return [];
    } catch (e) {
      console.error("Error cargando corredores viales:", e);
      return [];
    }
  }

  saveCorredores() {
    try {
      localStorage.setItem(STORAGE_KEY_CORREDORES, JSON.stringify(this.corredores));
    } catch (e) {
      console.error("Error guardando corredores viales:", e);
    }
  }

  init() {
    this.mapViewer = new RoadMapViewer(
      "map-vialidad",
      (points, longitudM) => this.onFinishDrawing(points, longitudM),
      (corredor, subtramo) => this.openEditModal(corredor, subtramo)
    );

    // Si existen corredores, activar el primero por defecto
    if (this.corredores.length > 0) {
      this.activeCorredorId = this.corredores[0].id;
    }

    this.refreshView();
    this.setupEventListeners();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  refreshView() {
    this.mapViewer.renderSavedTramos(this.corredores);
    this.updateStats();
    this.renderSidebarList();
    this.renderActiveStripMap();
  }

  /**
   * Cálculo de KPIs con desglose por condición física en toda la red
   */
  updateStats() {
    let totalMetros = 0;
    let buenoM = 0;
    let regularM = 0;
    let maloM = 0;
    let criticoM = 0;
    let totalSubtramos = 0;

    this.corredores.forEach(corr => {
      if (corr.subtramos) {
        corr.subtramos.forEach(sub => {
          totalSubtramos++;
          const len = sub.longitudM || 0;
          totalMetros += len;
          if (sub.color === "verde") buenoM += len;
          else if (sub.color === "amarillo") regularM += len;
          else if (sub.color === "naranja") maloM += len;
          else if (sub.color === "rojo") criticoM += len;
        });
      }
    });

    const contadorEl = document.getElementById("kpi-contador-calles");
    const longitudEl = document.getElementById("txt-longitud-total");
    const danadaEl = document.getElementById("txt-danada-pct");

    if (contadorEl) {
      contadorEl.textContent = `${this.corredores.length} corredores (${totalSubtramos} sub-tramos)`;
    }
    if (longitudEl) {
      longitudEl.textContent = `${(totalMetros / 1000).toFixed(2)} km (${totalMetros} m)`;
    }

    const metrosDanados = criticoM + maloM;
    const pctDanada = totalMetros > 0 ? Math.round((metrosDanados / totalMetros) * 100) : 0;
    if (danadaEl) {
      danadaEl.textContent = `${pctDanada}% crítico/malo (${((maloM + criticoM)/1000).toFixed(2)} km)`;
    }

    const barRojo = document.getElementById("bar-rojo");
    const barNaranja = document.getElementById("bar-naranja");
    const barAmarillo = document.getElementById("bar-amarillo");
    const barVerde = document.getElementById("bar-verde");

    if (barRojo) barRojo.style.width = totalMetros > 0 ? `${(criticoM / totalMetros) * 100}%` : "0%";
    if (barNaranja) barNaranja.style.width = totalMetros > 0 ? `${(maloM / totalMetros) * 100}%` : "0%";
    if (barAmarillo) barAmarillo.style.width = totalMetros > 0 ? `${(regularM / totalMetros) * 100}%` : "0%";
    if (barVerde) barVerde.style.width = totalMetros > 0 ? `${(buenoM / totalMetros) * 100}%` : "0%";
  }

  /**
   * Renderizado del Diagrama de Cinta Progresiva (Strip Map)
   * Muestra la autopista de extremo a extremo con sus sub-tramos y colores proporcionales
   */
  renderActiveStripMap() {
    const boxStrip = document.getElementById("box-strip-map-sidebar");
    const track = document.getElementById("strip-map-track");
    const titleEl = document.getElementById("strip-map-corredor-title");
    const pkStartEl = document.getElementById("strip-map-pk-start");
    const pkEndEl = document.getElementById("strip-map-pk-end");

    if (!boxStrip || !track) return;

    const corredor = this.corredores.find(c => c.id === this.activeCorredorId);
    if (!corredor || !corredor.subtramos || corredor.subtramos.length === 0) {
      boxStrip.classList.add("hidden");
      return;
    }

    boxStrip.classList.remove("hidden");
    if (titleEl) titleEl.textContent = corredor.nombre;

    let totalLen = 0;
    corredor.subtramos.forEach(s => totalLen += (s.longitudM || 0));

    if (pkStartEl) pkStartEl.textContent = "PK 0+000";
    if (pkEndEl) pkEndEl.textContent = RoadMapViewer.formatPK(totalLen);

    const colorClasses = {
      verde: "bg-emerald-500 hover:bg-emerald-400",
      amarillo: "bg-amber-500 hover:bg-amber-400",
      naranja: "bg-orange-500 hover:bg-orange-400",
      rojo: "bg-red-500 hover:bg-red-400"
    };

    track.innerHTML = corredor.subtramos.map((sub, sIdx) => {
      const pct = totalLen > 0 ? ((sub.longitudM || 0) / totalLen) * 100 : 100;
      const pkIni = RoadMapViewer.formatPK(sub.pkInicioM || 0);
      const pkFin = RoadMapViewer.formatPK(sub.pkFinM || (sub.pkInicioM + sub.longitudM));
      const hasBridge = sub.puenteCritico && sub.puenteCritico !== 'ninguno';

      return `
        <div 
          class="strip-bar-segment ${colorClasses[sub.color] || 'bg-slate-500'} flex items-center justify-center text-[10px] font-mono font-black text-[#0e092e] relative" 
          style="width: ${Math.max(pct, 4)}%" 
          title="${sub.nombre} (${pkIni} - ${pkFin}) • ${sub.longitudM}m [${sub.color.toUpperCase()}]"
          onclick="window.trazadorApp.focusSubtramo('${corredor.id}', '${sub.id}')"
        >
          ${hasBridge ? `<span class="absolute -top-1 right-0.5 text-xs drop-shadow">⚠️</span>` : ''}
          ${pct > 14 ? `<span class="truncate px-0.5">${sub.longitudM}m</span>` : ''}
        </div>
      `;
    }).join("");
  }

  /**
   * Renderizado de la lista lateral jerárquica (Corredores ➔ Sub-Tramos)
   */
  renderSidebarList() {
    const container = document.getElementById("lista-tramos-trazados");
    if (!container) return;

    if (this.corredores.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center border border-dashed border-[#2d1f85]/70 rounded-2xl text-slate-500 space-y-2">
          <i data-lucide="map" class="w-8 h-8 mx-auto text-slate-500"></i>
          <p class="text-xs font-bold text-slate-400">Aún no has trazado vías o autopistas.</p>
          <p class="text-xs">Toca "+ Trazar Corredor / Vía" para empezar.</p>
        </div>
      `;
      if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
      return;
    }

    const colorPill = {
      verde: "bg-emerald-500",
      amarillo: "bg-amber-500",
      naranja: "bg-orange-500",
      rojo: "bg-red-500"
    };

    container.innerHTML = this.corredores.map((corr) => {
      const isActive = corr.id === this.activeCorredorId;
      const subtramos = corr.subtramos || [];
      let totalCorredorM = 0;
      subtramos.forEach(s => totalCorredorM += (s.longitudM || 0));

      return `
        <div class="rounded-2xl border ${isActive ? 'border-amber-500/80 bg-[#1a1254]' : 'border-[#2d1f85] bg-[#160f47]'} p-3 space-y-2.5 transition">
          
          <!-- Encabezado del Corredor -->
          <div class="flex items-start justify-between gap-2 cursor-pointer" onclick="window.trazadorApp.setActiveCorredor('${corr.id}')">
            <div class="overflow-hidden space-y-0.5">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  ${corr.jerarquia ? corr.jerarquia.split('/')[0].trim() : 'Vía'}
                </span>
                <span class="text-xs text-slate-400 font-mono font-bold">${totalCorredorM} m total</span>
              </div>
              <h4 class="text-xs font-black text-white truncate hover:text-amber-300">${corr.nombre}</h4>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button type="button" onclick="event.stopPropagation(); window.trazadorApp.startAddingSubtramoTo('${corr.id}')" class="p-1 text-amber-400 hover:text-amber-300 rounded" title="Agregar siguiente sub-tramo">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
              </button>
              <button type="button" onclick="event.stopPropagation(); window.trazadorApp.deleteCorredor('${corr.id}')" class="p-1 text-slate-500 hover:text-red-400 rounded" title="Borrar corredor completo">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Mini Barra de Cinta del Corredor -->
          <div class="w-full h-1.5 rounded-full bg-[#0e092e] flex overflow-hidden border border-[#2d1f85]/50">
            ${subtramos.map(s => {
              const p = totalCorredorM > 0 ? (s.longitudM / totalCorredorM) * 100 : 100;
              return `<div style="width: ${p}%" class="${colorPill[s.color] || 'bg-slate-500'} h-full"></div>`;
            }).join("")}
          </div>

          <!-- Lista de Sub-Tramos de este Corredor -->
          <div class="space-y-1.5 pt-1 border-t border-[#2d1f85]/50">
            ${subtramos.map((s, idx) => {
              const pkIni = RoadMapViewer.formatPK(s.pkInicioM || 0);
              const pkFin = RoadMapViewer.formatPK(s.pkFinM || (s.pkInicioM + s.longitudM));
              const canalBadge = s.canalesAfectados === "canal_lento_pesado" 
                ? `<span class="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600">Canal Lento Pesado</span>`
                : '';

              return `
                <div class="p-2 rounded-xl bg-[#0e092e]/80 hover:bg-[#201569] border border-[#2d1f85]/80 cursor-pointer flex items-center justify-between gap-2 group transition" onclick="window.trazadorApp.focusSubtramo('${corr.id}', '${s.id}')">
                  <div class="flex items-center gap-2 overflow-hidden">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0 ${colorPill[s.color] || 'bg-slate-500'}"></span>
                    <div class="overflow-hidden">
                      <div class="text-[11px] font-bold text-slate-200 truncate group-hover:text-white">${s.nombre}</div>
                      <div class="flex flex-wrap items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <span class="text-amber-400 font-semibold">${pkIni}➔${pkFin}</span>
                        <span>•</span>
                        <span>${s.longitudM}m</span>
                        ${canalBadge}
                        ${s.puenteCritico && s.puenteCritico !== 'ninguno' ? `<span class="text-[9px] px-1 py-0.2 rounded bg-red-950 text-red-300 border border-red-600 font-bold">⚠️ PUENTE</span>` : ''}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0">
                    ${s.foto ? `<span class="text-xs" title="Tiene foto">📷</span>` : ''}
                    <button type="button" onclick="event.stopPropagation(); window.trazadorApp.deleteSubtramo('${corr.id}', '${s.id}')" class="p-1 text-slate-500 hover:text-red-400 rounded opacity-60 group-hover:opacity-100 transition" title="Borrar subtramo">
                      <i data-lucide="trash" class="w-3 h-3"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

        </div>
      `;
    }).join("");

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  setActiveCorredor(corredorId) {
    this.activeCorredorId = corredorId;
    this.renderActiveStripMap();
    this.renderSidebarList();

    const corr = this.corredores.find(c => c.id === corredorId);
    if (corr && corr.subtramos && corr.subtramos.length > 0) {
      const firstSub = corr.subtramos[0];
      if (firstSub.puntos && firstSub.puntos.length > 0) {
        this.mapViewer.focusOn(firstSub.puntos[0][0], firstSub.puntos[0][1]);
      }
    }
  }

  focusSubtramo(corredorId, subtramoId) {
    this.activeCorredorId = corredorId;
    const corr = this.corredores.find(c => c.id === corredorId);
    if (!corr) return;

    const sub = corr.subtramos.find(s => s.id === subtramoId);
    if (!sub) return;

    if (sub.puntos && sub.puntos.length > 0) {
      const center = sub.puntos[Math.floor(sub.puntos.length / 2)];
      this.mapViewer.focusOn(center[0], center[1]);
    }

    this.openEditModal(corr, sub);
  }

  startAddingSubtramoTo(corredorId) {
    this.activeCorredorId = corredorId;
    const corr = this.corredores.find(c => c.id === corredorId);
    if (!corr || !corr.subtramos || corr.subtramos.length === 0) return;

    const lastSub = corr.subtramos[corr.subtramos.length - 1];
    if (lastSub.puntos && lastSub.puntos.length > 0) {
      const lastCoord = lastSub.puntos[lastSub.puntos.length - 1];
      this.setDrawingUiState(true);
      this.mapViewer.startDrawing(lastCoord);
    }
  }

  /**
   * Finalización del trazo sobre el mapa y apertura del modal
   */
  onFinishDrawing(points, longitudM) {
    this.tempPoints = points;
    this.tempLongitudM = longitudM;
    this.editingCorredorId = null;
    this.editingSubtramoId = null;
    this.tempFoto = null;
    this.selectedColor = "verde";

    this.setDrawingUiState(false);

    // Si hay un corredor activo, sugerir su continuación progresiva
    let defaultCorredorNombre = `Corredor ${this.corredores.length + 1}`;
    let defaultJerarquia = "Troncal / Autopista (T-10, T-13)";
    let pkInicio = 0;
    let nextSubNum = 1;

    if (this.activeCorredorId) {
      const activeCorr = this.corredores.find(c => c.id === this.activeCorredorId);
      if (activeCorr) {
        defaultCorredorNombre = activeCorr.nombre;
        defaultJerarquia = activeCorr.jerarquia || defaultJerarquia;
        let sumLen = 0;
        activeCorr.subtramos.forEach(s => sumLen += (s.longitudM || 0));
        pkInicio = sumLen;
        nextSubNum = activeCorr.subtramos.length + 1;
      }
    }

    const pkFin = pkInicio + longitudM;
    const pkStr = `${RoadMapViewer.formatPK(pkInicio)} a ${RoadMapViewer.formatPK(pkFin)}`;

    const modal = document.getElementById("modal-asignar-tramo");
    document.getElementById("modal-tramo-longitud").textContent = `${longitudM} metros`;
    document.getElementById("modal-tramo-pk").textContent = pkStr;
    document.getElementById("input-corredor-nombre").value = defaultCorredorNombre;
    document.getElementById("input-tramo-nombre").value = `Subtramo ${nextSubNum}: (${pkStr})`;
    document.getElementById("input-tramo-detalle").value = "";

    const selectJerarquia = document.getElementById("select-tramo-jerarquia");
    if (selectJerarquia) selectJerarquia.value = defaultJerarquia;

    const selectCanales = document.getElementById("select-tramo-canales");
    if (selectCanales) selectCanales.value = "ambos";

    const selectPuente = document.getElementById("select-puente-critico");
    if (selectPuente) selectPuente.value = "ninguno";

    const selectDrenaje = document.getElementById("select-tramo-drenaje");
    if (selectDrenaje) selectDrenaje.value = "intactos";

    const selectBombeo = document.getElementById("select-bombeo-agricola");
    if (selectBombeo) selectBombeo.value = "adecuado_2pct";

    document.querySelectorAll("input[name='patologia_vial']").forEach(cb => {
      cb.checked = false;
    });

    const badgeCrit = document.getElementById("badge-asistencia-critica");
    if (badgeCrit) badgeCrit.classList.add("hidden");

    document.getElementById("box-dividir-tramo").classList.add("hidden");

    this.updateConditionalFields(defaultJerarquia);
    this.selectColorButton("verde");
    this.resetPhotoPreview();

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  /**
   * Modal en modo edición de un subtramo existente
   */
  openEditModal(corredor, subtramo) {
    this.editingCorredorId = corredor.id;
    this.editingSubtramoId = subtramo.id;
    this.tempPoints = subtramo.puntos;
    this.tempLongitudM = subtramo.longitudM;
    this.tempFoto = subtramo.foto || null;
    this.selectedColor = subtramo.color || "amarillo";

    const pkIni = RoadMapViewer.formatPK(subtramo.pkInicioM || 0);
    const pkFin = RoadMapViewer.formatPK(subtramo.pkFinM || (subtramo.pkInicioM + subtramo.longitudM));

    const modal = document.getElementById("modal-asignar-tramo");
    document.getElementById("modal-tramo-longitud").textContent = `${subtramo.longitudM} metros`;
    document.getElementById("modal-tramo-pk").textContent = `${pkIni} a ${pkFin}`;
    document.getElementById("input-corredor-nombre").value = corredor.nombre;
    document.getElementById("input-tramo-nombre").value = subtramo.nombre;
    document.getElementById("input-tramo-detalle").value = subtramo.detalle || "";

    const selectJerarquia = document.getElementById("select-tramo-jerarquia");
    if (selectJerarquia) selectJerarquia.value = corredor.jerarquia || "Troncal / Autopista (T-10, T-13)";

    const selectCanales = document.getElementById("select-tramo-canales");
    if (selectCanales) selectCanales.value = subtramo.canalesAfectados || "ambos";

    const selectPuente = document.getElementById("select-puente-critico");
    if (selectPuente) selectPuente.value = subtramo.puenteCritico || "ninguno";

    const selectDrenaje = document.getElementById("select-tramo-drenaje");
    if (selectDrenaje) selectDrenaje.value = subtramo.drenaje || "intactos";

    const selectBombeo = document.getElementById("select-bombeo-agricola");
    if (selectBombeo) selectBombeo.value = subtramo.bombeoTecnico || "adecuado_2pct";

    const subPatologias = subtramo.patologias || [];
    document.querySelectorAll("input[name='patologia_vial']").forEach(cb => {
      cb.checked = subPatologias.includes(cb.value);
    });

    this.updateConditionalFields(corredor.jerarquia || "");
    this.evaluarAsistenciaCritica();

    // Mostrar botón dividir si tiene al menos 2 puntos
    const boxDividir = document.getElementById("box-dividir-tramo");
    if (subtramo.puntos && subtramo.puntos.length >= 2) {
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

  /**
   * Adapta inteligentemente los bloques de preguntas según la jerarquía vial elegida
   */
  updateConditionalFields(jerarquia) {
    const boxForaneas = document.getElementById("box-patologias-foraneas");
    const boxAgricola = document.getElementById("box-patologias-agricola");
    const boxUrbana = document.getElementById("box-patologias-urbana");
    const boxTierra = document.getElementById("box-patologias-tierra");

    if (!boxForaneas || !boxAgricola || !boxUrbana || !boxTierra) return;

    boxForaneas.classList.add("hidden");
    boxAgricola.classList.add("hidden");
    boxUrbana.classList.add("hidden");
    boxTierra.classList.add("hidden");

    const j = jerarquia.toLowerCase();

    if (j.includes("agrícola") || j.includes("rural")) {
      boxAgricola.classList.remove("hidden");
    } else if (j.includes("avenida") || j.includes("calle") || j.includes("urbanismo")) {
      boxUrbana.classList.remove("hidden");
    } else if (j.includes("popular") || j.includes("tierra")) {
      boxTierra.classList.remove("hidden");
    } else {
      // Por defecto para Troncales, Locales, Ramales y Especiales
      boxForaneas.classList.remove("hidden");
    }
  }

  evaluarAsistenciaCritica() {
    const puente = document.getElementById("select-puente-critico")?.value || "ninguno";
    const drenaje = document.getElementById("select-tramo-drenaje")?.value || "intactos";
    const bombeo = document.getElementById("select-bombeo-agricola")?.value || "adecuado_2pct";
    const patologias = Array.from(document.querySelectorAll("input[name='patologia_vial']:checked")).map(cb => cb.value);

    const esCritico = puente !== "ninguno" || 
                      patologias.includes("perdida_carpeta") || 
                      patologias.includes("falla_borde") ||
                      patologias.includes("piel_cocodrilo") || 
                      patologias.includes("cloaca_socavando_base") ||
                      patologias.includes("alcantarilla_cajon_rota") ||
                      bombeo === "invertido_charco" ||
                      drenaje === "sepultados";

    const badgeCrit = document.getElementById("badge-asistencia-critica");
    if (badgeCrit) {
      if (esCritico) {
        badgeCrit.classList.remove("hidden");
      } else {
        badgeCrit.classList.add("hidden");
      }
    }

    if (esCritico && (this.selectedColor === "verde" || this.selectedColor === "amarillo")) {
      if (puente !== "ninguno" || patologias.includes("perdida_carpeta") || patologias.includes("falla_borde")) {
        this.selectColorButton("rojo");
      } else {
        this.selectColorButton("naranja");
      }
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

  deleteCorredor(corredorId) {
    if (confirm("¿Estás seguro de eliminar este corredor completo con todos sus sub-tramos?")) {
      this.corredores = this.corredores.filter(c => c.id !== corredorId);
      if (this.activeCorredorId === corredorId) {
        this.activeCorredorId = this.corredores.length > 0 ? this.corredores[0].id : null;
      }
      this.saveCorredores();
      this.refreshView();
    }
  }

  deleteSubtramo(corredorId, subtramoId) {
    if (confirm("¿Deseas eliminar este sub-tramo?")) {
      const corr = this.corredores.find(c => c.id === corredorId);
      if (!corr) return;

      corr.subtramos = corr.subtramos.filter(s => s.id !== subtramoId);
      if (corr.subtramos.length === 0) {
        this.corredores = this.corredores.filter(c => c.id !== corredorId);
      } else {
        // Recalcular progresivas acumuladas
        let acc = 0;
        corr.subtramos.forEach(s => {
          s.pkInicioM = acc;
          s.pkFinM = acc + s.longitudM;
          acc += s.longitudM;
        });
        corr.longitudTotalM = acc;
      }

      this.saveCorredores();
      this.refreshView();
    }
  }

  /**
   * División geométrica interactiva de un subtramo en dos progresivas independientes
   */
  splitCurrentTramo() {
    if (!this.editingCorredorId || !this.editingSubtramoId) return;
    const corr = this.corredores.find(c => c.id === this.editingCorredorId);
    if (!corr) return;

    const subIndex = corr.subtramos.findIndex(s => s.id === this.editingSubtramoId);
    if (subIndex === -1) return;

    const sub = corr.subtramos[subIndex];
    if (!sub.puntos || sub.puntos.length < 2) return;

    const splitResult = this.mapViewer.splitPointsAtDistance(sub.puntos, sub.longitudM / 2);
    if (!splitResult) return;

    const { pointsA, pointsB, lenA, lenB } = splitResult;
    const pkBase = sub.pkInicioM || 0;

    // Subtramo A (se queda con los datos originales y primera mitad)
    sub.nombre = `${sub.nombre} (Parte A)`;
    sub.puntos = pointsA;
    sub.longitudM = lenA;
    sub.pkInicioM = pkBase;
    sub.pkFinM = pkBase + lenA;

    // Subtramo B (segunda mitad, sugerido en rojo para asignar nuevo estado)
    const subB = {
      id: `SUB-${Date.now()}`,
      nombre: `${sub.nombre.replace(' (Parte A)', '')} (Parte B)`,
      color: "rojo",
      longitudM: lenB,
      pkInicioM: pkBase + lenA,
      pkFinM: pkBase + lenA + lenB,
      puntos: pointsB,
      canalesAfectados: sub.canalesAfectados || "ambos",
      patologias: ["baches_profundos"],
      puenteCritico: "ninguno",
      bombeoTecnico: sub.bombeoTecnico || "adecuado_2pct",
      drenaje: sub.drenaje || "intactos",
      detalle: "Sección dividida para asignar estado físico independiente",
      foto: null,
      fecha: new Date().toISOString()
    };

    corr.subtramos.splice(subIndex + 1, 0, subB);

    // Reajustar progresivas de los tramos subsiguientes
    let acc = 0;
    corr.subtramos.forEach(s => {
      s.pkInicioM = acc;
      s.pkFinM = acc + s.longitudM;
      acc += s.longitudM;
    });
    corr.longitudTotalM = acc;

    this.saveCorredores();
    this.closeModal();
    this.refreshView();

    alert(`¡Sub-tramo dividido con éxito!\n\n1) ${sub.nombre} (${lenA}m en ${sub.color})\n2) ${subB.nombre} (${lenB}m en Rojo)\n\nPuedes tocar cualquiera de los dos en el Diagrama de Cinta o en el mapa para ajustar su evaluación técnica.`);
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

  /**
   * Guarda los datos del formulario tanto para nuevo subtramo como para edición
   */
  saveCurrentFormData() {
    const corredorNombre = document.getElementById("input-corredor-nombre").value.trim() || "Corredor Vial";
    const subtramoNombre = document.getElementById("input-tramo-nombre").value.trim() || "Sub-Tramo";
    const jerarquia = document.getElementById("select-tramo-jerarquia")?.value || "Troncal / Autopista (T-10, T-13)";
    const canales = document.getElementById("select-tramo-canales")?.value || "ambos";
    const puenteCritico = document.getElementById("select-puente-critico")?.value || "ninguno";
    const drenaje = document.getElementById("select-tramo-drenaje")?.value || "intactos";
    const bombeo = document.getElementById("select-bombeo-agricola")?.value || "adecuado_2pct";
    const superficie = document.getElementById("select-superficie-agricola")?.value || "arena_sabana";
    const detalle = document.getElementById("input-tramo-detalle").value.trim();
    const patologias = Array.from(document.querySelectorAll("input[name='patologia_vial']:checked")).map(cb => cb.value);

    let targetCorredor = null;
    let targetSubtramo = null;

    if (this.editingCorredorId && this.editingSubtramoId) {
      // Modo Edición
      targetCorredor = this.corredores.find(c => c.id === this.editingCorredorId);
      if (targetCorredor) {
        targetCorredor.nombre = corredorNombre;
        targetCorredor.jerarquia = jerarquia;

        targetSubtramo = targetCorredor.subtramos.find(s => s.id === this.editingSubtramoId);
        if (targetSubtramo) {
          targetSubtramo.nombre = subtramoNombre;
          targetSubtramo.color = this.selectedColor;
          targetSubtramo.canalesAfectados = canales;
          targetSubtramo.puenteCritico = puenteCritico;
          targetSubtramo.drenaje = drenaje;
          targetSubtramo.bombeoTecnico = bombeo;
          targetSubtramo.superficieAgricola = superficie;
          targetSubtramo.patologias = patologias;
          targetSubtramo.detalle = detalle;
          targetSubtramo.foto = this.tempFoto;
        }
      }
    } else {
      // Modo Nuevo Trazo
      // Buscar si ya existe un corredor con ese nombre
      targetCorredor = this.corredores.find(c => c.nombre.toLowerCase() === corredorNombre.toLowerCase());

      if (!targetCorredor) {
        targetCorredor = {
          id: `CORR-${Date.now()}`,
          codigo: `CV-${this.corredores.length + 1}`,
          nombre: corredorNombre,
          jerarquia: jerarquia,
          longitudTotalM: 0,
          subtramos: []
        };
        this.corredores.push(targetCorredor);
      } else {
        targetCorredor.jerarquia = jerarquia;
      }

      // Calcular PK inicial para el nuevo subtramo en este corredor
      let pkIni = 0;
      targetCorredor.subtramos.forEach(s => pkIni += (s.longitudM || 0));

      targetSubtramo = {
        id: `SUB-${Date.now()}`,
        nombre: subtramoNombre,
        color: this.selectedColor,
        longitudM: this.tempLongitudM,
        pkInicioM: pkIni,
        pkFinM: pkIni + this.tempLongitudM,
        puntos: this.tempPoints,
        canalesAfectados: canales,
        puenteCritico: puenteCritico,
        drenaje: drenaje,
        bombeoTecnico: bombeo,
        superficieAgricola: superficie,
        patologias: patologias,
        detalle: detalle,
        foto: this.tempFoto,
        fecha: new Date().toISOString()
      };

      targetCorredor.subtramos.push(targetSubtramo);
    }

    if (targetCorredor) {
      // Recalcular longitud total del corredor
      let total = 0;
      targetCorredor.subtramos.forEach(s => total += (s.longitudM || 0));
      targetCorredor.longitudTotalM = total;
      this.activeCorredorId = targetCorredor.id;
    }

    this.saveCorredores();
    return { corredor: targetCorredor, subtramo: targetSubtramo };
  }

  setupEventListeners() {
    // 1. Selector de Jerarquía (Mutación Dinámica de Preguntas)
    const selectJerarquia = document.getElementById("select-tramo-jerarquia");
    if (selectJerarquia) {
      selectJerarquia.addEventListener("change", (e) => {
        this.updateConditionalFields(e.target.value);
      });
    }

    // 2. Asistencia Crítica Reactiva
    document.querySelectorAll("input[name='patologia_vial']").forEach(cb => {
      cb.addEventListener("change", () => this.evaluarAsistenciaCritica());
    });

    const selectPuente = document.getElementById("select-puente-critico");
    if (selectPuente) selectPuente.addEventListener("change", () => this.evaluarAsistenciaCritica());

    const selectDrenaje = document.getElementById("select-tramo-drenaje");
    if (selectDrenaje) selectDrenaje.addEventListener("change", () => this.evaluarAsistenciaCritica());

    const selectBombeo = document.getElementById("select-bombeo-agricola");
    if (selectBombeo) selectBombeo.addEventListener("change", () => this.evaluarAsistenciaCritica());

    // 3. Botones de Trazado
    const btnActivar = document.getElementById("btn-activar-trazo");
    if (btnActivar) {
      btnActivar.addEventListener("click", () => {
        this.setDrawingUiState(true);
        this.mapViewer.startDrawing();
      });
    }

    const btnDeshacer = document.getElementById("btn-deshacer-punto");
    if (btnDeshacer) {
      btnDeshacer.addEventListener("click", () => {
        this.mapViewer.undoLastPoint();
      });
    }

    const btnFinalizar = document.getElementById("btn-finalizar-trazo");
    if (btnFinalizar) {
      btnFinalizar.addEventListener("click", () => {
        this.mapViewer.finishDrawing();
      });
    }

    const btnCancelar = document.getElementById("btn-cancelar-trazo");
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => {
        this.setDrawingUiState(false);
        this.mapViewer.cancelDrawing();
      });
    }

    // 4. Selector de Color
    document.querySelectorAll(".btn-color-pick").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectColorButton(btn.dataset.color);
      });
    });

    // 5. Carga de Foto
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

    // 6. Guardar Solo Sub-Tramo
    const form = document.getElementById("form-guardar-tramo");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveCurrentFormData();
        this.closeModal();
        this.refreshView();
      });
    }

    // 7. Guardar y Continuar Trazando Siguiente Sub-Tramo
    const btnContinuar = document.getElementById("btn-guardar-y-continuar");
    if (btnContinuar) {
      btnContinuar.addEventListener("click", () => {
        const saved = this.saveCurrentFormData();
        this.closeModal();
        this.refreshView();

        if (saved && saved.subtramo && saved.subtramo.puntos && saved.subtramo.puntos.length > 0) {
          const lastCoord = saved.subtramo.puntos[saved.subtramo.puntos.length - 1];
          this.setDrawingUiState(true);
          this.mapViewer.startDrawing(lastCoord);
        }
      });
    }

    // 8. Botón Dividir en Sub-Tramos
    const btnDividir = document.getElementById("btn-dividir-tramo-en-dos");
    if (btnDividir) {
      btnDividir.addEventListener("click", () => {
        this.splitCurrentTramo();
      });
    }

    // 9. Botón rápido "Nuevo Sub-Tramo" desde la barra de cinta
    const btnAddStrip = document.getElementById("btn-sidebar-add-subtramo");
    if (btnAddStrip) {
      btnAddStrip.addEventListener("click", () => {
        if (this.activeCorredorId) {
          this.startAddingSubtramoTo(this.activeCorredorId);
        } else {
          this.setDrawingUiState(true);
          this.mapViewer.startDrawing();
        }
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
        if (confirm("¿Estás completamente seguro de borrar todos los corredores viales para reiniciar el levantamiento?")) {
          this.corredores = [];
          this.activeCorredorId = null;
          this.saveCorredores();
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

  /**
   * Exporta archivo KML completo con jerarquías, progresivas y patologías para Google Earth
   */
  exportKml() {
    if (this.corredores.length === 0) {
      alert("No hay corredores viales para exportar.");
      return;
    }

    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Inventario y Diagnóstico Vial de Precisión — Monagas 2026</name>
    <description>Levantamiento técnico de autopistas multi-estado, progresivas (PK) y fallas de pavimento (MIGATO)</description>

    <Style id="color_verde"><LineStyle><color>ff10b981</color><width>6</width></LineStyle></Style>
    <Style id="color_amarillo"><LineStyle><color>fff59e0b</color><width>6</width></LineStyle></Style>
    <Style id="color_naranja"><LineStyle><color>fff97316</color><width>6</width></LineStyle></Style>
    <Style id="color_rojo"><LineStyle><color>ffef4444</color><width>7</width></LineStyle></Style>
`;

    this.corredores.forEach(corr => {
      kml += `
    <Folder>
      <name>${corr.nombre} (${(corr.longitudTotalM / 1000).toFixed(2)} km)</name>
      <description>Jerarquía: ${corr.jerarquia || "No definida"}</description>
`;

      if (corr.subtramos) {
        corr.subtramos.forEach(sub => {
          if (!sub.puntos || sub.puntos.length < 2) return;
          const coordsStr = sub.puntos.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          const styleId = `#color_${sub.color || "amarillo"}`;
          const pkIni = RoadMapViewer.formatPK(sub.pkInicioM || 0);
          const pkFin = RoadMapViewer.formatPK(sub.pkFinM || (sub.pkInicioM + sub.longitudM));

          kml += `
      <Placemark>
        <name>${sub.nombre} [${pkIni} - ${pkFin}]</name>
        <description><![CDATA[
          <h3>${sub.nombre}</h3>
          <p><strong>Corredor:</strong> ${corr.nombre}</p>
          <p><strong>Jerarquía:</strong> ${corr.jerarquia}</p>
          <p><strong>Progresiva:</strong> ${pkIni} a ${pkFin} (${sub.longitudM} m)</p>
          <p><strong>Condición:</strong> ${sub.color.toUpperCase()}</p>
          <p><strong>Canal Afectado:</strong> ${sub.canalesAfectados || "Calzada Completa"}</p>
          ${sub.puenteCritico && sub.puenteCritico !== 'ninguno' ? `<p style="color:red;"><strong>⚠️ ALERTA PUENTE:</strong> ${sub.puenteCritico.replace(/_/g, ' ').toUpperCase()}</p>` : ''}
          ${sub.patologias && sub.patologias.length > 0 ? `<p><strong>Patologías:</strong> ${sub.patologias.join(', ')}</p>` : ''}
          ${sub.bombeoTecnico ? `<p><strong>Bombeo:</strong> ${sub.bombeoTecnico}</p>` : ''}
          <p><strong>Detalle:</strong> ${sub.detalle || "Sin observaciones adicionales"}</p>
        ]]></description>
        <styleUrl>${styleId}</styleUrl>
        <LineString>
          <coordinates>${coordsStr}</coordinates>
        </LineString>
      </Placemark>`;
        });
      }

      kml += `
    </Folder>`;
    });

    kml += `
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Diagnostico_Vial_Monagas_${new Date().toISOString().split("T")[0]}.kml`;
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
