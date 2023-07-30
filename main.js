const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

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

ipcMain.on('perform-login', async (event, arg) => {
  const { username, password } = arg;
  try {
    const response = await axios.post('https://sysportal.proalpha.com/files/index.php', { username, password });
    if (response.status === 200) {
      event.reply('login-result', true);
    } else {
      event.reply('login-result', false);
    }
  } catch (error) {
    console.error(error);
    event.reply('login-result', false);
  }
});

ipcMain.on('create-folders', (event, arg) => {
  const { selectedFolder, selectedVersion } = arg;
  const baseFolder = path.join(selectedFolder, 'pA-Install');
  const versionFolder = path.join(baseFolder, selectedVersion);
  const openedgeFolder = path.join(baseFolder, 'openedge');
  const thirdpartyFolder = path.join(baseFolder, 'thirdparty');

  try {
    if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);
    if (!fs.existsSync(versionFolder)) fs.mkdirSync(versionFolder);
    if (!fs.existsSync(openedgeFolder)) fs.mkdirSync(openedgeFolder);
    if (!fs.existsSync(thirdpartyFolder)) fs.mkdirSync(thirdpartyFolder);
    event.reply('folder-creation-result', true);
  } catch (error) {
    console.error(error);
    event.reply('folder-creation-result', false);
  }
});