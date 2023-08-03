const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 940,
    height: 520,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('create-folders', (event, selectedFolder, configData, selectedVersion) => {
    const { createFoldersFromConfig } = require('./renderer.js');
    try {
      createFoldersFromConfig(selectedFolder, configData, selectedVersion);
      event.reply('folder-creation-result', true);
    } catch (err) {
      console.error('Error creating folders:', err);
      event.reply('folder-creation-result', false);
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
