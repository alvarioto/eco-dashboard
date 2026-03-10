const fs = require('fs');
const h = fs.readFileSync('dist/Edificios_sub.html', 'utf8');
const bodyCount = (h.match(/<\/body>/g)||[]).length;
const landingOK = h.includes('abrirLandingPage');
const gasOK = h.includes('Dynamically load refrigerant');
const chartOK = h.includes("type: 'logarithmic'");
const updateOK = h.includes('consumoChart.update()');
const totalCalculosOK = h.includes('totalCalculos');
const spliceOK = h.includes('splice');

console.log('</body> count:', bodyCount, '(should be 2)');
console.log('abrirLandingPage present:', landingOK);
console.log('Gas loading present:', gasOK);
console.log('Logarithmic Y-axis present:', chartOK);
console.log('consumoChart.update present:', updateOK);
console.log('totalCalculos present:', totalCalculosOK);
console.log('splice (corruption indicator):', spliceOK);
console.log('Total file length:', h.length);

// Show what's around the first </body>
const bodyIdx = h.indexOf('</body>');
console.log('\nFirst </body> context:');
console.log(h.substring(bodyIdx - 150, bodyIdx + 60));
