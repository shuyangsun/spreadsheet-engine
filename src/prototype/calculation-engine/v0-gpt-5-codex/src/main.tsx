// @ts-nocheck
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");

document.documentElement.classList.remove("dark");

defaultThemeFromTokens();

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

function defaultThemeFromTokens() {
  fetch("/theme-tokens.json")
    .then((response) => response.json())
    .then((tokens) => {
      const root = document.documentElement;
      Object.entries(tokens.light ?? {}).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, String(value));
      });
    })
    .catch(() => {
      // Ignore theme token load errors; fall back to compiled defaults.
    });
}
