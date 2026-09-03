/**
 * Diálogo Flotante de Propiedades — Estilo Google Earth Pro
 * Pestañas: Descripción, Estilo/Color, Medidas
 */

export class PropertiesDialog {
  constructor(onSaveCallback) {
    this.onSaveCallback = onSaveCallback;
    this.currentItem = null;
    this.currentType = null; // 'poligono', 'ruta', 'marca'
    this.modalEl = document.getElementById("dialog-properties");

    this.initEvents();
  }

  initEvents() {
    // Pestañas
    document.querySelectorAll(".prop-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Cambios en vivo de color u opacidad para previsualización
    const inputOpacity = document.getElementById("prop-poly-opacity");
    const labelOpacity = document.getElementById("prop-poly-opacity-val");
    if (inputOpacity && labelOpacity) {
      inputOpacity.addEventListener("input", (e) => {
        labelOpacity.textContent = `${Math.round(e.target.value * 100)}%`;
      });
    }

    // Guardar
    const form = document.getElementById("form-properties");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.save();
      });
    }

    // Cancelar
    const btnCancel = document.getElementById("btn-prop-cancel");
    const btnClose = document.getElementById("btn-prop-close");
    if (btnCancel) btnCancel.addEventListener("click", () => this.close());
    if (btnClose) btnClose.addEventListener("click", () => this.close());
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

  open(type, item) {
    this.currentType = type;
    this.currentItem = item;

    document.getElementById("prop-dialog-title").textContent = 
      type === "poligono" ? "Google Earth — Propiedades del Polígono" :
      (type === "ruta" ? "Google Earth — Propiedades de la Ruta / Calle" : "Google Earth — Propiedades de la Marca");

    // Llenar Pestaña 1: Descripción
    document.getElementById("prop-name").value = item.nombre || "";
    document.getElementById("prop-desc").value = item.descripcion || "";

    // Pestaña 2: Estilo y Color
    const boxPolyStyle = document.getElementById("box-poly-fill-style");
    if (type === "poligono") {
      boxPolyStyle.classList.remove("hidden");
      document.getElementById("prop-border-color").value = item.colorBorde || "#38bdf8";
      document.getElementById("prop-border-width").value = item.anchoBorde || 2;
      document.getElementById("prop-fill-color").value = item.colorRelleno || "#38bdf8";
      const op = item.opacidad !== undefined ? item.opacidad : 0.4;
      document.getElementById("prop-poly-opacity").value = op;
      document.getElementById("prop-poly-opacity-val").textContent = `${Math.round(op * 100)}%`;
    } else {
      boxPolyStyle.classList.add("hidden");
      document.getElementById("prop-border-color").value = item.color || "#10b981";
      document.getElementById("prop-border-width").value = item.ancho || 4;
    }

    // Pestaña 3: Medidas
    const rowArea = document.getElementById("row-measure-area");
    const rowPerimeter = document.getElementById("row-measure-perimeter");
    const rowLength = document.getElementById("row-measure-length");

    if (type === "poligono") {
      rowArea.classList.remove("hidden");
      rowPerimeter.classList.remove("hidden");
      rowLength.classList.add("hidden");

      document.getElementById("val-measure-area-ha").textContent = `${item.areaHa || 0} Ha`;
      document.getElementById("val-measure-area-m2").textContent = `${Math.round((item.areaHa || 0) * 10000).toLocaleString()} m²`;
      document.getElementById("val-measure-perimeter").textContent = `${item.perimetroM || 0} metros`;
    } else if (type === "ruta") {
      rowArea.classList.add("hidden");
      rowPerimeter.classList.add("hidden");
      rowLength.classList.remove("hidden");

      document.getElementById("val-measure-length-m").textContent = `${item.longitudM || 0} metros`;
      document.getElementById("val-measure-length-km").textContent = `${((item.longitudM || 0) / 1000).toFixed(2)} km`;
    } else {
      rowArea.classList.add("hidden");
      rowPerimeter.classList.add("hidden");
      rowLength.classList.add("hidden");
    }

    this.switchTab("desc");
    this.modalEl.classList.remove("hidden");
    this.modalEl.classList.add("flex");
  }

  save() {
    if (!this.currentItem) return;

    const name = document.getElementById("prop-name").value.trim() || "Sin Título";
    const desc = document.getElementById("prop-desc").value.trim();

    const updated = {
      nombre: name,
      descripcion: desc
    };

    if (this.currentType === "poligono") {
      updated.colorBorde = document.getElementById("prop-border-color").value;
      updated.anchoBorde = parseInt(document.getElementById("prop-border-width").value) || 2;
      updated.colorRelleno = document.getElementById("prop-fill-color").value;
      updated.opacidad = parseFloat(document.getElementById("prop-poly-opacity").value) || 0.4;
    } else if (this.currentType === "ruta") {
      updated.color = document.getElementById("prop-border-color").value;
      updated.ancho = parseInt(document.getElementById("prop-border-width").value) || 4;
    }

    this.close();

    if (this.onSaveCallback) {
      this.onSaveCallback(this.currentType, this.currentItem.id, updated);
    }
  }

  close() {
    this.modalEl.classList.add("hidden");
    this.modalEl.classList.remove("flex");
    this.currentItem = null;
    this.currentType = null;
  }
}
