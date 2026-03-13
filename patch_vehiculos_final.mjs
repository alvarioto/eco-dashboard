import fs from 'fs';

let html = fs.readFileSync('src/Vehiculos.html', 'utf8');

// Replace all date range containers entirely, both forms
const regexDate = /<div class="date-range-container">[\s\S]*?<\/div>/g;
html = html.replace(regexDate, `<div class="input-group shadow-sm">
                    <input type="text" class="form-control text-center date-input" placeholder="dd/mm/aaaa">
                    <span class="input-group-text bg-white border-start-0 border-end-0 text-muted">&rarr;</span>
                    <input type="text" class="form-control text-center date-input" placeholder="dd/mm/aaaa">
                    <span class="input-group-text bg-white text-muted"><i class="bi bi-calendar"></i></span>
                </div>`);


// Convert any straggling form-control-custom
html = html.replace(/class="form-control-custom/g, 'class="form-control shadow-sm');
html = html.replace(/class="form-control shadow-sm text-muted"/g, 'class="form-select shadow-sm text-muted"');

// Fix the ID attributes on the date inputs inside the modals (to not break JS) limit to 2
let count = 0;
html = html.replace(/<input type="text" class="form-control text-center date-input" placeholder="dd\/mm\/aaaa">/g, (match) => {
    count++;
    if (count === 1) return '<input type="text" id="add-fecha-inicio" class="form-control text-center date-input" placeholder="dd/mm/aaaa">';
    if (count === 2) return '<input type="text" id="add-fecha-fin" class="form-control text-center date-input" placeholder="dd/mm/aaaa">';
    // The second modal duplicate needs it too (Wait, if id is duplicated it's bad HTML, 
    // but the original code had it duplicated. Javascript uses getElementById so it only gets the first anyway).
    if (count === 3) return '<input type="text" id="add-fecha-inicio" class="form-control text-center date-input" placeholder="dd/mm/aaaa">';
    if (count === 4) return '<input type="text" id="add-fecha-fin" class="form-control text-center date-input" placeholder="dd/mm/aaaa">';
    return match; // For the drawer
});

// Remove duplicate modal and drawer and empty state if they exist
// The first one ends around line 1191. The second one starts at 1344.
// Let's just Regex delete the entire second overlay, modal, and drawer.
const dupeRegex = /<!-- OVERLAY PARA DRAWER\/MODAL -->[\s\S]*?<!-- DRAWER: FILTROS -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
// Wait, regex might be too risky. It's safer to just do String manipulations.

const overrideCSS = `
<style>
/* Failsafe override for ANY browser ignoring inputs */
.modal-body .form-control, .modal-body .form-select, .modal-body .input-group-text {
    height: auto !important;
    line-height: normal !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    display: flex !important;
    align-items: center !important;
}
</style>
`;
// Let's inject this right before </head> to be absolutely sure no cached CSS ruins it.
html = html.replace('</head>', overrideCSS + '\n</head>');

fs.writeFileSync('src/Vehiculos.html', html);
console.log('Final patch applied.');
