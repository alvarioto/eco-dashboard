const fs = require('fs');
let h = fs.readFileSync('dist/Edificios_sub.html', 'utf8');

// Fix 1: Replace logarithmic with linear scale + display in tonnes
const oldY = `                            y: {
                                type: 'logarithmic',
                                stacked: false,
                                min: 1,
                                grid: { color: 'rgba(156,163,175,0.12)', borderDash: [3, 3] },
                                ticks: {
                                    color: '#9ca3af',
                                    font: { family: "'Nunito', sans-serif", size: 11 },
                                    callback: function (v) {
                                        if (v === 0) return '0';
                                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                                        if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
                                        return v;
                                    }
                                },
                                border: { display: false }
                            }`;

const newY = `                            y: {
                                beginAtZero: true,
                                stacked: false,
                                grid: { color: 'rgba(156,163,175,0.12)', borderDash: [3, 3] },
                                ticks: {
                                    color: '#9ca3af',
                                    font: { family: "'Nunito', sans-serif", size: 11 },
                                    callback: function (v) {
                                        // Display in tonnes CO2e
                                        const t = v / 1000;
                                        if (t >= 1000) return (t/1000).toFixed(0) + 'kt';
                                        if (t >= 1)    return t.toFixed(t >= 10 ? 0 : 1) + 't';
                                        return (v).toFixed(0) + 'kg';
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Emisiones (t CO₂e)',
                                    color: '#9ca3af',
                                    font: { family: "'Nunito', sans-serif", size: 11 }
                                },
                                border: { display: false }
                            }`;

if (h.includes(oldY)) {
    h = h.replace(oldY, newY);
    console.log('✅ Y-axis fixed: back to linear, showing tonnes');
} else {
    console.log('❌ Y-axis block not found. Searching for logarithmic...');
    const idx = h.indexOf("type: 'logarithmic'");
    if (idx >= 0) {
        console.log('Found at:', idx);
        console.log('Context:', h.substring(idx-100, idx+500));
    }
}

fs.writeFileSync('dist/Edificios_sub.html', h);
console.log('✅ Saved');
