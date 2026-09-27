import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sc-mapping/shared-types': path.resolve(import.meta.dirname, '../../packages/shared-types/src'),
      '@sc-mapping/parser': path.resolve(import.meta.dirname, '../../packages/parser/src'),
      '@sc-mapping/resolver': path.resolve(import.meta.dirname, '../../packages/resolver/src')
    }
  },
  server: {
    port: 5173
  }
});
