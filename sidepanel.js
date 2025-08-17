function mostrarRiesgos(riesgos) {
  const cont = document.getElementById("riesgos");
  cont.innerHTML = "";
  riesgos.forEach(r => {
    const div = document.createElement("div");
    div.className = `riesgo ${r.riesgo}`;
    div.innerHTML = `
      <strong>${r.riesgo === "alto" ? "🚨 Riesgo ALTO" : r.riesgo === "medio" ? "⚠️ Riesgo MEDIO" : "✔️ Riesgo BAJO"}</strong>
      <div><b>Motivo:</b> ${r.motivo}</div>
      <div><b>Sentimiento:</b> ${r.sentimiento}</div>
      <div><b>Intención:</b> ${r.intencion}</div>
      <div><b>Consejos:</b></div>
      <ul>${r.consejos.map(c => `<li>${c}</li>`).join("")}</ul>
      <hr>
    `;
    cont.appendChild(div);
  });
}

// Recupera los riesgos guardados en chrome.storage
chrome.storage.local.get(["riesgosDetectados"], (result) => {
  if (result.riesgosDetectados) {
    mostrarRiesgos(result.riesgosDetectados);
  }
});

// Escucha actualizaciones en tiempo real
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.nuevoRiesgo) {
    chrome.storage.local.get(["riesgosDetectados"], (result) => {
      mostrarRiesgos(result.riesgosDetectados || []);
    });
  }
});