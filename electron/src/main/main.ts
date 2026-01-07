import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

console.log('App starting...', { _dirname });

let mainWindow: BrowserWindow | null = null;

const DATA_DIR = path.join(os.homedir(), 'numeric');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');
const CURRENT_USER_PATH = path.join(DATA_DIR, 'current_user.json');
const LEADERBOARD_PATH = path.join(DATA_DIR, 'leaderboard.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory', err);
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(_dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Numerical Keyboard Trainer',
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(_dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await ensureDataDir();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('read-settings', async () => {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
});

ipcMain.handle('write-settings', async (_, settings) => {
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
});

ipcMain.handle('read-current-user', async () => {
  try {
    const data = await fs.readFile(CURRENT_USER_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
});

ipcMain.handle('write-current-user', async (_, user) => {
  await fs.writeFile(CURRENT_USER_PATH, JSON.stringify(user, null, 2));
});

ipcMain.handle('read-leaderboard', async () => {
  try {
    const data = await fs.readFile(LEADERBOARD_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
});

ipcMain.handle('write-leaderboard', async (_, leaderboard) => {
  await fs.writeFile(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2));
});

ipcMain.handle('get-sounds', async () => {
  try {
    // In production, sounds are in the resources folder
    // In dev, they are in public/sounds
    const soundsDir = app.isPackaged 
      ? path.join(process.resourcesPath, 'app', 'dist', 'sounds')
      : path.join(_dirname, '../../public/sounds');
    
    console.log('Fetching sounds from:', soundsDir);
    
    const listPath = path.join(soundsDir, 'list.json');
    const data = await fs.readFile(listPath, 'utf-8');
    const sounds = JSON.parse(data);
    console.log('Sounds loaded:', sounds.length);
    return sounds;
  } catch (err) {
    console.error('Failed to read sounds list', err);
    return [];
  }
});

ipcMain.handle('open-external', async (_, url) => {
  shell.openExternal(url);
});
