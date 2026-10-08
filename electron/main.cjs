/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Windows Desktop Application - Electron Main Process
 * 
 * Production Characteristics:
 * - 100% Offline-first local operation
 * - Local database stored securely in %APPDATA%\WordMemory\Local Storage
 * - Backups archived safely in %USERPROFILE%\Documents\WordMemoryBackups
 * - Non-destructive uninstall (user data preserved on uninstall/upgrade)
 * - Zero runtime network dependency for Bible memorization
 */

const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const APP_TITLE = 'WORD MEMORY - The Church of Pentecost Dubai';
const CHURCH_NAME = 'The Church of Pentecost Dubai - Pakistani & Indian Worship Centre';

// Enforce Windows User Data Isolation
const appDataPath = app.getPath('appData');
const userDataPath = path.join(appDataPath, 'WordMemory');
const backupsPath = path.join(app.getPath('documents'), 'WordMemoryBackups');
const logsPath = path.join(userDataPath, 'logs');

// Set isolated user data directory
app.setPath('userData', userDataPath);

// Ensure essential Windows directories exist
try {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  if (!fs.existsSync(backupsPath)) {
    fs.mkdirSync(backupsPath, { recursive: true });
  }
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true });
  }
} catch (e) {
  console.warn('Failed to ensure directory structure:', e);
}

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: APP_TITLE,
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#F8FAFC',
    show: false,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Native Windows Application Menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Backups Folder',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            shell.openPath(backupsPath);
          },
        },
        {
          label: 'Open Data Folder',
          click: () => {
            shell.openPath(userDataPath);
          },
        },
        { type: 'separator' },
        {
          label: 'Exit WORD MEMORY',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
        { role: 'toggleDevTools', accelerator: 'Ctrl+Shift+I' },
        { type: 'separator' },
        { role: 'resetZoom', accelerator: 'CmdOrCtrl+0' },
        { role: 'zoomIn', accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut', accelerator: 'CmdOrCtrl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen', accelerator: 'F11' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About WORD MEMORY',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About WORD MEMORY',
              message: 'WORD MEMORY — Production v1.0.0',
              detail: `${CHURCH_NAME}\n\nOfficial Bible Verse Memorization & Spiritual Growth Platform.\nOffline-First Architecture with Local WordPocket Urdu Bible Database.\n\nDatabase: ${userDataPath}\nBackups: ${backupsPath}`,
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load the production distribution build
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    // Development fallback
    mainWindow.loadURL('http://localhost:3000');
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-desktop-paths', async () => {
  return {
    userData: userDataPath,
    backups: backupsPath,
    logs: logsPath,
    database: path.join(userDataPath, 'Local Storage'),
  };
});

ipcMain.handle('open-backup-folder', async () => {
  return shell.openPath(backupsPath);
});

ipcMain.handle('get-app-metadata', async () => {
  return {
    appName: 'WORD MEMORY',
    version: '1.0.0',
    church: CHURCH_NAME,
    offlineReady: true,
  };
});

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
