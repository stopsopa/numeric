import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
  saveCurrentUser: (user: any) => ipcRenderer.invoke('save-current-user', user),
  getLeaderboard: () => ipcRenderer.invoke('get-leaderboard'),
  saveLeaderboard: (leaderboard: any) => ipcRenderer.invoke('save-leaderboard', leaderboard),
});
