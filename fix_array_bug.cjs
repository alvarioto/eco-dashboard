const fs = require('fs');
let content = fs.readFileSync('public/factoresdeemision.json', 'utf8');

// Fix the repeated "Comercializadoras": [
let fixed = content.replace(/"Comercializadoras": \[\s*"Comercializadoras": \[/g, '"Comercializadoras": [');
fs.writeFileSync('public/factoresdeemision.json', fixed);
console.log("Fixed Comercializadoras duplication");
