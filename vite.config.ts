
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure the public directory is set (default is 'public', but being explicit helps)
  // This tells Vite: "Copy everything inside /public to the root of /dist"
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
