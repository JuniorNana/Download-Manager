const { ipcRenderer } = require('electron');
const fs = require('fs');

// Die Funktion für den Login
document.getElementById('login-button').addEventListener('click', function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  ipcRenderer.send('perform-login', { username, password });
});

document.getElementById('create-button').addEventListener('click', function() {
  const selectedFolder = document.getElementById('folder-picker').value;

  // Überprüfen, ob der ausgewählte Pfad ein Ordner ist und nicht eine Datei
  fs.lstat(selectedFolder, (err, stats) => {
    if (err) throw err;
    if (stats.isDirectory()) {
      const selectedVersion = document.getElementById('version-select').value;
      ipcRenderer.send('create-folders', { selectedFolder, selectedVersion });
    } else {
      alert('Bitte wählen Sie einen Ordner aus, keine Datei');
    }
  });
});

const versionSelect = document.getElementById('version-select');
const tableContainer = document.getElementById('table-container');

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
                // Erstelle eine Checkbox für die "chk"-Spalte
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

ipcRenderer.on('login-result', (event, success) => {
  if (success) {
    alert('Login erfolgreich!');
  } else {
    alert('Login fehlgeschlagen!');
  }
});

ipcRenderer.on('folder-creation-result', (event, success) => {
  if (success) {
    alert('Ordner wurden erfolgreich erstellt!');
  } else {
    alert('Es gab ein Problem beim Erstellen der Ordner');
  }
});