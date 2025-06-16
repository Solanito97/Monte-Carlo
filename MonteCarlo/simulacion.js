// simulacion.js

function calcularDistribucionProbabilidad(datos) {
    let totalFrecuencia = datos.reduce((acc, item) => acc + item.frecuencia, 0);
    return datos.map(item => ({
        demanda: item.demanda,
        probabilidad: item.frecuencia / totalFrecuencia
    }));
}

function calcularDistribucionAcumulada(distribucion) {
    let acumulado = 0;
    return distribucion.map(item => {
        acumulado += item.probabilidad;
        return {
            ...item,
            probabilidadAcumulada: acumulado
        };
    });
}

function generarNumeroAleatorio() {
    return Math.random();
}

function asignarDemanda(distribucionAcumulada, aleatorio) {
    for (let item of distribucionAcumulada) {
        if (aleatorio <= item.probabilidadAcumulada) {
            return item.demanda;
        }
    }
    return distribucionAcumulada[distribucionAcumulada.length - 1].demanda;
}

function ejecutarSimulacion(datos, diasSimulacion) {
    const distribucion = calcularDistribucionProbabilidad(datos);
    const distribucionAcumulada = calcularDistribucionAcumulada(distribucion);

    const resultados = [];
    for (let i = 0; i < diasSimulacion; i++) {
        const aleatorio = generarNumeroAleatorio();
        const demanda = asignarDemanda(distribucionAcumulada, aleatorio);
        resultados.push(demanda);
    }

    return resultados;
}

function calcularResultadosEstadisticos(resultados) {
    const totalDemanda = resultados.reduce((acc, val) => acc + val, 0);
    const demandaPromedio = totalDemanda / resultados.length;

    return {
        totalDemanda: totalDemanda,
        demandaPromedio: demandaPromedio.toFixed(2),
        demandaPromedioRedondeada: Math.round(demandaPromedio)
    };
}
