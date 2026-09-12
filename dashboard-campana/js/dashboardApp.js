/**
 * MÓDULO 2 • Dashboard de Censo y Control Territorial • Monagas
 * Sector (Capa 5) ➔ Eje Territorial (Capa 4) ➔ Parroquia (Capa 3) ➔ Municipio (Capa 2) ➔ Estado (Capa 1)
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
    this.selectedMunId = "maturin"; // Maturín capital por defecto para foco inmediato
    this.selectedParishId = "todas";
    this.searchQuery = "";
    this.expandedParishes = new Set(["alto-de-los-godos", "san-simon"]);
    this.expandedSubparroquias = new Set(["sub-godos-lapuente"]);
    this.unsubscribeFirestore = null;

    this.isDemoMode = false; // Modo Producción 100% Limpio (Sin datos simulados)
    this.demoTerritorios = {};
    this.nf = new Intl.NumberFormat("es-VE");
    
    // Instancias de Gráficos
    this.barsChartInstance = null;
    this.electoralChartInstance = null;
    this.politicalChartInstance = null;
    this.coverageChartInstance = null;

    // Estado de la tabla plana paginada
    this.flatPage = 1;
    this.flatPerPage = 20;
    this.currentFlatSectors = [];
    this.activeView = "flat"; // "flat" o "cascade"

    this.initFirebase();
    this.bindEvents();
    this.updateParishSelect();
    this.render();
  }

  loadNominalElectores() {
    try {
      const raw = localStorage.getItem("migato_caracterizacion_voto_v1");
      if (raw) return JSON.parse(raw) || [];
    } catch(e) {
      console.warn("Error leyendo electores de localStorage:", e);
    }
    return [];
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
        this.updateCloudStatus(true, "En Línea");
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
    // 1. Selector de Municipio
    const selectMun = document.getElementById("filter-municipio");
    if (selectMun) {
      selectMun.value = this.selectedMunId;
      selectMun.addEventListener("change", (e) => {
        this.selectedMunId = e.target.value;
        this.selectedParishId = "todas";
        this.flatPage = 1;
        this.updateParishSelect();
        this.render();
      });
    }

    // 2. Selector de Parroquia
    const selectParish = document.getElementById("filter-parroquia");
    if (selectParish) {
      selectParish.addEventListener("change", (e) => {
        this.selectedParishId = e.target.value;
        this.flatPage = 1;
        this.render();
      });
    }

    // 3. Buscador de Texto
    const inputSearch = document.getElementById("filter-search");
    if (inputSearch) {
      inputSearch.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.flatPage = 1;
        this.render();
      });
    }

    // 4. Botón Limpiar Filtros
    const btnReset = document.getElementById("btn-reset-filters");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        this.selectedMunId = "maturin";
        this.selectedParishId = "todas";
        this.searchQuery = "";
        this.flatPage = 1;
        if (selectMun) selectMun.value = "maturin";
        if (inputSearch) inputSearch.value = "";
        this.updateParishSelect();
        this.render();
      });
    }

    // 5. Botones Conmutadores de Vista: Tabla Plana vs Cascada
    const btnViewFlat = document.getElementById("btn-view-flat");
    const btnViewCascade = document.getElementById("btn-view-cascade");
    const viewFlatCont = document.getElementById("view-flat-container");
    const viewCascadeCont = document.getElementById("view-cascade-container");

    if (btnViewFlat && btnViewCascade && viewFlatCont && viewCascadeCont) {
      btnViewFlat.addEventListener("click", () => {
        this.activeView = "flat";
        btnViewFlat.className = "px-3 py-1.5 rounded-xl bg-sky-500 text-white font-black shadow-md transition flex items-center gap-1.5 cursor-pointer";
        btnViewCascade.className = "px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#18114a] transition flex items-center gap-1.5 cursor-pointer";
        viewFlatCont.classList.remove("hidden");
        viewCascadeCont.classList.add("hidden");
      });

      btnViewCascade.addEventListener("click", () => {
        this.activeView = "cascade";
        btnViewCascade.className = "px-3 py-1.5 rounded-xl bg-sky-500 text-white font-black shadow-md transition flex items-center gap-1.5 cursor-pointer";
        btnViewFlat.className = "px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#18114a] transition flex items-center gap-1.5 cursor-pointer";
        viewCascadeCont.classList.remove("hidden");
        viewFlatCont.classList.add("hidden");
      });
    }

    // 6. Paginador de Tabla Plana
    const btnPrev = document.getElementById("btn-flat-prev");
    const btnNext = document.getElementById("btn-flat-next");
    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        if (this.flatPage > 1) {
          this.flatPage--;
          this.renderFlatTableOnly();
        }
      });
    }
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        const totalPages = Math.ceil(this.currentFlatSectors.length / this.flatPerPage) || 1;
        if (this.flatPage < totalPages) {
          this.flatPage++;
          this.renderFlatTableOnly();
        }
      });
    }

    // 7. Botón Exportar CSV
    const btnExport = document.getElementById("btn-export-csv");
    if (btnExport) {
      btnExport.addEventListener("click", () => this.exportCSV());
    }
  }

  updateParishSelect() {
    const sel = document.getElementById("filter-parroquia");
    if (!sel) return;

    let parishes = [];
    if (this.selectedMunId === "todos") {
      CATALOGO_MONAGAS.forEach(m => {
        m.parroquias.forEach(p => parishes.push({ ...p, munNombre: m.nombre }));
      });
    } else {
      const mObj = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
      if (mObj) {
        parishes = mObj.parroquias.map(p => ({ ...p, munNombre: mObj.nombre }));
      }
    }

    let html = `<option value="todas" ${this.selectedParishId === 'todas' ? 'selected' : ''}>-- Todas las Parroquias (${parishes.length}) --</option>`;
    parishes.forEach(p => {
      const isSel = this.selectedParishId === p.id ? 'selected' : '';
      const label = this.selectedMunId === "todos" ? `${p.nombre} (${p.munNombre})` : p.nombre;
      html += `<option value="${p.id}" ${isSel}>${label}</option>`;
    });

    sel.innerHTML = html;
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
          militantes: sp.sectores.reduce((sum, s) => sum + s.votantes, 0),
          votoDuro: sp.sectores.reduce((sum, s) => sum + (s.votoDuro !== undefined ? s.votoDuro : Math.round((s.votantes || 0) * 0.60)), 0),
          votoBlando: sp.sectores.reduce((sum, s) => sum + (s.votoBlando !== undefined ? s.votoBlando : Math.round((s.votantes || 0) * 0.25)), 0),
          votoNuevo: sp.sectores.reduce((sum, s) => sum + (s.votoNuevo !== undefined ? s.votoNuevo : Math.max(0, (s.votantes || 0) - Math.round((s.votantes || 0) * 0.60) - Math.round((s.votantes || 0) * 0.25))), 0)
        }));
        const poligonos = [];
        p.subparroquias.forEach(sp => {
          sp.sectores.forEach(s => {
            const vTotal = s.votantes || 0;
            const vDuro = s.votoDuro !== undefined ? s.votoDuro : Math.round(vTotal * 0.60);
            const vBlando = s.votoBlando !== undefined ? s.votoBlando : Math.round(vTotal * 0.25);
            const vNuevo = s.votoNuevo !== undefined ? s.votoNuevo : Math.max(0, vTotal - vDuro - vBlando);

            poligonos.push({
              id: s.id,
              nombre: s.nombre,
              subParroquiaId: sp.id,
              casas: s.casas,
              familias: s.familias,
              habitantes: s.habitantes,
              militantes: s.votantes,
              votantes: s.votantes,
              votoDuro: vDuro,
              votoBlando: vBlando,
              votoNuevo: vNuevo,
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

  buildCascadeModel() {
    const q = this.searchQuery;
    const nominalElectores = this.loadNominalElectores();
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
        totDuro: 0,
        totBlando: 0,
        totNuevo: 0,
        totNominales: 0,
        totSectores: 0,
        totEjes: 0
      };

      mun.parroquias.forEach(p => {
        if (this.selectedParishId !== "todas" && p.id !== this.selectedParishId) return;

        const docKey = `${mun.id}_${p.id}`;
        let tData = this.territorios[docKey] || {};

        if (this.isDemoMode && this.demoTerritorios[docKey]) {
          tData = this.demoTerritorios[docKey];
        }

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
          totDuro: 0,
          totBlando: 0,
          totNuevo: 0,
          totNominales: 0,
          totSectores: 0
        };

        let ejesList = subparroquias.length > 0 
          ? subparroquias 
          : [{ id: `eje-gen-${p.id}`, nombre: `Eje Central • ${p.nombre}`, casas: 0, militantes: 0 }];

        ejesList.forEach(sp => {
          const secInSp = poligonos.filter(sec => String(sec.subParroquiaId) === String(sp.id));
          
          let ejeCasas = 0, ejeFam = 0, ejeHab = 0, ejeVot = 0;
          let ejeDuro = 0, ejeBlando = 0, ejeNuevo = 0, ejeNominales = 0;
          
          secInSp.forEach(s => {
            const secNameLower = (s.nombre || "").toLowerCase().trim();
            const secInLocal = nominalElectores.filter(e => {
              const sec = (e.sector || "").toLowerCase().trim();
              return sec && (sec === secNameLower || sec.includes(secNameLower) || secNameLower.includes(sec));
            });

            const dCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "duro").length;
            const bCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "blando").length;
            const nCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "nuevo").length;

            const sVot = parseInt(s.militantes !== undefined ? s.militantes : (s.habitantes || 0)) || 0;

            let sDuro = s.votoDuro !== undefined ? parseInt(s.votoDuro) || 0 : (dCount > 0 ? dCount : Math.round(sVot * 0.60));
            let sBlando = s.votoBlando !== undefined ? parseInt(s.votoBlando) || 0 : (bCount > 0 ? bCount : Math.round(sVot * 0.25));
            let sNuevo = s.votoNuevo !== undefined ? parseInt(s.votoNuevo) || 0 : (nCount > 0 ? nCount : Math.max(0, sVot - sDuro - sBlando));

            if (dCount > sDuro) sDuro = dCount;
            if (bCount > sBlando) sBlando = bCount;
            if (nCount > sNuevo) sNuevo = nCount;

            s.votoDuro = sDuro;
            s.votoBlando = sBlando;
            s.votoNuevo = sNuevo;
            s.electoresNominales = secInLocal.length;

            ejeCasas += parseInt(s.casas || 0) || 0;
            ejeFam += parseInt(s.familias || s.casas || 0) || 0;
            ejeHab += parseInt(s.habitantes || s.militantes || 0) || 0;
            ejeVot += sVot;
            ejeDuro += sDuro;
            ejeBlando += sBlando;
            ejeNuevo += sNuevo;
            ejeNominales += secInLocal.length;
          });

          if (secInSp.length === 0) {
            ejeCasas = parseInt(sp.casas || 0) || 0;
            ejeFam = parseInt(sp.familias || sp.casas || 0) || 0;
            ejeHab = parseInt(sp.habitantes || sp.militantes || 0) || 0;
            ejeVot = parseInt(sp.militantes !== undefined ? sp.militantes : (sp.habitantes || 0)) || 0;
            ejeDuro = sp.votoDuro !== undefined ? parseInt(sp.votoDuro) || 0 : Math.round(ejeVot * 0.60);
            ejeBlando = sp.votoBlando !== undefined ? parseInt(sp.votoBlando) || 0 : Math.round(ejeVot * 0.25);
            ejeNuevo = sp.votoNuevo !== undefined ? parseInt(sp.votoNuevo) || 0 : Math.max(0, ejeVot - ejeDuro - ejeBlando);
          }

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
              votoDuro: ejeDuro,
              votoBlando: ejeBlando,
              votoNuevo: ejeNuevo,
              electoresNominales: ejeNominales,
              sectores: secInSp
            });

            parishNode.totCasas += ejeCasas;
            parishNode.totFam += ejeFam;
            parishNode.totHab += ejeHab;
            parishNode.totVot += ejeVot;
            parishNode.totDuro += ejeDuro;
            parishNode.totBlando += ejeBlando;
            parishNode.totNuevo += ejeNuevo;
            parishNode.totNominales += ejeNominales;
            parishNode.totSectores += secInSp.length;
          }
        });

        // Sumar sectores sin eje si existen
        const orphanSecs = poligonos.filter(sec => !sec.subParroquiaId || !subparroquias.some(sp => String(sp.id) === String(sec.subParroquiaId)));
        if (orphanSecs.length > 0) {
          let orphCasas = 0, orphFam = 0, orphHab = 0, orphVot = 0;
          let orphDuro = 0, orphBlando = 0, orphNuevo = 0, orphNominales = 0;
          orphanSecs.forEach(s => {
            const secNameLower = (s.nombre || "").toLowerCase().trim();
            const secInLocal = nominalElectores.filter(e => {
              const sec = (e.sector || "").toLowerCase().trim();
              return sec && (sec === secNameLower || sec.includes(secNameLower) || secNameLower.includes(sec));
            });

            const dCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "duro").length;
            const bCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "blando").length;
            const nCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "nuevo").length;

            const sVot = parseInt(s.militantes !== undefined ? s.militantes : (s.habitantes || 0)) || 0;
            let sDuro = s.votoDuro !== undefined ? parseInt(s.votoDuro) || 0 : (dCount > 0 ? dCount : Math.round(sVot * 0.60));
            let sBlando = s.votoBlando !== undefined ? parseInt(s.votoBlando) || 0 : (bCount > 0 ? bCount : Math.round(sVot * 0.25));
            let sNuevo = s.votoNuevo !== undefined ? parseInt(s.votoNuevo) || 0 : (nCount > 0 ? nCount : Math.max(0, sVot - sDuro - sBlando));

            if (dCount > sDuro) sDuro = dCount;
            if (bCount > sBlando) sBlando = bCount;
            if (nCount > sNuevo) sNuevo = nCount;

            s.votoDuro = sDuro;
            s.votoBlando = sBlando;
            s.votoNuevo = sNuevo;
            s.electoresNominales = secInLocal.length;

            orphCasas += parseInt(s.casas || 0) || 0;
            orphFam += parseInt(s.familias || s.casas || 0) || 0;
            orphHab += parseInt(s.habitantes || s.militantes || 0) || 0;
            orphVot += sVot;
            orphDuro += sDuro;
            orphBlando += sBlando;
            orphNuevo += sNuevo;
            orphNominales += secInLocal.length;
          });
          parishNode.ejes.push({
            id: `eje-otros-${p.id}`,
            nombre: "Otros Sectores Vecinales",
            casas: orphCasas,
            familias: orphFam,
            habitantes: orphHab,
            votantes: orphVot,
            votoDuro: orphDuro,
            votoBlando: orphBlando,
            votoNuevo: orphNuevo,
            electoresNominales: orphNominales,
            sectores: orphanSecs
          });
          parishNode.totCasas += orphCasas;
          parishNode.totFam += orphFam;
          parishNode.totHab += orphHab;
          parishNode.totVot += orphVot;
          parishNode.totDuro += orphDuro;
          parishNode.totBlando += orphBlando;
          parishNode.totNuevo += orphNuevo;
          parishNode.totNominales += orphNominales;
          parishNode.totSectores += orphanSecs.length;
        }

        if (parishNode.ejes.length > 0) {
          munNode.parroquias.push(parishNode);
          munNode.totCasas += parishNode.totCasas;
          munNode.totFam += parishNode.totFam;
          munNode.totHab += parishNode.totHab;
          munNode.totVot += parishNode.totVot;
          munNode.totDuro += parishNode.totDuro;
          munNode.totBlando += parishNode.totBlando;
          munNode.totNuevo += parishNode.totNuevo;
          munNode.totNominales += parishNode.totNominales;
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
    const cascadeModel = this.buildCascadeModel();

    // 1. Totales Macro
    let grandCasas = 0, grandFam = 0, grandHab = 0, grandVot = 0, grandSectores = 0, grandEjes = 0, grandParroquias = 0;
    let grandDuro = 0, grandBlando = 0, grandNuevo = 0, grandNominales = 0;

    cascadeModel.forEach(mun => {
      grandCasas += mun.totCasas;
      grandFam += mun.totFam;
      grandHab += mun.totHab;
      grandVot += mun.totVot;
      grandDuro += mun.totDuro;
      grandBlando += mun.totBlando;
      grandNuevo += mun.totNuevo;
      grandNominales += mun.totNominales;
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

    const elDuro = document.getElementById("kpi-voto-duro");
    const elDuroPct = document.getElementById("kpi-voto-duro-pct");
    const elBlando = document.getElementById("kpi-voto-blando");
    const elBlandoPct = document.getElementById("kpi-voto-blando-pct");
    const elNuevo = document.getElementById("kpi-voto-nuevo");
    const elNuevoPct = document.getElementById("kpi-voto-nuevo-pct");
    const elNominales = document.getElementById("kpi-electores-nominales");

    const grandPolTot = (grandDuro + grandBlando + grandNuevo) || 1;

    if (elCasas) elCasas.textContent = this.nf.format(grandCasas);
    if (elFam) elFam.textContent = this.nf.format(grandFam);
    if (elHab) elHab.textContent = this.nf.format(grandHab);
    if (elVot) elVot.textContent = this.nf.format(grandVot);
    if (elSec) elSec.textContent = this.nf.format(grandSectores);
    if (elEjes) elEjes.textContent = `${grandEjes} Ejes Territoriales`;
    if (elBadge) elBadge.textContent = `${grandParroquias} Parroquias en Vista`;

    if (elDuro) elDuro.textContent = this.nf.format(grandDuro);
    if (elDuroPct) elDuroPct.textContent = `${((grandDuro / grandPolTot) * 100).toFixed(1)}%`;
    if (elBlando) elBlando.textContent = this.nf.format(grandBlando);
    if (elBlandoPct) elBlandoPct.textContent = `${((grandBlando / grandPolTot) * 100).toFixed(1)}%`;
    if (elNuevo) elNuevo.textContent = this.nf.format(grandNuevo);
    if (elNuevoPct) elNuevoPct.textContent = `${((grandNuevo / grandPolTot) * 100).toFixed(1)}%`;
    if (elNominales) elNominales.textContent = this.nf.format(grandNominales);

    // 2. Gráfico Principal de Barras (Habitantes vs Votantes)
    this.renderTerritorialBarsChart(cascadeModel);

    // 3. Tabla Plana Paginada (Excel Style)
    this.prepareFlatSectorsList(cascadeModel);
    this.renderFlatTableOnly();

    // 4. Árbol en Cascada
    this.renderCascadeTree(cascadeModel);

    // 5. Herramientas Avanzadas dentro de <details> (Tortas y Pareto)
    this.renderDecisionCenter(cascadeModel);

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  renderTerritorialBarsChart(cascadeModel) {
    const canvas = document.getElementById("chart-territorial-bars");
    if (!canvas) return;

    let items = [];
    if (this.selectedMunId === "todos") {
      // Comparativa por los 13 Municipios
      items = cascadeModel.map(m => ({
        label: m.nombre,
        habitantes: m.totHab,
        votantes: m.totVot
      })).sort((a, b) => b.habitantes - a.habitantes);
    } else if (this.selectedParishId === "todas" && cascadeModel.length > 0) {
      // Comparativa por Parroquias del Municipio
      items = cascadeModel[0].parroquias.map(p => ({
        label: p.nombre,
        habitantes: p.totHab,
        votantes: p.totVot
      })).sort((a, b) => b.habitantes - a.habitantes);
    } else if (cascadeModel.length > 0 && cascadeModel[0].parroquias.length > 0) {
      // Comparativa por Ejes o Sectores Principales
      const p = cascadeModel[0].parroquias[0];
      items = p.ejes.map(e => ({
        label: e.nombre,
        habitantes: e.habitantes,
        votantes: e.votantes
      })).sort((a, b) => b.habitantes - a.habitantes).slice(0, 10);
    }

    if (items.length === 0) return;

    const labels = items.map(it => it.label);
    const dataHab = items.map(it => it.habitantes);
    const dataVot = items.map(it => it.votantes);

    if (typeof Chart === "undefined") {
      return;
    }

    if (this.barsChartInstance) {
      this.barsChartInstance.destroy();
      this.barsChartInstance = null;
    }

    const ctx = canvas.getContext("2d");
    this.barsChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Habitantes (Población)",
            data: dataHab,
            backgroundColor: "#10b981",
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          },
          {
            label: "Votantes Registrados",
            data: dataVot,
            backgroundColor: "#c084fc",
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false // Ya está en la cabecera
          },
          tooltip: {
            backgroundColor: "#140e40",
            titleColor: "#f8fafc",
            titleFont: { family: "Inter", weight: "bold", size: 12 },
            bodyFont: { family: "JetBrains Mono", size: 11 },
            borderColor: "#2d1f85",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                return ` ${context.dataset.label}: ${this.nf.format(val)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#94a3b8",
              font: { family: "Inter", size: 11, weight: "bold" },
              maxRotation: 35,
              minRotation: 0
            }
          },
          y: {
            grid: { color: "rgba(45, 31, 133, 0.35)" },
            ticks: {
              color: "#94a3b8",
              font: { family: "JetBrains Mono", size: 10 },
              callback: (val) => this.nf.format(val)
            }
          }
        }
      }
    });
  }

  prepareFlatSectorsList(cascadeModel) {
    const list = [];
    cascadeModel.forEach(mun => {
      mun.parroquias.forEach(p => {
        p.ejes.forEach(e => {
          e.sectores.forEach(s => {
            list.push({
              munId: mun.id,
              munNombre: mun.nombre,
              parishId: p.id,
              parishNombre: p.nombre,
              ejeNombre: e.nombre,
              id: s.id,
              nombre: s.nombre,
              casas: parseInt(s.casas || 0),
              familias: parseInt(s.familias || s.casas || 0),
              habitantes: parseInt(s.habitantes || s.militantes || 0),
              votantes: parseInt(s.militantes !== undefined ? s.militantes : (s.votantes || s.habitantes || 0)),
              votoDuro: parseInt(s.votoDuro || 0),
              votoBlando: parseInt(s.votoBlando || 0),
              votoNuevo: parseInt(s.votoNuevo || 0),
              centroVotacion: s.centroVotacion || ""
            });
          });
        });
      });
    });

    // Ordenar de mayor a menor votantes
    list.sort((a, b) => b.votantes - a.votantes);
    this.currentFlatSectors = list;
  }

  renderFlatTableOnly() {
    const tbody = document.getElementById("flat-table-body");
    const countBadge = document.getElementById("flat-table-count");
    const pageLbl = document.getElementById("lbl-flat-page");
    const btnPrev = document.getElementById("btn-flat-prev");
    const btnNext = document.getElementById("btn-flat-next");

    if (!tbody) return;

    const total = this.currentFlatSectors.length;
    if (total === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-8 text-center text-slate-400 italic">
            No se encontraron sectores para este filtro territorial o búsqueda.
          </td>
        </tr>
      `;
      if (countBadge) countBadge.textContent = "0 sectores encontrados";
      if (pageLbl) pageLbl.textContent = "Página 1 de 1";
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      return;
    }

    const totalPages = Math.ceil(total / this.flatPerPage) || 1;
    if (this.flatPage > totalPages) this.flatPage = totalPages;
    if (this.flatPage < 1) this.flatPage = 1;

    const startIdx = (this.flatPage - 1) * this.flatPerPage;
    const endIdx = Math.min(startIdx + this.flatPerPage, total);
    const slice = this.currentFlatSectors.slice(startIdx, endIdx);

    if (countBadge) {
      countBadge.textContent = `Mostrando ${startIdx + 1} - ${endIdx} de ${total} sectores territoriales`;
    }
    if (pageLbl) {
      pageLbl.textContent = `Página ${this.flatPage} de ${totalPages}`;
    }
    if (btnPrev) btnPrev.disabled = this.flatPage <= 1;
    if (btnNext) btnNext.disabled = this.flatPage >= totalPages;

    let html = "";
    slice.forEach((s, idx) => {
      const rowNum = startIdx + idx + 1;
      html += `
        <tr class="hover:bg-[#18114a] transition border-b border-[#2d1f85]/40">
          <td class="py-2.5 px-3 text-slate-400 font-mono">${rowNum}</td>
          <td class="py-2.5 px-3 text-sky-300 font-bold whitespace-nowrap">
            ${s.parishNombre}
          </td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">
            ${s.nombre}
          </td>
          <td class="py-2.5 px-3 text-right text-amber-400 font-black font-mono">${this.nf.format(s.casas)}</td>
          <td class="py-2.5 px-3 text-right text-sky-300 font-bold font-mono">${this.nf.format(s.familias)}</td>
          <td class="py-2.5 px-3 text-right text-emerald-400 font-black font-mono">${this.nf.format(s.habitantes)}</td>
          <td class="py-2.5 px-3 text-right text-purple-300 font-black font-mono">${this.nf.format(s.votantes)}</td>
          <td class="py-2.5 px-3 text-right text-emerald-400 font-bold font-mono">${this.nf.format(s.votoDuro)}</td>
          <td class="py-2.5 px-3 text-slate-300 truncate max-w-[220px] font-sans text-[11px]" title="${s.centroVotacion}">
            ${s.centroVotacion ? '🏫 ' + s.centroVotacion : '<span class="text-slate-600">Sin asignar</span>'}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
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
    const totDuro = cascadeModel.reduce((sum, m) => sum + m.totDuro, 0);
    const totBlando = cascadeModel.reduce((sum, m) => sum + m.totBlando, 0);
    const totNuevo = cascadeModel.reduce((sum, m) => sum + m.totNuevo, 0);
    const uniqueCentros = new Set(allSectors.map(s => s.centroVotacion).filter(Boolean)).size || 1;

    // Métricas de Decisión
    this.renderDecisionCockpit(cascadeModel, allSectors, totVotantes, totCasas, totFam, totSectores, uniqueCentros);

    // Gráficos de Torta Avanzados
    this.renderElectoralShareChart(cascadeModel, allSectors, totVotantes);
    this.renderPoliticalVoteChart(totDuro, totBlando, totNuevo);
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
      elCohabitDesc.innerHTML = `Carga de <strong class="text-sky-300 font-bold">${famCasa}</strong> familias/vivienda (${deficitPct}% de cohabitación familiar múltiple).`;
    }

    const schoolLoad = uniqueCentros > 0 ? Math.round(totVot / uniqueCentros) : 0;
    const elSchoolLoad = document.getElementById("decision-school-load");
    const elSchoolDesc = document.getElementById("decision-school-desc");
    if (elSchoolLoad) elSchoolLoad.textContent = this.nf.format(schoolLoad);
    if (elSchoolDesc) {
      elSchoolDesc.innerHTML = `Promedio de <strong class="text-purple-300 font-bold">${this.nf.format(schoolLoad)}</strong> electores por escuela para dimensionar testigos y transporte.`;
    }
  }

  renderElectoralShareChart(cascadeModel, allSectors, totVot) {
    const canvas = document.getElementById("chart-electoral-share");
    if (!canvas) return;

    let items = [];
    let subtitleText = "13 Municipios";

    if (this.selectedMunId === "todos") {
      subtitleText = "13 Municipios";
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
      subtitleText = "Ejes Territoriales";
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

    if (typeof Chart === "undefined") return;

    if (this.electoralChartInstance) {
      this.electoralChartInstance.destroy();
      this.electoralChartInstance = null;
    }

    const ctx = canvas.getContext("2d");
    this.electoralChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: "#0e092e",
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0e092e",
            titleColor: "#f59e0b",
            bodyColor: "#f8fafc",
            borderColor: "rgba(245, 158, 11, 0.4)",
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const val = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${this.nf.format(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    const summaryEl = document.getElementById("chart-electoral-summary");
    if (summaryEl && items.length > 0) {
      const topItem = items[0];
      const topPct = totVot > 0 ? ((topItem.value / totVot) * 100).toFixed(1) : 0;
      summaryEl.innerHTML = `
        <span class="truncate">Líder: <strong class="text-amber-400 font-bold">${topItem.label}</strong> (${topPct}%)</span>
        <span class="shrink-0 text-slate-400">Total: <strong class="text-white">${this.nf.format(totVot)}</strong></span>
      `;
    }
  }

  renderPoliticalVoteChart(duro, blando, nuevo) {
    const canvas = document.getElementById("chart-political-vote");
    if (!canvas) return;

    const total = (duro + blando + nuevo) || 1;
    const labels = ["🟢 Voto Duro", "🟡 Voto Blando", "🔵 Voto Nuevo"];
    const data = [duro, blando, nuevo];
    const colors = ["#10b981", "#f59e0b", "#38bdf8"];

    if (typeof Chart === "undefined") return;

    if (this.politicalChartInstance) {
      this.politicalChartInstance.destroy();
      this.politicalChartInstance = null;
    }

    const ctx = canvas.getContext("2d");
    this.politicalChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: "#0e092e",
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0e092e",
            titleColor: "#10b981",
            bodyColor: "#f8fafc",
            borderColor: "rgba(16, 185, 129, 0.4)",
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const val = context.parsed;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${this.nf.format(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    const summaryEl = document.getElementById("chart-political-summary");
    if (summaryEl) {
      const dPct = ((duro / total) * 100).toFixed(0);
      const bPct = ((blando / total) * 100).toFixed(0);
      const nPct = ((nuevo / total) * 100).toFixed(0);
      summaryEl.innerHTML = `
        <div class="p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <span class="block text-[9px] text-slate-400">🟢 Duro</span>
          <strong class="text-xs font-black">${dPct}%</strong>
        </div>
        <div class="p-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
          <span class="block text-[9px] text-slate-400">🟡 Blando</span>
          <strong class="text-xs font-black">${bPct}%</strong>
        </div>
        <div class="p-1.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300">
          <span class="block text-[9px] text-slate-400">🔵 Nuevo</span>
          <strong class="text-xs font-black">${nPct}%</strong>
        </div>
      `;
    }
  }

  renderCoverageTrafficChart(allSectors, totSec) {
    const canvas = document.getElementById("chart-coverage-traffic");
    if (!canvas) return;

    const high = allSectors.filter(s => (s.cobertura || 0) >= 75);
    const mid = allSectors.filter(s => (s.cobertura || 0) >= 50 && (s.cobertura || 0) < 75);
    const low = allSectors.filter(s => (s.cobertura || 0) < 50);

    const labels = ["🟢 Consolidado", "🟡 En Progreso", "🔴 Crítico"];
    const data = [high.length, mid.length, low.length];
    const colors = ["#10b981", "#f59e0b", "#f43f5e"];

    if (typeof Chart === "undefined") return;

    if (this.coverageChartInstance) {
      this.coverageChartInstance.destroy();
      this.coverageChartInstance = null;
    }

    const ctx = canvas.getContext("2d");
    this.coverageChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: "#0e092e",
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0e092e",
            titleColor: "#34d399",
            bodyColor: "#f8fafc",
            borderColor: "rgba(52, 211, 153, 0.4)",
            borderWidth: 1,
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

    const summaryEl = document.getElementById("chart-coverage-summary");
    if (summaryEl) {
      const highPct = totSec > 0 ? ((high.length / totSec) * 100).toFixed(0) : 0;
      const midPct = totSec > 0 ? ((mid.length / totSec) * 100).toFixed(0) : 0;
      const lowPct = totSec > 0 ? ((low.length / totSec) * 100).toFixed(0) : 0;

      summaryEl.innerHTML = `
        <div class="p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <span class="block text-[9px] text-slate-400">🟢 Óptimo</span>
          <strong class="text-xs font-black">${high.length}</strong> <span class="text-[9px] text-slate-400">(${highPct}%)</span>
        </div>
        <div class="p-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
          <span class="block text-[9px] text-slate-400">🟡 Medio</span>
          <strong class="text-xs font-black">${mid.length}</strong> <span class="text-[9px] text-slate-400">(${midPct}%)</span>
        </div>
        <div class="p-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
          <span class="block text-[9px] text-slate-400">🔴 Crítico</span>
          <strong class="text-xs font-black">${low.length}</strong> <span class="text-[9px] text-slate-400">(${lowPct}%)</span>
        </div>
      `;
    }
  }

  renderCascadeTree(cascadeModel) {
    const container = document.getElementById("cascade-container");
    if (!container) return;

    if (cascadeModel.length === 0) {
      container.innerHTML = `
        <div class="py-10 text-center text-slate-400 bg-[#18114a]/90 rounded-3xl border border-[#2d1f85]">
          <p class="font-bold text-sm text-slate-200">No se encontraron sectores ni ejes con el filtro actual.</p>
        </div>
      `;
      return;
    }

    let html = "";

    cascadeModel.forEach(mun => {
      mun.parroquias.forEach(p => {
        const isParishExpanded = this.expandedParishes.has(p.id);

        html += `
          <div class="bg-[#140e40] border border-[#2d1f85] rounded-3xl overflow-hidden shadow-lg transition">
            
            <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#23176d]/40 transition cursor-pointer" onclick="window.dashboardApp.toggleParish('${p.id}')">
              <div class="flex items-center gap-3 min-w-0">
                <button type="button" class="text-sky-400 hover:text-white text-xs font-mono font-bold p-1 shrink-0">
                  ${isParishExpanded ? '▼' : '▶'}
                </button>
                <div class="truncate">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono font-bold uppercase text-sky-400">Municipio ${p.munNombre}</span>
                  </div>
                  <h3 class="text-base font-black text-white mt-0.5 truncate">${p.nombre}</h3>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2 text-xs font-mono shrink-0">
                <div class="bg-[#0e092e] px-2.5 py-1.5 rounded-xl border border-[#2d1f85] text-center">
                  <span class="text-[9px] text-slate-400 block uppercase">Casas</span>
                  <strong class="text-amber-400 font-black">${this.nf.format(p.totCasas)}</strong>
                </div>
                <div class="bg-[#0e092e] px-2.5 py-1.5 rounded-xl border border-[#2d1f85] text-center">
                  <span class="text-[9px] text-slate-400 block uppercase">Habitantes</span>
                  <strong class="text-emerald-400 font-black">${this.nf.format(p.totHab)}</strong>
                </div>
                <div class="bg-[#0e092e] px-2.5 py-1.5 rounded-xl border border-[#2d1f85] text-center">
                  <span class="text-[9px] text-purple-300 block uppercase font-bold">Votantes</span>
                  <strong class="text-purple-300 font-black">${this.nf.format(p.totVot)}</strong>
                </div>
                <div class="bg-emerald-950/60 px-2 py-1.5 rounded-xl border border-emerald-500/30 text-center">
                  <span class="text-[9px] text-emerald-400 block uppercase font-bold">🟢 Duro</span>
                  <strong class="text-emerald-300 font-black">${this.nf.format(p.totDuro || 0)}</strong>
                </div>
              </div>
            </div>

            ${isParishExpanded ? `
              <div class="px-3 sm:px-5 pb-4 pt-1 space-y-3 border-t border-[#2d1f85]/80 bg-[#100b33]/90">
                ${p.ejes.map(eje => {
                  const isEjeExpanded = this.expandedSubparroquias.has(eje.id);

                  return `
                    <div class="bg-[#140e40]/90 border border-[#2d1f85] rounded-2xl overflow-hidden shadow-sm">
                      
                      <div class="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#23176d]/40 transition cursor-pointer" onclick="window.dashboardApp.toggleSubparroquia('${eje.id}')">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <button type="button" class="text-purple-400 hover:text-white text-xs font-mono font-bold p-0.5 shrink-0">
                            ${isEjeExpanded ? '▼' : '▶'}
                          </button>
                          <span class="text-base select-none shrink-0">${isEjeExpanded ? '📂' : '📁'}</span>
                          <div class="truncate">
                            <span class="text-xs font-black text-white truncate block">${eje.nombre}</span>
                            <span class="text-[10px] text-slate-400 font-mono">${eje.sectores.length} sectores</span>
                          </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-2 text-xs font-mono shrink-0">
                          <span class="text-amber-400 font-bold text-[11px]">🏠 ${eje.casas}</span>
                          <span class="text-slate-500">•</span>
                          <span class="text-emerald-400 font-bold text-[11px]">👥 ${eje.habitantes}</span>
                          <span class="text-slate-500">•</span>
                          <span class="text-purple-300 font-black text-[11px]">🗳️ ${eje.votantes}</span>
                        </div>
                      </div>

                      ${isEjeExpanded ? `
                        <div class="px-3 pb-3 pt-1 border-t border-[#2d1f85]/80 overflow-x-auto">
                          ${eje.sectores.length === 0 ? `
                            <p class="text-xs text-slate-400 italic py-2 text-center">
                              No hay sectores trazados aún dentro de este eje.
                            </p>
                          ` : `
                            <table class="w-full text-left border-collapse text-xs font-mono">
                              <thead>
                                <tr class="text-[10px] uppercase text-slate-400 border-b border-[#2d1f85]/80">
                                  <th class="py-2 px-2">Sector</th>
                                  <th class="py-2 px-2 text-right">Casas</th>
                                  <th class="py-2 px-2 text-right">Habitantes</th>
                                  <th class="py-2 px-2 text-right text-purple-300">Votantes</th>
                                  <th class="py-2 px-2 text-right text-emerald-400">🟢 Duro</th>
                                  <th class="py-2 px-2">Centro CNE</th>
                                </tr>
                              </thead>
                              <tbody class="divide-y divide-[#2d1f85]/40">
                                ${eje.sectores.map(sec => `
                                  <tr class="hover:bg-[#23176d]/40 transition">
                                    <td class="py-2 px-2 font-bold text-slate-200 flex items-center gap-1.5">
                                      <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background-color: ${sec.colorRelleno || '#38bdf8'}"></span>
                                      <span class="truncate">${sec.nombre}</span>
                                    </td>
                                    <td class="py-2 px-2 text-right text-amber-400 font-bold">${sec.casas || 0}</td>
                                    <td class="py-2 px-2 text-right text-emerald-400 font-bold">${sec.habitantes || sec.militantes || 0}</td>
                                    <td class="py-2 px-2 text-right text-purple-300 font-black">${sec.militantes !== undefined ? sec.militantes : (sec.habitantes || 0)}</td>
                                    <td class="py-2 px-2 text-right text-emerald-400 font-bold">${sec.votoDuro || 0}</td>
                                    <td class="py-2 px-2 text-slate-400 truncate max-w-[200px]" title="${sec.centroVotacion || ''}">
                                      ${sec.centroVotacion ? '🏫 ' + sec.centroVotacion : '<span class="text-slate-600">Sin asignar</span>'}
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
    csv += "Municipio,Parroquia,Eje Territorial,Sector,Casas,Familias,Habitantes,Votantes,Voto Duro,Voto Blando,Voto Nuevo,Electores Nominales,Centro de Votacion\n";

    cascadeModel.forEach(mun => {
      mun.parroquias.forEach(p => {
        p.ejes.forEach(eje => {
          if (eje.sectores.length === 0) {
            csv += `\"${mun.nombre}\",\"${p.nombre}\",\"${eje.nombre}\",\"(Sin sectores)\",${eje.casas},${eje.familias},${eje.habitantes},${eje.votantes},${eje.votoDuro || 0},${eje.votoBlando || 0},${eje.votoNuevo || 0},${eje.electoresNominales || 0},\"\"\n`;
          } else {
            eje.sectores.forEach(sec => {
              const vot = sec.militantes !== undefined ? sec.militantes : (sec.habitantes || 0);
              csv += `\"${mun.nombre}\",\"${p.nombre}\",\"${eje.nombre}\",\"${sec.nombre || ''}\",${sec.casas || 0},${sec.familias || sec.casas || 0},${sec.habitantes || vot || 0},${vot || 0},${sec.votoDuro || 0},${sec.votoBlando || 0},${sec.votoNuevo || 0},${sec.electoresNominales || 0},\"${sec.centroVotacion || ''}\"\n`;
            });
          }
        });
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `censo_electoral_migato_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

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

window.addEventListener("load", () => {
  if (window.dashboardApp && typeof Chart !== "undefined") {
    const cascadeModel = window.dashboardApp.buildCascadeModel();
    window.dashboardApp.renderTerritorialBarsChart(cascadeModel);
    window.dashboardApp.renderDecisionCenter(cascadeModel);
  }
});
