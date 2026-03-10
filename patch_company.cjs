const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'company.html');
const distPath = path.join(__dirname, 'dist', 'company.html');

let html = fs.readFileSync(srcPath, 'utf-8');

// 1. Add ID to building name input
html = html.replace(
    '<input class="form-control" placeholder="Introduce un nombre para la sede">',
    '<input class="form-control" id="nombreNuevoEdificio" placeholder="Introduce un nombre para la sede">'
);

// 2. Add ID to save button
html = html.replace(
    /boton_guardar_edificio_placeholder/g, // We will just use regex to match the button inside the modal instead to be safe!
    '' // Wait, a better regex is below
);
html = html.replace(
    /<div class="modal-footer border-0">\s*<button class="btn btn-primary w-100">Guardar<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<!-- ✅ MODAL CREAR VEHÍCULO -->/g,
    '<div class="modal-footer border-0">\n<button class="btn btn-primary w-100" id="btnGuardarEdificio">Guardar Edificio</button>\n</div>\n</div>\n</div>\n</div>\n<!-- ✅ MODAL CREAR VEHÍCULO -->'
);

// 3. Update the simularGuardado generic listener to ignore our button, and inject our real fetch logic
const originalScript = `// Detectamos todos los botones Guardar en los modales
              document.querySelectorAll('.modal button.btn-primary.w-100').forEach(btn => {
                btn.addEventListener('click', function (e) {
                  e.preventDefault();
                  const modal = this.closest('.modal');
                  if (modal) {
                    simularGuardado(\`#\${modal.id}\`);
                  }
                });
              });`;

const newScript = `// Detectamos todos los botones Guardar en los modales
              document.querySelectorAll('.modal button.btn-primary.w-100').forEach(btn => {
                btn.addEventListener('click', function (e) {
                  if (this.id === 'btnGuardarEdificio') return; // Skip
                  e.preventDefault();
                  const modal = this.closest('.modal');
                  if (modal) {
                    simularGuardado(\`#\${modal.id}\`);
                  }
                });
              });

              // REAL SAVE: ENVIAR EDIFICIO A BBDD
              const btnEdificio = document.getElementById('btnGuardarEdificio');
              if (btnEdificio) {
                  btnEdificio.addEventListener('click', function(e) {
                    e.preventDefault();
                    const nombre = document.getElementById('nombreNuevoEdificio').value;
                    if(!nombre) {
                        alert('Por favor, indica un nombre para el edificio');
                        return;
                    }

                    fetch('/api/add-building', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ name: nombre, property_type: 'Edificio', address: '' })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearEdificio'));
                            modal.hide();
                            document.getElementById('nombreNuevoEdificio').value = ''; // clean
                            const toast = new bootstrap.Toast(document.getElementById('successToast'));
                            toast.show();
                            setTimeout(() => location.reload(), 800);
                        } else {
                            alert('Error al crear edificio: ' + data.message);
                        }
                    })
                    .catch(err => {
                        console.error('Error in fetching building API', err);
                        alert('Error del servidor');
                    });
                  });
              }`;

const scriptRegex = /\/\/ Detectamos todos los botones Guardar en los modales[\s\S]*?document\.querySelectorAll\('\.modal button\.btn-primary\.w-100'\)\.forEach\(btn => \{[\s\S]*?btn\.addEventListener\('click', function \(e\) \{[\s\S]*?e\.preventDefault\(\);[\s\S]*?const modal = this\.closest\('\.modal'\);[\s\S]*?if \(modal\) \{[\s\S]*?simularGuardado\(`#\$\{modal\.id\}`\);[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}\);/g;

html = html.replace(scriptRegex, newScript);

fs.writeFileSync(srcPath, html);
fs.writeFileSync(distPath, html);

console.log("Patched src/company.html and dist/company.html successfully.");
