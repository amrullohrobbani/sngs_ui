import { app, protocol, BrowserWindow } from 'electron';
import path from 'path';
import { exec } from 'child_process';
// import { fileURLToPath } from 'url';

let mainWindow = null;
let nextServer = null;

// const __dirname = path.dirname(fileURLToPath(import.meta.url))


import { createHandler } from 'next-electron-rsc';

const appPath = app.getAppPath();
const isDev = process.env.NODE_ENV === 'development';
const localhostUrl = 'http://localhost:3000'; // must match Next.js dev server

// change to your path, make sure it's added to Electron Builder files
const standaloneDir = path.join(appPath, '.next', 'standalone', 'demo');

const { createInterceptor } = createHandler({
  standaloneDir,
  staticDir,
  localhostUrl,
  protocol,
});

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

  mainWindow.loadURL(`http://localhost:3000`); // Load the Next.js app

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
      if (!isDev) createInterceptor({ session: mainWindow.webContents.session });
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
