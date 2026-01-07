import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.join(os.homedir(), 'numeric');
if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}
function getFilePath(filename) {
    return path.join(STORAGE_PATH, filename);
}
function readJson(filename, defaultValue = {}) {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        catch (e) {
            console.error(`Error reading ${filename}:`, e);
        }
    }
    return defaultValue;
}
function writeJson(filename, data) {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
// IPC Handlers
ipcMain.handle('get-settings', () => readJson('settings.json'));
ipcMain.handle('save-settings', (_, settings) => writeJson('settings.json', settings));
ipcMain.handle('get-current-user', () => readJson('current_user.json', { username: '' }));
ipcMain.handle('save-current-user', (_, user) => writeJson('current_user.json', user));
ipcMain.handle('get-leaderboard', () => readJson('leaderboard.json', []));
ipcMain.handle('save-leaderboard', (_, leaderboard) => writeJson('leaderboard.json', leaderboard));
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        win.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
}
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
