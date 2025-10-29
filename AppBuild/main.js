const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🚀 DOZO Control Center v2.3.0 - Electron AutoPath Repair');
console.log('═══════════════════════════════════════════════════════');

function resolveDashboardPath() {
  console.log('\n🔍 Detectando entorno de ejecución...');
  console.log('process.resourcesPath:', process.resourcesPath);
  console.log('__dirname:', __dirname);
  console.log('app.isPackaged:', app.isPackaged);
  
  // Rutas posibles para el index.html
  const paths = [
    // Opción 1: Dashboard principal (desarrollo)
    path.join(__dirname, '../Dashboard/public/index.html'),
    // Opción 2: Dashboard principal (producción con extraResources)
    path.join(process.resourcesPath, 'Dashboard/public/index.html'),
    // Opción 3: AppBuild public (fallback desarrollo)
    path.join(__dirname, 'public/index.html'),
    // Opción 4: AppBuild public (fallback producción)
    path.join(process.resourcesPath, 'app/AppBuild/public/index.html'),
    // Opción 5: Dentro del asar (producción)
    path.join(__dirname, '../Dashboard/public/index.html').replace('app.asar', 'app.asar.unpacked')
  ];
  
  console.log('\n🔎 Buscando index.html en las siguientes rutas:');
  
  for (let i = 0; i < paths.length; i++) {
    const testPath = paths[i];
    console.log(`  [${i + 1}] ${testPath}`);
    
    if (fs.existsSync(testPath)) {
      console.log(`  ✅ ¡Encontrado!`);
      
      if (i === 0 || i === 2) {
        console.log('\n🧠 Entorno detectado: DESARROLLO');
      } else {
        console.log('\n🚀 Entorno detectado: PRODUCCIÓN');
      }
      
      return testPath;
    } else {
      console.log(`  ❌ No existe`);
    }
  }
  
  console.error('\n❌ ERROR CRÍTICO: No se encontró index.html en ninguna ruta');
  console.log('\n📋 Información de diagnóstico:');
  console.log('  - CWD:', process.cwd());
  console.log('  - Electron version:', process.versions.electron);
  console.log('  - Node version:', process.versions.node);
  
  return null;
}

function createWindow() {
  console.log('\n🪟 Creando ventana principal...');
  
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#101116',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/rockstage-icon.icns'),
    show: false // No mostrar hasta que esté listo
  });

  // Mostrar ventana cuando esté lista
  win.once('ready-to-show', () => {
    console.log('✅ Ventana lista para mostrar');
    win.show();
  });

  // Log de eventos de carga
  win.webContents.on('did-start-loading', () => {
    console.log('⏳ Iniciando carga de contenido...');
  });

  win.webContents.on('did-finish-load', () => {
    console.log('✅ Contenido cargado exitosamente');
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Error al cargar contenido:', errorCode, errorDescription);
  });

  // Abrir DevTools en desarrollo
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }

  const htmlPath = resolveDashboardPath();
  
  if (htmlPath) {
    console.log(`\n📄 Cargando: ${htmlPath}`);
    
    win.loadFile(htmlPath).catch(err => {
      console.error('❌ Error al cargar index.html:', err);
      // Mostrar página de error
      win.loadURL(`data:text/html,
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error - DOZO Control Center</title>
          <style>
            body {
              background: #101116;
              color: #E6C185;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .error-container {
              text-align: center;
              max-width: 600px;
            }
            h1 { color: #ff6b6b; }
            pre {
              background: #1a1a1a;
              padding: 15px;
              border-radius: 8px;
              overflow: auto;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>❌ Error al cargar DOZO Control Center</h1>
            <p>No se pudo cargar el archivo index.html</p>
            <h3>Información de error:</h3>
            <pre>${err.message}</pre>
            <p>Por favor, contacta al soporte técnico.</p>
          </div>
        </body>
        </html>
      `);
    });
  } else {
    console.error('❌ No se puede crear la ventana sin un archivo HTML válido');
    // Mostrar página de error crítico
    win.loadURL(`data:text/html,
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error Crítico - DOZO Control Center</title>
        <style>
          body {
            background: #101116;
            color: #E6C185;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .error-container {
            text-align: center;
            max-width: 800px;
          }
          h1 { color: #ff6b6b; }
          pre {
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
            overflow: auto;
            text-align: left;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>❌ Error Crítico - No se encontró index.html</h1>
          <h3>Rutas verificadas:</h3>
          <pre>${[
            path.join(__dirname, '../Dashboard/public/index.html'),
            path.join(process.resourcesPath, 'Dashboard/public/index.html'),
            path.join(__dirname, 'public/index.html')
          ].join('\n')}</pre>
          <h3>Información del sistema:</h3>
          <pre>
__dirname: ${__dirname}
process.resourcesPath: ${process.resourcesPath}
app.isPackaged: ${app.isPackaged}
process.cwd(): ${process.cwd()}
          </pre>
          <p><strong>Solución:</strong> Reinstala la aplicación o contacta al soporte técnico.</p>
        </div>
      </body>
      </html>
    `);
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

app.whenReady().then(() => {
  console.log('\n✅ Electron app ready');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('🔴 Todas las ventanas cerradas');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('🔄 App activada');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('📦 DOZO Electron AutoPath Repair inicializado');
