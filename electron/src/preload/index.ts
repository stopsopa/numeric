import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  readSettings: () => ipcRenderer.invoke('read-settings'),
  writeSettings: (settings: any) => ipcRenderer.invoke('write-settings', settings),
  readCurrentUser: () => ipcRenderer.invoke('read-current-user'),
  writeCurrentUser: (user: any) => ipcRenderer.invoke('write-current-user', user),
  readLeaderboard: () => ipcRenderer.invoke('read-leaderboard'),
  writeLeaderboard: (leaderboard: any) => ipcRenderer.invoke('write-leaderboard', leaderboard),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});
