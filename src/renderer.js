const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Funktion zum rekursiven Erstellen von Ordnern basierend auf Config.json
async function createFoldersFromConfig(basePath, configData) {
  const folderMap = new Map(configData.FolderCreation.map(folder => [folder['@id'], folder]));
  const createFolderRecursive = (folder) => {
    if (folder['@root'] !== '@root@') {
      const parentFolder = folderMap.get(folder['@root']);
      createFolderRecursive(parentFolder);
    }
    const fullPath = path.join(basePath, folder['@name']);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
  };

  for (const folder of configData.FolderCreation) {
    createFolderRecursive(folder);
  }
}

document.getElementById('create-button').addEventListener('click', function() {
  const selectedFolder = document.getElementById('folder-picker').value;

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

    fs.readFile(path.join(__dirname, 'config.json'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading config file:', err);
        alert('Ein Fehler ist aufgetreten beim Lesen der Konfigurationsdatei');
        return;
      }

      let configData;
      try {
        configData = JSON.parse(data);
      } catch (err) {
        console.error('Error parsing config file:', err);
        alert('Ein Fehler ist aufgetreten beim Parsen der Konfigurationsdatei');
        return;
      }

      try {
        createFoldersFromConfig(selectedFolder, configData);
        ipcRenderer.send('folder-creation-result', true);
      } catch (err) {
        console.error('Error creating folders:', err);
        ipcRenderer.send('folder-creation-result', false);
      }
    });
  });
});

const versionSelect = document.getElementById('version-select');
const tableContainer = document.getElementById('table-container');

document.addEventListener('DOMContentLoaded', function() {
  const table = document.createElement('table');
  table.setAttribute('border', '1');
  table.style.backgroundColor = 'white';
  tableContainer.appendChild(table);
});

versionSelect.addEventListener('change', function () {
  const selectedVersion = versionSelect.value;
  if (selectedVersion !== '') {
    fetch('../prepare.json')
      .then(response => response.json())
      .then(data => {
        const downloads = data.padownloads.find(download => download._version === selectedVersion);
        if (downloads) {
          const table = document.createElement('table');
          table.setAttribute('border', '1');
          table.style.backgroundColor = 'white';

          const headerRow = document.createElement('tr');
          ['chk', '_name', 'filename', 'destination', 'status'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
          });
          table.appendChild(headerRow);

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

ipcRenderer.on('folder-creation-result', (event, success) => {
  if (success) {
    alert('Ordner wurden erfolgreich erstellt!');
  } else {
    alert('Es gab ein Problem beim Erstellen der Ordner');
  }
});
