const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

async function createFoldersFromConfig(basePath, configData, selectedVersion) {
  const folderMap = new Map(configData.FolderCreation.map(folder => [folder['@id'], folder]));

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

  const rootFolders = configData.FolderCreation.filter(folder => folder['@root'] === '@root@');
  for (const rootFolder of rootFolders) {
    createFolderRecursive(rootFolder['@id'], basePath);
  }
}

document.getElementById('create-button').addEventListener('click', function () {
  const selectedFolder = document.getElementById('folder-picker').value;
  const selectedVersion = document.getElementById('version-select').value;

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
        createFoldersFromConfig(selectedFolder, configData, selectedVersion);
        ipcRenderer.send('folder-creation-result', true);
      } catch (err) {
        console.error('Error creating folders:', err);
        ipcRenderer.send('folder-creation-result', false);
      }
    });
  });
});

ipcRenderer.on('folder-creation-result', (event, success) => {
  if (success) {
    alert('Ordner wurden erfolgreich erstellt!');
  } else {
    alert('Es gab ein Problem beim Erstellen der Ordner');
  }
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











