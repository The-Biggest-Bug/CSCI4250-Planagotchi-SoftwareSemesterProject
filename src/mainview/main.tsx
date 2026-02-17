import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Electroview } from "electrobun/view";
import App from "./App";

// enables dragging to work
new Electroview({ rpc: { setTransport: (t) => t } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
