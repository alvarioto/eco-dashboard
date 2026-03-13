import fs from 'fs';

let html = fs.readFileSync('src/company.html', 'utf8');

// 1. Añadir IDs al formulario "Crear edificio"
html = html.replace(
    /<label class="form-label">Nombre \*<\/label>\s*<input class="form-control" id="nombreNuevoEdificio" placeholder="Introduce un nombre para la sede">/g,
    '<label class="form-label">Nombre *</label>\n                            <input class="form-control" id="nombreNuevoEdificio" placeholder="Introduce un nombre para la sede" required>'
);

html = html.replace(
    /<label class="form-label">Tipo de edificio \*<\/label>\s*<select class="form-select">\s*<option>--<\/option>\s*<\/select>/g,
    `<label class="form-label">Tipo de edificio *</label>
                            <select class="form-select" id="tipoNuevoEdificio" required>
                              <option value="">-- Selecciona --</option>
                              <option value="Oficinas">Oficinas</option>
                              <option value="Nave Industrial">Nave Industrial</option>
                              <option value="Local Comercial">Local Comercial</option>
                              <option value="Almacén">Almacén</option>
                              <option value="Comercial">Comercial</option>
                              <option value="Otro">Otro</option>
                            </select>`
);

html = html.replace(
    /<label class="form-label">Dirección \*<\/label>\s*<div class="input-group">\s*<input class="form-control">\s*<span class="input-group-text"><i class="bi bi-geo-alt"><\/i><\/span>\s*<\/div>/g,
    `<label class="form-label">Dirección *</label>
                            <div class="input-group">
                              <input class="form-control" id="direccionNuevoEdificio" placeholder="Calle, número..." required>
                              <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
                            </div>`
);

html = html.replace(
    /<div class="col"><label class="form-label">Región<\/label><input class="form-control">\s*<\/div>\s*<div class="col"><label class="form-label">Provincia<\/label><input class="form-control">\s*<\/div>\s*<div class="col"><label class="form-label">Ciudad<\/label><input class="form-control">\s*<\/div>/g,
    `<div class="col"><label class="form-label">Región</label><input class="form-control" id="regionNuevoEdificio"></div>
                            <div class="col"><label class="form-label">Provincia</label><input class="form-control" id="provinciaNuevoEdificio"></div>
                            <div class="col"><label class="form-label">Ciudad *</label><input class="form-control" id="ciudadNuevoEdificio" required></div>`
);

html = html.replace(
    /<div class="col">\s*<label class="form-label">País \*<\/label>\s*<select class="form-select">\s*<option>--<\/option>\s*<\/select>\s*<\/div>\s*<div class="col">\s*<label class="form-label">Superficie<\/label>\s*<div class="input-group">\s*<input class="form-control">\s*<span class="input-group-text">m²<\/span>\s*<\/div>\s*<\/div>/g,
    `<div class="col">
                              <label class="form-label">País *</label>
                              <select class="form-select" id="paisNuevoEdificio" required>
                                <option value="">-- Selecciona --</option>
                                <option value="España" selected>España</option>
                                <option value="Portugal">Portugal</option>
                                <option value="Francia">Francia</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </div>
                            <div class="col">
                              <label class="form-label">Superficie</label>
                              <div class="input-group">
                                <input type="number" step="0.01" class="form-control" id="superficieNuevoEdificio">
                                <span class="input-group-text">m²</span>
                              </div>
                            </div>`
);

// Populate el listado de edificios! The user says: "sale esa puta mierda que no me deja borrarla que es un ejemp0lo"
html = html.replace(
    /<tbody>\s*<tr>\s*<td>\s*<div class="form-check">\s*<input class="form-check-input" type="checkbox">\s*<\/div>\s*<\/td>\s*<td class="fw-bold">La Lonja Tech<\/td>\s*<td>España<\/td>\s*<td>--<\/td>\s*<td class="text-truncate" style="max-width: 250px;">\s*Muelle de Levante \(Puerto de Huelva\), Avenida Hispanoamérica, Huelva\s*<\/td>\s*<td>18 m²<\/td>\s*<\/tr>\s*<\/tbody>/g,
    `<tbody id="tbody-edificios">
                        </tbody>
                        <script>
                            document.addEventListener("DOMContentLoaded", () => {
                                fetch('/api/get-user-buildings', { credentials: 'include' })
                                  .then(res => res.json())
                                  .then(data => {
                                      if(data.success && data.buildings) {
                                          const tbody = document.getElementById('tbody-edificios');
                                          tbody.innerHTML = '';
                                          if (data.buildings.length === 0) {
                                              tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aún no hay edificios registrados.</td></tr>';
                                              return;
                                          }
                                          data.buildings.forEach(b => {
                                              const tr = document.createElement('tr');
                                              tr.innerHTML = \`
                                                  <td><div class="form-check"><input class="form-check-input" type="checkbox" value="\${b.id}"></div></td>
                                                  <td class="fw-bold">\${b.nombre}</td>
                                                  <td>\${b.pais || '--'}</td>
                                                  <td>\${b.provincia || '--'}</td>
                                                  <td class="text-truncate" style="max-width: 250px;">\${b.direccion || '--'}</td>
                                                  <td>\${b.superficie ? b.superficie + ' m²' : '--'}</td>
                                                  <td>
                                                      <button class="btn btn-sm btn-outline-danger btn-delete-edificio" data-id="\${b.id}">
                                                        <i class="bi bi-trash"></i>
                                                      </button>
                                                  </td>
                                              \`;
                                              tbody.appendChild(tr);
                                          });

                                          // Setup delete listeners
                                          document.querySelectorAll('.btn-delete-edificio').forEach(btn => {
                                              btn.addEventListener('click', (e) => {
                                                  const id = e.currentTarget.getAttribute('data-id');
                                                  if(confirm('¿Seguro que deseas eliminar este edificio?')) {
                                                      fetch('/api/delete-building/' + id, {
                                                          method: 'DELETE',
                                                          credentials: 'include'
                                                      }).then(r => r.json()).then(res => {
                                                          if(res.success) window.location.reload();
                                                          else alert('Error: ' + res.error);
                                                      });
                                                  }
                                              });
                                          });
                                      }
                                  });
                            });
                        </script>`
);

// Add table headers to align with the new delete button inside table-edificios.
// wait, the headers are: <th></th><th>Nombre</th><th>País</th><th>Provincia</th><th>Dirección</th><th>Superficie</th>
// Let's replace the thead closing tag with an extra Actions column.
html = html.replace(
    /<th>Superficie<\/th>\s*<\/tr>\s*<\/thead>/g,
    `<th>Superficie</th><th>Acciones</th></tr></thead>`
);

fs.writeFileSync('src/company.html', html);
console.log('src/company.html patched with input IDs and Dynamic Table');
