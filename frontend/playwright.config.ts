import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas E2E con Playwright.
 * Requisitos: backend en http://localhost:4000 (con seed) y frontend en http://localhost:3000.
 * Si las variables E2E_START_SERVERS=1, Playwright levanta ambos servidores automáticamente.
 */
const startServers = process.env.E2E_START_SERVERS === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'on',
    locale: 'es-CO',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /e2e-03|e2e-01/ },
  ],
  webServer: startServers
    ? [
        { command: 'npm --prefix ../backend run start:prod', url: 'http://localhost:4000/health', reuseExistingServer: true },
        { command: 'npm run start', url: 'http://localhost:3000/login', reuseExistingServer: true },
      ]
    : undefined,
});
