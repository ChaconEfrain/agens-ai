(function () {
  if (window.location.pathname.includes("/embed/")) return;
  const script = document.currentScript;

  const chatbotSlug = script.dataset.chatbotSlug;
  const position = script.dataset.position || "bottom-right";
  const themeColor = script.dataset.themeColor || "oklch(0.21 0.006 285.885)";
  const color = script.dataset.color || "#fff";
  const width = script.dataset.width || "350px";
  const height = script.dataset.height || "500px";
  const customStyles = script.dataset.customStyles || "";

  // Posiciones
  const isBottom = position.includes("bottom");
  const isRight = position.includes("right");

  // Crear botón flotante
  const button = document.createElement("button");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style[isBottom ? "bottom" : "top"] = "20px";
  button.style[isRight ? "right" : "left"] = "20px";
  button.style.width = "56px";
  button.style.height = "56px";
  button.style.borderRadius = "50%";
  button.style.border = "none";
  button.style.backgroundColor = themeColor;
  button.style.color = color;
  button.style.fontSize = "24px";
  button.style.cursor = "pointer";
  button.style.zIndex = "999998";
  button.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

  // Crear wrapper (contenedor del iframe)
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style[isBottom ? "bottom" : "top"] = "80px";
  wrapper.style[isRight ? "right" : "left"] = "20px";
  wrapper.style.width = width;
  wrapper.style.height = height;
  wrapper.style.borderRadius = "16px";
  wrapper.style.overflow = "hidden";
  wrapper.style.boxShadow = "0 0 12px rgba(0,0,0,0.15)";
  wrapper.style.zIndex = "999999";
  wrapper.style.display = "none"; // Oculto al inicio

  const iframe = document.createElement("iframe");
  iframe.src = `http://localhost:3000/embed/${chatbotSlug}`;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.border = "none";
  iframe.style.background = "#fff";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");

  wrapper.appendChild(iframe);
  document.body.appendChild(button);
  document.body.appendChild(wrapper);

  // Toggle del chat
  let isOpen = false;
  button.addEventListener("click", () => {
    isOpen = !isOpen;
    wrapper.style.display = isOpen ? "block" : "none";
    button.innerHTML = isOpen ? "❌" : "💬";
  });
  // Cerrar el chat con Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      isOpen = false;
      wrapper.style.display = "none";
      button.innerHTML = "💬";
    }
  });

  // Estilos extra del cliente (opcional)
  if (customStyles) {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customStyles;
    document.head.appendChild(styleTag);
  }
})();
