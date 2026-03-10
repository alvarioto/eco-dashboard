const fs = require('fs');
let html = fs.readFileSync('dist/Edificios_sub.html', 'utf8');

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
                            el.innerHTML += '<option value="" disabled>No tienes edificios registrados aún</option>';
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

// Insert after Choices plugin init
const initChoicesIndex = html.indexOf('const provChoises = new Choices');

if (initChoicesIndex !== -1) {
    // Insert just before it
    html = html.substring(0, initChoicesIndex) + scriptToInject + '\\n' + html.substring(initChoicesIndex);
    fs.writeFileSync('dist/Edificios_sub.html', html);
    console.log("✅ Injected building fetch script into Edificios_sub.html");
} else {
    // Fallback
    const fallbackPoint = html.lastIndexOf('</script>');
    if(fallbackPoint !== -1) {
       html = html.substring(0, fallbackPoint) + '\\n' + scriptToInject + '\\n</script>' + html.substring(fallbackPoint + 9);
       fs.writeFileSync('dist/Edificios_sub.html', html);
       console.log("✅ Injected building fetch script near bottom of Edificios_sub.html (Fallback)");
    } else {
       console.log("❌ Could not find an injection point.");
    }
}
