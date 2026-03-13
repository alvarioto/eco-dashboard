import fs from 'fs';

let html = fs.readFileSync('src/company.html', 'utf8');

// 1. ADD IDs TO VEHICLE MODAL INPUTS (if they don't have them)
const vBuildingSelect = '<select class="form-select select-edificio-dinamico" required>';
if (html.includes(vBuildingSelect)) {
    // Only target the one in the conmatricula tab inside modalCrearVehiculo
    // It's safer to just inject an ID to the first one within the vehicle context or add IDs strictly.
}

// A more robust approach: replace the entire modalCrearVehiculo form block with one that has IDs
const vehicleModalRegex = /<div class="tab-pane fade show active" id="vehiculo-conmatricula" role="tabpanel">[\s\S]*?<\/div>\s*<!-- Vehículo genérico -->/m;

const newVehicleConMatricula = `
                          <div class="tab-pane fade show active" id="vehiculo-conmatricula" role="tabpanel">
                            <form id="formCrearVehiculo">
                            <div class="mb-2">
                              <label class="form-label">Edificio *</label>
                              <select class="form-select select-edificio-dinamico" id="v_edificio" required>
                                <option value="">-- Selecciona edificio --</option>
                              </select>
                            </div>

                            <div class="mb-3">
                              <label class="form-label">Tipo de vehículo *</label>
                              <div class="d-flex gap-2 tipo-vehiculo-selector">
                                <button type="button" class="btn btn-outline-secondary w-100 active" onclick="document.getElementById('v_tipo').value='Vehículos'">🚗 Vehículos</button>
                                <button type="button" class="btn btn-outline-secondary w-100" onclick="document.getElementById('v_tipo').value='Maquinaria'">🚜 Maquinaria</button>
                                <button type="button" class="btn btn-outline-secondary w-100" onclick="document.getElementById('v_tipo').value='Larga distancia'">✈️ Larga distancia</button>
                              </div>
                              <input type="hidden" id="v_tipo" value="Vehículos">
                            </div>

                            <div class="row mb-2">
                              <div class="col">
                                <label class="form-label">Categoría *</label>
                                <select class="form-select" id="v_categoria" required>
                                  <option value="Turismos">Turismos</option>
                                  <option value="Furgoneta">Furgoneta</option>
                                  <option value="Camión">Camión</option>
                                  <option value="Motocicleta">Motocicleta</option>
                                </select>
                              </div>
                              <div class="col">
                                <label class="form-label">Tipo de motor *</label>
                                <select class="form-select" id="v_motor" required>
                                  <option value="">--</option>
                                  <option value="Combustión">Combustión</option>
                                  <option value="Híbrido Enchufable">Híbrido Enchufable</option>
                                  <option value="Eléctrico">Eléctrico</option>
                                </select>
                              </div>
                            </div>

                            <div class="mb-2">
                              <label class="form-label">Combustible por defecto *</label>
                              <select class="form-select" id="v_combustible" required>
                                <option value="">--</option>
                                <option value="Gasolina">Gasolina</option>
                                <option value="Diésel">Diésel</option>
                                <option value="Electricidad">Electricidad</option>
                                <option value="GLP">GLP</option>
                              </select>
                            </div>

                            <div class="mb-2">
                              <label class="form-label">Matrícula o identificador del vehículo *</label>
                              <input class="form-control" id="v_matricula" placeholder="0000AAA" required>
                            </div>

                            <div class="row mb-2">
                              <div class="col"><label class="form-label">Marca</label><input class="form-control" id="v_marca" placeholder="Ej. Honda"></div>
                              <div class="col"><label class="form-label">Modelo</label><input class="form-control" id="v_modelo" placeholder="Ej. Civic"></div>
                              <div class="col"><label class="form-label">Clase</label><input class="form-control" id="v_clase" placeholder="Ej. Compact"></div>
                            </div>
                            
                            <!-- Hidden submit trigger -->
                            <button type="submit" id="btnRealGuardarVehiculo" class="d-none">Guardar</button>
                            </form>
                          </div>
                          <!-- Vehículo genérico -->`;

html = html.replace(vehicleModalRegex, newVehicleConMatricula);
console.log('Injected form IDs to vehiculo-conmatricula tab.');

