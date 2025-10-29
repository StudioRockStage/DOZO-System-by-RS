import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    icon: path.join(__dirname, '../Dashboard/public/assets/rockstage-icon.icns')
  });
  win.loadFile(path.join(__dirname, '../Dashboard/public/index.html'));
}
app.whenReady().then(createWindow);