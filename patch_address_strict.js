import fs from 'fs';

let html = fs.readFileSync('src/company.html', 'utf8');

// The user strictly asked for: "ciudad codigo postal y municipio y calle fiel y verdadera"
// Current html has: direccion, region, provincia, ciudad, pais, superficie.
// I will rewrite the address fields section in the modal.

const oldAddressFields = /<div class="mb-2">\s*<label class="form-label">Dirección \*<\/label>\s*<div class="input-group">\s*<input class="form-control" id="direccionNuevoEdificio" placeholder="Calle, número..." required>\s*<span class="input-group-text"><i class="bi bi-geo-alt"><\/i><\/span>\s*<\/div>\s*<\/div>\s*<div class="row mb-2">\s*<div class="col"><label class="form-label">Región<\/label><input class="form-control" id="regionNuevoEdificio"><\/div>\s*<div class="col"><label class="form-label">Provincia<\/label><input class="form-control" id="provinciaNuevoEdificio"><\/div>\s*<div class="col"><label class="form-label">Ciudad \*<\/label><input class="form-control" id="ciudadNuevoEdificio" required><\/div>\s*<\/div>\s*<div class="row mb-2">\s*<div class="col">\s*<label class="form-label">País \*<\/label>\s*<select class="form-select" id="paisNuevoEdificio" required>\s*<option value="">-- Selecciona --<\/option>\s*<option value="España" selected>España<\/option>\s*<option value="Portugal">Portugal<\/option>\s*<option value="Francia">Francia<\/option>\s*<option value="Otro">Otro<\/option>\s*<\/select>\s*<\/div>\s*<div class="col">\s*<label class="form-label">Superficie<\/label>\s*<div class="input-group">\s*<input type="number" step="0.01" class="form-control" id="superficieNuevoEdificio">\s*<span class="input-group-text">m²<\/span>\s*<\/div>\s*<\/div>\s*<\/div>/g;

const newAddressFields = `
                          <div class="mb-2">
                            <label class="form-label">Calle *</label>
                            <div class="input-group">
                              <input class="form-control" id="direccionNuevoEdificio" placeholder="Calle fiel y verdadera..." required>
                              <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
                            </div>
                          </div>
                          <div class="row mb-2">
                            <div class="col">
                              <label class="form-label">Municipio *</label>
                              <input class="form-control" id="municipioNuevoEdificio" placeholder="Municipio" required>
                            </div>
                            <div class="col">
                              <label class="form-label">Ciudad *</label>
                              <input class="form-control" id="ciudadNuevoEdificio" placeholder="Ciudad" required>
                            </div>
                          </div>
                          <div class="row mb-2">
                            <div class="col">
                              <label class="form-label">C.P. *</label>
                              <input class="form-control" id="codigoPostalNuevoEdificio" placeholder="Código Postal" required>
                            </div>
                            <div class="col">
                              <label class="form-label">País *</label>
                              <select class="form-select" id="paisNuevoEdificio" required>
                                <option value="">-- Selecciona --</option>
                                <option value="España" selected>España</option>
                                <option value="Portugal">Portugal</option>
                                <option value="Francia">Francia</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </div>
                          </div>
                          <div class="mb-2">
                              <label class="form-label">Superficie</label>
                              <div class="input-group">
                                <input type="number" step="0.01" class="form-control" id="superficieNuevoEdificio">
                                <span class="input-group-text">m²</span>
                              </div>
                          </div>
`;

if(oldAddressFields.test(html)) {
    html = html.replace(oldAddressFields, newAddressFields);
    fs.writeFileSync('src/company.html', html);
    console.log("Successfully rebuilt building address fields.");
} else {
    console.error("Could not find the address fields block to replace.");
}

// Ensure the real JS payload includes the new postal code and municipio
let payloadRegex = /const payload = \{[\s\S]*?\};/;
let newPayload = `const payload = {
                        name: nombre,
                        property_type: document.getElementById('tipoNuevoEdificio').value,
                        address: document.getElementById('direccionNuevoEdificio').value,
                        municipio: document.getElementById('municipioNuevoEdificio').value,
                        ciudad: document.getElementById('ciudadNuevoEdificio').value,
                        codigo_postal: document.getElementById('codigoPostalNuevoEdificio').value,
                        pais: document.getElementById('paisNuevoEdificio').value,
                        superficie: document.getElementById('superficieNuevoEdificio').value || null
                    };`;

if(payloadRegex.test(html)) {
    html = html.replace(payloadRegex, newPayload);
    fs.writeFileSync('src/company.html', html);
    console.log("Successfully rebuilt the building JS payload.");
} else {
    console.error("Could not find the payload block.");
}

