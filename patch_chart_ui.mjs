import fs from 'fs';

let html = fs.readFileSync('src/Edificios_sub.html', 'utf8');

const newChartHTML = `
    <!-- Filtros de la Gráfica -->
    <div class="d-flex align-items-center gap-2 mb-3">
        <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
            <i class="bi bi-plus"></i> Añadir filtro
        </button>
        <div class="badge bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2 fw-normal" style="font-size: 0.85rem;">
            <i class="bi bi-calendar"></i> Año <span class="ms-1 fw-bold">2023</span> <i class="bi bi-chevron-down ms-1"></i>
        </div>
        <div class="badge bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2 fw-normal" style="font-size: 0.85rem;">
            <i class="bi bi-lightning-charge"></i> Tipo <span class="text-muted mx-1">es</span> <span class="fw-bold">Electricidad</span> <i class="bi bi-chevron-down ms-1"></i>
            <button class="btn-close btn-close-sm ms-2" style="font-size: 0.6rem;"></button>
        </div>
    </div>

    <!-- Gráfico de barras / líneas V2 Interactivo -->
    <div class="card mb-5 w-100" style="border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: none; overflow: hidden;">
        
        <!-- Tabs Superiores de la Gráfica -->
        <div class="d-flex border-bottom bg-white">
            <div class="p-3" style="width: 50%; border-right: 1px solid #e5e7eb; cursor: pointer;">
                <div class="d-flex align-items-center gap-2 mb-1">
                    <div style="width: 12px; height: 12px; background-color: #10b981; border-radius: 2px;"></div>
                    <span class="fw-semibold text-dark" style="font-size: 0.95rem;">Todos</span>
                </div>
                <div class="text-muted" style="font-size: 1.1rem;">
                    <span class="fw-bold text-dark fs-5" id="chartTotalConsumos">2</span> consumos
                </div>
            </div>
            
            <div class="p-3" style="width: 50%; cursor: pointer; border-bottom: 3px solid #0f766e; background-color: #f8fafc;">
                <div class="d-flex align-items-center gap-2 mb-1">
                    <div style="width: 12px; height: 12px; background-color: #fcd34d; border-radius: 2px;"></div>
                    <span class="fw-semibold text-dark" style="font-size: 0.95rem;">Electricidad</span>
                </div>
                <div class="text-muted" style="font-size: 1.1rem;">
                    <span class="fw-bold text-dark fs-5" id="chartElecConsumos">2</span> consumos <i class="bi bi-info-circle ms-1 small text-muted"></i>
                </div>
            </div>
        </div>

        <div class="card-body" style="padding: 20px;">
            <!-- Controles Internos de la Gráfica -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h6 class="text-muted fw-normal mb-1">Días con consumo</h6>
                    <h4 class="fw-bold mb-0 text-dark"><span id="chartLabelConsumos">2</span> consumos</h4>
                </div>
                <div class="btn-group border rounded" style="background: #fff;">
                    <button class="btn btn-sm px-3 fw-semibold text-dark" style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; margin: 2px;">Días con consumo</button>
                    <button class="btn btn-sm px-3 text-muted fw-normal" style="border: none; margin: 2px; background: transparent;">Kilovatio hora (kWh)</button>
                </div>
            </div>

            <!-- Contenedor del Canvas -->
            <div class="chart-container" style="padding: 0; margin-top: 0; height: 300px;">
                <canvas id="consumoChart"></canvas>
            </div>
        </div>
    </div>`;

const basicChartHTMLREGEX = /<!-- Gráfico de barras \/ líneas V2 -->[\s\S]*?<div class="card mb-5 w-100"[\s\S]*?<div class="chart-container" style="padding: 0; margin-top: 0;">\s*<canvas id="consumoChart"><\/canvas>\s*<\/div>\s*<\/div>\s*<\/div>/;

if (basicChartHTMLREGEX.test(html)) {
    html = html.replace(basicChartHTMLREGEX, newChartHTML);
    fs.writeFileSync('src/Edificios_sub.html', html);
    console.log('Chart UI successfully updated.');
} else {
    // Try a more flexible replacement
    const basicChartSplit = html.split('<!-- Gráfico de barras / líneas V2 -->');
    if (basicChartSplit.length > 1) {
        const afterSplit = basicChartSplit[1].split('<!-- Tabla de Consumos -->');
        if (afterSplit.length > 1) {
            html = basicChartSplit[0] + newChartHTML + '\n\n    <!-- Tabla de Consumos -->' + afterSplit[1];
            fs.writeFileSync('src/Edificios_sub.html', html);
            console.log('Chart UI string updated with fallback method.');
        } else {
            console.error('Could not find Tabla de Consumos block!');
        }
    } else {
        console.error('Could not find existing basic chart UI!');
    }
}
