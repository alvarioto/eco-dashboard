const fs = require('fs');
const h = fs.readFileSync('dist/Edificios_sub.html', 'utf8');
const lines = h.split('\n');
lines.forEach((l, i) => {
    if (l.includes('Choices') || l.includes('proveedores') || l.includes('selectProveedor')) {
        console.log(i + 1, ':', l.substring(0, 140));
    }
});
