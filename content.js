function extraerTextoPagina() {
  return document.body.innerText.slice(0, 500);
}

setInterval(() => {
  console.log("Punto de control 1: setInterval está corriendo.");

  chrome.storage.local.get(["proteccionActiva"], (data) => {
    if (data.proteccionActiva) {
      console.log("Punto de control 2: La protección está activa. Preparando fetch.");
      const texto = extraerTextoPagina();

      fetch("http://localhost:3000/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto })
      })
      .then(res => {
        console.log("Punto de control 3: Respuesta del servidor recibida. Estado:", res.status);
        if (!res.ok) {
          throw new Error(`Error en la respuesta del servidor: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Punto de control 4: Respuesta JSON analizada con éxito.");

        // Verifica que la respuesta JSON contenga los datos esperados
        if (!data || !data.resultado || !data.resultado.gemini || !data.resultado.perspective) {
          console.error("❌ Respuesta del servidor inválida o incompleta:", data);
          return;
        }

        const perspectiveScores = data.resultado.perspective?.attributeScores || {};
        const porcentajes = Object.keys(perspectiveScores).map(key => ({
            label: key,
            valor: Math.round(perspectiveScores[key].summaryScore.value * 100)
        }));

        const resultadosParaStorage = [{
            nivel: data.resultado.gemini?.riesgo || "desconocido",
            descripcion: data.resultado.gemini?.motivo || "No disponible",
            consejos: data.resultado.gemini?.consejos || [],
            porcentajes: porcentajes
        }];

        console.log("Punto de control 5: Datos listos para guardar en storage.");

        chrome.storage.local.set({ analisisResultados: resultadosParaStorage }, () => {
          console.log("Punto de control 6: ¡✅ Datos guardados con éxito en storage!");
          chrome.runtime.sendMessage({ nuevoRiesgo: true });
        });
      })
      .catch(err => {
        console.error("❌ Error durante el fetch o el parseo de JSON:", err);
      });
    } else {
        console.log("La protección no está activa. No se ejecuta el análisis.");
    }
  });
}, 8000);