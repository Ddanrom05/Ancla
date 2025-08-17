document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-proteccion");
  const estado = document.getElementById("estado");
  const openPanel = document.getElementById("abrir-panel"); // ID corregido

  chrome.storage.local.get(["proteccionActiva"], (data) => {
    toggle.checked = data.proteccionActiva || false;
    estado.textContent = toggle.checked ? "Extensión Activa ✅" : "Extensión Desactivada ❌";
  });

  toggle.addEventListener("change", () => {
    chrome.storage.local.set({ proteccionActiva: toggle.checked });
    estado.textContent = toggle.checked ? "Extensión Activa ✅" : "Extensión Desactivada ❌";
  });

  if (openPanel){
    openPanel.addEventListener("click", () => {
      chrome.windows.create({
        url: chrome.runtime.getURL("results.html"),
        type: "popup",
        width: 500,
        height: 600
      });
    });
  }
});