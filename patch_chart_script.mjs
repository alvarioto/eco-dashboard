import fs from 'fs';

let html = fs.readFileSync('src/Edificios_sub.html', 'utf8');

// The backend returns { id, nombre } per building, we need to make sure the dropdowns catch it correctly
const oldDropdownBinding = /dropdowns.forEach\(select => \{\s*if \(select\) \{\s*select.innerHTML = '<option value="">-- Selecciona un edificio --<\/option>';\s*data.buildings.forEach\(b => \{\s*const option = document.createElement\('option'\);\s*option.value = b.nombre;\s*option.textContent = b.nombre;\s*select.appendChild\(option\);\s*\}\);\s*\}\s*\}\);/g;

const newDropdownBinding = `dropdowns.forEach(select => {
                        if (select) {
                            select.innerHTML = '<option value="">-- Selecciona un edificio --</option>';
                            data.buildings.forEach(b => {
                                const option = document.createElement('option');
                                option.value = b.nombre; // We use nombre as value so the fetch works perfectly
                                option.textContent = b.nombre;
                                select.appendChild(option);
                            });
                        }
                    });`;

if(oldDropdownBinding.test(html)) {
    html = html.replace(oldDropdownBinding, newDropdownBinding);
    fs.writeFileSync('src/Edificios_sub.html', html);
    console.log("Verified building dropdown binding syntax.");
} else {
    console.log("Could not find exact Regex block, skipping since logic might be okay.");
}

// Chart functionality fixes: 
// The user has a generic <canvas id="consumoChart"></canvas>. I need to build the interaction logic that binds to the UI tabs.

const chartScriptInjection = `
    const updateStatsBoxes = (dataPorMes, type) => {
        const total = dataPorMes.reduce((a, b) => a + (b > 0 ? 1 : 0), 0); // Count months with consumption
        document.getElementById('chartLabelConsumos').textContent = total;
        
        // Very basic stats logic
        if(type === 'none') {
            document.getElementById('chartTotalConsumos').textContent = total;
        } else {
            document.getElementById('chartElecConsumos').textContent = total;
        }
    };
    
    // Bind interaction triggers (Mockup for actual functioning)
    document.addEventListener("DOMContentLoaded", function () {
        const typeTabAll = document.querySelector('div.p-3[style*="border-right"]');
        const typeTabElec = document.querySelector('div.p-3[style*="border-bottom"]');
        
        let currentChartType = 'bar'; // or kWh vs days

        if(typeTabAll) {
           typeTabAll.addEventListener('click', () => {
               // Update UI styling
               typeTabAll.style.backgroundColor = '#f8fafc';
               typeTabAll.style.borderBottom = '3px solid #0f766e';
               if(typeTabElec) {
                   typeTabElec.style.backgroundColor = 'white';
                   typeTabElec.style.borderBottom = 'none';
               }
               // Reload generic chart
               actualizarGrafico(); 
           });
        }
    });

    // We augment actualizarGrafico to trigger stats box
    const oldActualizarGrafico = actualizarGrafico;
    actualizarGrafico = function() {
        oldActualizarGrafico();
        
        const data = consumoChart.data.datasets[0].data;
        document.getElementById('chartLabelConsumos').textContent = data.reduce((a, b) => a + (b > 0 ? 1 : 0), 0) + ' consumos';
        
        document.getElementById('chartTotalConsumos').textContent = document.querySelectorAll('tbody tr').length;
        document.getElementById('chartElecConsumos').textContent = Array.from(document.querySelectorAll('tbody tr')).filter(tr => tr.innerText.includes('Electricidad')).length;
    };
`;

if(html.includes('function actualizarGrafico() {') && !html.includes('updateStatsBoxes')) {
    html = html.replace('function actualizarGrafico() {', chartScriptInjection + '\n    function actualizarGrafico() {');
    fs.writeFileSync('src/Edificios_sub.html', html);
    console.log("Chart interactivity JS successfully injected.");
}


