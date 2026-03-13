import fs from 'fs';
import path from 'path';

let html = fs.readFileSync('src/Vehiculos.html', 'utf8');

// 1. Remove all the problematic CSS classes from the <style> block
const cssRegexList = [
    /\/\* ESTILOS DE FORMS COMUNES \*\/[\s\S]*?(?=\/\* OVERLAY \*\/)/,
];
cssRegexList.forEach(regex => {
    html = html.replace(regex, '');
});

// 2. Replace form-group-custom structurally throughout the document
html = html.replace(/<div class="form-group-custom">/g, '<div class="mb-3">');

// 3. Replace labels structurally
html = html.replace(/<label>([\s\S]*?)<\/label>/g, '<label class="form-label text-muted small fw-medium">$1</label>');

// 4. Replace basic inputs and selects
html = html.replace(/class="form-control-custom"/g, 'class="form-control shadow-sm"');
html = html.replace(/class="form-control-custom text-muted"/g, 'class="form-select shadow-sm text-muted"');
html = html.replace(/class="form-control-custom text-muted select-vehiculo-dinamico"/g, 'class="form-select shadow-sm text-muted select-vehiculo-dinamico"');

// 5. Replace date-range-container structurally
const dateRangeRegex = /<div class="date-range-container">[\s\S]*?<input type="text" id="add-fecha-inicio" class="form-control shadow-sm date-input"[\s\S]*?placeholder="dd\/mm\/aaaa">[\s\S]*?<span class="mx-2 text-muted" style="font-size: 0\.8rem;">&rarr;<\/span>[\s\S]*?<input type="text" id="add-fecha-fin" class="form-control shadow-sm date-input"[\s\S]*?placeholder="dd\/mm\/aaaa">[\s\S]*?<i class="bi bi-calendar ms-2 text-muted" style="font-size: 0\.95rem;"><\/i>[\s\S]*?<\/div>/;

const newDateRange = `<div class="input-group shadow-sm">
                    <input type="text" id="add-fecha-inicio" class="form-control text-center date-input" placeholder="dd/mm/aaaa">
                    <span class="input-group-text bg-white border-start-0 border-end-0 text-muted">&rarr;</span>
                    <input type="text" id="add-fecha-fin" class="form-control text-center date-input" placeholder="dd/mm/aaaa">
                    <span class="input-group-text bg-white text-muted"><i class="bi bi-calendar"></i></span>
                </div>`;

html = html.replace(dateRangeRegex, newDateRange);

// also for the drawer
const drawerDateRegex = /<div class="date-range-container">[\s\S]*?<input type="text" class="form-control shadow-sm date-input" placeholder="dd\/mm\/aaaa">[\s\S]*?<span class="mx-1 text-muted">-<\/span>[\s\S]*?<input type="text" class="form-control shadow-sm date-input" placeholder="dd\/mm\/aaaa">[\s\S]*?<i class="bi bi-calendar ms-1 text-muted"><\/i>[\s\S]*?<\/div>/;

const newDrawerDate = `<div class="input-group shadow-sm">
                <input type="text" class="form-control text-center date-input" placeholder="dd/mm/aaaa">
                <span class="input-group-text bg-white border-start-0 border-end-0 text-muted">-</span>
                <input type="text" class="form-control text-center date-input" placeholder="dd/mm/aaaa">
                <span class="input-group-text bg-white text-muted"><i class="bi bi-calendar"></i></span>
            </div>`;

html = html.replace(drawerDateRegex, newDrawerDate);

// 6. Replace combined-input structurally (Cantidad)
const cantidadRegex = /<div class="combined-input">[\s\S]*?<input type="number" id="add-cantidad" value="0" min="0" step="0\.01">[\s\S]*?<select id="add-unidad">[\s\S]*?<option value="kg">Kilogramos \(kg\)<\/option>[\s\S]*?<option value="km">Kilómetros \(km\)<\/option>[\s\S]*?<option value="l" selected>Litros \(l\)<\/option>[\s\S]*?<option value="mi">Millas \(mi\)<\/option>[\s\S]*?<option value="kwh">Kilovatio hora \(kwh\)<\/option>[\s\S]*?<option value="kwh-net">Kilovatio hora neto \(kwh-net\)<\/option>[\s\S]*?<option value="gal">Galones \(gal\)<\/option>[\s\S]*?<\/select>[\s\S]*?<\/div>/;

const newCantidad = `<div class="input-group shadow-sm">
                    <input type="number" id="add-cantidad" class="form-control text-end" value="0" min="0" step="0.01">
                    <select id="add-unidad" class="form-select" style="max-width: 170px;">
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="km">Kilómetros (km)</option>
                        <option value="l" selected>Litros (l)</option>
                        <option value="mi">Millas (mi)</option>
                        <option value="kwh">Kilovatio hora (kwh)</option>
                        <option value="kwh-net">Kilovatio hora neto (kwh-net)</option>
                        <option value="gal">Galones (gal)</option>
                    </select>
                </div>`;
html = html.replace(cantidadRegex, newCantidad);

// 7. Replace combined-input structurally (Coste total)
const costeRegex = /<div class="combined-input">[\s\S]*?<input type="number" id="add-coste" placeholder="--" min="0" step="0\.01">[\s\S]*?<select id="add-moneda" style="width: 110px;">[\s\S]*?<option value="EUR">EUR \(€\)<\/option>[\s\S]*?<option value="USD">USD \(\$\)<\/option>[\s\S]*?<\/select>[\s\S]*?<\/div>/;

const newCoste = `<div class="input-group shadow-sm">
                    <input type="number" id="add-coste" class="form-control text-end" placeholder="--" min="0" step="0.01">
                    <select id="add-moneda" class="form-select" style="max-width: 110px;">
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                    </select>
                </div>`;
html = html.replace(costeRegex, newCoste);

// 8. Replace combined-input structurally (Distancia)
const distanciaRegex = /<div class="combined-input">[\s\S]*?<input type="number" id="add-distancia" value="0" min="0" step="0\.1">[\s\S]*?<div class="fixed-unit">Kilómetros \(km\)<\/div>[\s\S]*?<\/div>/;

const newDistancia = `<div class="input-group shadow-sm">
                    <input type="number" id="add-distancia" class="form-control text-end" value="0" min="0" step="0.1">
                    <span class="input-group-text bg-white text-muted">Kilómetros (km)</span>
                </div>`;
html = html.replace(distanciaRegex, newDistancia);

// 9. Extra select replacements for the Drawer
html = html.replace(/<select class="form-control shadow-sm">/g, '<select class="form-select shadow-sm">');


fs.writeFileSync('src/Vehiculos.html', html);
console.log('Vehiculos.html replaced with native Bootstrap classes successfully.');
