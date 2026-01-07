"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    readSettings: () => electron_1.ipcRenderer.invoke('read-settings'),
    writeSettings: (settings) => electron_1.ipcRenderer.invoke('write-settings', settings),
    readCurrentUser: () => electron_1.ipcRenderer.invoke('read-current-user'),
    writeCurrentUser: (user) => electron_1.ipcRenderer.invoke('write-current-user', user),
    readLeaderboard: () => electron_1.ipcRenderer.invoke('read-leaderboard'),
    writeLeaderboard: (leaderboard) => electron_1.ipcRenderer.invoke('write-leaderboard', leaderboard),
    openExternal: (url) => electron_1.ipcRenderer.invoke('open-external', url),
});
