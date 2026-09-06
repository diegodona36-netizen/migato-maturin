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

import { CATALOGO_MONAGAS } from "../../earth-monagas/js/catalogoMonagas.js?v=100";
import { SECTORES_LAPUENTE, SUBPARROQUIAS_GODOS } from "../../earth-monagas/js/geoMonagas.js?v=100";
import { DEFAULT_SAN_SIMON_SUBPARROQUIAS, DEFAULT_COROZO_SUBPARROQUIAS } from "../../earth-monagas/js/earthStore.js?v=100";

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
    this.selectedMunId = "maturin";
    this.selectedParishId = "todas";
    this.searchQuery = "";
    this.expandedParishes = new Set(["alto-de-los-godos", "san-simon"]);
    this.expandedSubparroquias = new Set(["sub-godos-6", "sub-ss-casco"]);
    this.unsubscribeFirestore = null;

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

        // Precarga de datos predeterminados en memoria si no hay nada guardado aún
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

    if (elCasas) elCasas.textContent = grandCasas.toLocaleString();
    if (elFam) elFam.textContent = grandFam.toLocaleString();
    if (elHab) elHab.textContent = grandHab.toLocaleString();
    if (elVot) elVot.textContent = grandVot.toLocaleString();
    if (elSec) elSec.textContent = grandSectores.toLocaleString();
    if (elEjes) elEjes.textContent = `${grandEjes} Ejes Comunales`;
    if (elBadge) elBadge.textContent = `${grandParroquias} Parroquias en Vista`;

    // 2. Renderizar Árbol en Cascada
    this.renderCascadeTree(cascadeModel);

    if (window.lucide) window.lucide.createIcons();
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

document.addEventListener("DOMContentLoaded", () => {
  window.dashboardApp = new TerritorialDashboardApp();
});
