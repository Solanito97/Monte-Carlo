// Mejoras sugeridas para funcionalidad.js

const datosDemanda = [];

// Función mejorada para mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'error') {
    const contenedor = document.getElementById('mensajes') || crearContenedorMensajes();
    contenedor.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`;
    setTimeout(() => contenedor.innerHTML = '', 3000);
}

function crearContenedorMensajes() {
    const contenedor = document.createElement('div');
    contenedor.id = 'mensajes';
    document.body.insertBefore(contenedor, document.body.firstChild);
    return contenedor;
}

// Función mejorada para agregar datos
window.agregarDato = function () {
    const demanda = parseInt(document.getElementById("demanda").value);
    const frecuencia = parseInt(document.getElementById("frecuencia").value);

    // Validaciones mejoradas
    if (isNaN(demanda) || isNaN(frecuencia)) {
        mostrarMensaje("Por favor ingrese valores numéricos válidos.");
        return;
    }

    if (demanda < 0) {
        mostrarMensaje("La demanda no puede ser negativa.");
        return;
    }

    if (frecuencia <= 0) {
        mostrarMensaje("La frecuencia debe ser mayor a cero.");
        return;
    }

    // Verificar duplicados
    if (datosDemanda.some(item => item.demanda === demanda)) {
        mostrarMensaje("Ya existe un registro con esa demanda. Actualice la frecuencia existente.");
        return;
    }

    datosDemanda.push({ demanda, frecuencia });
    actualizarTabla();
    limpiarCampos();
    mostrarMensaje("Dato agregado correctamente.", 'exito');
};

// Función para eliminar datos
window.eliminarDato = function(index) {
    if (confirm("¿Está seguro de eliminar este dato?")) {
        datosDemanda.splice(index, 1);
        actualizarTabla();
        mostrarMensaje("Dato eliminado correctamente.", 'exito');
    }
};

// Tabla mejorada con opción de eliminar
function actualizarTabla() {
    const tabla = document.getElementById("tablaDatos");
    let html = "<thead><tr><th>Demanda</th><th>Frecuencia</th><th>Probabilidad</th><th>Acciones</th></tr></thead><tbody>";
    
    const totalFrecuencia = datosDemanda.reduce((sum, item) => sum + item.frecuencia, 0);
    
    datosDemanda.forEach((item, index) => {
        const probabilidad = (item.frecuencia / totalFrecuencia * 100).toFixed(2);
        html += `<tr>
            <td>${item.demanda}</td>
            <td>${item.frecuencia}</td>
            <td>${probabilidad}%</td>
            <td><button onclick="eliminarDato(${index})" class="btn-eliminar">Eliminar</button></td>
        </tr>`;
    });
    
    html += "</tbody>";
    tabla.innerHTML = html;
}

// Simulación mejorada con más estadísticas
window.simular = function () {
    const diasSimulacion = parseInt(document.getElementById("diasSimulacion").value);
    const nivelInventario = parseInt(document.getElementById("nivelInventario").value);
    const costoAlmacen = parseFloat(document.getElementById("costoAlmacen").value);
    const costoEscasez = parseFloat(document.getElementById("costoEscasez").value);

    // Validaciones mejoradas
    if (datosDemanda.length === 0) {
        mostrarMensaje("Debe ingresar al menos un dato de demanda.");
        return;
    }

    if (isNaN(diasSimulacion) || diasSimulacion < 100) {
        mostrarMensaje("Debe simular al menos 100 días.");
        return;
    }

    if (isNaN(nivelInventario) || nivelInventario < 0) {
        mostrarMensaje("El nivel de inventario debe ser un número válido mayor o igual a cero.");
        return;
    }

    if (isNaN(costoAlmacen) || costoAlmacen < 0 || isNaN(costoEscasez) || costoEscasez < 0) {
        mostrarMensaje("Los costos deben ser números válidos mayores o iguales a cero.");
        return;
    }

    const resultados = ejecutarSimulacion(datosDemanda, diasSimulacion, nivelInventario, costoAlmacen, costoEscasez);
    mostrarResultados(resultados);
    mostrarMensaje("Simulación completada exitosamente.", 'exito');
};

// Función de simulación con más estadísticas
function ejecutarSimulacion(datos, dias, nivelInventario, costoAlmacen, costoEscasez) {
    const totalFrecuencia = datos.reduce((sum, item) => sum + item.frecuencia, 0);
    const probabilidades = datos.map(item => ({
        demanda: item.demanda,
        probabilidad: item.frecuencia / totalFrecuencia
    }));

    let escasezCount = 0;
    let excesoCount = 0;
    let costoExcesoTotal = 0;
    let costoEscasezTotal = 0;
    const simulaciones = [];
    const demandas = [];

    for (let i = 0; i < dias; i++) {
        const aleatorio = Math.random();
        let acumulada = 0;
        let demandaSimulada = 0;

        for (const p of probabilidades) {
            acumulada += p.probabilidad;
            if (aleatorio <= acumulada) {
                demandaSimulada = p.demanda;
                break;
            }
        }

        demandas.push(demandaSimulada);
        
        let estado = 'normal';
        let costoExceso = 0;
        let costoEscasez = 0;

        if (demandaSimulada > nivelInventario) {
            escasezCount++;
            costoEscasez = (demandaSimulada - nivelInventario) * costoEscasez;
            costoEscasezTotal += costoEscasez;
            estado = 'escasez';
        } else if (demandaSimulada < nivelInventario) {
            excesoCount++;
            costoExceso = (nivelInventario - demandaSimulada) * costoAlmacen;
            costoExcesoTotal += costoExceso;
            estado = 'exceso';
        }

        simulaciones.push({
            dia: i + 1,
            demanda: demandaSimulada,
            inventario: nivelInventario,
            estado: estado,
            costoExceso: costoExceso,
            costoEscasez: costoEscasez
        });
    }

    // Calcular estadísticas adicionales
    const demandaPromedio = demandas.reduce((a, b) => a + b, 0) / demandas.length;
    const varianza = demandas.reduce((acc, val) => acc + Math.pow(val - demandaPromedio, 2), 0) / demandas.length;
    const desviacionEstandar = Math.sqrt(varianza);

    return {
        simulaciones,
        demandas,
        estadisticas: {
            demandaPromedio: demandaPromedio.toFixed(2),
            desviacionEstandar: desviacionEstandar.toFixed(2),
            demandaMaxima: Math.max(...demandas),
            demandaMinima: Math.min(...demandas)
        },
        probabilidadEscasez: ((escasezCount / dias) * 100).toFixed(2),
        probabilidadExceso: ((excesoCount / dias) * 100).toFixed(2),
        costoPromedioExceso: (costoExcesoTotal / dias).toFixed(2),
        costoPromedioEscasez: (costoEscasezTotal / dias).toFixed(2),
        costoTotalPromedio: ((costoExcesoTotal + costoEscasezTotal) / dias).toFixed(2)
    };
}

// Mostrar resultados mejorados
function mostrarResultados({ simulaciones, estadisticas, probabilidadEscasez, probabilidadExceso, costoPromedioExceso, costoPromedioEscasez, costoTotalPromedio }) {
    // Guardar los resultados para usar en tabla completa y exportación
    ultimosResultados = simulaciones;
    
    const resultadoDiv = document.getElementById("resultadoSimulacion");
    resultadoDiv.innerHTML = `
        <div class="estadisticas-grid">
            <div class="stat-card">
                <h4>Estadísticas de Demanda</h4>
                <p><strong>Demanda Promedio:</strong> ${estadisticas.demandaPromedio}</p>
                <p><strong>Desviación Estándar:</strong> ${estadisticas.desviacionEstandar}</p>
                <p><strong>Demanda Máxima:</strong> ${estadisticas.demandaMaxima}</p>
                <p><strong>Demanda Mínima:</strong> ${estadisticas.demandaMinima}</p>
            </div>
            <div class="stat-card">
                <h4>Probabilidades</h4>
                <p><strong>Probabilidad de Escasez:</strong> ${probabilidadEscasez}%</p>
                <p><strong>Probabilidad de Exceso:</strong> ${probabilidadExceso}%</p>
            </div>
            <div class="stat-card">
                <h4>Costos Promedio</h4>
                <p><strong>Costo de Exceso:</strong> $${costoPromedioExceso}</p>
                <p><strong>Costo de Escasez:</strong> $${costoPromedioEscasez}</p>
                <p><strong>Costo Total:</strong> $${costoTotalPromedio}</p>
            </div>
        </div>
    `;

    // Mostrar tabla resumida por defecto
    mostrarTablaResultados(simulaciones);
    
    // Configurar el botón de tabla completa
    const btnToggle = document.getElementById("btnToggleTabla");
    if (btnToggle) {
        btnToggle.textContent = "Mostrar Tabla Completa";
        btnToggle.disabled = false;
    }
    
    // Generar el gráfico
    graficarResultados(simulaciones);
    
    // Mostrar mensaje de éxito
    mostrarMensaje("Simulación completada exitosamente.", 'exito');
}

// Mostrar solo los primeros 50 resultados por defecto
function mostrarTablaResultados(resultados) {
    const tabla = document.getElementById("tablaResultados");
    const limite = 50;
    
    let html = `<thead><tr><th>Día</th><th>Demanda</th><th>Inventario</th><th>Estado</th><th>Costo</th></tr></thead><tbody>`;
    
    for (let i = 0; i < Math.min(limite, resultados.length); i++) {
        const item = resultados[i];
        const costo = item.costoExceso + item.costoEscasez;
        html += `<tr class="${item.estado}">
            <td>${item.dia}</td>
            <td>${item.demanda}</td>
            <td>${item.inventario}</td>
            <td>${item.estado}</td>
            <td>$${costo.toFixed(2)}</td>
        </tr>`;
    }
    
    html += "</tbody>";
    
    if (resultados.length > limite) {
        html += `<tfoot><tr><td colspan="5">Mostrando primeros ${limite} de ${resultados.length} días</td></tr></tfoot>`;
    }
    
    tabla.innerHTML = html;
}

window.toggleTablaCompleta = function() {
    const tabla = document.getElementById("tablaResultados");
    const btn = document.getElementById("btnToggleTabla");
    
    if (tabla.dataset.completa === "true") {
        tabla.dataset.completa = "false";
        btn.textContent = "Mostrar Tabla Completa";
        mostrarTablaResultados(ultimosResultados);
    } else {
        tabla.dataset.completa = "true";
        btn.textContent = "Mostrar Resumen";
        mostrarTablaCompleta(ultimosResultados);
    }
};

// Variable para guardar los últimos resultados
let ultimosResultados = [];

// Función para mostrar tabla completa
function mostrarTablaCompleta(resultados) {
    const tabla = document.getElementById("tablaResultados");
    
    let html = `<thead><tr><th>Día</th><th>Demanda</th><th>Inventario</th><th>Estado</th><th>Costo</th></tr></thead><tbody>`;
    
    resultados.forEach(item => {
        const costo = item.costoExceso + item.costoEscasez;
        html += `<tr class="${item.estado}">
            <td>${item.dia}</td>
            <td>${item.demanda}</td>
            <td>${item.inventario}</td>
            <td>${item.estado}</td>
            <td>$${costo.toFixed(2)}</td>
        </tr>`;
    });
    
    html += "</tbody>";
    tabla.innerHTML = html;
}

// Función para exportar resultados
window.exportarResultados = function() {
    if (!ultimosResultados || ultimosResultados.length === 0) {
        mostrarMensaje("No hay resultados para exportar.", "error");
        return;
    }

    let csvContent = "Día,Demanda,Inventario,Estado,Costo\n";
    
    ultimosResultados.forEach(item => {
        const costo = item.costoExceso + item.costoEscasez;
        csvContent += `${item.dia},${item.demanda},${item.inventario},${item.estado},${costo.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'resultados_simulacion.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Función para graficar resultados (actualizada)
function graficarResultados(resultados) {
    const ctx = document.getElementById('graficoResultados').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (window.resultadosChart) {
        window.resultadosChart.destroy();
    }
    
    // Preparar datos para el gráfico
    const dias = resultados.map(item => item.dia);
    const demandas = resultados.map(item => item.demanda);
    const inventarios = resultados.map(item => item.inventario);
    
    window.resultadosChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dias,
            datasets: [
                {
                    label: 'Demanda',
                    data: demandas,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                },
                {
                    label: 'Inventario',
                    data: inventarios,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Demanda vs Inventario'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = resultados[context.dataIndex];
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y;
                            
                            if (data.estado !== 'normal') {
                                label += ` (${data.estado})`;
                            }
                            
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
// Función para limpiar todos los datos de demanda
window.limpiarTodosDatos = function() {
    if (datosDemanda.length === 0) {
        mostrarMensaje("No hay datos para limpiar.", "info");
        return;
    }

    if (confirm("¿Está seguro que desea eliminar todos los datos de demanda?")) {
        datosDemanda.length = 0; // Vaciar el array
        actualizarTabla();
        mostrarMensaje("Todos los datos han sido eliminados.", "exito");
    }
};

// Función para limpiar campos de entrada (si no la tienes)
function limpiarCampos() {
    document.getElementById("demanda").value = "";
    document.getElementById("frecuencia").value = "";
}
