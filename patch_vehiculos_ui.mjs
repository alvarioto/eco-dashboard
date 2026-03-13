import fs from 'fs';

let html = fs.readFileSync('src/Vehiculos.html', 'utf8');

// 1. Fix modal height jump
const modalCssRegex = /\.modal-body \{\s*padding: 24px;\s*max-height: 60vh;\s*overflow-y: auto;\s*\}/;
const newModalCss = `.modal-body {
        padding: 24px;
        min-height: 600px; /* Fixed height to prevent size jumps */
    }`;
html = html.replace(modalCssRegex, newModalCss);

// 2. Clear out dummy vehicles dropdown inside the Añadir Consumo form
const vehicleDropdownRegex = /<select id="add-vehiculo" class="form-control-custom text-muted">[\s\S]*?<\/select>/;
const newVehicleDropdown = `<select id="add-vehiculo" class="form-control-custom text-muted select-vehiculo-dinamico">
                    <option value="" disabled selected>-- Cargando vehículos --</option>
                </select>`;
html = html.replace(vehicleDropdownRegex, newVehicleDropdown);

// 3. Inject javascript to fetch database vehicles on page load
const injectPoint = `// --- ACTUALIZACIÓN DE INTERFAZ ---`;
const newDataFetchLogic = `
    // --- REAL DATABASE FETCH ---
    let realVehicles = [];
    
    function fetchRealData() {
        return fetch('/api/get-user-vehicles', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if(data.success && data.vehicles) {
                    realVehicles = data.vehicles;
                }
            })
            .catch(err => console.error("Error fetching vehicles:", err));
    }

    function renderRealVehiclesDropdown() {
        const selects = document.querySelectorAll('.select-vehiculo-dinamico');
        selects.forEach(select => {
            select.innerHTML = '<option value="" disabled selected>-- Seleccione un vehículo --</option>';
            realVehicles.forEach(v => {
                const text = \`\${v.marca || ''} \${v.modelo || ''} (\${v.identificador || 'S/N'})\`.trim() || 'Vehículo sin nombre';
                select.innerHTML += \`<option value="\${v.id}">\${text}</option>\`;
            });
        });
    }

    // --- ACTUALIZACIÓN DE INTERFAZ ---`;

if(!html.includes('fetchRealData')) {
    html = html.replace(injectPoint, newDataFetchLogic);
}

// Ensure the new fetch is called inside DOMContentLoaded
const domLoadedRegex = /document\.addEventListener\("DOMContentLoaded", function \(\) \{\s*updateUI\(\);/s;
const newDomLoaded = `document.addEventListener("DOMContentLoaded", function () {
        fetchRealData().then(() => {
            renderRealVehiclesDropdown();
            updateUI(); 
        });`;
html = html.replace(domLoadedRegex, newDomLoaded);

fs.writeFileSync('src/Vehiculos.html', html);
console.log('Vehiculos.html UI fixes applied successfully.');
