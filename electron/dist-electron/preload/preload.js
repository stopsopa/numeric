"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => electron_1.ipcRenderer.invoke('save-settings', settings),
    getCurrentUser: () => electron_1.ipcRenderer.invoke('get-current-user'),
    saveCurrentUser: (user) => electron_1.ipcRenderer.invoke('save-current-user', user),
    getLeaderboard: () => electron_1.ipcRenderer.invoke('get-leaderboard'),
    saveLeaderboard: (leaderboard) => electron_1.ipcRenderer.invoke('save-leaderboard', leaderboard),
});
