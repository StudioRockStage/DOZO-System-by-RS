const ws = new WebSocket('ws://localhost:9091');

const statusBadge = document.getElementById('system-status');
const lastCommit = document.getElementById('last-commit');
const telemetryTime = document.getElementById('telemetry-time');
const chartEl = document.getElementById('telemetry-chart');
const chartCanvas = chartEl ? chartEl.getContext('2d') : null;

let telemetryChart;
let telemetryData = [];
let timeLabels = [];

function initChart() {
  if (!chartCanvas || typeof Chart === 'undefined') return;
  telemetryChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [{
        label: 'Eventos de Telemetría',
        data: telemetryData,
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243,156,18,0.2)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        fill: true
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Tiempo' } },
        y: { title: { display: true, text: 'Eventos / seg' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function updateChart(value) {
  if (!telemetryChart) return;
  const now = new Date().toLocaleTimeString();
  if (timeLabels.length > 20) {
    timeLabels.shift();
    telemetryData.shift();
  }
  timeLabels.push(now);
  telemetryData.push(value);
  telemetryChart.update();
}

ws.onopen = () => {
  console.log('✅ Conectado al Live Event Bridge');
  if (statusBadge) {
    statusBadge.textContent = 'LIVE_EVENT_BRIDGE_OK';
    statusBadge.classList.add('active');
  }
};

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.event === 'telemetry_update') {
    if (telemetryTime) telemetryTime.textContent = data.timestamp || 'Sincronizado';
    updateChart(Math.floor(Math.random() * 10) + 1);
  }

  if (data.event === 'commit_update') {
    if (lastCommit) lastCommit.textContent = data.commit;
  }
};

window.onload = initChart;
