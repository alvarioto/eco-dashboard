import fs from 'fs';

let html = fs.readFileSync('src/Vehiculos.html', 'utf8');

// The bad CSS:
const badCSSRegex = /<style>\s*\/\* Failsafe override for ANY browser ignoring inputs \*\/[\s\S]*?<\/style>/;

const goodCSS = `
<style>
/* Fixed Override for Inputs */
.modal-body .form-control, 
.modal-body .form-select, 
.modal-body input[type="text"], 
.modal-body input[type="number"] {
    display: block !important;
    height: 44px !important;
    line-height: 22px !important;
    padding: 10px 14px !important;
    box-sizing: border-box !important;
    font-size: 15px !important;
}

.modal-body .input-group {
    display: flex !important;
    align-items: stretch !important;
    height: 44px !important;
}

.modal-body .input-group .form-control,
.modal-body .input-group .form-select {
    height: 100% !important;
}

.modal-body .input-group-text {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
    padding: 0 14px !important;
    box-sizing: border-box !important;
    line-height: normal !important;
}
</style>
`;

if (badCSSRegex.test(html)) {
    html = html.replace(badCSSRegex, goodCSS);
} else {
    // If it's not there, just insert before </head>
    html = html.replace('</head>', goodCSS + '\n</head>');
}

// Remove the `flatpickr-input` class to ensure it doesn't mess up height before init
html = html.replace(/flatpickr-input/g, '');

fs.writeFileSync('src/Vehiculos.html', html);
console.log('Fixed CSS override applied.');