// 2. CHANGE THE SAVE BUTTON IN MODALCREARVEHICULO TO TRIGGER THE FORM
const vehiculoSaveBtn = /<button class="btn btn-primary w-100">Guardar<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<!-- ✅ MODAL: Crear empleado -->/;
const newVehiculoSaveBtn = `<button class="btn btn-primary w-100" onclick="document.getElementById('btnRealGuardarVehiculo').click()">Guardar Vehículo</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- ✅ MODAL: Crear empleado -->`;
html = html.replace(vehiculoSaveBtn, newVehiculoSaveBtn);
console.log('Modified the Vehiculo form save button.');

// 3. INJECT THE VEHICLE FETCH SCRIPT AND FORM LISTENER INTO THE RENDERED FOOTER
const injectToken = `// Fetch and populate Buildings (Edificios)`;
const vehicleScript = `
                  // 🚗 FETCH VEHICLES 
                  fetch('/api/get-user-vehicles', { credentials: 'include' })
                      .then(res => res.json())
                      .then(data => {
                          if (data.success && data.vehicles) {
                              const tbody = document.getElementById('tbody-vehiculos');
                              if(tbody) {
                                  tbody.innerHTML = '';
                                  data.vehicles.forEach(v => {
                                      const tr = document.createElement('tr');
                                      tr.innerHTML = \`
                                        <td><input type="checkbox"></td>
                                        <td><span class="badge bg-light border text-dark">\${v.tipo_vehiculo || 'Vehículos'}</span></td>
                                        <td>\${v.categoria || '--'}</td>
                                        <td>\${v.identificador || '--'}</td>
                                        <td>\${v.fecha_inicio ? new Date(v.fecha_inicio).toLocaleDateString() : '--'}</td>
                                        <td>--</td>
                                        <td>\${v.marca || ''} \${v.modelo || ''}</td>
                                        <td>\${v.nombre_edificio || '--'}</td>
                                        <td><button class="btn btn-outline-danger btn-sm" onclick="eliminarVehiculo(\${v.id})"><i class="bi bi-trash"></i></button></td>
                                      \`;
                                      tbody.appendChild(tr);
                                  });
                              }
                          }
                      })
                      .catch(err => console.error('Error fetching vehicles:', err));

                  // 🚗 HANDLE VEHICLE FORM SUBMISSION
                  const formVehiculo = document.getElementById('formCrearVehiculo');
                  if (formVehiculo) {
                      formVehiculo.addEventListener('submit', function(e) {
                          e.preventDefault();
                          const data = {
                              building_name: document.getElementById('v_edificio').value,
                              tipo_vehiculo: document.getElementById('v_tipo').value,
                              categoria: document.getElementById('v_categoria').value,
                              tipo_motor: document.getElementById('v_motor').value,
                              combustible: document.getElementById('v_combustible').value,
                              identificador: document.getElementById('v_matricula').value,
                              marca: document.getElementById('v_marca').value,
                              modelo: document.getElementById('v_modelo').value,
                              clase: document.getElementById('v_clase').value,
                              propiedad_alquiler: 'Propiedad', // Hardcoded for now based on UI simplicity
                              control_operacional: 'Sí', 
                              activo: true, 
                              fecha_inicio: null
                          };

                          fetch('/api/add-vehicle', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify(data)
                          })
                          .then(res => res.json())
                          .then(res => {
                              if(res.success) {
                                  const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearVehiculo'));
                                  modal.hide();
                                  formVehiculo.reset();
                                  alert('Vehículo guardado correctamente.');
                                  location.reload();
                              } else {
                                  alert('Error: ' + res.message);
                              }
                          })
                          .catch(err => alert('Error del servidor: ' + err.message));
                      });
                  }

                  // globally accessible delete for vehicles
                  window.eliminarVehiculo = function(id) {
                      if(!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) return;
                      fetch(\`/api/delete-vehicle/\${id}\`, { method: 'DELETE', credentials: 'include' })
                      .then(res => res.json())
                      .then(data => {
                          if(data.success) { alert('Vehículo eliminado.'); location.reload(); }
                          else { alert('Error: ' + data.error); }
                      }).catch(err => console.error(err));
                  };

                  // Fetch and populate Buildings (Edificios)`;

if (!html.includes('fetch(\'/api/get-user-vehicles\'')) {
    html = html.replace(injectToken, vehicleScript);
    console.log('Injected vehicle javascript logic successfully.');
} else {
    console.log('Vehicle logic already present.');
}

fs.writeFileSync('src/company.html', html);
console.log('patch_vehicles.mjs completed successfully.');
