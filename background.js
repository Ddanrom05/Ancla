// background.js (Versión Final)

// Función para enviar texto a Gemini
async function analizarTexto(texto) {
  try {
    const response = await fetch("http://localhost:3000/analizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });
    const data = await response.json();
    return data.resultado || "{}";
  } catch (err) {
    console.error("Error al conectar con el backend:", err);
    return JSON.stringify({ riesgo: "error", motivo: "Error en el análisis" });
  }
}

// Escucha mensajes desde content.js y results.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Escucha la solicitud del dashboard
    if (request.action === "getAnalysis") {
        console.log("Solicitud de análisis recibida del dashboard. Enviando a content.js...");
        // Envía el mensaje a la pestaña activa para que content.js responda
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "runAnalysis" }, (response) => {
                    // Responde al dashboard con el resultado
                    sendResponse(response);
                });
            }
        });
        return true; // Importante para la respuesta asíncrona
    }
});