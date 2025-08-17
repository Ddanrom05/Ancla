// results.js (CORREGIDO Y REFORZADO)

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Cargado. Buscando datos en storage...");

    // Carga los datos al iniciar
    chrome.storage.local.get(["analisisResultados"], (data) => {
        if (data && data.analisisResultados) {
            console.log("Datos iniciales encontrados:", data.analisisResultados);
            mostrarResultados(data.analisisResultados);
        } else {
            console.log("No hay datos iniciales en storage.");
        }
    });

    // Escucha cambios en el storage para actualizar en tiempo real
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.analisisResultados) {
            console.log("Cambio detectado. Nuevos datos:", changes.analisisResultados.newValue);
            mostrarResultados(changes.analisisResultados.newValue);
        }
    });
});

function mostrarResultados(data) {
    console.log("Función mostrarResultados llamada con:", data);
    
    // Verificación de datos antes de usarlos
    if (!data || data.length === 0 || !data[0]) {
        console.error("Datos inválidos. No se puede renderizar.");
        return;
    }

    const resultado = data[0];
    const { nivel, descripcion, consejos, porcentajes } = resultado;

    // --- Nivel de riesgo ---
    const nivelRiesgoElem = document.getElementById("nivel-riesgo");
    if (nivelRiesgoElem) {
        nivelRiesgoElem.textContent = nivel.toUpperCase();
        nivelRiesgoElem.className = ''; // Limpia todas las clases
        if (nivel === "alto") {
            nivelRiesgoElem.classList.add("riesgo-alto");
        } else if (nivel === "medio") {
            nivelRiesgoElem.classList.add("riesgo-medio");
        } else {
            nivelRiesgoElem.classList.add("riesgo-bajo");
        }
    }

    // --- Descripción ---
    const descripcionRiesgoElem = document.getElementById("descripcion-riesgo");
    if (descripcionRiesgoElem) {
        descripcionRiesgoElem.textContent = descripcion;
    }

    // --- Consejos ---
    const listaConsejosElem = document.getElementById("lista-consejos");
    if (listaConsejosElem) {
        listaConsejosElem.innerHTML = "";
        consejos.forEach(c => {
            const li = document.createElement("li");
            li.textContent = c;
            listaConsejosElem.appendChild(li);
        });
    }

    // --- Porcentajes (Gráficas) ---
    const graficasElem = document.getElementById("graficas-resultados");
    if (graficasElem) {
        graficasElem.innerHTML = "";
        porcentajes.forEach(p => {
            const container = document.createElement("div");
            container.className = 'barra-container';

            const bar = document.createElement("div");
            bar.className = 'barra';
            
            // Determina el color de la barra según el valor
            if (p.valor > 70) {
                bar.classList.add('barra-roja');
            } else if (p.valor > 40) {
                bar.classList.add('barra-naranja');
            } else {
                bar.classList.add('barra-verde');
            }
            
            bar.textContent = `${p.label}: ${p.valor}%`;
            bar.style.width = p.valor + "%";
            container.appendChild(bar);
            graficasElem.appendChild(container);
        });
    }
}