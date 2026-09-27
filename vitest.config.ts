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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'packages/*/src/**',
        'apps/*/src/**'
      ],
      exclude: [
        // Test files
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        // Build artifacts and dependencies
        '**/node_modules/**',
        '**/dist/**',
        // Pure TypeScript type-declaration files (no runtime code to cover)
        '**/*.d.ts',
        // shared-types: pure interface/type files — no executable runtime code
        'packages/shared-types/**',
        // App entry point — covered transitively, not directly testable
        'apps/web/src/main.tsx',
        // Package barrel re-exports (index.ts) — covered via their re-exported modules
        '**/index.ts',
        // CSS/style files — not JS/TS, cannot have statement coverage
        '**/*.css',
        // JSON data files — not executable code
        '**/*.json',
        // Scratch/scratch verification files
        '**/test-verify*'
      ],
      thresholds: {
        statements: 85,
        // Branch threshold: 80% gate (achieved 83.9% across monorepo after HardwareInspector
        // rAF/Gamepad API polling mocks and parser/resolver test expansions).
        branches: 80,
        functions: 85,
        lines: 85
      }
    }
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
