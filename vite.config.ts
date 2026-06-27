import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:
    process.env.NODE_ENV === "production"
      ? "/frontend-pc-repair-management/"
      : "/",
  test: {
    globals: true, // Permite usar describe, test y expect sin importarlos en cada archivo
    environment: "jsdom", // Simula el DOM de un navegador
    setupFiles: "./src/setupTests.ts", // Archivo de configuración inicial para los matchers extendidos
  },
});
