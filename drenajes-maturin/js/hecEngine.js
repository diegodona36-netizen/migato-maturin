/**
 * Motor de Cálculo Hidráulico HEC-RAS para Drenajes de Maturín (Blindado sin NaN)
 */
export class HecRasEngine {
  constructor() {
    this.gravity = 9.81;
  }

  calcCaudalPluvial(intensidadMmH, areaCuencaHa = 60, coefEscorrentia = 0.70) {
    const Q = (coefEscorrentia * intensidadMmH * areaCuencaHa) / 360;
    return Math.round(Q * 100) / 100;
  }

  calcTiranteNormal(Q, canal) {
    const b = canal.anchoM || canal.anchoPromedioM || 3.5;
    const z = 1.0; // Talud 1:1
    const S = canal.pendienteS || 0.002;
    const n_base = canal.rugosidadManning || 0.040;
    const sedPct = canal.estadoSedimentacionPct || 50;
    const n = n_base * (1 + (sedPct / 100) * 0.4);
    const H = canal.profundidadM || 2.0;

    let y = 0.6;
    for (let i = 0; i < 30; i++) {
      const A = (b + z * y) * y;
      const P = b + 2 * y * Math.sqrt(1 + z * z);
      const R = A / (P || 1);
      const Q_calc = (1 / n) * A * Math.pow(R, 2/3) * Math.sqrt(S);
      const diff = Q_calc - Q;
      if (Math.abs(diff) < 0.01) break;

      const dQ = (Q_calc - (1 / n) * ((b + z * (y - 0.01)) * (y - 0.01)) * Math.pow(R, 2/3) * Math.sqrt(S)) / 0.01;
      y = y - diff / (dQ || 1);
      if (y < 0.1) y = 0.1;
      if (y > 8.0) y = 8.0;
    }

    y = Math.round(y * 100) / 100;
    const A_final = (b + z * y) * y;
    const vel = Math.round((Q / (A_final || 1)) * 100) / 100;
    const froude = Math.round((vel / Math.sqrt(this.gravity * (y || 0.5))) * 100) / 100;
    const desborda = y >= H;
    const tiranteDesborde = desborda ? Math.round((y - H) * 100) / 100 : 0;

    return {
      caudalQ: Q,
      tiranteM: y,
      profundidadCanalM: H,
      velocidadMs: vel,
      froude: froude,
      regimen: froude < 1 ? "Subcrítico (Tranquilo)" : "Supercrítico (Rápido)",
      desborda: desborda,
      tiranteDesbordeM: tiranteDesborde,
      capacidadUsoPct: Math.min(150, Math.round((Q / (canal.capacidadDisenoM3s || 10)) * 100))
    };
  }

  simularEscenario(canales, intensidadMmH) {
    const resultados = canales.map(canal => {
      const areaAportanteHa = (canal.longitudKm || 2.5) * 25;
      const Q_tormenta = this.calcCaudalPluvial(intensidadMmH, areaAportanteHa);
      const hid = this.calcTiranteNormal(Q_tormenta, canal);

      let vivAfectadas = 0;
      let severidad = "NORMAL";

      if (hid.desborda) {
        vivAfectadas = Math.round((canal.viviendasRiesgo || 100) * 0.85);
        severidad = "CRÍTICO";
      } else if (hid.capacidadUsoPct > 80) {
        vivAfectadas = Math.round((canal.viviendasRiesgo || 100) * 0.25);
        severidad = "ALERTA";
      }

      const dragadoM3 = Math.round((canal.longitudKm || 2.0) * 1000 * (canal.anchoM || 3.0) * ((canal.estadoSedimentacionPct || 50) / 100) * 0.5);

      return {
        canalId: canal.id,
        nombre: canal.nombre,
        parroquia: canal.parroquia,
        tipoIntervencion: canal.tipoIntervencion,
        hidraulica: hid,
        viviendasAfectadas: vivAfectadas,
        severidad: severidad,
        dragadoRequeridoM3: dragadoM3,
        lat: canal.lat || 9.746,
        lng: canal.lng || -63.181
      };
    });

    const totalViviendas = resultados.reduce((acc, r) => acc + (r.viviendasAfectadas || 0), 0);
    const canalesDesbordados = resultados.filter(r => r.hidraulica.desborda).length;
    const totalDragado = resultados.reduce((acc, r) => acc + (r.dragadoRequeridoM3 || 0), 0);

    return {
      intensidadMmH,
      resumen: {
        totalCanales: canales.length,
        canalesDesbordados: canalesDesbordados,
        viviendasAfectadas: totalViviendas,
        totalDragadoM3: totalDragado,
        nivelAlertaGlobal: canalesDesbordados >= 8 ? "ROJA (EMERGENCIA)" : (canalesDesbordados >= 3 ? "AMARILLA (ALERTA)" : "VERDE (NORMAL)")
      },
      detalles: resultados
    };
  }
}
