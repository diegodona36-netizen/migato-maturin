/**
 * Dashboard de Estadísticas Electorales y Militancia 1x10 • Comando de Campaña Monagas
 * Sincronización en tiempo real con Firebase Firestore + Respaldo Offline
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  getDocs,
  doc,
  setDoc,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Credenciales oficiales de Firebase (gato-3e238)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCK8DBZWsVflfMoA_z-9XupX0BvLE4iJjc",
  authDomain: "gato-3e238.firebaseapp.com",
  projectId: "gato-3e238",
  storageBucket: "gato-3e238.firebasestorage.app",
  messagingSenderId: "630890915824",
  appId: "1:630890915824:web:bc0deb7f80c4494b78df35",
  measurementId: "G-G1617P2MM0"
};

// Padrón Oficial y Metas Electorales por Parroquia (Base INE / CNE)
export const PADRON_PARROQUIAS_MONAGAS = {
  // MATURÍN (10 Parroquias)
  "san-simon": { nombre: "San Simón", munId: "maturin", electores: 78500, metaVotos: 51000, centros: 38, mesas: 84 },
  "alto-de-los-godos": { nombre: "Alto de Los Godos", munId: "maturin", electores: 69200, metaVotos: 45000, centros: 32, mesas: 72 },
  "boqueron": { nombre: "Boquerón", munId: "maturin", electores: 58400, metaVotos: 38000, centros: 26, mesas: 60 },
  "las-cocuizas": { nombre: "Las Cocuizas", munId: "maturin", electores: 49800, metaVotos: 32400, centros: 24, mesas: 52 },
  "santa-cruz": { nombre: "Santa Cruz", munId: "maturin", electores: 36500, metaVotos: 23700, centros: 18, mesas: 38 },
  "san-vicente": { nombre: "San Vicente", munId: "maturin", electores: 24100, metaVotos: 15600, centros: 12, mesas: 26 },
  "la-pica": { nombre: "La Pica", munId: "maturin", electores: 21300, metaVotos: 13800, centros: 11, mesas: 24 },
  "el-furrial": { nombre: "El Furrial", munId: "maturin", electores: 18900, metaVotos: 12300, centros: 10, mesas: 20 },
  "jusepin": { nombre: "Jusepín", munId: "maturin", electores: 15200, metaVotos: 9900, centros: 8, mesas: 16 },
  "el-corozo": { nombre: "El Corozo", munId: "maturin", electores: 12600, metaVotos: 8200, centros: 7, mesas: 14 },

  // OTROS MUNICIPIOS
  "aragua-de-maturin": { nombre: "Aragua de Maturín", munId: "piar", electores: 18400, metaVotos: 12000, centros: 16, mesas: 24 },
  "caripe": { nombre: "Caripe", munId: "caripe", electores: 16800, metaVotos: 11000, centros: 14, mesas: 22 },
  "caicara": { nombre: "Caicara", munId: "cedeno", electores: 17200, metaVotos: 11200, centros: 15, mesas: 23 },
  "punta-de-mata": { nombre: "Punta de Mata", munId: "ezequiel-zamora", electores: 34200, metaVotos: 22500, centros: 24, mesas: 42 },
  "temblador": { nombre: "Temblador", munId: "libertador", electores: 22500, metaVotos: 14800, centros: 18, mesas: 28 },
  "caripito": { nombre: "Caripito", munId: "bolivar", electores: 33200, metaVotos: 21500, centros: 22, mesas: 36 },
  "quiriquire": { nombre: "Quiriquire", munId: "punceres", electores: 14800, metaVotos: 9800, centros: 12, mesas: 18 },
  "san-antonio": { nombre: "San Antonio de Capayacuar", munId: "acosta", electores: 11500, metaVotos: 7600, centros: 10, mesas: 14 },
  "aguasay": { nombre: "Aguasay", munId: "aguasay", electores: 9800, metaVotos: 6400, centros: 9, mesas: 12 },
  "uracoa": { nombre: "Uracoa", munId: "uracoa", electores: 6800, metaVotos: 4500, centros: 7, mesas: 10 },
  "barrancas": { nombre: "Barrancas del Orinoco", munId: "sotillo", electores: 18900, metaVotos: 12400, centros: 15, mesas: 22 },
  "santa-barbara": { nombre: "Santa Bárbara", munId: "santa-barbara", electores: 8500, metaVotos: 5600, centros: 8, mesas: 11 }
};

export const MUNICIPIOS_CATALOG = [
  { id: "maturin", nombre: "Maturín" },
  { id: "bolivar", nombre: "Bolívar (Caripito)" },
  { id: "ezequiel-zamora", nombre: "Ezequiel Zamora (Punta de Mata)" },
  { id: "libertador", nombre: "Libertador (Temblador)" },
  { id: "piar", nombre: "Piar (Aragua)" },
  { id: "caripe", nombre: "Caripe" },
  { id: "cedeno", nombre: "Cedeño (Caicara)" },
  { id: "punceres", nombre: "Punceres (Quiriquire)" },
  { id: "sotillo", nombre: "Sotillo (Barrancas)" },
  { id: "acosta", nombre: "Acosta (San Antonio)" },
  { id: "aguasay", nombre: "Aguasay" },
  { id: "santa-barbara", nombre: "Santa Bárbara" },
  { id: "uracoa", nombre: "Uracoa" }
];

export class CampaignDashboardApp {
  constructor() {
    this.db = null;
    this.territorios = {};
    this.militantesRoster = this.loadMilitantesRoster();
    this.selectedMunId = "maturin";
    this.selectedParishId = "todas";
    this.searchQuery = "";
    this.unsubscribeFirestore = null;
    this.currentSectorForModal = null;

    this.initFirebase();
    this.bindEvents();
    this.render();
  }

  loadMilitantesRoster() {
    try {
      const raw = localStorage.getItem("militancia_monagas_sectores_v1");
      return raw ? JSON.parse(raw) : {};
    } catch(e) {
      return {};
    }
  }

  saveMilitantesRoster() {
    try {
      localStorage.setItem("militancia_monagas_sectores_v1", JSON.stringify(this.militantesRoster));
    } catch(e) {}
  }

  initFirebase() {
    try {
      const app = initializeApp(FIREBASE_CONFIG, "CAMPAIGN_DASHBOARD_APP");
      this.db = getFirestore(app);
      try {
        enableIndexedDbPersistence(this.db).catch(() => {});
      } catch(e) {}

      this.updateCloudStatus(true, "Conectado a Firebase");

      // Escuchar cambios en tiempo real
      const colRef = collection(this.db, "territorios_monagas");
      this.unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
        const cloudData = {};
        snapshot.forEach(docSnap => {
          cloudData[docSnap.id] = docSnap.data();
        });
        this.territorios = cloudData;
        this.render();
        this.updateCloudStatus(true, "Firebase En Vivo");
      }, (err) => {
        console.warn("Aviso Firestore:", err);
        this.fallbackToLocalStorage();
      });
    } catch(e) {
      console.warn("Error inicializando Firebase:", e);
      this.fallbackToLocalStorage();
    }
  }

  fallbackToLocalStorage() {
    this.updateCloudStatus(false, "Modo Local / Caché");
    try {
      const raw = localStorage.getItem("earth_monagas_places_v3");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Adaptar estructura
        const converted = {};
        if (parsed.parroquias) {
          Object.keys(parsed.parroquias).forEach(pKey => {
            const p = parsed.parroquias[pKey];
            const munId = p.munId || "maturin";
            const parishId = p.parishId || pKey;
            converted[`${munId}_${parishId}`] = p;
          });
        }
        this.territorios = converted;
        this.render();
      }
    } catch(err) {}
  }

  updateCloudStatus(connected, text) {
    const dot = document.getElementById("cloud-status-dot");
    const label = document.getElementById("cloud-status-text");
    if (dot) {
      dot.className = `w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`;
    }
    if (label) {
      label.textContent = text;
    }
  }

  bindEvents() {
    // Selector de Municipio
    const selMun = document.getElementById("filter-municipio");
    if (selMun) {
      selMun.addEventListener("change", (e) => {
        this.selectedMunId = e.target.value;
        this.selectedParishId = "todas";
        this.updateParishPills();
        this.render();
      });
    }

    // Buscador
    const inSearch = document.getElementById("filter-search");
    if (inSearch) {
      inSearch.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTableOnly();
      });
    }

    // Botón Exportar CSV
    const btnExport = document.getElementById("btn-export-csv");
    if (btnExport) {
      btnExport.addEventListener("click", () => this.exportCSVReport());
    }

    // Botón Recargar
    const btnReload = document.getElementById("btn-refresh-data");
    if (btnReload) {
      btnReload.addEventListener("click", () => {
        btnReload.classList.add("animate-spin");
        setTimeout(() => {
          btnReload.classList.remove("animate-spin");
          this.render();
        }, 600);
      });
    }

    // Modal de Militantes
    const modalClose = document.getElementById("btn-close-militantes-modal");
    if (modalClose) {
      modalClose.addEventListener("click", () => this.closeMilitantesModal());
    }

    const formAddMilitante = document.getElementById("form-add-militante");
    if (formAddMilitante) {
      formAddMilitante.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitNewMilitante();
      });
    }
  }

  updateParishPills() {
    const container = document.getElementById("parish-pills-container");
    if (!container) return;

    // Obtener las parroquias del municipio seleccionado
    const parishesInMun = Object.keys(PADRON_PARROQUIAS_MONAGAS)
      .filter(k => PADRON_PARROQUIAS_MONAGAS[k].munId === this.selectedMunId)
      .map(k => ({ id: k, ...PADRON_PARROQUIAS_MONAGAS[k] }));

    let html = `
      <button type="button" data-parish="todas" class="parish-pill px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${this.selectedParishId === 'todas' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'}">
        <i data-lucide="layers" class="w-3.5 h-3.5"></i>
        <span>Todas las Parroquias</span>
      </button>
    `;

    parishesInMun.forEach(p => {
      const isSel = this.selectedParishId === p.id;
      html += `
        <button type="button" data-parish="${p.id}" class="parish-pill px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${isSel ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'}">
          <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
          <span>${p.nombre}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    // Reactivar eventos de las píldoras
    container.querySelectorAll(".parish-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedParishId = btn.dataset.parish;
        this.updateParishPills();
        this.render();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Recopila todos los sectores del estado / municipio / parroquia
  getAllSectorsList() {
    const list = [];

    // Recorrer la data de territorios
    Object.keys(this.territorios).forEach(docKey => {
      const t = this.territorios[docKey];
      const munId = t.munId || docKey.split("_")[0] || "maturin";
      const parishId = t.parishId || docKey.split("_")[1] || "san-simon";

      // Filtro de municipio
      if (this.selectedMunId !== "todos" && munId !== this.selectedMunId) {
        return;
      }

      // Filtro de parroquia
      if (this.selectedParishId !== "todas" && parishId !== this.selectedParishId) {
        return;
      }

      const pInfo = PADRON_PARROQUIAS_MONAGAS[parishId] || { nombre: parishId, munId };
      const subparroquias = t.subparroquias || [];

      (t.poligonos || []).forEach(sec => {
        // Encontrar sub-parroquia padre si existe
        const spPadre = subparroquias.find(sp => String(sp.id) === String(sec.subParroquiaId));
        const subParroquiaNombre = spPadre ? spPadre.nombre : (sec.subParroquiaId ? `Eje ${sec.subParroquiaId}` : "Sin Eje Asignado");

        const militantes = parseInt(sec.militantes !== undefined ? sec.militantes : (sec.habitantes || 0)) || 0;
        const casas = parseInt(sec.casas || 0) || 0;
        const familias = parseInt(sec.familias || casas) || 0;

        // Individuales registrados en el roster
        const rosterCount = (this.militantesRoster[sec.id] || []).length;
        const totalMilitantesEfectivo = Math.max(militantes, rosterCount);

        list.push({
          id: sec.id,
          nombre: sec.nombre || "Sector sin nombre",
          munId,
          parishId,
          parroquiaNombre: pInfo.nombre,
          subParroquiaId: sec.subParroquiaId,
          subParroquiaNombre,
          militantes: totalMilitantesEfectivo,
          casas,
          familias,
          lider: sec.lider || "Por designar",
          telefono: sec.telefono || "",
          coberturaRatio: casas > 0 ? (totalMilitantesEfectivo / (casas * 1.5)) : 0,
          color: sec.colorRelleno || "#38bdf8"
        });
      });
    });

    return list;
  }

  calculateAggregates() {
    const allSectors = this.getAllSectorsList();

    let totalMilitantes = 0;
    let totalCasas = 0;
    let totalFamilias = 0;
    let totalLideres = 0;

    allSectors.forEach(sec => {
      totalMilitantes += sec.militantes;
      totalCasas += sec.casas;
      totalFamilias += sec.familias;
      if (sec.lider && sec.lider.toLowerCase() !== "por designar") {
        totalLideres++;
      }
    });

    // Padrón y metas electorales según la selección
    let padronElectores = 0;
    let metaVotos = 0;
    let centrosVotacion = 0;
    let mesasElectorales = 0;

    if (this.selectedParishId !== "todas") {
      const p = PADRON_PARROQUIAS_MONAGAS[this.selectedParishId];
      if (p) {
        padronElectores = p.electores;
        metaVotos = p.metaVotos;
        centrosVotacion = p.centros;
        mesasElectorales = p.mesas;
      }
    } else {
      // Sumar todas las del municipio seleccionado
      Object.keys(PADRON_PARROQUIAS_MONAGAS).forEach(k => {
        const p = PADRON_PARROQUIAS_MONAGAS[k];
        if (p.munId === this.selectedMunId) {
          padronElectores += p.electores;
          metaVotos += p.metaVotos;
          centrosVotacion += p.centros;
          mesasElectorales += p.mesas;
        }
      });
    }

    const pctMetaAlcanzada = metaVotos > 0 ? ((totalMilitantes / metaVotos) * 100) : 0;
    const proyeccion1x10 = totalMilitantes * 10;
    const pct1x10VsMeta = metaVotos > 0 ? ((proyeccion1x10 / metaVotos) * 100) : 0;

    return {
      allSectors,
      totalSectores: allSectors.length,
      totalMilitantes,
      totalCasas,
      totalFamilias,
      totalLideres,
      padronElectores,
      metaVotos,
      centrosVotacion,
      mesasElectorales,
      pctMetaAlcanzada,
      proyeccion1x10,
      pct1x10VsMeta
    };
  }

  render() {
    this.updateParishPills();
    const agg = this.calculateAggregates();

    // Actualizar KPIs
    this.renderKPIs(agg);

    // Actualizar Comparativa de Parroquias
    this.renderParishRanking();

    // Actualizar Tabla
    this.renderTable(agg.allSectors);

    if (window.lucide) window.lucide.createIcons();
  }

  renderKPIs(agg) {
    // 1. Total Militantes
    const elMilitantes = document.getElementById("kpi-total-militantes");
    if (elMilitantes) elMilitantes.textContent = agg.totalMilitantes.toLocaleString();

    // 2. Meta de Votos y Porcentaje
    const elMeta = document.getElementById("kpi-meta-votos");
    if (elMeta) elMeta.textContent = agg.metaVotos.toLocaleString();

    const elPctMeta = document.getElementById("kpi-pct-meta");
    const elPctProgress = document.getElementById("kpi-pct-progress");
    const elPctBadge = document.getElementById("kpi-pct-badge");

    const pctNum = Math.min(Math.round(agg.pctMetaAlcanzada), 100);
    if (elPctMeta) elPctMeta.textContent = `${pctNum}%`;
    if (elPctProgress) {
      elPctProgress.style.width = `${pctNum}%`;
      // Color semáforo
      elPctProgress.className = `h-full rounded-full transition-all duration-700 ${
        pctNum >= 70 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
        pctNum >= 40 ? 'bg-amber-400 shadow-lg shadow-amber-400/50' : 'bg-red-500 shadow-lg shadow-red-500/50'
      }`;
    }

    if (elPctBadge) {
      if (pctNum >= 70) {
        elPctBadge.textContent = "🟢 Cobertura Óptima";
        elPctBadge.className = "px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 text-[10px] font-black";
      } else if (pctNum >= 40) {
        elPctBadge.textContent = "🟡 Cobertura Media";
        elPctBadge.className = "px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-400 border border-amber-500/40 text-[10px] font-black";
      } else {
        elPctBadge.textContent = "🔴 Cobertura Baja (Alerta)";
        elPctBadge.className = "px-2 py-0.5 rounded-md bg-red-950/60 text-red-400 border border-red-500/40 text-[10px] font-black";
      }
    }

    // 3. Casas y Familias
    const elCasas = document.getElementById("kpi-total-casas");
    if (elCasas) elCasas.textContent = agg.totalCasas.toLocaleString();

    // 4. Proyección 1x10
    const el1x10 = document.getElementById("kpi-proyeccion-1x10");
    if (el1x10) el1x10.textContent = agg.proyeccion1x10.toLocaleString();

    // 5. Líderes de Calle
    const elLideres = document.getElementById("kpi-total-lideres");
    if (elLideres) elLideres.textContent = agg.totalLideres.toLocaleString();

    // 6. Centros y Mesas
    const elCentros = document.getElementById("kpi-centros-mesas");
    if (elCentros) elCentros.textContent = `${agg.centrosVotacion} Centros / ${agg.mesasElectorales} Mesas`;

    // Subtítulo del dashboard
    const subTitle = document.getElementById("dashboard-territory-subtitle");
    if (subTitle) {
      const pName = this.selectedParishId !== "todas" 
        ? PADRON_PARROQUIAS_MONAGAS[this.selectedParishId]?.nombre 
        : `Todo el Municipio ${MUNICIPIOS_CATALOG.find(m => m.id === this.selectedMunId)?.nombre || this.selectedMunId}`;
      subTitle.textContent = `${pName} • Padrón: ${agg.padronElectores.toLocaleString()} electores • ${agg.totalSectores} Sectores Censados`;
    }
  }

  renderParishRanking() {
    const container = document.getElementById("ranking-parroquias-container");
    if (!container) return;

    // Calcular datos por parroquia para el municipio activo
    const parishStats = [];

    Object.keys(PADRON_PARROQUIAS_MONAGAS).forEach(pId => {
      const p = PADRON_PARROQUIAS_MONAGAS[pId];
      if (p.munId !== this.selectedMunId) return;

      const docKey = `${p.munId}_${pId}`;
      const t = this.territorios[docKey] || {};
      const poligonos = t.poligonos || [];

      let militantes = 0;
      let casas = 0;
      poligonos.forEach(sec => {
        const m = parseInt(sec.militantes !== undefined ? sec.militantes : (sec.habitantes || 0)) || 0;
        const rosterCount = (this.militantesRoster[sec.id] || []).length;
        militantes += Math.max(m, rosterCount);
        casas += parseInt(sec.casas || 0) || 0;
      });

      const pct = p.metaVotos > 0 ? Math.round((militantes / p.metaVotos) * 100) : 0;

      parishStats.push({
        id: pId,
        nombre: p.nombre,
        militantes,
        casas,
        metaVotos: p.metaVotos,
        pct,
        sectoresCount: poligonos.length
      });
    });

    // Ordenar por porcentaje de cumplimiento descendente
    parishStats.sort((a, b) => b.pct - a.pct);

    let html = "";
    parishStats.forEach((ps, idx) => {
      const colorBg = ps.pct >= 70 ? 'bg-emerald-500' : (ps.pct >= 40 ? 'bg-amber-400' : 'bg-red-500');
      const colorText = ps.pct >= 70 ? 'text-emerald-400' : (ps.pct >= 40 ? 'text-amber-400' : 'text-red-400');
      const isCurrent = this.selectedParishId === ps.id;

      html += `
        <div class="p-3 rounded-2xl bg-slate-900 border ${isCurrent ? 'border-sky-500 shadow-md shadow-sky-500/20' : 'border-slate-800'} hover:border-slate-700 transition cursor-pointer" onclick="window.campaignDashboard?.filterByParishDirect('${ps.id}')">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">#${idx + 1}</span>
              <span class="text-xs font-bold text-white hover:text-sky-300 transition">${ps.nombre}</span>
              <span class="text-[10px] text-slate-500 font-mono">(${ps.sectoresCount} sect.)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-black ${colorText}">${ps.pct}%</span>
              <span class="text-[11px] text-slate-400 font-mono">(${ps.militantes.toLocaleString()} / ${ps.metaVotos.toLocaleString()})</span>
            </div>
          </div>
          <!-- Barra de Progreso -->
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="${colorBg} h-full rounded-full transition-all duration-500" style="width: ${Math.min(ps.pct, 100)}%"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderTable(sectors) {
    const tbody = document.getElementById("table-sectors-tbody");
    const countBadge = document.getElementById("table-sectors-count");
    if (!tbody) return;

    let filtered = sectors;
    if (this.searchQuery) {
      filtered = sectors.filter(s => 
        s.nombre.toLowerCase().includes(this.searchQuery) ||
        s.parroquiaNombre.toLowerCase().includes(this.searchQuery) ||
        s.subParroquiaNombre.toLowerCase().includes(this.searchQuery) ||
        s.lider.toLowerCase().includes(this.searchQuery) ||
        s.telefono.toLowerCase().includes(this.searchQuery)
      );
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Sectores`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-slate-500">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
            <p class="text-xs font-medium">No se encontraron sectores con los filtros actuales.</p>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let html = "";
    filtered.forEach(sec => {
      // Teléfono formateado para WhatsApp
      const rawTel = (sec.telefono || "").replace(/\D/g, "");
      let waUrl = null;
      if (rawTel.length >= 10) {
        const fullTel = rawTel.startsWith("58") ? rawTel : `58${rawTel.replace(/^0/, "")}`;
        waUrl = `https://wa.me/${fullTel}?text=${encodeURIComponent(`Hola compañero(a) ${sec.lider}, le saludamos del Comando de Campaña Monagas respecto al Sector ${sec.nombre}.`)}`;
      }

      const semaforoBadge = sec.militantes >= 500
        ? '<span class="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">🟢 Fuerte</span>'
        : (sec.militantes >= 150 
          ? '<span class="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/40 text-[10px] font-bold">🟡 Medio</span>' 
          : '<span class="px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-500/40 text-[10px] font-bold">🔴 Prioritario</span>');

      html += `
        <tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
          <!-- Sector y Sub-Parroquia -->
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${sec.color};"></span>
              <div>
                <span class="text-xs font-black text-white block">${sec.nombre}</span>
                <span class="text-[10px] text-purple-300 font-medium">${sec.subParroquiaNombre}</span>
              </div>
            </div>
          </td>

          <!-- Parroquia -->
          <td class="px-4 py-3 text-xs text-slate-300 font-medium">
            ${sec.parroquiaNombre}
          </td>

          <!-- Militantes -->
          <td class="px-4 py-3 text-right">
            <span class="text-xs font-mono font-black text-sky-400 bg-sky-950/60 px-2 py-1 rounded-lg border border-sky-600/30">
              ${sec.militantes.toLocaleString()}
            </span>
          </td>

          <!-- Casas / Familias -->
          <td class="px-4 py-3 text-right">
            <span class="text-xs font-mono font-bold text-amber-400">
              ${sec.casas.toLocaleString()}
            </span>
          </td>

          <!-- Líder y WhatsApp -->
          <td class="px-4 py-3">
            <div class="flex items-center justify-between gap-2">
              <div>
                <span class="text-xs font-bold text-white block">${sec.lider}</span>
                <span class="text-[11px] font-mono text-slate-400">${sec.telefono || 'Sin teléfono'}</span>
              </div>
              ${waUrl ? `
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 transition flex items-center gap-1 text-[11px] font-bold shrink-0" title="Contactar por WhatsApp">
                  <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                  <span class="hidden xl:inline">Chat</span>
                </a>
              ` : ''}
            </div>
          </td>

          <!-- Semáforo Estatus -->
          <td class="px-4 py-3 text-center">
            ${semaforoBadge}
          </td>

          <!-- Acciones -->
          <td class="px-4 py-3 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button type="button" onclick="window.campaignDashboard?.openMilitantesModal('${sec.id}', '${encodeURIComponent(sec.nombre)}', '${sec.parishId}', '${sec.munId}')" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-sky-900 text-sky-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1" title="Ver Censo Nominal">
                <i data-lucide="users" class="w-3 h-3"></i>
                <span>Censo</span>
              </button>
              <a href="../earth-monagas/?sector=${sec.id}&parish=${sec.parishId}&mun=${sec.munId}" class="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition" title="Localizar en Google Earth">
                <i data-lucide="map" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  renderTableOnly() {
    const agg = this.calculateAggregates();
    this.renderTable(agg.allSectors);
  }

  filterByParishDirect(parishId) {
    this.selectedParishId = parishId;
    this.updateParishPills();
    this.render();
  }

  // MODAL DE DETALLE Y REGISTRO DE MILITANTES
  openMilitantesModal(sectorId, sectorNombreEncoded, parishId, munId) {
    const sectorNombre = decodeURIComponent(sectorNombreEncoded);
    this.currentSectorForModal = { id: sectorId, nombre: sectorNombre, parishId, munId };

    const modal = document.getElementById("modal-militantes-detail");
    const title = document.getElementById("modal-militantes-title");
    const secInput = document.getElementById("new-mil-sector-id");

    if (title) title.textContent = `Censo Nominal 1x10 • ${sectorNombre}`;
    if (secInput) secInput.value = sectorId;

    this.renderMilitantesList();

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  closeMilitantesModal() {
    const modal = document.getElementById("modal-militantes-detail");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    this.currentSectorForModal = null;
  }

  renderMilitantesList() {
    const container = document.getElementById("militantes-list-container");
    if (!container || !this.currentSectorForModal) return;

    const list = this.militantesRoster[this.currentSectorForModal.id] || [];

    if (list.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-slate-500">
          <i data-lucide="user-plus" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
          <p class="text-xs">No hay militantes nominales registrados en este sector todavía.</p>
          <p class="text-[11px] text-slate-600">Completa el formulario de la derecha para registrar el primer militante.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let html = "";
    list.forEach(m => {
      html += `
        <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white">${m.nombre}</span>
              <span class="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-600/40 text-[10px] font-mono">${m.rol}</span>
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>C.I: <b>${m.cedula}</b></span>
              <span>•</span>
              <span>Tel: <b>${m.telefono || 'N/A'}</b></span>
              ${m.manzana ? `<span>• Manz: ${m.manzana}</span>` : ''}
            </div>
          </div>
          <button type="button" onclick="window.campaignDashboard?.deleteMilitante('${this.currentSectorForModal.id}', '${m.id}')" class="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition" title="Eliminar">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  submitNewMilitante() {
    if (!this.currentSectorForModal) return;

    const sectorId = this.currentSectorForModal.id;
    const inNombre = document.getElementById("new-mil-nombre");
    const inCedula = document.getElementById("new-mil-cedula");
    const inTelefono = document.getElementById("new-mil-telefono");
    const inRol = document.getElementById("new-mil-rol");
    const inManzana = document.getElementById("new-mil-manzana");

    if (!inNombre || !inCedula || !inNombre.value.trim() || !inCedula.value.trim()) {
      alert("Por favor complete al menos el Nombre y la Cédula del militante.");
      return;
    }

    if (!this.militantesRoster[sectorId]) {
      this.militantesRoster[sectorId] = [];
    }

    const newMil = {
      id: "mil-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      nombre: inNombre.value.trim(),
      cedula: inCedula.value.trim(),
      telefono: (inTelefono ? inTelefono.value : "").trim(),
      rol: inRol ? inRol.value : "Militante 1x10",
      manzana: (inManzana ? inManzana.value : "").trim(),
      fecha: new Date().toISOString()
    };

    this.militantesRoster[sectorId].unshift(newMil);
    this.saveMilitantesRoster();

    // Limpiar formulario
    inNombre.value = "";
    inCedula.value = "";
    if (inTelefono) inTelefono.value = "";
    if (inManzana) inManzana.value = "";

    this.renderMilitantesList();
    this.render();
  }

  deleteMilitante(sectorId, militanteId) {
    if (!this.militantesRoster[sectorId]) return;
    this.militantesRoster[sectorId] = this.militantesRoster[sectorId].filter(m => m.id !== militanteId);
    this.saveMilitantesRoster();
    this.renderMilitantesList();
    this.render();
  }

  // EXPORTADOR OFICIAL A EXCEL / CSV
  exportCSVReport() {
    const sectors = this.getAllSectorsList();
    if (sectors.length === 0) {
      alert("No hay sectores para exportar con los filtros seleccionados.");
      return;
    }

    const headers = [
      "Municipio",
      "Parroquia",
      "Eje Comunal / Sub-Parroquia",
      "Sector Comunal",
      "Militantes Registrados",
      "Casas Contactadas",
      "Familias",
      "Líder de Comunidad",
      "Teléfono WhatsApp",
      "Estatus Cobertura"
    ];

    const rows = sectors.map(s => {
      const estatus = s.militantes >= 500 ? "Fuerte" : (s.militantes >= 150 ? "Medio" : "Prioritario");
      return [
        `"${s.munId}"`,
        `"${s.parroquiaNombre}"`,
        `"${s.subParroquiaNombre}"`,
        `"${s.nombre}"`,
        s.militantes,
        s.casas,
        s.familias,
        `"${s.lider}"`,
        `"${s.telefono}"`,
        `"${estatus}"`
      ];
    });

    // UTF-8 BOM para apertura perfecta en Excel
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const pName = this.selectedParishId !== "todas" ? this.selectedParishId : this.selectedMunId;
    link.href = url;
    link.download = `Reporte_Campana_Militancia_${pName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Inicialización global
document.addEventListener("DOMContentLoaded", () => {
  window.campaignDashboard = new CampaignDashboardApp();
});
