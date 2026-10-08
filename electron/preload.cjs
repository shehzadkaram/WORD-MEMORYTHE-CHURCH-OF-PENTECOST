/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Secure Desktop Preload Bridge
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronDesktopAPI', {
  isDesktop: true,
  platform: 'win32',
  appName: 'WORD MEMORY',
  appVersion: '1.0.0',
  churchName: 'The Church of Pentecost Dubai - Pakistani & Indian Worship Centre',
  getDesktopPaths: () => ipcRenderer.invoke('get-desktop-paths'),
  openBackupFolder: () => ipcRenderer.invoke('open-backup-folder'),
  getAppMetadata: () => ipcRenderer.invoke('get-app-metadata'),
});
