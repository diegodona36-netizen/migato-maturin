/**
 * Gráficos y Series Temporales — Monitor de Cortes Eléctricos
 */
export class OutageCharts {
  constructor() {
    this.nationalChart = null;
  }

  renderNationalTimeline(containerId, range = "24h") {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (this.nationalChart) {
      this.nationalChart.destroy();
    }

    const hoursCount = range === "24h" ? 24 : (range === "48h" ? 48 : 24);
    const labels = [];
    const sondeoData = [];
    const bgpData = [];
    const telescopioData = [];

    const now = new Date();
    for (let i = hoursCount; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 3600 * 1000));
      const hours = d.getHours().toString().padStart(2, "0") + ":00";
      labels.push(hours);

      // Simulación de curva nacional con caída en horas pico
      if (i >= 3 && i <= 7) {
        // Horario de corte detectado (caída de sondeo, BGP estable)
        sondeoData.push(58 + Math.sin(i) * 4);
        bgpData.push(98.5 + (Math.random() * 0.5));
        telescopioData.push(52 + Math.sin(i) * 5);
      } else {
        sondeoData.push(92 + (Math.random() * 5));
        bgpData.push(99 + (Math.random() * 0.8));
        telescopioData.push(88 + (Math.random() * 6));
      }
    }

    this.nationalChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sondeo Activo (Active Probing / Ping)",
            data: sondeoData,
            borderColor: "#0284c7",
            backgroundColor: "rgba(2, 132, 199, 0.08)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 2
          },
          {
            label: "Rutas BGP (Enrutamiento Telecom)",
            data: bgpData,
            borderColor: "#10b981",
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.1,
            fill: false,
            pointRadius: 0
          },
          {
            label: "Telescopio de Red (Darknet Traffic)",
            data: telescopioData,
            borderColor: "#f97316",
            backgroundColor: "rgba(249, 115, 22, 0.05)",
            borderWidth: 1.5,
            tension: 0.3,
            fill: true,
            pointRadius: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              font: { size: 11, family: "sans-serif" }
            }
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ": " + context.parsed.y.toFixed(1) + "%";
              }
            }
          }
        },
        scales: {
          y: {
            min: 40,
            max: 105,
            ticks: {
              callback: function(val) { return val + "%"; },
              font: { size: 10 }
            },
            grid: { color: "#f1f5f9" }
          },
          x: {
            ticks: { font: { size: 10 }, maxRotation: 45 },
            grid: { display: false }
          }
        }
      }
    });
  }
}
