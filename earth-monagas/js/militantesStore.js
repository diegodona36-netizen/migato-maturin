/**
 * Gestor de Persistencia y Carga de Militantes por Sector
 * Permite registrar líderes, jefes de calle, UBCh y militantes por sector,
 * persistirlos en LocalStorage y exportarlos a formato CSV/Excel.
 */

const STORAGE_KEY = "militancia_monagas_sectores_v1";

export class MilitantesStore {
  constructor() {
    this.militantes = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Error al cargar militantes de localStorage:", e);
      return {};
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.militantes));
    } catch (e) {
      console.error("Error al guardar militantes en localStorage:", e);
    }
  }

  getMilitantes(sectorId) {
    if (!this.militantes[sectorId]) {
      this.militantes[sectorId] = [];
    }
    return this.militantes[sectorId];
  }

  getTotalCount(sectorId) {
    return this.getMilitantes(sectorId).length;
  }

  addMilitante(sectorId, data) {
    const list = this.getMilitantes(sectorId);
    const newMilitante = {
      id: "mil-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      nombre: data.nombre.trim(),
      cedula: data.cedula.trim(),
      telefono: (data.telefono || "").trim(),
      rol: data.rol || "Militante de Base",
      manzana: (data.manzana || "").trim(),
      direccion: (data.direccion || "").trim(),
      voto: data.voto || "Comprometido",
      fechaRegistro: new Date().toISOString()
    };
    list.unshift(newMilitante);
    this.saveToStorage();
    return newMilitante;
  }

  updateMilitante(sectorId, militanteId, updatedData) {
    const list = this.getMilitantes(sectorId);
    const idx = list.findIndex(m => m.id === militanteId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedData, fechaActualizacion: new Date().toISOString() };
      this.saveToStorage();
      return list[idx];
    }
    return null;
  }

  deleteMilitante(sectorId, militanteId) {
    const list = this.getMilitantes(sectorId);
    const idx = list.findIndex(m => m.id === militanteId);
    if (idx !== -1) {
      const removed = list.splice(idx, 1)[0];
      this.saveToStorage();
      return removed;
    }
    return null;
  }

  exportCSV(sectorId, sectorNombre = "Sector") {
    const list = this.getMilitantes(sectorId);
    if (list.length === 0) {
      alert(`No hay militantes registrados en ${sectorNombre} para exportar.`);
      return;
    }

    const headers = ["Sector", "Nombre y Apellido", "Cédula", "Teléfono", "Rol / Responsabilidad", "Manzana / Calle", "Dirección", "Compromiso Voto", "Fecha"];
    const rows = list.map(m => [
      `"${sectorNombre}"`,
      `"${m.nombre}"`,
      `"${m.cedula}"`,
      `"${m.telefono}"`,
      `"${m.rol}"`,
      `"${m.manzana}"`,
      `"${m.direccion}"`,
      `"${m.voto}"`,
      `"${new Date(m.fechaRegistro).toLocaleDateString()}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    this.downloadFile(`militancia_${sectorNombre.replace(/\s+/g, "_")}.csv`, csvContent, "text/csv;charset=utf-8;");
  }

  exportAllCSV(sectoresCatalogo) {
    let allRows = [];
    const headers = ["Sector #", "Nombre Sector", "Nombre y Apellido", "Cédula", "Teléfono", "Rol / Responsabilidad", "Manzana", "Dirección", "Compromiso Voto", "Fecha"];

    sectoresCatalogo.forEach(sec => {
      const list = this.getMilitantes(sec.id);
      list.forEach(m => {
        allRows.push([
          `"${sec.numero || ''}"`,
          `"${sec.nombre}"`,
          `"${m.nombre}"`,
          `"${m.cedula}"`,
          `"${m.telefono}"`,
          `"${m.rol}"`,
          `"${m.manzana}"`,
          `"${m.direccion}"`,
          `"${m.voto}"`,
          `"${new Date(m.fechaRegistro).toLocaleDateString()}"`
        ]);
      });
    });

    if (allRows.length === 0) {
      alert("No hay militantes registrados en ninguno de los sectores.");
      return;
    }

    const csvContent = "\uFEFF" + [headers.join(","), ...allRows.map(r => r.join(","))].join("\r\n");
    this.downloadFile("censo_militancia_la_puente_completo.csv", csvContent, "text/csv;charset=utf-8;");
  }

  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
