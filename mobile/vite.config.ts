import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite builds and serves the React app (see "scripts" in package.json).
export default defineConfig({
  plugins: [react()],
});
