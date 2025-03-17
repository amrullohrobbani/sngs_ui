import { app, BrowserWindow } from 'electron';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

let mainWindow = null;
let nextServer = null;

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(`file://${path.join(__dirname, '.next/server/pages/index.html')}`); // Load the Next.js app

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Start the Next.js production server
  nextServer = exec('npm run start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Next.js: ${error}`);
    }
    console.log(stdout);
    console.error(stderr);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill(); // Kill the Next.js server when Electron quits
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
