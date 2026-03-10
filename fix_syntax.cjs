const fs = require('fs');
let h = fs.readFileSync('dist/Edificios_sub.html', 'utf8');

// The splice patch left duplicate closing braces after the y-axis block.
// Remove the leftover:  },\n                                border: { display: false }\n                            }\n
// that appears right after the correct y-axis closing brace (at line 1889-1891)

const badFragment = `                            }
                                },
                                border: { display: false }
                            }
                        },
                        animation:`;

const fixedFragment = `                            }
                        },
                        animation:`;

if (h.includes(badFragment)) {
    h = h.replace(badFragment, fixedFragment);
    console.log('✅ Removed duplicate closing braces from Y-axis block');
} else {
    console.log('❌ Bad fragment not found exactly. Searching context...');
    const idx = h.indexOf('easeOutCubic');
    console.log('Context around animation line:', h.substring(idx - 300, idx + 50));
}

fs.writeFileSync('dist/Edificios_sub.html', h);
console.log('✅ Saved');
