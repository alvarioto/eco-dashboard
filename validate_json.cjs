const fs = require('fs');
let content = fs.readFileSync('public/factoresdeemision.json', 'utf8');

// The array starts with `{ "Comercializadora": "AB ENERGÍA 1903."` without a key or array bracket
content = content.replace(/\{\s*"Comercializadora": "AB ENERGÍA 1903\.",/, '"Comercializadoras": [\n    {\n        "Comercializadora": "AB ENERGÍA 1903.",');

// The array ends with `UNION FENOSA COMERCIAL.` object, then a bunch of `}`
content = content.replace(/"Comercializadora": "UNION FENOSA COMERCIAL\.",\s*"kg CO2e\/kWh": 0\.31\s*\}/, '"Comercializadora": "UNION FENOSA COMERCIAL.",\n        "kg CO2e/kWh": 0.31\n    }\n]');

try {
    JSON.parse(content);
    fs.writeFileSync('public/factoresdeemision.json', content);
    console.log("SUCCESS");
} catch (e) {
    console.log("ERROR: " + e.message);
    fs.writeFileSync('public/factoresdeemision.json', content);
}
