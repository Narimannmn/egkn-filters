import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PortalContainerProvider } from "../lib/portalContainer";
import { queryClient } from "../lib/queryClient";
import panelCss from "../styles/panel.css?inline";

const HOST_ID = "egkn-filter-host";

function mount(): void {
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = panelCss;
  shadow.appendChild(style);

  const mountPoint = document.createElement("div");
  mountPoint.className = "egkn-root";
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(
    <QueryClientProvider client={queryClient}>
      <PortalContainerProvider container={mountPoint}>
        <App />
      </PortalContainerProvider>
    </QueryClientProvider>,
  );
}

if (document.body) {
  mount();
} else {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
}
