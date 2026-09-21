import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/**/*.spec.ts',
      'packages/**/*.test.ts',
      'apps/**/*.spec.ts',
      'apps/**/*.spec.tsx',
      'apps/**/*.test.tsx'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**'
    ],
  },
  resolve: {
    alias: {
      '@sc-mapping/shared-types': path.resolve(import.meta.dirname, 'packages/shared-types/src'),
      '@sc-mapping/parser': path.resolve(import.meta.dirname, 'packages/parser/src'),
      '@sc-mapping/resolver': path.resolve(import.meta.dirname, 'packages/resolver/src'),
      'react': path.resolve(import.meta.dirname, 'node_modules/react'),
      'react-dom': path.resolve(import.meta.dirname, 'node_modules/react-dom')
    }
  }
});
