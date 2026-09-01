/**
 * Gráficos Hidráulicos — Drenajes de Maturín
 */
export class DrainageCharts {
  constructor() {
    this.profileChart = null;
    this.capacityChart = null;
  }

  renderLongitudinalProfile(containerId, canal, hidraulica) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.profileChart) {
        this.profileChart.destroy();
        this.profileChart = null;
      }

      // Generar puntos a lo largo del caño
      const stations = [];
      const fondoCanal = [];
      const bordeSuperior = [];
      const nivelAgua = [];

      const totalLenM = canal.longitudKm * 1000;
      const step = totalLenM / 8;
      const slope = canal.pendienteS;

      for (let i = 0; i <= 8; i++) {
        const x = Math.round(i * step);
        stations.push(`${x}m`);

        const elevationFondo = Math.round((50 - (x * slope)) * 100) / 100;
        const elevationBorde = Math.round((elevationFondo + canal.profundidadM) * 100) / 100;
        const elevationAgua = Math.round((elevationFondo + hidraulica.tiranteM) * 100) / 100;

        fondoCanal.push(elevationFondo);
        bordeSuperior.push(elevationBorde);
        nivelAgua.push(elevationAgua);
      }

      this.profileChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: stations,
          datasets: [
            {
              label: "Nivel de Agua Simulado (HEC-RAS)",
              data: nivelAgua,
              borderColor: hidraulica.desborda ? "#ef4444" : "#0284c7",
              backgroundColor: hidraulica.desborda ? "rgba(239, 68, 68, 0.25)" : "rgba(2, 132, 199, 0.25)",
              borderWidth: 2.5,
              fill: "-1",
              tension: 0.1
            },
            {
              label: "Fondo del Caño (Cota Solera)",
              data: fondoCanal,
              borderColor: "#78716c",
              borderWidth: 2,
              borderDash: [2, 2],
              fill: false,
              tension: 0
            },
            {
              label: "Borde Superior / Terreno (Desbordamiento)",
              data: bordeSuperior,
              borderColor: "#dc2626",
              borderWidth: 2,
              borderDash: [4, 4],
              fill: false,
              tension: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top", labels: { boxWidth: 12, font: { size: 10 } } },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  return ctx.dataset.label + ": " + ctx.parsed.y + " msnm";
                }
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: "Cota (msnm)", font: { size: 10 } },
              grid: { color: "#f1f5f9" }
            },
            x: {
              title: { display: true, text: "Progresiva a lo largo del Caño", font: { size: 10 } },
              grid: { display: false }
            }
          }
        }
      });
    } catch (e) {
      console.warn("Error renderizando perfil longitudinal:", e.message);
    }
  }

  renderCapacityComparison(containerId, canalesSimulados) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.capacityChart) {
        this.capacityChart.destroy();
        this.capacityChart = null;
      }

      const labels = canalesSimulados.map(c => c.nombre.replace("Caño ", "").replace("Riberas del ", ""));
      const Q_actual = canalesSimulados.map(c => c.hidraulica.caudalQ);
      const Q_capacidad = [18.5, 14.0, 11.5, 22.0, 8.5, 16.0, 180.0];

      this.capacityChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Caudal de Tormenta Q (m³/s)",
              data: Q_actual,
              backgroundColor: canalesSimulados.map(c => c.hidraulica.desborda ? "#ef4444" : "#0284c7"),
              borderRadius: 6
            },
            {
              label: "Capacidad Máxima de Diseño (m³/s)",
              data: Q_capacidad,
              backgroundColor: "#cbd5e1",
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 12, font: { size: 10 } } }
          },
          scales: {
            y: {
              title: { display: true, text: "Caudal (m³/s)" },
              grid: { color: "#f1f5f9" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    } catch (e) {
      console.warn("Error renderizando gráfico de capacidad:", e.message);
    }
  }
}
