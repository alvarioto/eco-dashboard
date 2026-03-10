const fs = require('fs');
let html = fs.readFileSync('dist/Edificios_sub.html', 'utf8');

// The problem: patch_html.cjs replaced the FIRST </body> in the file,
// which was inside a JS template literal:  newWindow.document.write(`...<body>...</body>...</html>`)
// We need to:
// 1. Restore that corrupted template literal
// 2. Add the gas loading script before the REAL last </body>

// The gas script that was wrongly inserted into the JS template literal
const wrongInsert = `<script>
    // Dynamically load refrigerant gases from API
    document.addEventListener('DOMContentLoaded', function() {
        fetch('http://localhost:3000/api/detalles-recarga-gas', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data) {
                    const gasSelect = document.getElementById('gasRecargaGas');
                    if (gasSelect) {
                        gasSelect.innerHTML = '<option value="">-- Selecciona un gas --</option>';
                        data.data.forEach(function(gas) {
                            const opt = document.createElement('option');
                            opt.value = gas.Nombre;
                            opt.textContent = gas.Nombre + ' (PCG: ' + gas.PCA6AR + ')';
                            gasSelect.appendChild(opt);
                        });
                        console.log('✅ Gases fugitivos cargados:', data.data.length, 'opciones');
                    }
                }
            })
            .catch(function(err) { console.error('Error cargando gases:', err); });
    });
</script>
</body>`;

// It was placed where </body> was inside the template literal
// The original text at that point was just: </body>
if (html.includes(wrongInsert)) {
    html = html.replace(wrongInsert, '</body>');
    console.log('✅ Restored broken template literal </body>');
} else {
    console.log('⚠️  Wrong insert string not found exactly — trying to find the damage...');
    // Find where the gas script appears and show context
    const idx = html.indexOf('Dynamically load refrigerant');
    if (idx >= 0) {
        console.log('Gas script found at char:', idx);
        console.log('Context:', JSON.stringify(html.substring(idx - 100, idx + 50)));
    } else {
        console.log('Gas script not found. File may already be clean or differently corrupted.');
    }
}

// Now add the gas script before the REAL last </body> (at end of file)
const lastBodyIdx = html.lastIndexOf('</body>');
if (lastBodyIdx >= 0) {
    const gasScript = `<script>
    // Dynamically load refrigerant gases from API
    document.addEventListener('DOMContentLoaded', function() {
        fetch('http://localhost:3000/api/detalles-recarga-gas', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data) {
                    const gasSelect = document.getElementById('gasRecargaGas');
                    if (gasSelect) {
                        gasSelect.innerHTML = '<option value="">-- Selecciona un gas --</option>';
                        data.data.forEach(function(gas) {
                            const opt = document.createElement('option');
                            opt.value = gas.Nombre;
                            opt.textContent = gas.Nombre + ' (PCG: ' + gas.PCA6AR + ')';
                            gasSelect.appendChild(opt);
                        });
                        console.log('Gases fugitivos cargados:', data.data.length);
                    }
                }
            })
            .catch(function(err) { console.error('Error cargando gases:', err); });
    });
</script>
`;
    html = html.substring(0, lastBodyIdx) + gasScript + html.substring(lastBodyIdx);
    console.log('✅ Gas loading script inserted before last </body>');
}

// Also fix flatpickr locale issue — replace flatpickr.l10ns.es with just {} or remove locale
// The Spanish locale script is not loaded, so remove the locale param
html = html.replace(/locale: flatpickr\.l10ns\.es,\s*\n/g, '');
console.log('✅ Removed invalid flatpickr locale reference');

fs.writeFileSync('dist/Edificios_sub.html', html);
console.log('✅ File saved');
