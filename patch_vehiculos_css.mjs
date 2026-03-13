import fs from 'fs';

let html = fs.readFileSync('src/Vehiculos.html', 'utf8');

// The CSS rules to modify
const cssReplacements = [
    {
        find: /\.form-control-custom \{\s*width: 100%;\s*padding: 10px 14px;\s*border: 1px solid #d1d5db;\s*border-radius: 6px;\s*font-size: 0\.95rem;\s*color: #374151;\s*outline: none;\s*box-sizing: border-box;\s*\}/g,
        replace: `.form-control-custom {
        width: 100%;
        height: 42px; /* Fixed height for exact alignment */
        line-height: 1.5;
        padding: 8px 14px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.95rem;
        color: #374151;
        outline: none;
        box-sizing: border-box;
    }`
    },
    {
        find: /\.date-input \{\s*border: none;\s*padding: 10px 0;\s*outline: none;\s*width: 100%;\s*font-size: 0\.95rem;\s*text-align: center;\s*color: #374151;\s*background: transparent;\s*\}/g,
        replace: `.date-input {
        border: none;
        padding: 0;
        height: 40px;
        line-height: 40px; /* Vertically center */
        outline: none;
        width: 100%;
        font-size: 0.95rem;
        text-align: center;
        color: #374151;
        background: transparent;
    }`
    },
    {
        find: /\.combined-input input \{\s*flex: 1;\s*border: none;\s*outline: none;\s*padding: 10px 14px;\s*font-size: 0\.95rem;\s*border-radius: 6px 0 0 6px;\s*text-align: right;\s*color: #374151;\s*background: transparent;\s*\}/g,
        replace: `.combined-input input {
        flex: 1;
        border: none;
        outline: none;
        padding: 0 14px;
        height: 40px;
        line-height: 40px;
        font-size: 0.95rem;
        border-radius: 6px 0 0 6px;
        text-align: right;
        color: #374151;
        background: transparent;
    }`
    },
    {
        find: /\.combined-input select,\s*\.combined-input \.fixed-unit \{\s*width: 130px;\s*border: none;\s*outline: none;\s*padding: 10px 14px;\s*font-size: 0\.95rem;\s*background: transparent;\s*color: #374151;\s*border-radius: 0 6px 6px 0;\s*border-left: 1px solid #e5e7eb;\s*\}/g,
        replace: `.combined-input select,
    .combined-input .fixed-unit {
        width: 130px;
        border: none;
        outline: none;
        padding: 0 14px;
        height: 40px;
        line-height: 40px;
        font-size: 0.95rem;
        background: transparent;
        color: #374151;
        border-radius: 0 6px 6px 0;
        border-left: 1px solid #e5e7eb;
    }`
    }
];

cssReplacements.forEach(rep => {
    html = html.replace(rep.find, rep.replace);
});

// Fix the placeholder missing a left margin inside the Identificador único input
html = html.replace(/<input type="text" id="add-id" class="form-control-custom">/, `<input type="text" id="add-id" class="form-control-custom" placeholder="Ej. L-001">`);

fs.writeFileSync('src/Vehiculos.html', html);
console.log('Vehiculos CSS input alignment patched.');
