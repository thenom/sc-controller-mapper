/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPPORTER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
