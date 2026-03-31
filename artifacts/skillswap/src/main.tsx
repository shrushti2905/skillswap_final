import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setupApi } from "./lib/api-setup";
import App from "./App";
import "./index.css";

// Configure API client to attach the token
setupApi();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);