import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/components/**', 'src/lib/**'],
      exclude: ['**/*.test.tsx'],
      reporter: ['text', 'html'],
      // Quality Gate del frontend: el CI falla si la cobertura baja de estos umbrales
      thresholds: { lines: 75, branches: 70, functions: 70, statements: 75 },
    },
  },
});
