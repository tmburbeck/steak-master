/// <reference types="vite/client" />

// Tells TypeScript which VITE_* environment variables exist (see mobile/.env.example).
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}
