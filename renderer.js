
document.addEventListener('DOMContentLoaded', function () {
    const versionSelect = document.getElementById('version-select');
    const tableContainer = document.getElementById('table-container');

    versionSelect.addEventListener('change', function () {
      const selectedVersion = versionSelect.value;
      if (selectedVersion !== '') {
        fetch('prepare.json')
          .then(response => response.json())
          .then(data => {
            const downloads = data.padownloads.find(download => download._version === selectedVersion);
            if (downloads) {
              const table = document.createElement('table');
              table.setAttribute('border', '1');
              table.style.backgroundColor = 'white';

              const headerRow = document.createElement('tr');
              ['chk', 'name', 'filename', 'destination', 'status'].forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
              });
              table.appendChild(headerRow);

              downloads.download.forEach(download => {
                const row = document.createElement('tr');
                ['chk', 'name', 'filename', 'destination', 'status'].forEach(key => {
                  const td = document.createElement('td');
                  td.textContent = download[key] || '';
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
