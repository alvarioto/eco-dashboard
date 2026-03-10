const fs = require('fs');
const h = fs.readFileSync('dist/Edificios_sub.html', 'utf8');

// Find chart-related lines
const lines = h.split('\n');
lines.forEach((line, i) => {
    if (line.includes('consumoChart') || line.includes('new Chart') || line.includes('chart-container') || line.includes('canvas') && line.includes('id')) {
        console.log(`L${i + 1}: ${line.substring(0, 150)}`);
    }
});
