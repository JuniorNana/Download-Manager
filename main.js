// Einbinden der notwendigen Electron-Module und der 'path'-Bibliothek
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// Funktion zum Erstellen des Hauptfensters der Anwendung
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 940,
    height: 520,
    resizable: true,              //Erlaubt die Vergrößerung der App
    webPreferences: {
      nodeIntegration: true,      // Erlaubt die Verwendung von Node.js-Funktionen im Renderer-Prozess
      contextIsolation: false,    // Deaktiviert die Kontextisolierung
    }
  });

  // Lädt die Haupt-HTML-Datei der Anwendung
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}
// Dieser Code wird ausgeführt, sobald Electron die Initialisierung abgeschlossen hat
app.whenReady().then(() => {
  // Erstellt das Hauptfenster
  createWindow();
  // Stellt sicher, dass ein neues Fenster erstellt wird, wenn die App aktiviert wird und kein Fenster offen ist
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  // IPC-Listener: Erwartet eine Nachricht vom Renderer-Prozess zum Erstellen von Ordnern
  ipcMain.on('create-folders', (event, selectedFolder, configData, selectedVersion) => {
    // Importiert die 'createFoldersFromConfig'-Funktion aus 'renderer.js'
    const { createFoldersFromConfig } = require('./renderer.js');
    try {
      createFoldersFromConfig(selectedFolder, configData, selectedVersion);
      event.reply('folder-creation-result', true);  // Informiert den Renderer-Prozess, dass die Ordner erfolgreich erstellt wurden
    } catch (err) {
      console.error('Error creating folders:', err);
      event.reply('folder-creation-result', false); // Informiert den Renderer-Prozess über einen Fehler beim Erstellen von Ordnern
    }
  });
});
// Schließt die Anwendung, wenn alle Fenster geschlossen sind (außer auf macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});