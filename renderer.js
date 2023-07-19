document.addEventListener('DOMContentLoaded', function () {
  const versionSelect = document.getElementById('version-select');
  const tableContainer = document.getElementById('table-container');

  // Die Funktion für den Login
  function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Hier kannst du die Logik für den Login implementieren
    // Zum Beispiel: eine API-Anfrage an den Server, um die Anmeldeinformationen zu überprüfen.
    // Wenn der Login erfolgreich ist, kannst du die gewünschte Aktion ausführen, z.B. die Tabelle anzeigen.
    // Wenn der Login fehlschlägt, kannst du eine Fehlermeldung anzeigen.

    // Beispiel:
    if (username === 'admin' && password === '123456') {
      alert('Login erfolgreich!');
    } else {
      alert('Login!');
     // document.getElementById('error-message').innerText = 'Falscher Benutzername oder Passwort.';
    }
  }

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
});
