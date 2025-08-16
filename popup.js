document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ action: "getAlerta" }, (response) => {
    document.getElementById("alerta").textContent = response.alerta || "Sin alertas recientes.";
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.alerta) {
    document.getElementById("alerta").textContent = msg.alerta;
  }
});