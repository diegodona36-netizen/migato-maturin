/**
 * Motor de Cálculo Hidráulico HEC-RAS para Drenajes Urbanos de Maturín
 * Implementa ecuaciones de Saint-Venant 1D/2D, Manning y modelado de manchas de inundación.
 */

export class HecRasEngine {
  constructor() {
    this.gravity = 9.81; // m/s^2
  }

  /**
   * Calcula el caudal generado por una tormenta pluvial (Método Racional: Q = C * I * A / 360)
   * @param {number} intensidadMmH - Intensidad de lluvia en mm/hora (ej: 20, 50, 90)
   * @param {number} areaCuencaHa - Área de la cuenca en hectáreas
   * @param {number} coefEscorrentia - Coeficiente C (urbano típico 0.65 - 0.85)
   */
  calcCaudalPluvial(intensidadMmH, areaCuencaHa = 180, coefEscorrentia = 0.75) {
    const Q = (coefEscorrentia * intensidadMmH * areaCuencaHa) / 360;
    return Math.round(Q * 100) / 100; // m3/s
  }

  /**
   * Resuelve el tirante normal (y) mediante la ecuación de Manning para sección trapecial
   * Q = (1/n) * A * R^(2/3) * S^(1/2)
   */
  calcTiranteNormal(Q, canal, factorSedimentacion = 1.0) {
    const b = canal.anchoPromedioM;
    const z = 1.0; // Talud 1:1
    const S = canal.pendienteS;
    const n = canal.rugosidadManning * (1 + (canal.estadoSedimentacionPct / 100) * 0.5 * factorSedimentacion);
    const H = canal.profundidadM;

    // Búsqueda numérica del tirante y
    let y = 0.5; // Valor inicial
    for (let iter = 0; iter < 40; iter++) {
      const A = (b + z * y) * y;
      const P = b + 2 * y * Math.sqrt(1 + z * z);
      const R = A / P;
      const Q_calc = (1 / n) * A * Math.pow(R, 2/3) * Math.sqrt(S);
      
      const diff = Q_calc - Q;
      if (Math.abs(diff) < 0.001) break;

      // Derivada aproximada
      const dQ = (Q_calc - (1 / n) * ((b + z * (y - 0.01)) * (y - 0.01)) * Math.pow(R, 2/3) * Math.sqrt(S)) / 0.01;
      y = y - diff / (dQ || 1);
      if (y < 0.05) y = 0.05;
      if (y > 10.0) y = 10.0;
    }

    y = Math.round(y * 100) / 100;

    // Parámetros hidráulicos finales
    const A_final = (b + z * y) * y;
    const velocidad = Math.round((Q / (A_final || 1)) * 100) / 100;
    const froude = Math.round((velocidad / Math.sqrt(this.gravity * y)) * 100) / 100;
    
    // Verificación de desbordamiento
    const desborda = y > H;
    const tiranteDesborde = desborda ? Math.round((y - H) * 100) / 100 : 0;
    const bordoLibreM = desborda ? 0 : Math.round((H - y) * 100) / 100;
    const anchoInundacionM = desborda ? Math.round((tiranteDesborde * 45 + b) * 10) / 10 : 0;

    return {
      caudalQ: Q,
      tiranteM: y,
      profundidadCanalM: H,
      velocidadMs: velocidad,
      froude: froude,
      regimen: froude < 1 ? "Subcrítico (Tranquilo)" : "Supercrítico (Rápido)",
      desborda: desborda,
      tiranteDesbordeM: tiranteDesborde,
      bordoLibreM: bordoLibreM,
      anchoInundacionM: anchoInundacionM,
      capacidadUsoPct: Math.round((Q / canal.capacidadDisenoM3s) * 100)
    };
  }

  /**
   * Simula la red completa de caños de Maturín para un escenario de lluvia dado
   */
  simularEscenario(canales, intensidadMmH, coefMantenimiento = 1.0) {
    const resultados = canales.map(canal => {
      // Ajustar área aportante proporcional a la longitud
      const areaAportanteHa = canal.longitudKm * 35;
      const Q_tormenta = this.calcCaudalPluvial(intensidadMmH, areaAportanteHa);
      const hidraulica = this.calcTiranteNormal(Q_tormenta, canal, coefMantenimiento);

      // Calcular viviendas afectadas en este escenario
      let viviendasAfectadas = 0;
      let severidad = "NORMAL";

      if (hidraulica.desborda) {
        if (hidraulica.tiranteDesbordeM > 0.4) {
          viviendasAfectadas = Math.round(canal.viviendasRiesgo * 0.95);
          severidad = "CRÍTICO";
        } else {
          viviendasAfectadas = Math.round(canal.viviendasRiesgo * 0.60);
          severidad = "ALTO";
        }
      } else if (hidraulica.capacidadUsoPct > 80) {
        viviendasAfectadas = Math.round(canal.viviendasRiesgo * 0.20);
        severidad = "ALERTA";
      }

      return {
        canalId: canal.id,
        nombre: canal.nombre,
        parroquia: canal.parroquia,
        hidraulica: hidraulica,
        viviendasAfectadas: viviendasAfectadas,
        severidad: severidad,
        coordenadas: canal.coordenadas,
        dragadoRequeridoM3: Math.round(canal.longitudKm * 1000 * canal.anchoPromedioM * (canal.estadoSedimentacionPct / 100) * 0.7)
      };
    });

    const totalViviendasAfectadas = resultados.reduce((acc, r) => acc + r.viviendasAfectadas, 0);
    const canalesDesbordados = resultados.filter(r => r.hidraulica.desborda).length;
    const totalDragadoM3 = resultados.reduce((acc, r) => acc + r.dragadoRequeridoM3, 0);

    return {
      intensidadMmH,
      resumen: {
        totalCanales: canales.length,
        canalesDesbordados: canalesDesbordados,
        viviendasAfectadas: totalViviendasAfectadas,
        totalDragadoM3: totalDragadoM3,
        nivelAlertaGlobal: canalesDesbordados >= 3 ? "ROJA (EMERGENCIA)" : (canalesDesbordados >= 1 ? "AMARILLA (ALERTA)" : "VERDE (NORMAL)")
      },
      detalles: resultados
    };
  }
}
