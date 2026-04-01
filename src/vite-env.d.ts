/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** If set, browser calls this backend directly (no Vite proxy). Example: http://127.0.0.1:5001 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
