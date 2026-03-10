const fs = require('fs');
let html = fs.readFileSync('dist/Edificios_sub.html', 'utf8');

// The HTML contains 3 selects: edificioElectricidad, edificioCombustible, edificioRecargaGas
// We need to inject a script that fetches '/api/get-user-buildings' and populates them.

const scriptToInject = `
    // LOAD BUILDINGS FOR CURRENT USER
    fetch('/api/get-user-buildings', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.success && data.buildings) {
                const buildings = data.buildings;
                const selects = ['edificioElectricidad', 'edificioCombustible', 'edificioRecargaGas'];
                
                selects.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        el.innerHTML = '<option value="" disabled selected>Seleccione el edificio...</option>';
                        if (buildings.length === 0) {
                            el.innerHTML += '<option value="" disabled>No tienes edificios creados aún</option>';
                        } else {
                            buildings.forEach(b => {
                                el.innerHTML += \`<option value="\${b.name}">\${b.name}</option>\`;
                            });
                        }
                    }
                });
            }
        })
        .catch(err => console.error("Error loading user buildings:", err));
`;

// Find where Choices are initialized to inject our building fetch right near it
const initChoicesIndex = html.indexOf('const provChoises = new Choices');

if (initChoicesIndex !== -1) {
    // Insert just before it
    html = html.substring(0, initChoicesIndex) + scriptToInject + '\n' + html.substring(initChoicesIndex);
    fs.writeFileSync('dist/Edificios_sub.html', html);
    console.log("Injected building fetch script into Edificios_sub.html");
} else {
    // Fallback: append before closing script or body
    const closingScript = html.lastIndexOf('</script>');
    if (closingScript !== -1 && closingScript > html.length - 2000) {
        html = html.substring(0, closingScript) + scriptToInject + '\n</script>' + html.substring(closingScript + 9);
        fs.writeFileSync('dist/Edificios_sub.html', html);
        console.log("Injected building fetch script near bottom of Edificios_sub.html");
    } else {
        console.log("Could not find suitable injection point.");
    }
}
