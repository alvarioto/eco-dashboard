// calculohuella.js

// Variable global para guardar los factores de combustible desde la base de datos
window.factoresCombustible = null;

async function cargarFactoresCombustible() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/factores-emision', { credentials: 'include' });
        const data = await respuesta.json();
        if (data.success && data.factors) {
            window.factoresCombustible = data.factors;
            console.log('Factores de combustible cargados:', window.factoresCombustible);
        } else {
            console.error('Error al recibir los factores de emisión del servidor.');
        }
    } catch (error) {
        console.error('Error al cargar los factores de combustible:', error);
    }
}

// Función para cargar los datos de la tabla detallescomercializadoras desde la BBDD
async function cargarDetallesComercializadoras() {
    try {
        console.log("Intentando cargar detalles de comercializadoras...");
        const respuesta = await fetch('http://localhost:3000/api/detalles-comercializadoras', { credentials: 'include' });
        const data = await respuesta.json();
        if (data.success && data.data) {
            window.detallesComercializadoras = data.data;
            console.log('Detalles de comercializadoras cargados:', window.detallesComercializadoras);
        } else {
            console.error('Error al recibir los detalles de comercializadoras del servidor.');
        }
    } catch (error) {
        console.error('Error al cargar detalles de comercializadoras:', error);
    }
}

// Función para cargar los datos de recarga de gas desde la BBDD
async function cargarDetallesRecargaGas() {
    try {
        console.log("Intentando cargar detalles de recarga de gas...");
        const respuesta = await fetch('http://localhost:3000/api/detalles-recarga-gas', { credentials: 'include' });
        const data = await respuesta.json();
        if (data.success && data.data) {
            window.detallesRecargaGas = data.data;
            console.log('Detalles de recarga de gas cargados:', window.detallesRecargaGas);
        } else {
            console.error('Error al recibir los detalles de recarga de gas del servidor.');
        }
    } catch (error) {
        console.error('Error al cargar detalles de recarga de gas:', error);
    }
}

// Función para calcular la huella de carbono del Alcance 1
function calcularHuellaAlcance1(tipoCombustible, cantidad, year) {
    // Verifica que se hayan cargado los factores dinámicos
    if (!window.factoresCombustible) {
        console.error("Factores de emisión no cargados.");
        return null;
    }
    // Busca en la variable global el registro que coincida con el combustible y el año
    const registro = window.factoresCombustible.find(rec =>
        rec.Nombre.toLowerCase() === tipoCombustible.toLowerCase() &&
        String(rec.Año) === String(year)
    );
    if (!registro) {
        console.error("No se encontró el registro para:", tipoCombustible, "año:", year);
        return null;
    }
    // Se usa la columna 'Cantidad' como factor de emisión
    const factorEmision = parseFloat(registro.Cantidad);
    return cantidad * factorEmision;
}


// Función para calcular la huella de carbono del Alcance 2
function calcularHuellaAlcance2(comercializadora, consumo) {
    // Comprobar que detallesComercializadoras está definido y es un arreglo
    if (!window.detallesComercializadoras || !Array.isArray(window.detallesComercializadoras)) {
        console.error("Detalles de comercializadoras no cargados o no es un array.");
        return null;
    }

    // Comprobar que el parámetro comercializadora tenga un valor
    if (!comercializadora) {
        console.error("Valor de comercializadora no proporcionado.");
        return null;
    }
    
    const lowerComercializadora = comercializadora.toLowerCase();

    // Buscar el registro validando que cada elemento y su propiedad Comercializadora estén definidos
    const registro = window.detallesComercializadoras.find(item => {
        return item && item.Comercializadora && item.Comercializadora.toLowerCase() === lowerComercializadora;
    });
    
    if (registro) {
        const factor = parseFloat(registro.CO2ekWh);
        if (isNaN(factor)) {
            console.error("El factor CO2ekWh no es un número para:", registro);
            return null;
        }
        return consumo * factor;
    } else {
        console.error("No se encontró la comercializadora:", comercializadora);
        return null;
    }
}




// Función para calcular la huella de carbono para Combustión
function calcularHuellaCombustion(tipoCombustible, cantidad) {
    if (factoresEmisionAdicionales["Combustion"][tipoCombustible]) {
        const factorEmision = factoresEmisionAdicionales["Combustion"][tipoCombustible];
        const huellaCarbono = cantidad * factorEmision;
        return huellaCarbono;
    } else {
        return null; // Combustible no encontrado
    }
}

// Función para calcular la huella de carbono para Recarga de Gas
function calcularHuellaRecargaGas(tipoGas, cantidad) {
    // Verifica que los datos de recarga de gas se hayan cargado
    if (!window.detallesRecargaGas || !Array.isArray(window.detallesRecargaGas)) {
        console.error("Detalles de recarga de gas no cargados o no es un array.");
        return null;
    }
    if (!tipoGas) {
        console.error("Valor de gas no proporcionado.");
        return null;
    }
    const lowerTipo = tipoGas.toLowerCase();
    const registro = window.detallesRecargaGas.find(item =>
        item.Nombre && item.Nombre.toLowerCase() === lowerTipo
    );
    if (registro) {
        const factor = parseFloat(registro.PCA6AR);
        if (isNaN(factor)) {
            console.error("El factor de emisión no es un número para:", registro);
            return null;
        }
        return cantidad * factor;
    } else {
        console.error("No se encontró el gas:", tipoGas);
        return null;
    }
}


// Función para calcular la huella de carbono para Energía Generada
function calcularHuellaEnergiaGenerada(tipoFuente, cantidad) {
    // Calcular la huella de carbono usando un factor de emisión general fijo
    const factorEmisionGeneral = 0.25; // Puedes ajustar este valor si lo deseas
    const huellaCarbono = cantidad * factorEmisionGeneral;

    return huellaCarbono;
}




// Función para mostrar el resultado en el modal
function mostrarResultadoEnModal(mensaje) {
    const resultadoHuellaModal = document.getElementById('resultadoHuellaModal');
    resultadoHuellaModal.textContent = mensaje;
    document.getElementById('resultadoModalContent').style.display = 'flex';
}

// Función para cerrar el modal de resultado
function cerrarModalResultado() {
    document.getElementById('resultadoModalContent').style.display = 'none';
}

// Función para abrir la landing page con el resultado
function abrirLandingPage(mensaje) {
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
        <html>
            <head>
                <title>Resultado del Cálculo de Huella de Carbono</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f0f0f0;
                    }
                    .result-container {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    h1 {
                        color: #004e60;
                    }
                    button {
                        background-color: #004e60;
                        color: white;
                        padding: 10px 15px;
                        border-radius: 5px;
                        border: none;
                        cursor: pointer;
                        font-size: 16px;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="result-container">
                    <h1>Resultado del Cálculo de Huella de Carbono</h1>
                    <p>${mensaje}</p>
                    <button onclick="window.close()">Cerrar</button>
                </div>
            </body>
        </html>
    `);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarFactoresCombustible();
    cargarDetallesComercializadoras();
    cargarDetallesRecargaGas();
});
