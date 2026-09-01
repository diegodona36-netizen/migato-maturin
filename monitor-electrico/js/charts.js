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

    const now = new Date();
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const labels = [];
    const sondeoData = [];
    const bgpData = [];
    const telescopioData = [];

    if (range === "24h") {
      for (let i = 24; i >= 0; i--) {
        const d = new Date(now.getTime() - (i * 3600 * 1000));
        const hourStr = d.getHours().toString().padStart(2, "0") + ":00";
        labels.push(i === 0 ? `Ahora (${hourStr})` : hourStr);

        // Curva de 24h con caídas en horas pico
        if (i >= 2 && i <= 6) {
          sondeoData.push(58 + Math.sin(i) * 5);
          bgpData.push(98.8 + Math.random() * 0.4);
          telescopioData.push(50 + Math.sin(i) * 6);
        } else {
          sondeoData.push(92 + (Math.random() * 5));
          bgpData.push(99.2 + (Math.random() * 0.5));
          telescopioData.push(88 + (Math.random() * 6));
        }
      }
    } else if (range === "48h") {
      for (let i = 48; i >= 0; i -= 2) {
        const d = new Date(now.getTime() - (i * 3600 * 1000));
        const dayStr = i > 24 ? "Ayer" : "Hoy";
        const hourStr = d.getHours().toString().padStart(2, "0") + ":00";
        labels.push(`${dayStr} ${hourStr}`);

        if ((i >= 2 && i <= 6) || (i >= 26 && i <= 30)) {
          sondeoData.push(52 + Math.random() * 8);
          bgpData.push(98.5 + Math.random() * 0.6);
          telescopioData.push(48 + Math.random() * 8);
        } else {
          sondeoData.push(90 + (Math.random() * 7));
          bgpData.push(99 + (Math.random() * 0.8));
          telescopioData.push(85 + (Math.random() * 8));
        }
      }
    } else if (range === "7d") {
      const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getTime() - (i * 24 * 3600 * 1000));
        const dayName = daysOfWeek[d.getDay()];
        const dayNum = d.getDate();
        const monthName = months[d.getMonth()];
        labels.push(i === 0 ? "Hoy" : `${dayName} ${dayNum} ${monthName}`);

        if (i === 1 || i === 3 || i === 5) {
          sondeoData.push(68 + Math.random() * 6);
          bgpData.push(99.0 + Math.random() * 0.5);
          telescopioData.push(62 + Math.random() * 7);
        } else {
          sondeoData.push(89 + Math.random() * 6);
          bgpData.push(99.5 + Math.random() * 0.4);
          telescopioData.push(86 + Math.random() * 6);
        }
      }
    } else if (range === "30d") {
      for (let i = 30; i >= 0; i -= 2) {
        const d = new Date(now.getTime() - (i * 24 * 3600 * 1000));
        const dayNum = d.getDate();
        const monthName = months[d.getMonth()];
        labels.push(i === 0 ? "Hoy" : `${dayNum} ${monthName}`);

        sondeoData.push(75 + Math.sin(i * 0.5) * 15 + (Math.random() * 5));
        bgpData.push(98.8 + (Math.random() * 1.0));
        telescopioData.push(70 + Math.sin(i * 0.5) * 14 + (Math.random() * 6));
      }
    }

    this.nationalChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sondeo Activo (Active Probing / Ping Residencial)",
            data: sondeoData,
            borderColor: "#0284c7",
            backgroundColor: "rgba(2, 132, 199, 0.08)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: range === "24h" ? 3 : 2
          },
          {
            label: "Rutas BGP (Troncal Telecom CANTV/Móvil)",
            data: bgpData,
            borderColor: "#10b981",
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.1,
            fill: false,
            pointRadius: 0
          },
          {
            label: "Telescopio de Red (Darknet Traffic UCSD)",
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
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              font: { size: 11, family: "sans-serif" }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ": " + context.parsed.y.toFixed(1) + "%";
              }
            }
          }
        },
        scales: {
          y: {
            min: 35,
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
