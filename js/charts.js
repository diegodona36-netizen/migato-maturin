/**
 * Módulo de Gráficos Estadísticos con Chart.js
 * Genera visualizaciones modernas para los Dashboards de Agua y Vialidad.
 */

export class DashboardCharts {
  constructor() {
    this.charts = {};
  }

  destroyChart(id) {
    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }
  }

  destroyAll() {
    Object.keys(this.charts).forEach(id => this.destroyChart(id));
  }

  /**
   * Renderiza el gráfico de semáforo (Doughnut)
   */
  renderSemaforoChart(canvasId, statsData, title) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const data = [
      statsData.verde || 0,
      statsData.amarillo || 0,
      statsData.rojo || 0
    ];

    this.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['🟢 Bueno (Verde)', '🟡 Regular (Amarillo)', '🔴 Crítico (Rojo)'],
        datasets: [{
          data: data,
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 16,
              font: { size: 12, family: 'Inter, sans-serif' }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw;
                const total = data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return ` ${context.label}: ${val} reportes (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Renderiza gráfico de barras de causas/problemáticas más frecuentes
   */
  renderProblemBreakdownChart(canvasId, problemasMap, barColor = '#3B82F6') {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const entries = Object.entries(problemasMap || {}).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(l => l.length > 32 ? l.substring(0, 32) + '...' : l),
        datasets: [{
          label: 'Frecuencia de Reportes',
          data: values,
          backgroundColor: barColor,
          borderRadius: 6,
          maxBarThickness: 28
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => labels[items[0].dataIndex] || '',
              label: (context) => ` ${context.raw} reportes en comunidades`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0, font: { family: 'Inter, sans-serif' } },
            grid: { color: '#F1F5F9' }
          },
          y: {
            ticks: { font: { size: 11, family: 'Inter, sans-serif' } },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * Renderiza gráfico comparativo por Parroquias de Maturín
   */
  renderParroquiasChart(canvasId, parroquiasStats, metricKey = 'aguaRojo', label = 'Sectores Críticos') {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const entries = Object.entries(parroquiasStats || {}).sort((a, b) => (b[1][metricKey] || 0) - (a[1][metricKey] || 0));
    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1][metricKey] || 0);

    const barColors = metricKey.includes('agua') ? '#0284C7' : '#D97706';

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: values,
          backgroundColor: barColors,
          borderRadius: 6,
          maxBarThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.raw} reportes críticos en ${context.label}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: '#F1F5F9' }
          },
          x: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * Renderiza gráfico comparativo de las 10 Parroquias de Maturín (Agua vs Vialidad)
   */
  renderComparisonChart(canvasId, stats) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const parroquiasList = [
      'San Simón', 'Alto de Los Godos', 'Boquerón', 'Las Cocuizas',
      'Santa Cruz', 'La Pica', 'Jusepín', 'El Furrial', 'San Vicente', 'El Corozo'
    ];

    const aguaRojoData = parroquiasList.map(p => stats.parroquias && stats.parroquias[p] ? stats.parroquias[p].aguaRojo : 0);
    const vialidadRojoData = parroquiasList.map(p => stats.parroquias && stats.parroquias[p] ? stats.parroquias[p].vialidadRojo : 0);

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: parroquiasList,
        datasets: [
          {
            label: '🚰 Agua en Alerta Roja (Sin Servicio)',
            data: aguaRojoData,
            backgroundColor: '#0284C7',
            borderRadius: 6,
            barPercentage: 0.75
          },
          {
            label: '🛣️ Vialidad en Alerta Roja (Intransitable)',
            data: vialidadRojoData,
            backgroundColor: '#EA580C',
            borderRadius: 6,
            barPercentage: 0.75
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Inter, sans-serif', size: 12, weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${context.raw} reportes críticos en ${context.label}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: '#F1F5F9' },
            title: { display: true, text: 'Reportes Críticos (Semáforo Rojo)', font: { size: 11, weight: '600' } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: '600' } }
          }
        }
      }
    });
  }
}
