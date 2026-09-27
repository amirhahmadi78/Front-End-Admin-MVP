import { app, BrowserWindow } from "electron";
import path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const indexPath = path.join(app.getAppPath(), "dist/index.html");

  win.loadFile(indexPath);

  // win.webContents.openDevTools()
}

app.whenReady().then(createWindow);
