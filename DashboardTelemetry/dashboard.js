// DOZO Telemetry Dashboard v2.2.0 - Frontend Logic
// Autor: RockStage Solutions / David Alejandro Pérez Rea

let updateInterval;
let isUpdating = false;

// Actualizar dashboard con datos del servidor
async function updateDashboard() {
  if (isUpdating) return;
  isUpdating = true;
  
  try {
    const res = await fetch("/api/metrics");
    const data = await res.json();
    
    // Actualizar timestamp
    const now = new Date();
    document.getElementById("last-update").textContent = 
      `Última actualización: ${now.toLocaleTimeString()}`;
    
    if (data.error) {
      document.getElementById("integrity-files").textContent = data.error;
      document.getElementById("integrity-dirs").textContent = data.error;
      isUpdating = false;
      return;
    }
    
    // Actualizar nombre del reporte
    document.getElementById("report-name").textContent = 
      `Reporte: ${data.reportFile || 'N/A'}`;
    
    // Actualizar métricas del sistema
    updateSystemMetrics(data.system);
    
    // Actualizar integridad
    updateIntegrity(data.telemetry.integrity);
    
    // Actualizar estado de IA
    updateAIStatus(data.telemetry.aiSyncContext);
    
    // Actualizar análisis de salud
    updateHealthAnalysis(data.telemetry.healthAnalysis);
    
    // Actualizar auditoría de fases
    updatePhaseAudit(data.telemetry.previousPhases);
    
  } catch (error) {
    console.error("Error actualizando dashboard:", error);
    document.getElementById("integrity-files").textContent = 
      `Error de conexión: ${error.message}\n\nAsegúrate de que telemetry-server.js esté ejecutándose.`;
  }
  
  isUpdating = false;
}

// Actualizar métricas del sistema
function updateSystemMetrics(sys) {
  document.getElementById("cpu").textContent = `${sys.cpu} núcleos`;
  document.getElementById("cpu-model").textContent = sys.cpuModel || "Unknown CPU";
  
  document.getElementById("mem").textContent = 
    `${sys.memUsed} GB / ${sys.memTotal} GB`;
  document.getElementById("mem-percent").textContent = 
    `Uso: ${sys.memUsagePercent}%`;
  
  // Actualizar barra de progreso de memoria
  const memFill = document.getElementById("mem-fill");
  memFill.style.width = `${sys.memUsagePercent}%`;
  
  // Cambiar color según uso
  if (sys.memUsagePercent > 80) {
    memFill.style.background = "linear-gradient(90deg, #f44336 0%, #ff5722 100%)";
  } else if (sys.memUsagePercent > 60) {
    memFill.style.background = "linear-gradient(90deg, #ffc107 0%, #ffeb3b 100%)";
  } else {
    memFill.style.background = "linear-gradient(90deg, #E6C185 0%, #f5d9a0 100%)";
  }
  
  document.getElementById("uptime").textContent = `${sys.uptime} horas`;
  document.getElementById("hostname").textContent = 
    `${sys.hostname} (${sys.platform})`;
}

// Actualizar integridad del sistema
function updateIntegrity(integrity) {
  if (!integrity) {
    document.getElementById("integrity-files").textContent = "No disponible";
    document.getElementById("integrity-dirs").textContent = "No disponible";
    return;
  }
  
  // Archivos críticos
  if (integrity.coreFiles) {
    const filesFormatted = Object.entries(integrity.coreFiles)
      .map(([file, hash]) => {
        if (hash === null) {
          return `❌ ${file}: MISSING`;
        } else if (hash.startsWith("ERROR")) {
          return `⚠️ ${file}: ${hash}`;
        } else {
          return `✅ ${file}\n   ${hash.substring(0, 16)}...`;
        }
      })
      .join('\n\n');
    
    document.getElementById("integrity-files").textContent = filesFormatted;
  }
  
  // Directorios
  if (integrity.directories) {
    const dirsFormatted = Object.entries(integrity.directories)
      .map(([dir, info]) => {
        const status = info.status === "OK" ? "✅" : 
                      info.status === "MISSING" ? "❌" : "⚠️";
        const files = info.files ? `${info.files} archivos` : "N/A";
        const size = info.sizeMB ? `${info.sizeMB} MB` : "N/A";
        return `${status} ${dir}\n   ${files}, ${size}`;
      })
      .join('\n\n');
    
    document.getElementById("integrity-dirs").textContent = dirsFormatted;
  }
}

