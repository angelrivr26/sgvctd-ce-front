import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45000,
  expect: { timeout: 20000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4205',
    viewport: { width: 1440, height: 1000 },
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath:
        process.env['COMPROBANTES_BROWSER'] ||
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    },
  },
});
