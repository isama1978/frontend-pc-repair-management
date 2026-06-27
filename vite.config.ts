import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Si el comando es 'build', inyecta la ruta de GitHub Pages; si es 'dev', usa la raíz '/'
    base: command === 'build' ? '/frontend-pc-repair-management/' : '/',
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };
});