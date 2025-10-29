/*
═══════════════════════════════════════════════════════════════
🧩 DOZO AppSync WebSocket Client v2.6.3
Autor: RockStage Solutions
Descripción:
Cliente WebSocket para recibir eventos de telemetría en tiempo real
desde el Live WebSocket Event Bridge.
═══════════════════════════════════════════════════════════════
*/

const ws = new WebSocket("ws://localhost:9091");

ws.onopen = () => {
  console.log("📡 Conectado al Event Bridge");
  updateConnectionStatus("Conectado", "success");
};

ws.onmessage = (msg) => {
  try {
    const data = JSON.parse(msg.data);
    console.log("📨 Evento recibido:", data.event);

    if (data.event === "telemetry_update") {
      updateTelemetryStatus(data);
    }

    if (data.event === "commit_update") {
      updateLastCommit(data);
    }
  } catch (err) {
    console.error("❌ Error procesando mensaje:", err.message);
  }
};

ws.onclose = () => {
  console.log("📡 Desconectado del Event Bridge");
  updateConnectionStatus("Desconectado", "error");
  
  // Intentar reconectar después de 5 segundos
  setTimeout(() => {
    console.log("🔄 Intentando reconectar...");
    location.reload();
  }, 5000);
};

ws.onerror = (error) => {
  console.error("❌ Error en WebSocket:", error);
  updateConnectionStatus("Error de conexión", "error");
};

function updateConnectionStatus(status, type) {
  const statusElement = document.getElementById("connection-status");
  if (statusElement) {
    statusElement.textContent = status;
    statusElement.className = `status-${type}`;
  }
}

function updateTelemetryStatus(data) {
  const elements = {
    "telemetry-status": `Última sincronización: ${formatTimestamp(data.timestamp)} – Estado: ${data.status}`,
    "user-info": `Usuario: ${data.user}`,
    "repo-info": `Repositorio: ${data.repo}`,
    "branch-info": `Rama: ${data.branch}`,
    "version-info": `Versión: ${data.version}`,
    "commit-info": `Último commit: ${data.lastCommit}`
  };

  Object.entries(elements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  });
}

function updateLastCommit(data) {
  const lastCommitElement = document.getElementById("last-commit");
  if (lastCommitElement) {
    lastCommitElement.textContent = `Último commit: ${data.commit}`;
  }
}

function formatTimestamp(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch (err) {
    return timestamp;
  }
}

// Función para enviar comando al servidor (opcional)
function sendCommand(command, data = {}) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ command, ...data }));
  } else {
    console.warn("⚠️ WebSocket no está conectado");
  }
}

// Exportar funciones para uso global
window.AppSyncClient = {
  sendCommand,
  updateTelemetryStatus,
  updateLastCommit,
  isConnected: () => ws.readyState === WebSocket.OPEN
};