// Actualizar estado de IA
function updateAIStatus(aiContext) {
  if (!aiContext) return;
  
  const aiGrid = document.getElementById("ai-bridge");
  aiGrid.innerHTML = '';
  
  // Cursor AI
  if (aiContext.cursorAI) {
    const cursorCard = createAICard(
      "Cursor AI",
      aiContext.cursorAI.status,
      aiContext.cursorAI.capabilities || []
    );
    aiGrid.appendChild(cursorCard);
  }
  
  // Claude AI
  if (aiContext.claudeAI) {
    const claudeCard = createAICard(
      "Claude AI",
      aiContext.claudeAI.status,
      aiContext.claudeAI.capabilities || []
    );
    aiGrid.appendChild(claudeCard);
  }
  
  // ChatGPT
  if (aiContext.chatGPT) {
    const chatgptCard = createAICard(
      "ChatGPT",
      aiContext.chatGPT.status,
      aiContext.chatGPT.capabilities || []
    );
    aiGrid.appendChild(chatgptCard);
  }
}

// Crear tarjeta de IA
function createAICard(name, status, capabilities) {
  const card = document.createElement('div');
  card.className = 'ai-card';
  
  const statusEmoji = status === "ACTIVE" ? "🟢" :
                     status === "STANDBY" ? "🟡" : "🔴";
  
  card.innerHTML = `
    <h3>${name}</h3>
    <p class="ai-status-indicator">${statusEmoji} ${status}</p>
    <p class="ai-capabilities">${capabilities.join(', ')}</p>
  `;
  
  return card;
}

// Actualizar análisis de salud
function updateHealthAnalysis(healthAnalysis) {
  if (!healthAnalysis) return;
  
  // Estado general
  const statusEl = document.getElementById("overall-status");
  statusEl.textContent = healthAnalysis.overallStatus || "UNKNOWN";
  statusEl.className = "status-badge";
  
  if (healthAnalysis.overallStatus === "HEALTHY") {
    statusEl.classList.add("healthy");
  } else {
    statusEl.classList.add("warning");
  }
  
  // Advertencias
  const warningsList = document.getElementById("warnings-list");
  warningsList.innerHTML = '';
  
  if (healthAnalysis.warnings && healthAnalysis.warnings.length > 0) {
    healthAnalysis.warnings.forEach(warning => {
      const li = document.createElement('li');
      li.textContent = warning;
      warningsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = "Sin advertencias detectadas";
    li.style.color = "#4caf50";
    warningsList.appendChild(li);
  }
  
  // Recomendaciones
  const recommendationsList = document.getElementById("recommendations-list");
  recommendationsList.innerHTML = '';
  
  if (healthAnalysis.recommendations && healthAnalysis.recommendations.length > 0) {
    healthAnalysis.recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.textContent = rec;
      recommendationsList.appendChild(li);
    });
  }
}

// Actualizar auditoría de fases
function updatePhaseAudit(previousPhases) {
  if (!previousPhases) return;
  
  const phasesGrid = document.getElementById("phases-grid");
  phasesGrid.innerHTML = '';
  
  previousPhases.forEach(phase => {
    const card = document.createElement('div');
    card.className = 'phase-card';
    
    if (phase.status === "VERIFIED") {
      card.classList.add("verified");
    } else if (phase.status === "MISSING") {
      card.classList.add("missing");
    }
    
    const statusEmoji = phase.status === "VERIFIED" ? "✅" : "❌";
    
    card.innerHTML = `
      <div class="phase-number">Fase ${phase.phase}</div>
      <div class="phase-status">${statusEmoji} ${phase.reportCount} reportes</div>
    `;
    
    phasesGrid.appendChild(card);
  });
}

// Inicializar dashboard
function initDashboard() {
  console.log("🚀 Inicializando DOZO Telemetry Dashboard v2.2.0");
  
  // Primera actualización inmediata
  updateDashboard();
  
  // Actualizar cada 5 segundos
  updateInterval = setInterval(updateDashboard, 5000);
  
  console.log("✅ Dashboard inicializado - Actualizando cada 5 segundos");
}

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}


