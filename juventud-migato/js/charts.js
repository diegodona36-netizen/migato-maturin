/**
 * Gráficos de Rendimiento y Evaluación — Juventud MIGATO
 */
export class YouthCharts {
  constructor() {
    this.performanceChart = null;
    this.axesChart = null;
  }

  renderMunicipalComparison(containerId, reportes) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.performanceChart) {
        this.performanceChart.destroy();
        this.performanceChart = null;
      }

      const labels = reportes.map(r => r.municipio);
      const captacionData = reportes.map(r => r.captacion.totalJovenes);
      const conversatoriosData = reportes.map(r => r.conversatorios.totalAsistentes);
      const caminatasCasasData = reportes.map(r => r.caminatas.casasVisitadas);

      this.performanceChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "🟡 Jóvenes Captados",
              data: captacionData,
              backgroundColor: "#f59e0b",
              borderRadius: 6
            },
            {
              label: "🗣️ Asistentes a Conversatorios",
              data: conversatoriosData,
              backgroundColor: "#0284c7",
              borderRadius: 6
            },
            {
              label: "🚶‍♂️ Casas Tocadas en Caminatas",
              data: caminatasCasasData,
              backgroundColor: "#10b981",
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ": " + context.parsed.y;
                }
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: "Total de Contactos / Jóvenes" },
              grid: { color: "#f1f5f9" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    } catch (e) {
      console.warn("Error renderizando gráfico comparativo:", e.message);
    }
  }

  renderAxesSummaryDoughnut(containerId, totales) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.axesChart) {
        this.axesChart.destroy();
        this.axesChart = null;
      }

      this.axesChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["🟡 Captación", "🗣️ Conversatorios", "🚶‍♂️ Caminatas"],
          datasets: [
            {
              data: [totales.captacion, totales.conversatorios, totales.caminatas],
              backgroundColor: ["#f59e0b", "#0284c7", "#10b981"],
              borderWidth: 2,
              borderColor: "#ffffff"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } }
          },
          cutout: "68%"
        }
      });
    } catch (e) {
      console.warn("Error renderizando gráfico dona:", e.message);
    }
  }
}
