function detectarMensajes() {
  // Ejemplo: detecta mensajes en inputs de chat
  const inputs = document.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      const texto = input.value.trim();
      if (texto.length > 5) {
        chrome.runtime.sendMessage(
          { action: "analizar", texto },
          (response) => {
            if (response && response.resultado) {
              console.log("🔎 Análisis Gemini:", response.resultado);

              if (response.resultado.includes("Grooming 🚨")) {
                alert("⚠️ Posible GROOMING detectado. Ten cuidado.");
              } else if (response.resultado.includes("Ciberacoso ⚠️")) {
                alert("⚠️ Posible CIBERACOSO detectado.");
              }
            }
          }
        );
      }
    });
  });
}

detectarMensajes();
