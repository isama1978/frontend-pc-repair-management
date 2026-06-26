/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string;
  // Agregá acá más variables si las necesitás en el futuro
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
