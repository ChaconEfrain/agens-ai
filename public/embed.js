(async function () {
  const script = document.currentScript;

  const chatbotSlug = script.dataset.chatbotSlug;

  let styles;
  let token;
  try {
    const res = await fetch(
      `https://agens-ai.vercel.app/api/embed-styles?slug=${chatbotSlug}`
    );

    if (!res.ok) {
      console.error("Error fetching embed configuration:", res.statusText);
      return;
    }

    const data = await res.json();

    styles = data.styles;
    token = data.token;
  } catch (error) {
    console.error("Error fetching embed styles:", error);
    return;
  }

  const position = styles.position ?? "bottom-right";
  const themeColor = styles.button.bgColor ?? "#2b2233";
  const buttonWidth = styles.button.width ?? "50px";
  const buttonHeight = styles.button.height ?? "50px";
  const borderRadius = styles.button.borderRadius ?? "30px";
  const width = styles.chat.width ?? "350px";
  const height = styles.chat.height ?? "500px";
  const isBottom = position.includes("bottom");
  const isRight = position.includes("right");

  // Floating button
  const button = document.createElement("button");
  button.innerHTML = styles.button.icon ?? "💬";
  button.style.position = "fixed";
  button.style[isBottom ? "bottom" : "top"] = "16px";
  button.style[isRight ? "right" : "left"] = "16px";
  button.style.width = `${buttonWidth}px`;
  button.style.height = `${buttonHeight}px`;
  button.style.borderRadius = `${borderRadius}px`;
  button.style.border = "none";
  button.style.backgroundColor = themeColor;
  button.style.cursor = "pointer";
  button.style.zIndex = "999998";
  button.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.padding = "0";
  button.style.margin = "0";

  // iframe wrapper
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style[isBottom ? "bottom" : "top"] = "80px";
  wrapper.style[isRight ? "right" : "left"] = "16px";
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.borderRadius = "16px";
  wrapper.style.overflow = "hidden";
  wrapper.style.boxShadow = "0 0 12px rgba(0,0,0,0.15)";
  wrapper.style.zIndex = "999999";
  wrapper.style.display = "none";

  const iframe = document.createElement("iframe");
  iframe.src = `https://agens-ai.vercel.app/embed/${chatbotSlug}`;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.border = "none";
  iframe.style.background = "#fff";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");

  wrapper.appendChild(iframe);
  document.body.appendChild(button);
  document.body.appendChild(wrapper);

  // Chat toggle
  let isOpen = false;
  button.addEventListener("click", () => {
    isOpen = !isOpen;
    wrapper.style.display = isOpen ? "block" : "none";
  });

  // Close with Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      isOpen = false;
      wrapper.style.display = "none";
    }
  });
  // Close with click outside
  document.addEventListener("click", (event) => {
    if (
      isOpen &&
      !wrapper.contains(event.target) &&
      !button.contains(event.target)
    ) {
      isOpen = false;
      wrapper.style.display = "none";
    }
  });
  window.addEventListener("message", (event) => {
    if (event.data?.type === "request-token") {
      const targetOrigin = new URL(iframe.src).origin;
      iframe.contentWindow.postMessage({ type: "token", token }, targetOrigin);
    }
  });
})();
