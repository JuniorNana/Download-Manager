const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

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
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});


ipcMain.on('folder-creation-result', (event, success) => {
  if (success) {
    event.reply('folder-creation-result', true);
  } else {
    console.error('Es gab ein Problem beim Erstellen der Ordner');
    event.reply('folder-creation-result', false);
  }
});