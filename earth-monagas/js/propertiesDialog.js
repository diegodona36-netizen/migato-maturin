/**
 * Diálogo Flotante de Propiedades y Carga de Militantes — Estilo Google Earth Pro
 * Pestañas: Ficha Territorial, Militantes por Sector, Estilo y Color, Medidas
 */
import { detectParishFromGeometry } from "./geoMonagas.js?v=100";
import { CATALOGO_MONAGAS, findParishInCatalog } from "./catalogoMonagas.js?v=100";
import { GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=100";
import { CENTROS_MATURIN } from "./centrosData.js?v=100";

export class PropertiesDialog {
  constructor(onSaveCallback, onLiveChangeCallback, onStartEditGeometry) {
    if (typeof onSaveCallback !== "function" && typeof onLiveChangeCallback === "function") {
      this.onSaveCallback = onLiveChangeCallback;
      this.onLiveChangeCallback = onStartEditGeometry;
      this.onStartEditGeometry = arguments[3];
    } else {
      this.onSaveCallback = onSaveCallback;
      this.onLiveChangeCallback = onLiveChangeCallback;
      this.onStartEditGeometry = onStartEditGeometry;
    }

    this.currentItem = null;
    this.currentType = null; // 'poligono', 'ruta', 'marca'
    this.currentMunId = "maturin";
    this.currentParishId = "alto-de-los-godos";
    this.detectedParishMatch = null;
    this.modalEl = document.getElementById("dialog-properties");

    this.initEvents();
  }

  initEvents() {
    this.setupTerritorialSelectors();

    // Pestañas
    document.querySelectorAll(".prop-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Cambios en vivo de color u opacidad para previsualización instantánea
    const inputOpacity = document.getElementById("prop-poly-opacity");
    const labelOpacity = document.getElementById("prop-poly-opacity-val");
    const inputBorderColor = document.getElementById("prop-border-color");
    const inputBorderWidth = document.getElementById("prop-border-width");
    const inputFillColor = document.getElementById("prop-fill-color");

    const triggerLiveUpdate = () => {
      if (!this.currentItem) return;
      const draft = {
        colorBorde: inputBorderColor ? inputBorderColor.value : "#38bdf8",
        anchoBorde: inputBorderWidth ? (parseInt(inputBorderWidth.value) || 2) : 2,
        colorRelleno: inputFillColor ? inputFillColor.value : "#38bdf8",
        opacidad: inputOpacity ? (parseFloat(inputOpacity.value) || 0.38) : 0.38,
        color: inputBorderColor ? inputBorderColor.value : "#10b981",
        ancho: inputBorderWidth ? (parseInt(inputBorderWidth.value) || 4) : 4
      };
      if (this.onLiveChangeCallback) {
        this.onLiveChangeCallback(this.currentType, this.currentItem.id, draft);
      }
    };

    if (inputOpacity && labelOpacity) {
      inputOpacity.addEventListener("input", (e) => {
        labelOpacity.textContent = `${Math.round(e.target.value * 100)}%`;
        triggerLiveUpdate();
      });
    }

    // Paleta de Colores Rápidos
    document.querySelectorAll(".btn-quick-color").forEach(btn => {
      btn.addEventListener("click", () => {
        const color = btn.dataset.color;
        const name = btn.dataset.name;

        const bColor = document.getElementById("prop-border-color");
        const fColor = document.getElementById("prop-fill-color");
        const labelName = document.getElementById("palette-color-name");

        if (bColor) bColor.value = color;
        if (fColor) fColor.value = color;
        if (labelName) labelName.textContent = name;

        document.querySelectorAll(".btn-quick-color").forEach(b => {
          const isCurrent = b === btn;
          b.classList.toggle("border-white", isCurrent);
          b.classList.toggle("border-slate-700", !isCurrent);
          b.classList.toggle("scale-105", isCurrent);
          const icon = b.querySelector(".check-icon");
          if (icon) icon.classList.toggle("hidden", !isCurrent);
        });

        triggerLiveUpdate();
      });
    });

    if (inputBorderColor) inputBorderColor.addEventListener("input", triggerLiveUpdate);
    if (inputBorderWidth) inputBorderWidth.addEventListener("input", triggerLiveUpdate);
    if (inputFillColor) inputFillColor.addEventListener("input", triggerLiveUpdate);



    // Botón Ajustar Vértices en Satélite o Trazar en el Satélite
    const btnEditGeo = document.getElementById("btn-prop-edit-geometry");
    if (btnEditGeo) {
      btnEditGeo.addEventListener("click", () => {
        if (!this.currentItem) return;
        const item = this.currentItem;
        const isNew = !!item.isNew;
        const type = this.currentType;
        this.close();
        if (isNew) {
          window.earthApp?.toolsManager?.setActiveTool(type);
        } else if (this.onStartEditGeometry) {
          this.onStartEditGeometry(item, type);
        }
      });
    }

    // Guardar vía Submit o Botón Aceptar
    const form = document.getElementById("form-properties");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.save();
      };
    }

    const btnSave = document.getElementById("btn-prop-save");
    if (btnSave) {
      btnSave.onclick = (e) => {
        e.preventDefault();
        this.save();
      };
    }

    // Cancelar
    const btnCancel = document.getElementById("btn-prop-cancel");
    const btnClose = document.getElementById("btn-prop-close");
    if (btnCancel) btnCancel.addEventListener("click", () => this.cancel());
    if (btnClose) btnClose.addEventListener("click", () => this.cancel());
  }

  setupTerritorialSelectors() {
    const selMun = document.getElementById("prop-select-mun");
    const selParish = document.getElementById("prop-select-parish");
    const wrapSubParish = document.getElementById("wrapper-prop-select-subparish");
    const btnApplyDetected = document.getElementById("btn-prop-apply-detected");

    if (selMun) {
      selMun.addEventListener("change", () => {
        const munId = selMun.value;
        this.populateParishesDropdown(munId);
      });
    }

    if (selParish) {
      selParish.addEventListener("change", () => {
        const munId = selMun ? selMun.value : this.currentMunId;
        const pStore = window.earthApp?.store?.getParish(munId, selParish.value);
        const parishSubparroquias = pStore?.subparroquias || [];
        const list = parishSubparroquias;
        const selSubParish = document.getElementById("prop-select-subparish");
        if (wrapSubParish && selSubParish) {
          if (list.length > 0) {
            selSubParish.innerHTML = `<option value="">-- Sin Eje Asignado --</option>` + list.map(sp => 
              `<option value="${sp.id}">${sp.nombre}</option>`
            ).join("");
            wrapSubParish.classList.remove("hidden");
          } else {
            selSubParish.innerHTML = `<option value="">-- Sin Ejes Creados --</option>`;
            wrapSubParish.classList.add("hidden");
          }
        }
      });
    }

    if (btnApplyDetected) {
      btnApplyDetected.addEventListener("click", () => {
        if (this.detectedParishMatch) {
          const { mun, parish } = this.detectedParishMatch;
          if (selMun) {
            selMun.value = mun.id;
            this.populateParishesDropdown(mun.id, parish.id);
          }
          const hint = document.getElementById("prop-geo-detected-hint");
          if (hint) hint.classList.add("hidden");
        }
      });
    }
  }

  populateParishesDropdown(munId, selectedParishId = null) {
    const selParish = document.getElementById("prop-select-parish");
    const wrapSubParish = document.getElementById("wrapper-prop-select-subparish");
    const selSubParish = document.getElementById("prop-select-subparish");
    if (!selParish) return;

    const munObj = CATALOGO_MONAGAS.find(m => m.id === munId);
    if (!munObj) return;

    selParish.innerHTML = munObj.parroquias.map(p => 
      `<option value="${p.id}">${p.nombre}</option>`
    ).join("");

    if (selectedParishId && munObj.parroquias.some(p => p.id === selectedParishId)) {
      selParish.value = selectedParishId;
    } else if (munObj.parroquias.length > 0) {
      selParish.value = munObj.parroquias[0].id;
    }

    if (wrapSubParish && selSubParish) {
      const pStore = window.earthApp?.store?.getParish(munId, selParish.value);
      const parishSubparroquias = pStore?.subparroquias || [];
      const list = parishSubparroquias;
      if (list.length > 0) {
        selSubParish.innerHTML = `<option value="">-- Sin Eje Asignado --</option>` + list.map(sp => 
          `<option value="${sp.id}">${sp.nombre}</option>`
        ).join("");
        wrapSubParish.classList.remove("hidden");
      } else {
        selSubParish.innerHTML = `<option value="">-- Sin Ejes Creados --</option>`;
        wrapSubParish.classList.add("hidden");
      }
    }
  }

  switchTab(tabName) {
    document.querySelectorAll(".prop-tab-btn").forEach(b => {
      const isSel = b.dataset.tab === tabName;
      b.classList.toggle("bg-slate-800", isSel);
      b.classList.toggle("text-sky-400", isSel);
      b.classList.toggle("border-b-2", isSel);
      b.classList.toggle("border-sky-500", isSel);
      b.classList.toggle("text-slate-400", !isSel);
    });

    document.querySelectorAll(".prop-tab-content").forEach(pane => {
      pane.classList.toggle("hidden", pane.dataset.tab !== tabName);
    });
  }

  openForCreate(type) {
    const munId = window.earthApp?.selectedMunId || "maturin";
    const parishId = window.earthApp?.selectedParishId || "san-simon";
    const parish = window.earthApp?.store?.getParish(munId, parishId);
    const center = parish?.centro || [9.7469, -63.1812];

    const offset = 0.003;
    const defaultVertices = [
      [center[0] + offset, center[1] - offset],
      [center[0] + offset, center[1] + offset],
      [center[0] - offset, center[1] + offset],
      [center[0] - offset, center[1] - offset],
      [center[0] + offset, center[1] - offset]
    ];

    let draftItem;
    if (type === "subparroquia") {
      const count = (parish?.subparroquias || []).length + 1;
      draftItem = {
        id: `SUBPAR-${Date.now()}`,
        nombre: `Sub-Parroquia ${count} • Eje Comunal`,
        alias: `Eje Comunal ${count}`,
        descripcion: `Eje Comunal de ${parish?.nombre || 'la Parroquia'}`,
        colorBorde: "#c084fc",
        anchoBorde: 2.5,
        colorRelleno: "#a855f7",
        opacidad: 0.2,
        areaHa: 45.0,
        perimetroM: 2800,
        visible: true,
        vertices: defaultVertices,
        isNew: true
      };
    } else if (type === "poligono") {
      const count = (parish?.poligonos || []).length + 1;
      draftItem = {
        id: `POLY-${Date.now()}`,
        nombre: `Sector Comunal ${count}`,
        subParroquiaId: window.earthApp?.activeSubParroquiaId || (parish?.subparroquias?.[0]?.id || null),
        descripcion: `Comunidad en ${parish?.nombre || 'la Parroquia'}`,
        colorBorde: "#38bdf8",
        anchoBorde: 2,
        colorRelleno: "#38bdf8",
        opacidad: 0.35,
        militantes: 250,
        casas: 180,
        familias: 195,
        habitantes: 720,
        lider: "",
        telefono: "",
        areaHa: 15.0,
        perimetroM: 1600,
        visible: true,
        vertices: defaultVertices,
        isNew: true
      };
    } else if (type === "ruta") {
      draftItem = {
        id: `ROUTE-${Date.now()}`,
        nombre: "Nueva Calle / Ruta",
        descripcion: `Vía comunal en ${parish?.nombre || 'la Parroquia'}`,
        color: "#10b981",
        ancho: 4,
        puntos: [
          [center[0] - offset, center[1] - offset],
          [center[0] + offset, center[1] + offset]
        ],
        longitudM: 850,
        visible: true,
        isNew: true
      };
    } else {
      draftItem = {
        id: `MARK-${Date.now()}`,
        nombre: "Nuevo Punto de Interés",
        tipo: "punto_interes",
        descripcion: `Punto de Interés en ${parish?.nombre || 'la Parroquia'}`,
        lat: center[0],
        lng: center[1],
        visible: true,
        isNew: true
      };
    }

    this.open(type, draftItem, munId, parishId);
  }

  open(type, item, currentMunId = null, currentParishId = null) {
    this.currentType = type;
    this.currentItem = item;
    this.currentMunId = currentMunId || item.munId || "maturin";
    this.currentParishId = currentParishId || item.parishId || "san-simon";

    this.originalState = {
      nombre: item.nombre,
      descripcion: item.descripcion,
      colorBorde: item.colorBorde,
      anchoBorde: item.anchoBorde,
      colorRelleno: item.colorRelleno,
      opacidad: item.opacidad,
      color: item.color,
      ancho: item.ancho
    };

    const isNew = !!item.isNew;
    const pStore = window.earthApp?.store?.getParish(this.currentMunId, this.currentParishId);
    const parishLabel = pStore?.nombre ? ` (${pStore.nombre})` : "";

    const titleEl = document.getElementById("prop-dialog-title");
    if (titleEl) {
      if (isNew) {
        titleEl.textContent = 
          type === "poligono" ? `MIGATO — Nuevo Sector Comunal${parishLabel}` :
          (type === "subparroquia" ? `MIGATO — Nueva Sub-Parroquia / Eje Comunal${parishLabel}` :
          (type === "ruta" ? `MIGATO — Nueva Calle / Ruta${parishLabel}` : `MIGATO — Nueva Marca de Posición${parishLabel}`));
      } else {
        titleEl.textContent = 
          type === "poligono" ? `MIGATO — Ficha del Sector: ${item.nombre}` :
          (type === "subparroquia" ? `MIGATO — Sub-Parroquia / Eje Comunal: ${item.nombre}` :
          (type === "ruta" ? `MIGATO — Propiedades de la Calle: ${item.nombre}` : `MIGATO — Marca de Posición: ${item.nombre}`));
      }
    }

    const btnEditGeo = document.getElementById("btn-prop-edit-geometry");
    if (btnEditGeo) {
      const span = btnEditGeo.querySelector("span");
      if (span) {
        span.textContent = isNew ? "✏️ Trazar en el Satélite" : "Ajustar Vértices";
      }
    }

    const btnSave = document.getElementById("btn-prop-save");
    if (btnSave) {
      const span = btnSave.querySelector("span");
      if (span) {
        span.textContent = isNew ? "Guardar y Crear" : "Guardar Datos";
      }
    }

    const lblName = document.getElementById("prop-name-label");
    if (lblName) {
      if (type === "subparroquia") lblName.textContent = "Nombre del Eje / Sub-Parroquia *";
      else if (type === "poligono") lblName.textContent = "Nombre del Sector / Comunidad *";
      else if (type === "ruta") lblName.textContent = "Nombre de la Calle / Ruta *";
      else if (type === "marca") lblName.textContent = "Nombre del Punto de Interés / Marca *";
    }

    // Llenar Ficha Territorial
    document.getElementById("prop-name").value = item.nombre || "";
    document.getElementById("prop-desc").value = item.descripcion || "";

    // Configurar selectores territoriales
    const selMun = document.getElementById("prop-select-mun");
    const selParish = document.getElementById("prop-select-parish");
    const selSubParish = document.getElementById("prop-select-subparish");
    const wrapSubParish = document.getElementById("wrapper-prop-select-subparish");
    const badgeDetected = document.getElementById("prop-badge-auto-detected");
    const hintDetected = document.getElementById("prop-geo-detected-hint");
    const textDetected = document.getElementById("prop-geo-detected-text");

    if (wrapSubParish) {
      wrapSubParish.classList.toggle("hidden", type !== "poligono");
    }

    if (selMun) {
      selMun.innerHTML = CATALOGO_MONAGAS.map(m => 
        `<option value="${m.id}">${m.nombre}</option>`
      ).join("");
      selMun.value = this.currentMunId;
    }

    this.populateParishesDropdown(this.currentMunId, this.currentParishId);

    if (selSubParish && type === "poligono") {
      const pStore = window.earthApp?.store?.getParish(this.currentMunId, this.currentParishId);
      const parishSubparroquias = pStore?.subparroquias || [];
      const list = parishSubparroquias;
      
      if (list.length > 0) {
        selSubParish.innerHTML = `<option value="">-- Sin Eje Asignado --</option>` + list.map(sp => 
          `<option value="${sp.id}">${sp.nombre}</option>`
        ).join("");
        if (item.subParroquiaId) {
          selSubParish.value = item.subParroquiaId;
        } else if (window.earthApp?.activeSubParroquiaId) {
          selSubParish.value = window.earthApp.activeSubParroquiaId;
        } else if (list.length === 1) {
          selSubParish.value = list[0].id;
        }
        selSubParish.parentElement?.classList.remove("hidden");
      } else {
        selSubParish.innerHTML = `<option value="">-- Sin Ejes Creados --</option>`;
      }
    }

    // Auto-detección espacial por coordenadas
    const geom = item.vertices || item.puntos || (item.lat !== undefined ? [item.lat, item.lng] : null);
    const detected = detectParishFromGeometry(geom, GEO_PARROQUIAS_OFICIAL);
    this.detectedParishMatch = null;

    if (detected) {
      const match = findParishInCatalog(detected.parishId);
      if (match) {
        this.detectedParishMatch = match;
        if (badgeDetected) {
          badgeDetected.textContent = `📍 ${match.parish.nombre}`;
          badgeDetected.title = `Detectado en: Parroquia ${match.parish.nombre} (Municipio ${match.mun.nombre})`;
          badgeDetected.classList.remove("hidden");
        }

        if (match.parish.id !== this.currentParishId) {
          if (hintDetected && textDetected) {
            textDetected.textContent = `📍 Geometría detectada en: Parroquia ${match.parish.nombre} (${match.mun.nombre})`;
            hintDetected.classList.remove("hidden");
          }
        } else {
          if (hintDetected) hintDetected.classList.add("hidden");
        }
      }
    } else {
      if (badgeDetected) badgeDetected.classList.add("hidden");
      if (hintDetected) hintDetected.classList.add("hidden");
    }

    const boxSocio = document.getElementById("box-prop-socio");
    const boxFieldMetrics = document.getElementById("box-prop-field-metrics");
    const boxSubparishInfo = document.getElementById("box-prop-subparish-info");
    const boxPolyStyle = document.getElementById("box-poly-fill-style");
    const rowArea = document.getElementById("row-measure-area");
    const rowLength = document.getElementById("row-measure-length");

    const currentUser = window.earthApp?.authManager?.getCurrentUser();
    const isFieldOperator = currentUser && currentUser.rol === "operador";

    if (type === "poligono" || type === "subparroquia") {
      const isSub = type === "subparroquia";
      const isPoly = type === "poligono";

      if (boxSocio) boxSocio.classList.toggle("hidden", isSub);
      if (btnEditGeo) {
        if (isFieldOperator) {
          btnEditGeo.classList.add("hidden");
        } else {
          btnEditGeo.classList.remove("hidden");
        }
      }
      if (boxPolyStyle) boxPolyStyle.classList.remove("hidden");
      if (rowArea) rowArea.classList.remove("hidden");
      if (rowLength) rowLength.classList.add("hidden");

      if (boxSubparishInfo) {
        boxSubparishInfo.classList.toggle("hidden", !isSub);
        if (isSub) {
          if (wrapSubParish) wrapSubParish.classList.add("hidden");
          if (boxFieldMetrics) boxFieldMetrics.classList.add("hidden");

          const childSecs = (pStore?.poligonos || []).filter(p => String(p.subParroquiaId) === String(item.id));
          const countEl = document.getElementById("prop-subparish-sectors-count");
          if (countEl) countEl.textContent = `${childSecs.length} Sectores`;

          let totCasas = 0, totFam = 0, totHab = 0, totVot = 0;
          childSecs.forEach(c => {
            totCasas += parseInt(c.casas || 0) || 0;
            totFam += parseInt(c.familias || 0) || 0;
            totHab += parseInt(c.habitantes || 0) || 0;
            totVot += parseInt(c.militantes !== undefined ? c.militantes : (c.habitantes || 0)) || 0;
          });

          const elTCasas = document.getElementById("prop-subparish-total-casas");
          const elTFamil = document.getElementById("prop-subparish-total-familias");
          const elTHab = document.getElementById("prop-subparish-total-habitantes");
          const elTVot = document.getElementById("prop-subparish-total-votantes");
          if (elTCasas) elTCasas.textContent = totCasas.toLocaleString();
          if (elTFamil) elTFamil.textContent = totFam.toLocaleString();
          if (elTHab) elTHab.textContent = totHab.toLocaleString();
          if (elTVot) elTVot.textContent = totVot.toLocaleString();

          const btnAddSector = document.getElementById("btn-prop-add-sector-to-subparish");
          if (btnAddSector) {
            btnAddSector.onclick = () => {
              this.close();
              window.earthApp?.startSectorInSubParish(item.id);
            };
          }
        } else {
          if (wrapSubParish) wrapSubParish.classList.remove("hidden");
          if (boxFieldMetrics) boxFieldMetrics.classList.remove("hidden");
        }
      } else {
        if (wrapSubParish) wrapSubParish.classList.toggle("hidden", isSub);
        if (boxFieldMetrics) boxFieldMetrics.classList.toggle("hidden", isSub);
      }

      if (isPoly) {
        // Valores de caracterización socio-política del sector
        const inMilitantes = document.getElementById("prop-militantes");
        const inCasas = document.getElementById("prop-casas");
        const inFamilias = document.getElementById("prop-familias");
        const inHab = document.getElementById("prop-habitantes");
        const inCentroVot = document.getElementById("prop-centro-votacion");

        const numMilitantes = item.militantes !== undefined ? item.militantes : (item.habitantes || 0);
        const numCasas = item.casas || 0;

        if (inMilitantes) inMilitantes.value = numMilitantes;
        if (inCasas) inCasas.value = numCasas;
        if (inFamilias) inFamilias.value = item.familias !== undefined ? item.familias : numCasas;
        if (inHab) inHab.value = item.habitantes !== undefined ? item.habitantes : numMilitantes;
        if (inCentroVot) inCentroVot.value = item.centroVotacion || "";

        // Poblar datalist con centros electorales oficiales de la parroquia activa
        const dl = document.getElementById("centros-votacion-datalist");
        if (dl) {
          const parishCentros = (CENTROS_MATURIN || []).filter(c => c.parroquia === this.currentParishId);
          if (parishCentros.length > 0) {
            dl.innerHTML = parishCentros.map(c => `<option value="${c.nombre} (${c.mesas} mesas)">${c.id} • ${c.nombre} [${c.electores} electores]</option>`).join("");
          } else {
            dl.innerHTML = (CENTROS_MATURIN || []).slice(0, 40).map(c => `<option value="${c.nombre}">${c.nombre} (${c.parroquiaNombre})</option>`).join("");
          }
        }
      }

      // Medidas Geométricas
      const valHa = document.getElementById("val-measure-area-ha");
      const valM2 = document.getElementById("val-measure-area-m2");
      const valPer = document.getElementById("val-measure-perimeter");
      if (valHa) valHa.textContent = `${item.areaHa || 0} Ha`;
      if (valM2) valM2.textContent = `${Math.round((item.areaHa || 0) * 10000).toLocaleString()} m²`;
      if (valPer) valPer.textContent = `${item.perimetroM || 0} m`;
    } else {
      if (boxSocio) boxSocio.classList.add("hidden");
      if (boxFieldMetrics) boxFieldMetrics.classList.add("hidden");
      if (boxSubparishInfo) boxSubparishInfo.classList.add("hidden");
      if (wrapSubParish) wrapSubParish.classList.add("hidden");
      if (btnEditGeo) {
        if (isFieldOperator) {
          btnEditGeo.classList.add("hidden");
        } else {
          btnEditGeo.classList.toggle("hidden", !isNew);
        }
      }
      if (boxPolyStyle) boxPolyStyle.classList.add("hidden");
      if (rowArea) rowArea.classList.add("hidden");

      if (type === "ruta") {
        if (rowLength) rowLength.classList.remove("hidden");
        const valLenM = document.getElementById("val-measure-length-m");
        const valLenKm = document.getElementById("val-measure-length-km");
        if (valLenM) valLenM.textContent = `${item.longitudM || 0} m`;
        if (valLenKm) valLenKm.textContent = `${((item.longitudM || 0) / 1000).toFixed(2)} km`;
      } else {
        if (rowLength) rowLength.classList.add("hidden");
      }
    }

    // Estilo y Color
    const inBorderColor = document.getElementById("prop-border-color");
    const inBorderWidth = document.getElementById("prop-border-width");
    const inFillColor = document.getElementById("prop-fill-color");
    const inOpacity = document.getElementById("prop-poly-opacity");
    const inOpacityVal = document.getElementById("prop-poly-opacity-val");

    const itemColor = item.colorRelleno || item.color || "#38bdf8";
    if (inBorderColor) inBorderColor.value = item.colorBorde || item.color || "#38bdf8";
    if (inBorderWidth) inBorderWidth.value = item.anchoBorde || item.ancho || 2;
    if (inFillColor) inFillColor.value = itemColor;
    if (inOpacity) {
      const op = item.opacidad !== undefined ? item.opacidad : 0.38;
      inOpacity.value = op;
      if (inOpacityVal) inOpacityVal.textContent = `${Math.round(op * 100)}%`;
    }

    // Resaltar color activo en la paleta rápida
    const activeHex = itemColor.toLowerCase();
    document.querySelectorAll(".btn-quick-color").forEach(b => {
      const isMatch = b.dataset.color.toLowerCase() === activeHex;
      b.classList.toggle("border-white", isMatch);
      b.classList.toggle("border-slate-700", !isMatch);
      b.classList.toggle("scale-105", isMatch);
      const icon = b.querySelector(".check-icon");
      if (icon) icon.classList.toggle("hidden", !isMatch);
      if (isMatch) {
        const labelName = document.getElementById("palette-color-name");
        if (labelName) labelName.textContent = b.dataset.name;
      }
    });

    // Iniciar siempre en la primera pestaña (Ficha de Militancia)
    this.switchTab("desc");

    // Abrir Modal con garantía total de visibilidad
    this.modalEl = this.modalEl || document.getElementById("dialog-properties");
    if (this.modalEl) {
      this.modalEl.classList.remove("hidden");
      this.modalEl.classList.add("flex");
      this.modalEl.style.display = "flex";
      this.modalEl.style.zIndex = "99999";
    }

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  save() {
    if (!this.currentItem) return;

    const inName = document.getElementById("prop-name");
    const inDesc = document.getElementById("prop-desc");
    const nombre = inName ? (inName.value.trim() || this.currentItem.nombre) : (this.currentItem.nombre || "Sin Nombre");
    const descripcion = inDesc ? inDesc.value.trim() : (this.currentItem.descripcion || "");

    const inMilitantes = document.getElementById("prop-militantes");
    const inCasas = document.getElementById("prop-casas");
    const inFamilias = document.getElementById("prop-familias");
    const inHab = document.getElementById("prop-habitantes");

    const inMun = document.getElementById("prop-select-mun");
    const inParish = document.getElementById("prop-select-parish");
    const inSubParish = document.getElementById("prop-select-subparish");
    const inCentroVot = document.getElementById("prop-centro-votacion");

    const targetMunId = inMun && inMun.value ? inMun.value : (this.currentMunId || "maturin");
    const targetParishId = inParish && inParish.value ? inParish.value : (this.currentParishId || "alto-de-los-godos");
    let subParroquiaId = (inSubParish && inSubParish.value) ? inSubParish.value : (this.currentItem.subParroquiaId || null);

    // Si es polígono y la parroquia tiene sub-parroquias pero ninguna fue seleccionada, auto-asignar
    if (this.currentType === "poligono" && !subParroquiaId) {
      const pStore = window.earthApp?.store?.getParish(targetMunId, targetParishId);
      const parishSubps = pStore?.subparroquias || [];
      if (window.earthApp?.activeSubParroquiaId && parishSubps.some(s => String(s.id) === String(window.earthApp.activeSubParroquiaId))) {
        subParroquiaId = String(window.earthApp.activeSubParroquiaId);
      } else if (parishSubps.length > 0) {
        subParroquiaId = String(parishSubps[0].id);
      }
    }

    const militantesVal = inMilitantes ? (parseInt(inMilitantes.value) || 0) : (this.currentItem.militantes || this.currentItem.habitantes || 0);
    const casasVal = inCasas ? (parseInt(inCasas.value) || 0) : (this.currentItem.casas || 0);
    const familiasVal = inFamilias && inFamilias.value !== "" ? (parseInt(inFamilias.value) || 0) : (this.currentItem.familias !== undefined ? this.currentItem.familias : casasVal);
    const habitantesVal = inHab && inHab.value !== "" ? (parseInt(inHab.value) || 0) : (this.currentItem.habitantes !== undefined ? this.currentItem.habitantes : militantesVal);
    const centroVotacionVal = inCentroVot ? inCentroVot.value.trim() : (this.currentItem.centroVotacion || "");

    const defaultBorder = this.currentType === "subparroquia" ? "#c084fc" : (this.currentType === "ruta" ? "#10b981" : (this.currentType === "marca" ? "#ef4444" : "#38bdf8"));
    const defaultFill = this.currentType === "subparroquia" ? "#a855f7" : "#38bdf8";
    const defaultOpacity = this.currentType === "subparroquia" ? 0.2 : 0.38;

    const inBorderColor = document.getElementById("prop-border-color");
    const inBorderWidth = document.getElementById("prop-border-width");
    const inFillColor = document.getElementById("prop-fill-color");
    const inOpacity = document.getElementById("prop-poly-opacity");

    const isNew = !!this.currentItem.isNew;
    const updated = {
      nombre,
      descripcion,
      colorBorde: inBorderColor?.value || this.currentItem.colorBorde || defaultBorder,
      anchoBorde: parseInt(inBorderWidth?.value) || this.currentItem.anchoBorde || 2,
      colorRelleno: inFillColor?.value || this.currentItem.colorRelleno || defaultFill,
      opacidad: inOpacity ? (parseFloat(inOpacity.value) || defaultOpacity) : (this.currentItem.opacidad !== undefined ? this.currentItem.opacidad : defaultOpacity),
      color: inBorderColor?.value || this.currentItem.color || defaultBorder,
      ancho: parseInt(inBorderWidth?.value) || this.currentItem.ancho || 2,
      militantes: militantesVal,
      casas: casasVal,
      familias: familiasVal,
      habitantes: habitantesVal,
      centroVotacion: centroVotacionVal,
      munId: targetMunId,
      parishId: targetParishId,
      subParroquiaId: this.currentType === "subparroquia" ? null : subParroquiaId,
      isNew: isNew
    };

    if (this.onSaveCallback) {
      this.onSaveCallback(this.currentType, this.currentItem.id, updated, targetMunId, targetParishId);
    }
    this.close();
  }

  cancel() {
    if (this.currentItem && this.originalState && this.onLiveChangeCallback) {
      this.onLiveChangeCallback(this.currentType, this.currentItem.id, this.originalState);
    }
    this.close();
  }

  close() {
    this.currentItem = null;
    this.currentType = null;
    this.modalEl = this.modalEl || document.getElementById("dialog-properties");
    if (this.modalEl) {
      this.modalEl.classList.add("hidden");
      this.modalEl.classList.remove("flex");
      this.modalEl.style.display = "none";
    }
  }
}
