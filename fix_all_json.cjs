const fs = require('fs');
let content = fs.readFileSync('public/factoresdeemision.json', 'utf8');

// 1. Garbled root closure at line 289
content = content.replace(/\}\s*\}\s*\}\s*"Factores de emisión por gases"/, '}\n    },\n    "Factores de emisión por gases"');

// 2. Garbled "VEHÍCULOS Y MAQUINARIA""A. Transporte por carretera": {
content = content.replace(/##\s*"VEHÍCULOS Y MAQUINARIA""A\. Transporte por carretera":/g, '},\n"VEHÍCULOS Y MAQUINARIA": {\n"A. Transporte por carretera":');

// 3. Garbled "factores emision por gases" = {
content = content.replace(/"factores emision por gases"\s*=\s*\{/g, '},\n"factores emision por gases": {');

// 4. Garbled "Gasolina aviación (l)": "Aéreo": {
content = content.replace(/"Gasolina aviación \(l\)": "Aéreo": \{/g, '"Gasolina aviación (l)": {\n"Aéreo": {');

// 5. Garbled "Transporte ferroviario"
content = content.replace(/,Transporte ferroviario, marítimo y aéreo"Transporte ferroviario, marítimo y aéreo": \{/g, '},\n"Transporte ferroviario, marítimo y aéreo": {');

// 6. Garbled "factores de emision por gas" = \n "Gasóleo (l)": {
content = content.replace(/"factores de emision por gas"\s*=\s*\n\s*"Gasóleo \(l\)": \{/g, '},\n"factores de emision por gas": {\n"Gasóleo (l)": {');

// 7. Garbled "factores de emision de maquinaria" = \n "Gasóleo B (l)": {
content = content.replace(/"factores de emision de maquinaria"\s*=\s*\n\s*"Gasóleo B \(l\)": \{/g, '},\n"factores de emision de maquinaria": {\n"Gasóleo B (l)": {');

// 8. Missing commas and trailing commas globally
content = content.replace(/([\}])(\s*)"([^"]+)"\s*:/g, '$1,$2"$3":');
content = content.replace(/([0-9"a-zA-Z])(\s*\n\s*)"([^"]+)"\s*:/g, '$1,$2"$3":');
content = content.replace(/,(\s*[}\]])/g, '$1');

// Because inserting commas implicitly everywhere can sometimes result in duplicates `,,`, fix them:
content = content.replace(/,(\s*),/g, ',$1');

try {
    JSON.parse(content);
    console.log("SUCCESS");
} catch (e) {
    console.log("ERROR: " + e.message);
}
fs.writeFileSync('public/factoresdeemision.json', content);
