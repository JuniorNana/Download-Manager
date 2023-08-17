// Einbinden der benötigten Module
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Funktion zum Erzeugen von Ordnern basierend auf der ausgewählten proALPHA-Version
async function createFoldersFromConfig(basePath, configData, selectedVersion) {
  // Erstelle eine Map aus den Ordnereinstellungen der Konfigurationsdaten
  const folderMap = new Map(configData.FolderCreation.map(folder => [folder['@id'], folder]));

  // Rekursive Hilfsfunktion zum Erzeugen von Ordnern
  const createFolderRecursive = (folderId, parentPath) => {
    const folder = folderMap.get(folderId);
    if (!folder) return;

    let folderName = folder['@name'];
    if (folderName === '@version@') {
      folderName = selectedVersion;
    }

    const fullPath = path.join(parentPath, folderName);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }

    for (const subFolder of configData.FolderCreation) {
      if (subFolder['@root'] === folderId) {
        createFolderRecursive(subFolder['@id'], fullPath);
      }
    }
  };

  // Beginne mit der Erzeugung von Root-Ordnern
  const rootFolders = configData.FolderCreation.filter(folder => folder['@root'] === '@root@');
  for (const rootFolder of rootFolders) {
    createFolderRecursive(rootFolder['@id'], basePath);
  }
}

// Event-Listener, der beim Klicken des "create-button" ausgelöst wird
document.getElementById('create-button').addEventListener('click', function () {
  // Ausgewählten Ordner und Version abrufen
  const selectedFolder = document.getElementById('folder-picker').value;
  const selectedVersion = document.getElementById('version-select').value;

  // Überprüfe, ob der ausgewählte Pfad ein Ordner ist
  fs.lstat(selectedFolder, (err, stats) => {
    if (err) {
      console.error('Error accessing selected folder:', err);
      alert('Ein Fehler ist aufgetreten beim Zugriff auf den ausgewählten Ordner');
      return;
    }
    if (!stats.isDirectory()) {
      alert('Bitte wählen Sie einen Ordner aus, keine Datei');
      return;
    }

    // Lese die Konfigurationsdatei
    fs.readFile(path.join(__dirname, 'config.json'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading config file:', err);
        alert('Ein Fehler ist aufgetreten beim Lesen der Konfigurationsdatei');
        return;
      }

      // Parse die Konfigurationsdatei
      let configData;
      try {
        configData = JSON.parse(data);
      } catch (err) {
        console.error('Error parsing config file:', err);
        alert('Ein Fehler ist aufgetreten beim Parsen der Konfigurationsdatei');
        return;
      }

      // Versuche, Ordner zu erstellen
      try {
        createFoldersFromConfig(selectedFolder, configData, selectedVersion);
        ipcRenderer.send('folder-creation-result', true);
      } catch (err) {
        console.error('Error creating folders:', err);
        ipcRenderer.send('folder-creation-result', false);
      }
    });
  });
});

// Behandle das Ergebnis des Ordnererstellungsprozesses
ipcRenderer.on('folder-creation-result', (event, success) => {
  if (success) {
    alert('Ordner wurden erfolgreich erstellt!');
  } else {
    alert('Es gab ein Problem beim Erstellen der Ordner');
  }
});

// Referenzen auf HTML-Elemente
const versionSelect = document.getElementById('version-select');
const tableContainer = document.getElementById('table-container');

// Event-Listener für das Laden des Dokuments
document.addEventListener('DOMContentLoaded', function() {
  // Erstelle eine Tabelle, wenn das Dokument geladen wird
  const table = document.createElement('table');
  table.setAttribute('border', '1');
  table.style.backgroundColor = 'white';
  tableContainer.appendChild(table);
});

// Event-Listener für Änderungen im Version-Auswahl-Dropdown
versionSelect.addEventListener('change', function () {
  // Ausgewählte Version abrufen
  const selectedVersion = versionSelect.value;
  if (selectedVersion !== '') {
    fetch('../prepare.json')
      .then(response => response.json())
      .then(data => {
        const downloads = data.padownloads.find(download => download._version === selectedVersion);
        if (downloads) {
          // Erstelle eine Tabelle basierend auf der ausgewählten Version
          const table = document.createElement('table');
          table.setAttribute('border', '1');
          table.style.backgroundColor = 'white';

          // Erstelle Tabellenheader
          const headerRow = document.createElement('tr');
          ['chk', '_name', 'filename', 'destination', 'status'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
          });
          table.appendChild(headerRow);

          // Befülle die Tabelle mit Daten
          downloads.download.forEach(download => {
            const row = document.createElement('tr');
            ['chk', '_name', 'filename', 'destination', 'status'].forEach(key => {
              const td = document.createElement('td');
              if (key === 'chk') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                td.appendChild(checkbox);
              } else {
                td.textContent = download[key] || '';
              }
              row.appendChild(td);
            });
            table.appendChild(row);
          });

          // Setze den Tabelleninhalt zurück und füge die neue Tabelle hinzu
          tableContainer.innerHTML = '';
          tableContainer.appendChild(table);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  } else {
    tableContainer.innerHTML = '';
  }
});