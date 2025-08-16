const API_KEY = "AIzaSyBFzpUsgPdhaVwB94vvb6w_581SlWfrZBQ"; // <<-- pon tu API Key aquí
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Función para enviar texto a Gemini
async function analizarTexto(texto) {
  try {
    const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analiza este mensaje y clasifícalo en: 
                - Seguro ✅ 
                - Ciberacoso ⚠️ 
                - Grooming 🚨 
                
                Mensaje: "${texto}"`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo analizar";
  } catch (err) {
    console.error("Error al conectar con Gemini:", err);
    return "Error en el análisis";
  }
}

// Escuchar mensajes desde content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analizar") {
    analizarTexto(request.texto).then((resultado) => {
      sendResponse({ resultado });
    });
    return true; // Necesario para usar sendResponse async
  }
});
