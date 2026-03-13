import fs from 'fs';

let html = fs.readFileSync('src/company.html', 'utf8');

// The selects inside Vehiculo con matricula:
html = html.replace(
    /<div class="mb-2">\s*<label class="form-label">Edificio \*<\/label>\s*<select class="form-select">\s*<option>--<\/option>\s*<\/select>\s*<\/div>/g,
    `<div class="mb-2">
                              <label class="form-label">Edificio *</label>
                              <select class="form-select select-edificio-dinamico" required>
                                <option value="">-- Selecciona edificio --</option>
                              </select>
                            </div>`
);

// The select inside Empleado modal
html = html.replace(
    /<label class="form-label">Edificio <i class="bi bi-info-circle small ms-1"><\/i><\/label>\s*<select class="form-select">\s*<option>--<\/option>\s*<\/select>/g,
    `<label class="form-label">Edificio <i class="bi bi-info-circle small ms-1"></i></label>
                          <select class="form-select select-edificio-dinamico">
                            <option value="">-- Selecciona edificio --</option>
                          </select>`
);

// Add the population logic to the script I added earlier at the bottom.
// Wait, I can just append it to the script block I injected!
if (html.includes('data.buildings.forEach(b => {') && !html.includes('select-edificio-dinamico')) {
    html = html.replace(
        `// Setup delete listeners`,
        `// Populate select dropdowns globally
         const selects = document.querySelectorAll('.select-edificio-dinamico');
         selects.forEach(select => {
             // Keep the first default option
             const defaultOpt = select.querySelector('option');
             select.innerHTML = '';
             if(defaultOpt) select.appendChild(defaultOpt);
             data.buildings.forEach(b => {
                 const opt = document.createElement('option');
                 opt.value = b.id; // or b.nombre depending on what is sent
                 opt.textContent = b.nombre;
                 select.appendChild(opt);
             });
         });

         // Setup delete listeners`
    );
}

fs.writeFileSync('src/company.html', html);
console.log('src/company.html updated with dynamic select-edificio-dinamico logic.');
