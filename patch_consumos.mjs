import fs from 'fs';

let html = fs.readFileSync('src/Edificios_sub.html', 'utf8');

// 1. Lock modal height to prevent resizing
html = html.replace(
    '<div class="col-lg-6 v2-form-col">',
    '<div class="col-lg-6 v2-form-col" style="min-height: 600px;">'
);

const allCurrencies = `
                                            <option value="EUR">EUR (€)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="JPY">JPY (¥)</option>
                                            <option value="CNY">CNY (¥)</option>
                                            <option value="MXN">MXN ($)</option>
                                            <option value="BRL">BRL (R$)</option>
                                            <option value="ARS">ARS ($)</option>
                                            <option value="COP">COP ($)</option>
                                            <option value="CLP">CLP ($)</option>
                                            <option value="PEN">PEN (S/)</option>
                                            <option value="CAD">CAD ($)</option>
                                            <option value="AUD">AUD ($)</option>
                                            <option value="CHF">CHF (CHF)</option>
                                            <option value="INR">INR (₹)</option>
`;

// 2. Add currencies to Electricidad
html = html.replace(
    /<select id="monedaElectricidad">\s*<option value="EUR">EUR \(€\)<\/option>\s*<option value="USD">USD \(\$\)<\/option>\s*<option value="GBP">GBP \(£\)<\/option>\s*<\/select>/g,
    `<select id="monedaElectricidad">${allCurrencies}                                        </select>`
);

// 3. Add currencies to Combustible
html = html.replace(
    /<select id="monedaCombustible">\s*<option value="EUR">EUR \(€\)<\/option>\s*<option value="USD">USD \(\$\)<\/option>\s*<option value="GBP">GBP \(£\)<\/option>\s*<\/select>/g,
    `<select id="monedaCombustible">${allCurrencies}                                        </select>`
);

// 4. Add currencies to RecargaGas
html = html.replace(
    /<select id="monedaRecargaGas">\s*<option value="EUR">EUR \(€\)<\/option>\s*<option value="USD">USD \(\$\)<\/option>\s*<option value="GBP">GBP \(£\)<\/option>\s*<\/select>/g,
    `<select id="monedaRecargaGas">${allCurrencies}                                        </select>`
);

fs.writeFileSync('src/Edificios_sub.html', html);
console.log('src/Edificios_sub.html updated: Modal size locked and Currencies expanded.');
