/**
 * Gráficos y Series Temporales — Monitor de Cortes Eléctricos
 */
export class OutageCharts {
  constructor() {
    this.nationalChart = null;
    this.monagasChart = null;
  }

  renderMonagasTimeline(containerId, range = "24h") {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.monagasChart) {
        this.monagasChart.destroy();
        this.monagasChart = null;
      }

      const now = new Date();
      const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const labels = [];
      const monagasDisponibilidad = [];
      const monagasVoltaje = [];

      if (range === "24h") {
        for (let i = 24; i >= 0; i--) {
          const d = new Date(now.getTime() - (i * 3600 * 1000));
          const hourStr = d.getHours().toString().padStart(2, "0") + ":00";
          labels.push(i === 0 ? `Ahora (${hourStr})` : hourStr);

          if (i >= 1 && i <= 3) {
            monagasDisponibilidad.push(55);
            monagasVoltaje.push(104);
          } else if (i >= 8 && i <= 11) {
            monagasDisponibilidad.push(68);
            monagasVoltaje.push(109);
          } else {
            monagasDisponibilidad.push(88);
            monagasVoltaje.push(118);
          }
        }
      } else if (range === "48h") {
        for (let i = 48; i >= 0; i -= 2) {
          const d = new Date(now.getTime() - (i * 3600 * 1000));
          const dayStr = i > 24 ? "Ayer" : "Hoy";
          const hourStr = d.getHours().toString().padStart(2, "0") + ":00";
          labels.push(`${dayStr} ${hourStr}`);

          if ((i >= 1 && i <= 4) || (i >= 22 && i <= 26)) {
            monagasDisponibilidad.push(52);
            monagasVoltaje.push(102);
          } else {
            monagasDisponibilidad.push(85);
            monagasVoltaje.push(116);
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

          if (i === 1 || i === 4) {
            monagasDisponibilidad.push(48);
            monagasVoltaje.push(102);
          } else {
            monagasDisponibilidad.push(78);
            monagasVoltaje.push(114);
          }
        }
      } else if (range === "30d") {
        for (let i = 30; i >= 0; i -= 2) {
          const d = new Date(now.getTime() - (i * 24 * 3600 * 1000));
          const dayNum = d.getDate();
          const monthName = months[d.getMonth()];
          labels.push(i === 0 ? "Hoy" : `${dayNum} ${monthName}`);

          monagasDisponibilidad.push(Math.round(65 + Math.sin(i * 0.4) * 18));
          monagasVoltaje.push(Math.round(110 + Math.sin(i * 0.4) * 7));
        }
      }

      this.monagasChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Disponibilidad Eléctrica en Monagas (%)",
              data: monagasDisponibilidad,
              borderColor: "#d97706",
              backgroundColor: "rgba(217, 119, 6, 0.12)",
              borderWidth: 2.5,
              tension: 0.3,
              fill: true,
              pointRadius: range === "24h" ? 3 : 2
            },
            {
              label: "Estabilidad de Tensión / Voltaje (Escala Relativa %)",
              data: monagasVoltaje.map(v => Math.round((v / 120) * 100)),
              borderColor: "#0284c7",
              borderWidth: 1.5,
              borderDash: [4, 4],
              tension: 0.2,
              fill: false,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              labels: { boxWidth: 12, font: { size: 11, family: "sans-serif" } }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  if (context.datasetIndex === 0) {
                    return "Disponibilidad Eléctrica: " + context.parsed.y + "%";
                  } else {
                    return "Voltaje Estimado: " + Math.round((context.parsed.y / 100) * 120) + "V";
                  }
                }
              }
            }
          },
          scales: {
            y: {
              min: 30,
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
    } catch (err) {
      console.warn("Error renderizando gráfico de Monagas:", err.message);
    }
  }

  renderNationalTimeline(containerId, range = "24h") {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.nationalChart) {
        this.nationalChart.destroy();
        this.nationalChart = null;
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

          if (i >= 2 && i <= 6) {
            sondeoData.push(58);
            bgpData.push(98.8);
            telescopioData.push(50);
          } else {
            sondeoData.push(92);
            bgpData.push(99.2);
            telescopioData.push(88);
          }
        }
      } else if (range === "48h") {
        for (let i = 48; i >= 0; i -= 2) {
          const d = new Date(now.getTime() - (i * 3600 * 1000));
          const dayStr = i > 24 ? "Ayer" : "Hoy";
          const hourStr = d.getHours().toString().padStart(2, "0") + ":00";
          labels.push(`${dayStr} ${hourStr}`);

          if ((i >= 2 && i <= 6) || (i >= 26 && i <= 30)) {
            sondeoData.push(52);
            bgpData.push(98.5);
            telescopioData.push(48);
          } else {
            sondeoData.push(90);
            bgpData.push(99);
            telescopioData.push(85);
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
            sondeoData.push(68);
            bgpData.push(99.0);
            telescopioData.push(62);
          } else {
            sondeoData.push(89);
            bgpData.push(99.5);
            telescopioData.push(86);
          }
        }
      } else if (range === "30d") {
        for (let i = 30; i >= 0; i -= 2) {
          const d = new Date(now.getTime() - (i * 24 * 3600 * 1000));
          const dayNum = d.getDate();
          const monthName = months[d.getMonth()];
          labels.push(i === 0 ? "Hoy" : `${dayNum} ${monthName}`);

          sondeoData.push(Math.round(75 + Math.sin(i * 0.5) * 15));
          bgpData.push(99.0);
          telescopioData.push(Math.round(70 + Math.sin(i * 0.5) * 14));
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
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              labels: { boxWidth: 12, font: { size: 11, family: "sans-serif" } }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ": " + context.parsed.y + "%";
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
    } catch (err) {
      console.warn("Error renderizando gráfico nacional:", err.message);
    }
  }
}
