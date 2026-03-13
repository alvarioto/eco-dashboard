import fs from 'fs';

let html = fs.readFileSync('src/company.html', 'utf8');

// Add Acciones column to Vehiculos
html = html.replace(
    /<th>Edificio<\/th>\s*<\/tr>\s*<\/thead>\s*<tbody>\s*<tr>\s*<td><input type="checkbox"><\/td>\s*<td><span class="badge bg-light border text-dark">Vehículos<\/span><\/td>\s*<td>Turismos<\/td>\s*<td>8137KZX<\/td>\s*<td>--<\/td>\s*<td>--<\/td>\s*<td>WV GOLF VARIANT<\/td>\s*<td>La Lonja Tech<\/td>\s*<\/tr>/g,
    `<th>Edificio</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><input type="checkbox"></td>
                          <td><span class="badge bg-light border text-dark">Vehículos</span></td>
                          <td>Turismos</td>
                          <td>8137KZX</td>
                          <td>--</td>
                          <td>--</td>
                          <td>WV GOLF VARIANT</td>
                          <td>La Lonja Tech</td>
                          <td><button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button></td>
                        </tr>`
);

// Add Acciones column to Personal
html = html.replace(
    /<th>Departamento<\/th>\s*<\/tr>\s*<\/thead>\s*<tbody>\s*<tr>\s*<td><input type="checkbox"><\/td>\s*<td>\s*<div class="d-flex align-items-center gap-2">\s*<div\s*class="avatar bg-success-subtle text-success fw-bold rounded-circle d-flex justify-content-center align-items-center"\s*style="width: 30px; height: 30px;">JS<\/div>\s*Jose Alvaro Diaz\s*<\/div>\s*<\/td>\s*<td>eslendis@desarrollocircular.es<\/td>\s*<td>--<\/td>\s*<td>--<\/td>\s*<td><span class="badge bg-light text-dark">La Lonja Tech<\/span><\/td>\s*<td><span class="badge bg-light text-dark">DPTO TÉCICO<\/span><\/td>\s*<\/tr>\s*<tr>\s*<td><input type="checkbox"><\/td>\s*<td>\s*<div class="d-flex align-items-center gap-2">\s*<div\s*class="avatar bg-success-subtle text-success fw-bold rounded-circle d-flex justify-content-center align-items-center"\s*style="width: 30px; height: 30px;">JM<\/div>\s*José Manuel Ramírez Mendoza\s*<\/div>\s*<\/td>\s*<td>josemanuel@desarrollocircular.es<\/td>\s*<td>--<\/td>\s*<td>--<\/td>\s*<td>--<\/td>\s*<td>--<\/td>\s*<\/tr>/g,
    `<th>Departamento</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><input type="checkbox"></td>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div class="avatar bg-success-subtle text-success fw-bold rounded-circle d-flex justify-content-center align-items-center" style="width: 30px; height: 30px;">JS</div>
                              Jose Alvaro Diaz
                            </div>
                          </td>
                          <td>eslendis@desarrollocircular.es</td>
                          <td>--</td>
                          <td>--</td>
                          <td><span class="badge bg-light text-dark">La Lonja Tech</span></td>
                          <td><span class="badge bg-light text-dark">DPTO TÉCICO</span></td>
                          <td><button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button></td>
                        </tr>
                        <tr>
                          <td><input type="checkbox"></td>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div class="avatar bg-success-subtle text-success fw-bold rounded-circle d-flex justify-content-center align-items-center" style="width: 30px; height: 30px;">JM</div>
                              José Manuel Ramírez Mendoza
                            </div>
                          </td>
                          <td>josemanuel@desarrollocircular.es</td>
                          <td>--</td>
                          <td>--</td>
                          <td>--</td>
                          <td>--</td>
                          <td><button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button></td>
                        </tr>`
);

fs.writeFileSync('src/company.html', html);
console.log('Static delete buttons added to Vehiculos and Personal');
