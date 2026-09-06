/**
 * Dashboard de Censo y Control Territorial en Cascada • Monagas
 * Sector (Capa 5) ➔ Eje Comunal (Capa 4) ➔ Parroquia (Capa 3) ➔ Municipio (Capa 2) ➔ Estado (Capa 1)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { CATALOGO_MONAGAS } from "../../earth-monagas/js/catalogoMonagas.js?v=102";
import { SECTORES_LAPUENTE, SUBPARROQUIAS_GODOS } from "../../earth-monagas/js/geoMonagas.js?v=102";
import { DEFAULT_SAN_SIMON_SUBPARROQUIAS, DEFAULT_COROZO_SUBPARROQUIAS } from "../../earth-monagas/js/earthStore.js?v=102";
import { MONAGAS_DEMO_DATA } from "../../demo-estadisticas/js/demoData.js?v=102";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCK8DBZWsVflfMoA_z-9XupX0BvLE4iJjc",
  authDomain: "gato-3e238.firebaseapp.com",
  projectId: "gato-3e238",
  storageBucket: "gato-3e238.firebasestorage.app",
  messagingSenderId: "630890915824",
  appId: "1:630890915824:web:bc0deb7f80c4494b78df35",
  measurementId: "G-G1617P2MM0"
};

export class TerritorialDashboardApp {
  constructor() {
    this.db = null;
    this.territorios = {};
    this.selectedMunId = "todos";
    this.selectedParishId = "todas";
    this.searchQuery = "";
    this.expandedParishes = new Set(["alto-de-los-godos", "san-simon", "punta-de-mata"]);
    this.expandedSubparroquias = new Set(["sub-godos-lapuente", "sub-ss-casco"]);
    this.unsubscribeFirestore = null;

    this.isDemoMode = true; // Activo por defecto para que las tablas tengan 350+ sectores precargados
    this.demoTerritorios = this.buildDemoTerritoriosMap();
    this.nf = new Intl.NumberFormat("es-VE");
    this.electoralChartInstance = null;
    this.coverageChartInstance = null;

    this.initFirebase();
    this.bindEvents();
    this.render();
  }

  initFirebase() {
    try {
      const app = initializeApp(FIREBASE_CONFIG, "TERRITORIAL_DASHBOARD_APP");
      this.db = getFirestore(app);
      try { enableIndexedDbPersistence(this.db).catch(() => {}); } catch(e) {}

      this.updateCloudStatus(true, "Conectado");

      const colRef = collection(this.db, "territorios_monagas");
      this.unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
        const cloudData = {};
        snapshot.forEach(docSnap => {
          let data = docSnap.data();
          if (data && data.dataJson && typeof data.dataJson === "string") {
            try {
              const parsed = JSON.parse(data.dataJson);
              data = { ...data, ...parsed };
            } catch(e) {}
          }
          cloudData[docSnap.id] = data;
        });
        this.territorios = cloudData;
        this.render();
        this.updateCloudStatus(true, "En Vivo");
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
    this.updateCloudStatus(false, "Modo Local");
    try {
      const raw = localStorage.getItem("earth_monagas_places_v8") ||
                  localStorage.getItem("earth_monagas_places_v3") ||
                  localStorage.getItem("earth_monagas_places_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.municipios) {
          const map = {};
          Object.entries(parsed.municipios).forEach(([mId, mun]) => {
            Object.entries(mun.parroquias || {}).forEach(([pId, p]) => {
              map[`${mId}_${pId}`] = { ...p, munId: mId, parishId: pId };
            });
          });
          this.territorios = map;
        }
      }
    } catch(e) {
      console.warn("Error leyendo localStorage:", e);
    }
    this.render();
  }

  updateCloudStatus(online, text) {
    const dot = document.getElementById("cloud-status-dot");
    const label = document.getElementById("cloud-status-text");
    if (dot) {
      dot.className = online 
        ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" 
        : "w-2 h-2 rounded-full bg-amber-400";
    }
    if (label) label.textContent = text;
  }

  bindEvents() {
    const selectMun = document.getElementById("filter-municipio");
    if (selectMun) {
      selectMun.addEventListener("change", (e) => {
        this.selectedMunId = e.target.value;
        this.selectedParishId = "todas";
        this.render();
      });
    }

    const inputSearch = document.getElementById("filter-search");
    if (inputSearch) {
      inputSearch.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    const btnExport = document.getElementById("btn-export-csv");
    if (btnExport) {
      btnExport.addEventListener("click", () => this.exportCSV());
    }

    const btnToggleDemo = document.getElementById("btn-toggle-demo-mode");
    if (btnToggleDemo) {
      btnToggleDemo.addEventListener("click", () => {
        this.isDemoMode = !this.isDemoMode;
        const lbl = document.getElementById("label-demo-mode");
        const banner = document.getElementById("banner-demo-notice");
        if (lbl) lbl.textContent = this.isDemoMode ? "Modo Demo Activo" : "Modo En Vivo (Firebase)";
        if (banner) banner.style.display = this.isDemoMode ? "flex" : "none";
        btnToggleDemo.className = this.isDemoMode 
          ? "px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          : "px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer";
        this.render();
      });
    }
  }

  buildDemoTerritoriosMap() {
    const map = {};
    if (!MONAGAS_DEMO_DATA || !MONAGAS_DEMO_DATA.municipios) return map;
    
    MONAGAS_DEMO_DATA.municipios.forEach(m => {
      m.parroquias.forEach(p => {
        const docKey = `${m.id}_${p.id}`;
        const subparroquias = p.subparroquias.map(sp => ({
          id: sp.id,
          nombre: sp.nombre,
          casas: sp.sectores.reduce((sum, s) => sum + s.casas, 0),
          militantes: sp.sectores.reduce((sum, s) => sum + s.votantes, 0)
        }));
        const poligonos = [];
        p.subparroquias.forEach(sp => {
          sp.sectores.forEach(s => {
            poligonos.push({
              id: s.id,
              nombre: s.nombre,
              subParroquiaId: sp.id,
              casas: s.casas,
              familias: s.familias,
              habitantes: s.habitantes,
              militantes: s.votantes,
              votantes: s.votantes,
              centroVotacion: s.centroVotacion,
              cobertura: s.cobertura,
              colorRelleno: s.colorRelleno || "#f59e0b"
            });
          });
        });
        map[docKey] = { subparroquias, poligonos };
      });
    });
    return map;
  }

  updateParishPills() {
    const container = document.getElementById("parish-pills-container");
    if (!container) return;

    let parishes = [];
    if (this.selectedMunId === "todos") {
      CATALOGO_MONAGAS.forEach(m => {
        m.parroquias.forEach(p => parishes.push({ ...p, munId: m.id, munNombre: m.nombre }));
      });
    } else {
      const mObj = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
      if (mObj) {
        parishes = mObj.parroquias.map(p => ({ ...p, munId: mObj.id, munNombre: mObj.nombre }));
      }
    }

    let html = `
      <button type="button" data-parish="todas" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${this.selectedParishId === 'todas' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
        <i data-lucide="layers" class="w-3.5 h-3.5"></i>
        <span>Todas (${parishes.length})</span>
      </button>
    `;

    parishes.forEach(p => {
      const isSel = this.selectedParishId === p.id;
      html += `
        <button type="button" data-parish="${p.id}" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${isSel ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
          <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
          <span>${p.nombre}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll("button[data-parish]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedParishId = btn.dataset.parish;
        this.render();
      });
    });
  }

  // Calcula la suma en cascada para todo el catálogo
  buildCascadeModel() {
    const q = this.searchQuery;
    const model = [];

    CATALOGO_MONAGAS.forEach(mun => {
      if (this.selectedMunId !== "todos" && mun.id !== this.selectedMunId) return;

      const munNode = {
        id: mun.id,
        nombre: mun.nombre,
        parroquias: [],
        totCasas: 0,
        totFam: 0,
        totHab: 0,
        totVot: 0,
        totSectores: 0,
        totEjes: 0
      };

      mun.parroquias.forEach(p => {
        if (this.selectedParishId !== "todas" && p.id !== this.selectedParishId) return;

        const docKey = `${mun.id}_${p.id}`;
        let tData = this.territorios[docKey] || {};

        // Si estamos en modo demo o no hay datos guardados en la nube, usamos la maqueta demo completa
        if (this.isDemoMode || !tData.poligonos || tData.poligonos.length === 0) {
          if (this.demoTerritorios[docKey]) {
            tData = this.demoTerritorios[docKey];
          }
        }

        // Precarga de datos predeterminados si sigue vacío
        let subparroquias = tData.subparroquias || [];
        let poligonos = tData.poligonos || [];

        if (subparroquias.length === 0) {
          if (mun.id === "maturin" && p.id === "alto-de-los-godos") subparroquias = SUBPARROQUIAS_GODOS || [];
          if (mun.id === "maturin" && p.id === "san-simon") subparroquias = DEFAULT_SAN_SIMON_SUBPARROQUIAS || [];
          if (mun.id === "maturin" && p.id === "el-corozo") subparroquias = DEFAULT_COROZO_SUBPARROQUIAS || [];
        }
        if (poligonos.length === 0) {
          if (mun.id === "maturin" && p.id === "alto-de-los-godos") poligonos = SECTORES_LAPUENTE || [];
        }

        const parishNode = {
          id: p.id,
          nombre: p.nombre,
          munId: mun.id,
          munNombre: mun.nombre,
          ejes: [],
          totCasas: 0,
          totFam: 0,
          totHab: 0,
          totVot: 0,
          totSectores: 0
        };

        // Si no hay ejes creados, colocar un eje general para agrupar
        let ejesList = subparroquias.length > 0 
          ? subparroquias 
          : [{ id: `eje-gen-${p.id}`, nombre: `Eje Central • ${p.nombre}`, casas: 0, militantes: 0 }];

        ejesList.forEach(sp => {
          const secInSp = poligonos.filter(sec => String(sec.subParroquiaId) === String(sp.id));
          
          let ejeCasas = 0, ejeFam = 0, ejeHab = 0, ejeVot = 0;
          
          secInSp.forEach(s => {
            ejeCasas += parseInt(s.casas || 0) || 0;
            ejeFam += parseInt(s.familias || s.casas || 0) || 0;
            ejeHab += parseInt(s.habitantes || s.militantes || 0) || 0;
            ejeVot += parseInt(s.militantes !== undefined ? s.militantes : (s.habitantes || 0)) || 0;
          });

          // Fallback a los datos del propio eje si no tiene sectores desglosados
          if (secInSp.length === 0) {
            ejeCasas = parseInt(sp.casas || 0) || 0;
            ejeFam = parseInt(sp.familias || sp.casas || 0) || 0;
            ejeHab = parseInt(sp.habitantes || sp.militantes || 0) || 0;
            ejeVot += parseInt(sp.militantes !== undefined ? sp.militantes : (sp.habitantes || 0)) || 0;
          }

          // Filtro de búsqueda por texto
          const matchQ = !q || 
            sp.nombre.toLowerCase().includes(q) || 
            secInSp.some(s => s.nombre.toLowerCase().includes(q)) ||
            p.nombre.toLowerCase().includes(q);

          if (matchQ) {
            parishNode.ejes.push({
              id: sp.id,
              nombre: sp.nombre,
              casas: ejeCasas,
              familias: ejeFam,
              habitantes: ejeHab,
              votantes: ejeVot,
              sectores: secInSp
            });

            parishNode.totCasas += ejeCasas;
            parishNode.totFam += ejeFam;
            parishNode.totHab += ejeHab;
            parishNode.totVot += ejeVot;
            parishNode.totSectores += secInSp.length;
          }
        });

        // Sumar sectores sin eje si existen
        const orphanSecs = poligonos.filter(sec => !sec.subParroquiaId || !subparroquias.some(sp => String(sp.id) === String(sec.subParroquiaId)));
        if (orphanSecs.length > 0) {
          let orphCasas = 0, orphFam = 0, orphHab = 0, orphVot = 0;
          orphanSecs.forEach(s => {
            orphCasas += parseInt(s.casas || 0) || 0;
            orphFam += parseInt(s.familias || s.casas || 0) || 0;
            orphHab += parseInt(s.habitantes || s.militantes || 0) || 0;
            orphVot += parseInt(s.militantes !== undefined ? s.militantes : (s.habitantes || 0)) || 0;
          });
          parishNode.ejes.push({
            id: `eje-otros-${p.id}`,
            nombre: "Otros Sectores Comunales",
            casas: orphCasas,
            familias: orphFam,
            habitantes: orphHab,
            votantes: orphVot,
            sectores: orphanSecs
          });
          parishNode.totCasas += orphCasas;
          parishNode.totFam += orphFam;
          parishNode.totHab += orphHab;
          parishNode.totVot += orphVot;
          parishNode.totSectores += orphanSecs.length;
        }

        if (parishNode.ejes.length > 0) {
          munNode.parroquias.push(parishNode);
          munNode.totCasas += parishNode.totCasas;
          munNode.totFam += parishNode.totFam;
          munNode.totHab += parishNode.totHab;
          munNode.totVot += parishNode.totVot;
          munNode.totSectores += parishNode.totSectores;
          munNode.totEjes += parishNode.ejes.length;
        }
      });

      if (munNode.parroquias.length > 0) {
        model.push(munNode);
      }
    });

    return model;
  }

  render() {
    this.updateParishPills();
    const cascadeModel = this.buildCascadeModel();

    // 1. Totales Macro
    let grandCasas = 0, grandFam = 0, grandHab = 0, grandVot = 0, grandSectores = 0, grandEjes = 0, grandParroquias = 0;

    cascadeModel.forEach(mun => {
      grandCasas += mun.totCasas;
      grandFam += mun.totFam;
      grandHab += mun.totHab;
      grandVot += mun.totVot;
      grandSectores += mun.totSectores;
      grandEjes += mun.totEjes;
      grandParroquias += mun.parroquias.length;
    });

    const elCasas = document.getElementById("kpi-total-casas");
    const elFam = document.getElementById("kpi-total-familias");
    const elHab = document.getElementById("kpi-total-habitantes");
    const elVot = document.getElementById("kpi-total-votantes");
    const elSec = document.getElementById("kpi-total-sectores");
    const elEjes = document.getElementById("kpi-total-ejes");
    const elBadge = document.getElementById("cascade-summary-badge");

    if (elCasas) elCasas.textContent = this.nf.format(grandCasas);
    if (elFam) elFam.textContent = this.nf.format(grandFam);
    if (elHab) elHab.textContent = this.nf.format(grandHab);
    if (elVot) elVot.textContent = this.nf.format(grandVot);
    if (elSec) elSec.textContent = this.nf.format(grandSectores);
    if (elEjes) elEjes.textContent = `${grandEjes} Ejes Comunales`;
    if (elBadge) elBadge.textContent = `${grandParroquias} Parroquias en Vista`;

    // 2. Renderizar Centro de Decisión (Gráficos de Torta y Cockpit)
    this.renderDecisionCenter(cascadeModel);

    // 3. Renderizar Árbol en Cascada
    this.renderCascadeTree(cascadeModel);

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  renderDecisionCenter(cascadeModel) {
    const allSectors = [];
    cascadeModel.forEach(mun => {
      mun.parroquias.forEach(p => {
        p.ejes.forEach(e => {
          e.sectores.forEach(s => {
            allSectors.push({
              ...s,
              munNombre: mun.nombre,
              parishNombre: p.nombre,
              subParroquiaNombre: e.nombre,
              votantes: s.militantes !== undefined ? s.militantes : (s.votantes || s.habitantes || 0)
            });
          });
        });
      });
    });

    const totVotantes = cascadeModel.reduce((sum, m) => sum + m.totVot, 0);
    const totCasas = cascadeModel.reduce((sum, m) => sum + m.totCasas, 0);
    const totFam = cascadeModel.reduce((sum, m) => sum + m.totFam, 0);
    const totSectores = cascadeModel.reduce((sum, m) => sum + m.totSectores, 0);
    const uniqueCentros = new Set(allSectors.map(s => s.centroVotacion).filter(Boolean)).size || 1;

    // 1. Métricas de Decisión
    this.renderDecisionCockpit(cascadeModel, allSectors, totVotantes, totCasas, totFam, totSectores, uniqueCentros);

    // 2. Gráficos de Torta
    this.renderElectoralShareChart(cascadeModel, allSectors, totVotantes);
    this.renderCoverageTrafficChart(allSectors, totSectores);
  }

  renderDecisionCockpit(cascadeModel, allSectors, totVot, totCasas, totFam, totSec, uniqueCentros) {
    let items = [];
    if (this.selectedMunId === "todos") {
      items = [...cascadeModel].sort((a, b) => b.totVot - a.totVot).map(m => ({ nombre: m.nombre, votantes: m.totVot }));
    } else if (this.selectedParishId === "todas" && cascadeModel.length > 0) {
      items = [...cascadeModel[0].parroquias].sort((a, b) => b.totVot - a.totVot).map(p => ({ nombre: p.nombre, votantes: p.totVot }));
    } else if (cascadeModel.length > 0 && cascadeModel[0].parroquias.length > 0) {
      items = [...cascadeModel[0].parroquias[0].ejes].sort((a, b) => b.votantes - a.votantes).map(e => ({ nombre: e.nombre, votantes: e.votantes }));
    }

    const top3 = items.slice(0, 3);
    const top3Votantes = top3.reduce((sum, it) => sum + it.votantes, 0);
    const paretoPct = totVot > 0 ? ((top3Votantes / totVot) * 100).toFixed(1) : "0.0";
    const elParetoPct = document.getElementById("decision-pareto-pct");
    const elParetoDesc = document.getElementById("decision-pareto-desc");
    if (elParetoPct) elParetoPct.textContent = `${paretoPct}%`;
    if (elParetoDesc) {
      const names = top3.map(it => it.nombre).join(", ");
      elParetoDesc.innerHTML = `Concentrado en <strong class="text-amber-300 font-bold">${names || "territorios líderes"}</strong>. Focalizar la movilización aquí asegura la meta.`;
    }

    const critSectors = allSectors.filter(s => (s.cobertura || 0) < 50);
    const critCount = critSectors.length;
    const critPct = totSec > 0 ? ((critCount / totSec) * 100).toFixed(1) : "0.0";
    const elRiskCount = document.getElementById("decision-risk-count");
    const elRiskDesc = document.getElementById("decision-risk-desc");
    if (elRiskCount) elRiskCount.textContent = critCount;
    if (elRiskDesc) {
      elRiskDesc.innerHTML = `<strong class="text-rose-300 font-bold">${critPct}%</strong> del territorio (${critCount} sectores) con censo &lt;50%. Desplegar brigadas.`;
    }

    const famCasa = totCasas > 0 ? (totFam / totCasas).toFixed(2) : "1.00";
    const deficitPct = Math.max(0, Math.round((parseFloat(famCasa) - 1.0) * 100));
    const elCohabit = document.getElementById("decision-cohabit-ratio");
    const elCohabitDesc = document.getElementById("decision-cohabit-desc");
    if (elCohabit) elCohabit.textContent = famCasa;
    if (elCohabitDesc) {
      elCohabitDesc.innerHTML = `Déficit de <strong class="text-sky-300 font-bold">${deficitPct}%</strong> en viviendas (cohabitación familiar múltiple detectada).`;
    }

    const schoolLoad = uniqueCentros > 0 ? Math.round(totVot / uniqueCentros) : 0;
    const elSchoolLoad = document.getElementById("decision-school-load");
    const elSchoolDesc = document.getElementById("decision-school-desc");
    if (elSchoolLoad) elSchoolLoad.textContent = this.nf.format(schoolLoad);
    if (elSchoolDesc) {
      elSchoolDesc.innerHTML = `Promedio de <strong class="text-purple-300 font-bold">${this.nf.format(schoolLoad)}</strong> electores por escuela para dimensionar testigos y transporte.`;
    }
  }

  renderSVGDoughnutFallback(canvas, labels, data, colors, centerTitle, centerValue) {
    canvas.style.display = "none";
    let container = canvas.parentElement.querySelector(".svg-doughnut-fallback");
    if (!container) {
      container = document.createElement("div");
      container.className = "svg-doughnut-fallback flex flex-col items-center justify-center w-full py-2";
      canvas.parentElement.appendChild(container);
    }

    const total = data.reduce((a, b) => a + b, 0) || 1;
    const circumference = 2 * Math.PI * 40;
    let offset = 0;

    const circles = data.map((val, idx) => {
      const pct = val / total;
      const dashArray = `${pct * circumference} ${circumference}`;
      const circleSvg = `<circle cx="50" cy="50" r="40" fill="transparent" stroke="${colors[idx % colors.length]}" stroke-width="15" stroke-dasharray="${dashArray}" stroke-dashoffset="${-offset}" transform="rotate(-90 50 50)"></circle>`;
      offset += pct * circumference;
      return circleSvg;
    }).join("");

    const topLabel = centerTitle || labels[0] || "";
    const topPct = centerValue || ((data[0] / total) * 100).toFixed(0) + "%";

    container.innerHTML = `
      <div class="relative w-44 h-44">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" stroke-width="15"></circle>
          ${circles}
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span class="text-[10px] text-slate-400 font-mono">LÍDER</span>
          <span class="text-xs font-black text-amber-400 truncate max-w-[90px]">${topLabel}</span>
          <span class="text-sm font-black text-white">${topPct}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2 mt-2 text-[10px] text-slate-300 font-mono">
        ${labels.slice(0, 5).map((l, i) => `
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full" style="background-color:${colors[i % colors.length]}"></span>
            ${l} (${((data[i]/total)*100).toFixed(0)}%)
          </span>
        `).join("")}
      </div>
    `;
  }

  renderElectoralShareChart(cascadeModel, allSectors, totVot) {
    const canvas = document.getElementById("chart-electoral-share");
    if (!canvas) return;

    let items = [];
    let subtitleText = "13 Municipios";

    if (this.selectedMunId === "todos") {
      subtitleText = "13 Municipios del Estado";
      items = [...cascadeModel].sort((a, b) => b.totVot - a.totVot).map(m => ({
        label: m.nombre,
        value: m.totVot
      }));
    } else if (this.selectedParishId === "todas" && cascadeModel.length > 0) {
      subtitleText = `Parroquias de ${cascadeModel[0].nombre}`;
      items = [...cascadeModel[0].parroquias].sort((a, b) => b.totVot - a.totVot).map(p => ({
        label: p.nombre,
        value: p.totVot
      }));
    } else if (cascadeModel.length > 0 && cascadeModel[0].parroquias.length > 0) {
      subtitleText = "Ejes Comunales";
      items = [...cascadeModel[0].parroquias[0].ejes].sort((a, b) => b.votantes - a.votantes).map(e => ({
        label: e.nombre,
        value: e.votantes
      }));
    }

    const subEl = document.getElementById("chart-electoral-subtitle");
    if (subEl) subEl.textContent = subtitleText;

    const colors = [
      "#f59e0b", "#38bdf8", "#34d399", "#a855f7", "#f43f5e",
      "#fbbf24", "#818cf8", "#2dd4bf", "#fb923c", "#e879f9",
      "#4ade80", "#60a5fa", "#94a3b8"
    ];

    const labels = items.map(it => it.label);
    const data = items.map(it => it.value);

    if (typeof Chart === "undefined") {
      this.renderSVGDoughnutFallback(canvas, labels, data, colors, labels[0], null);
    } else {
      if (this.electoralChartInstance) {
        this.electoralChartInstance.destroy();
        this.electoralChartInstance = null;
      }
      canvas.style.display = "block";
      const svgOld = canvas.parentElement.querySelector(".svg-doughnut-fallback");
      if (svgOld) svgOld.remove();

      const ctx = canvas.getContext("2d");
      this.electoralChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: "#060913",
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: {
              position: window.innerWidth < 640 ? "bottom" : "right",
              labels: {
                color: "#cbd5e1",
                boxWidth: 10,
                font: { family: "Inter", size: 10 }
              }
            },
            tooltip: {
              backgroundColor: "#0f172a",
              titleColor: "#f59e0b",
              bodyColor: "#f8fafc",
              borderColor: "rgba(245, 158, 11, 0.4)",
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: (context) => {
                  const val = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                  return ` ${context.label}: ${this.nf.format(val)} votantes (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    const summaryEl = document.getElementById("chart-electoral-summary");
    if (summaryEl && items.length > 0) {
      const topItem = items[0];
      const topPct = totVot > 0 ? ((topItem.value / totVot) * 100).toFixed(1) : 0;
      summaryEl.innerHTML = `
        <span class="truncate">Líder: <strong class="text-amber-400 font-bold">${topItem.label}</strong> (${this.nf.format(topItem.value)} • ${topPct}%)</span>
        <span class="shrink-0 text-slate-400">Total: <strong class="text-white">${this.nf.format(totVot)}</strong></span>
      `;
    }
  }

  renderCoverageTrafficChart(allSectors, totSec) {
    const canvas = document.getElementById("chart-coverage-traffic");
    if (!canvas) return;

    const high = allSectors.filter(s => (s.cobertura || 0) >= 80);
    const mid = allSectors.filter(s => (s.cobertura || 0) >= 50 && (s.cobertura || 0) < 80);
    const low = allSectors.filter(s => (s.cobertura || 0) < 50);

    const data = [high.length, mid.length, low.length];
    const labels = ["Alta (≥80%)", "Media (50-79%)", "Crítica (<50%)"];
    const colors = ["#10b981", "#f59e0b", "#ef4444"];

    if (typeof Chart === "undefined") {
      this.renderSVGDoughnutFallback(canvas, labels, data, colors, "ÓPTIMO", totSec > 0 ? ((high.length/totSec)*100).toFixed(0) + "%" : "0%");
    } else {
      if (this.coverageChartInstance) {
        this.coverageChartInstance.destroy();
        this.coverageChartInstance = null;
      }
      canvas.style.display = "block";
      const svgOld = canvas.parentElement.querySelector(".svg-doughnut-fallback");
      if (svgOld) svgOld.remove();

      const ctx = canvas.getContext("2d");
      this.coverageChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderColor: "#060913",
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#cbd5e1",
                boxWidth: 12,
                font: { family: "Inter", size: 11 }
              }
            },
            tooltip: {
              backgroundColor: "#0f172a",
              titleColor: "#34d399",
              bodyColor: "#f8fafc",
              borderColor: "rgba(52, 211, 153, 0.4)",
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: (context) => {
                  const val = context.parsed;
                  const pct = totSec > 0 ? ((val / totSec) * 100).toFixed(1) : 0;
                  return ` ${context.label}: ${val} sectores (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    const summaryEl = document.getElementById("chart-coverage-summary");
    if (summaryEl) {
      const highPct = totSec > 0 ? ((high.length / totSec) * 100).toFixed(0) : 0;
      const midPct = totSec > 0 ? ((mid.length / totSec) * 100).toFixed(0) : 0;
      const lowPct = totSec > 0 ? ((low.length / totSec) * 100).toFixed(0) : 0;

      summaryEl.innerHTML = `
        <div class="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <span class="block text-[10px] text-slate-400">🟢 Óptimo</span>
          <strong class="text-sm font-black">${high.length}</strong> <span class="text-[10px] text-slate-400">(${highPct}%)</span>
        </div>
        <div class="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
          <span class="block text-[10px] text-slate-400">🟡 En Progreso</span>
          <strong class="text-sm font-black">${mid.length}</strong> <span class="text-[10px] text-slate-400">(${midPct}%)</span>
        </div>
        <div class="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
          <span class="block text-[10px] text-slate-400">🔴 Crítico</span>
          <strong class="text-sm font-black">${low.length}</strong> <span class="text-[10px] text-slate-400">(${lowPct}%)</span>
        </div>
      `;
    }
  }

  renderCascadeTree(cascadeModel) {
    const container = document.getElementById("cascade-container");
    if (!container) return;

    if (cascadeModel.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-slate-500 bg-slate-950/60 rounded-3xl border border-slate-800">
          <i data-lucide="map-pin-off" class="w-8 h-8 mx-auto mb-2 text-slate-600"></i>
          <p class="font-bold text-sm text-slate-400">No se encontraron sectores ni ejes con el filtro actual.</p>
        </div>
      `;
      return;
    }

    let html = "";

    cascadeModel.forEach(mun => {
      mun.parroquias.forEach(p => {
        const isParishExpanded = this.expandedParishes.has(p.id);

        html += `
          <div class="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg transition">
            
            <!-- CABECERA DE PARROQUIA (NIVEL 3) -->
            <div class="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/60 transition cursor-pointer" onclick="window.dashboardApp.toggleParish('${p.id}')">
              <div class="flex items-center gap-3 min-w-0">
                <button type="button" class="text-sky-400 hover:text-white text-xs font-mono font-bold p-1 shrink-0">
                  ${isParishExpanded ? '▼' : '▶'}
                </button>
                <div class="truncate">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono font-bold uppercase text-sky-400">Municipio ${p.munNombre}</span>
                    <span class="text-[9px] font-mono bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800/50">Capa 3</span>
                  </div>
                  <h3 class="text-base sm:text-lg font-black text-white mt-0.5 truncate">${p.nombre}</h3>
                </div>
              </div>

              <!-- Cifras Sumadas de la Parroquia -->
              <div class="grid grid-cols-4 gap-2 text-xs font-mono shrink-0">
                <div class="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span class="text-[9px] text-slate-400 block uppercase">Casas</span>
                  <strong class="text-amber-400 font-black">${p.totCasas.toLocaleString()}</strong>
                </div>
                <div class="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span class="text-[9px] text-slate-400 block uppercase">Familias</span>
                  <strong class="text-sky-300 font-black">${p.totFam.toLocaleString()}</strong>
                </div>
                <div class="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span class="text-[9px] text-slate-400 block uppercase">Habitantes</span>
                  <strong class="text-emerald-400 font-black">${p.totHab.toLocaleString()}</strong>
                </div>
                <div class="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-purple-900/50 text-center">
                  <span class="text-[9px] text-purple-300 block uppercase font-bold">Votantes</span>
                  <strong class="text-purple-300 font-black">${p.totVot.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <!-- CONTENIDO DESPLEGADO DE LA PARROQUIA: SUB-PARROQUIAS / EJES (NIVEL 4) -->
            ${isParishExpanded ? `
              <div class="px-3 sm:px-5 pb-4 pt-1 space-y-3 border-t border-slate-800/80 bg-slate-950/40">
                ${p.ejes.map(eje => {
                  const isEjeExpanded = this.expandedSubparroquias.has(eje.id);

                  return `
                    <div class="bg-slate-900/90 border border-purple-900/40 rounded-2xl overflow-hidden shadow-sm">
                      
                      <!-- Cabecera del Eje Comunal -->
                      <div class="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-purple-950/30 transition cursor-pointer" onclick="window.dashboardApp.toggleSubparroquia('${eje.id}')">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <button type="button" class="text-purple-400 hover:text-white text-xs font-mono font-bold p-0.5 shrink-0">
                            ${isEjeExpanded ? '▼' : '▶'}
                          </button>
                          <span class="text-base select-none shrink-0">${isEjeExpanded ? '📂' : '📁'}</span>
                          <div class="truncate">
                            <div class="flex items-center gap-1.5">
                              <span class="text-[9px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/60 font-bold">Nivel 4</span>
                              <span class="text-xs font-black text-white truncate">${eje.nombre}</span>
                            </div>
                            <span class="text-[10px] text-slate-400 font-mono">${eje.sectores.length} sectores comunales</span>
                          </div>
                        </div>

                        <!-- Cifras Sumadas del Eje -->
                        <div class="flex items-center gap-2 text-xs font-mono shrink-0">
                          <span class="text-amber-400 font-bold text-[11px]">🏠 ${eje.casas}</span>
                          <span class="text-slate-500">•</span>
                          <span class="text-sky-300 text-[11px]">👨‍👩‍👧 ${eje.familias}</span>
                          <span class="text-slate-500">•</span>
                          <span class="text-emerald-400 font-bold text-[11px]">👥 ${eje.habitantes}</span>
                          <span class="text-slate-500">•</span>
                          <span class="text-purple-300 font-black text-[11px] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">🗳️ ${eje.votantes}</span>
                        </div>
                      </div>

                      <!-- TABLA DE SECTORES (NIVEL 5) -->
                      ${isEjeExpanded ? `
                        <div class="px-3 pb-3 pt-1 border-t border-purple-950/80 overflow-x-auto">
                          ${eje.sectores.length === 0 ? `
                            <p class="text-xs text-slate-500 italic py-2 text-center">
                              No hay sectores trazados aún dentro de este eje.
                            </p>
                          ` : `
                            <table class="w-full text-left border-collapse text-xs font-mono">
                              <thead>
                                <tr class="text-[10px] uppercase text-slate-400 border-b border-slate-800/80">
                                  <th class="py-2 px-2">Sector Comunal (Capa 5)</th>
                                  <th class="py-2 px-2 text-right">Casas</th>
                                  <th class="py-2 px-2 text-right">Familias</th>
                                  <th class="py-2 px-2 text-right">Habitantes</th>
                                  <th class="py-2 px-2 text-right">Votantes</th>
                                  <th class="py-2 px-2">Centro de Votación CNE</th>
                                </tr>
                              </thead>
                              <tbody class="divide-y divide-slate-800/40">
                                ${eje.sectores.map(sec => `
                                  <tr class="hover:bg-slate-800/40 transition">
                                    <td class="py-2 px-2 font-bold text-slate-200 flex items-center gap-1.5">
                                      <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background-color: ${sec.colorRelleno || '#38bdf8'}"></span>
                                      <span class="truncate">${sec.nombre}</span>
                                    </td>
                                    <td class="py-2 px-2 text-right text-amber-400 font-bold">${sec.casas || 0}</td>
                                    <td class="py-2 px-2 text-right text-sky-300">${sec.familias || sec.casas || 0}</td>
                                    <td class="py-2 px-2 text-right text-emerald-400 font-bold">${sec.habitantes || sec.militantes || 0}</td>
                                    <td class="py-2 px-2 text-right text-purple-300 font-black">${sec.militantes !== undefined ? sec.militantes : (sec.habitantes || 0)}</td>
                                    <td class="py-2 px-2 text-slate-400 truncate max-w-[200px]" title="${sec.centroVotacion || ''}">
                                      ${sec.centroVotacion ? `🏫 ${sec.centroVotacion}` : '<span class="text-slate-600">Sin asignar</span>'}
                                    </td>
                                  </tr>
                                `).join("")}
                              </tbody>
                            </table>
                          `}
                        </div>
                      ` : ''}

                    </div>
                  `;
                }).join("")}
              </div>
            ` : ''}

          </div>
        `;
      });
    });

    container.innerHTML = html;
  }

  toggleParish(parishId) {
    if (this.expandedParishes.has(parishId)) {
      this.expandedParishes.delete(parishId);
    } else {
      this.expandedParishes.add(parishId);
    }
    this.render();
  }

  toggleSubparroquia(subparroquiaId) {
    if (this.expandedSubparroquias.has(subparroquiaId)) {
      this.expandedSubparroquias.delete(subparroquiaId);
    } else {
      this.expandedSubparroquias.add(subparroquiaId);
    }
    this.render();
  }

  exportCSV() {
    const cascadeModel = this.buildCascadeModel();
    let csv = "\uFEFF"; // UTF-8 BOM para Excel
    csv += "Municipio,Parroquia,Eje Comunal,Sector,Casas,Familias,Habitantes,Votantes,Centro de Votacion\n";

    cascadeModel.forEach(mun => {
      mun.parroquias.forEach(p => {
        p.ejes.forEach(eje => {
          if (eje.sectores.length === 0) {
            csv += `\"${mun.nombre}\",\"${p.nombre}\",\"${eje.nombre}\",\"(Sin sectores)\",${eje.casas},${eje.familias},${eje.habitantes},${eje.votantes},\"\"\n`;
          } else {
            eje.sectores.forEach(sec => {
              const vot = sec.militantes !== undefined ? sec.militantes : (sec.habitantes || 0);
              csv += `\"${mun.nombre}\",\"${p.nombre}\",\"${eje.nombre}\",\"${sec.nombre || ''}\",${sec.casas || 0},${sec.familias || sec.casas || 0},${sec.habitantes || vot || 0},${vot || 0},\"${sec.centroVotacion || ''}\"\n`;
            });
          }
        });
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `censo_territorial_monagas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Inicialización global indestructible (funciona incluso si DOMContentLoaded ya ocurrió)
function bootTerritorialDashboardApp() {
  if (!window.dashboardApp) {
    try {
      window.dashboardApp = new TerritorialDashboardApp();
      console.log("MIGATO TerritorialDashboardApp inicializada correctamente.");
    } catch (err) {
      console.error("Error inicializando TerritorialDashboardApp:", err);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootTerritorialDashboardApp);
} else {
  bootTerritorialDashboardApp();
}

// Respaldo para cuando Chart.js termine de cargar desde CDN
window.addEventListener("load", () => {
  if (window.dashboardApp && typeof Chart !== "undefined") {
    const cascadeModel = window.dashboardApp.buildCascadeModel();
    window.dashboardApp.renderDecisionCenter(cascadeModel);
  }
});
