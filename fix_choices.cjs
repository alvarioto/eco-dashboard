const fs = require('fs');
let h = fs.readFileSync('dist/Edificios_sub.html', 'utf8');

// Replace the broken Choices.js init that depends on proveedoresElectricidad (loaded too late)
// with a direct API-based approach
const oldChoicesInit = `                // Initialize Choices.js and load dynamic provider options
                document.addEventListener("DOMContentLoaded", function () {
                    const selectElement = document.getElementById("selectProveedorElectricidad");

                    if (typeof proveedoresElectricidad !== 'undefined') {
                        const choicesOptions = proveedoresElectricidad.map(prov => ({
                            value: prov,
                            label: prov
                        }));

                        const choices = new Choices(selectElement, {
                            searchEnabled: true,
                            itemSelectText: '',
                            shouldSort: false, // already sorted in JS
                            choices: choicesOptions
                        });
                    }
                });`;

const newChoicesInit = `                // Load comercializadoras from API and initialize Choices.js dynamically
                document.addEventListener("DOMContentLoaded", function () {
                    const selectElement = document.getElementById("selectProveedorElectricidad");

                    fetch('http://localhost:3000/api/detalles-comercializadoras', { credentials: 'include' })
                        .then(function(r) { return r.json(); })
                        .then(function(data) {
                            if (data.success && data.data && data.data.length > 0) {
                                // Get unique provider names, sorted
                                const nombres = [...new Set(data.data
                                    .map(function(d) { return d.Comercializadora; })
                                    .filter(Boolean)
                                )].sort();

                                const choicesOptions = nombres.map(function(prov) {
                                    return { value: prov, label: prov };
                                });

                                new Choices(selectElement, {
                                    searchEnabled: true,
                                    searchPlaceholderValue: 'Buscar comercializadora...',
                                    itemSelectText: '',
                                    shouldSort: false,
                                    choices: choicesOptions
                                });
                                console.log('✅ Comercializadoras cargadas en dropdown:', nombres.length);
                            } else {
                                console.error('No se recibieron comercializadoras de la API');
                            }
                        })
                        .catch(function(err) {
                            console.error('Error cargando comercializadoras:', err);
                        });
                });`;

if (h.includes(oldChoicesInit)) {
    h = h.replace(oldChoicesInit, newChoicesInit);
    console.log('✅ Choices.js init replaced with API-based loading');
} else {
    console.log('❌ Old Choices init not found. Searching...');
    const idx = h.indexOf('proveedoresElectricidad');
    if (idx >= 0) console.log('proveedoresElectricidad at:', idx, '\nContext:', h.substring(idx-100, idx+200));
}

fs.writeFileSync('dist/Edificios_sub.html', h);
console.log('✅ Saved');
