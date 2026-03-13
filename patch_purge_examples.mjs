import fs from 'fs';

let html = fs.readFileSync('src/company.html', 'utf8');

// 1. CLEAR EDIFICIOS STATIC TABLE
const edificiosRegex = /<tbody>\s*<tr>\s*<td><input type="checkbox"><\/td>\s*<td>La Lonja Tech<\/td>\s*<td>España<\/td>\s*<td>--<\/td>\s*<td>Muelle de Levante \(Puerto de Huelva\), Avenida Hispanoamérica, Huelva<\/td>\s*<td>18 m²<\/td>\s*<\/tr>\s*<\/tbody>/;
if (edificiosRegex.test(html)) {
    html = html.replace(edificiosRegex, '<tbody id="tbody-edificios"></tbody>');
    console.log('Cleared Edificios table.');
} else { console.log('Edificios table not matched exactly. Attempting override if id="tbody-edificios" exists... otherwise, skipping clear.'); }

// 2. CLEAR VEHÍCULOS STATIC TABLE
// Match the <tbody> inside the vehiculo tab
const vehiculosRegex = /<tbody>\s*<tr>\s*<td><input type="checkbox"><\/td>\s*<td><span class="badge bg-light border text-dark">Vehículos<\/span><\/td>\s*<td>Turismos<\/td>\s*<td>8137KZX<\/td>\s*<td>--<\/td>\s*<td>--<\/td>\s*<td>WV GOLF VARIANT<\/td>\s*<td>La Lonja Tech<\/td>\s*<td><button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"><\/i><\/button><\/td>\s*<\/tr>\s*<\/tbody>/;
if (vehiculosRegex.test(html)) {
    html = html.replace(vehiculosRegex, '<tbody id="tbody-vehiculos"></tbody>');
    console.log('Cleared Vehiculos table.');
}

// 3. CLEAR PERSONAL STATIC TABLE
const personalRegex = /<tbody>\s*<tr>\s*<td><input type="checkbox"><\/td>\s*<td>\s*<div class="d-flex align-items-center gap-2">\s*<div class="avatar bg-success-subtle text-success fw-bold rounded-circle d-flex justify-content-center align-items-center" style="width: 30px; height: 30px;">JS<\/div>\s*Jose Alvaro Diaz\s*<\/div>\s*<\/td>[\s\S]*?<\/tbody>/;
if (personalRegex.test(html)) {
    html = html.replace(personalRegex, '<tbody id="tbody-personal"></tbody>');
    console.log('Cleared Personal table.');
}

// 4. INJECT FETCH JAVASCRIPT AT THE BOTTOM
const jsInjection = `
            <script>
              document.addEventListener("DOMContentLoaded", function () {
                  // Fetch and populate Buildings (Edificios)
                  fetch('/api/get-user-buildings', { credentials: 'include' })
                      .then(res => res.json())
                      .then(data => {
                          if (data.success && data.buildings) {
                              const tbody = document.getElementById('tbody-edificios');
                              if(tbody) tbody.innerHTML = ''; // Ensure it's empty

                              const dropdowns = document.querySelectorAll('.select-edificio-dinamico');
                              dropdowns.forEach(select => {
                                  select.innerHTML = '<option value="">-- Selecciona edificio --</option>';
                              });

                              data.buildings.forEach(b => {
                                  // Populate table
                                  if(tbody) {
                                      const tr = document.createElement('tr');
                                      tr.innerHTML = \`
                                        <td><input type="checkbox"></td>
                                        <td>\${b.nombre}</td>
                                        <td>\${b.pais || '--'}</td>
                                        <td>\${b.codigo_postal || '--'}</td>
                                        <td>\${b.direccion || '--'} \${b.municipio ? ', ' + b.municipio : ''} \${b.ciudad ? '(' + b.ciudad + ')' : ''}</td>
                                        <td>\${b.superficie || '--'} m²</td>
                                        <td><button class="btn btn-outline-danger btn-sm" onclick="eliminarEdificio(\${b.id})"><i class="bi bi-trash"></i></button></td>
                                      \`;
                                      tbody.appendChild(tr);
                                  }

                                  // Populate all select dropdowns
                                  dropdowns.forEach(select => {
                                      const option = document.createElement('option');
                                      option.value = b.nombre;
                                      option.textContent = b.nombre;
                                      select.appendChild(option);
                                  });
                              });
                          }
                      })
                      .catch(err => console.error('Error fetching buildings:', err));
              });

              // Add globally-accessible delete function
              window.eliminarEdificio = function(id) {
                  if(!confirm('¿Estás seguro de que deseas eliminar este edificio?')) return;
                  fetch(\`/api/delete-building/\${id}\`, {
                      method: 'DELETE',
                      credentials: 'include'
                  })
                  .then(res => res.json())
                  .then(data => {
                      if(data.success) {
                          alert('Edificio eliminado.');
                          location.reload();
                      } else {
                          alert('Error al eliminar: ' + data.error);
                      }
                  })
                  .catch(err => console.error(err));
              };
            </script>
`;

if (!html.includes('fetch(\'/api/get-user-buildings\'')) {
    html = html.replace('{% endblock %}', jsInjection + '\n            {% endblock %}');
    console.log('Injected fetch script successfully.');
} else {
    console.log('Fetch script might already be injected. Skipping double-inject.');
}

fs.writeFileSync('src/company.html', html);
console.log('Done modifying company.html');
