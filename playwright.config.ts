import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: true, // un test.only oublié ne doit jamais rendre la CI verte
  retries: 0, // pas de retry : un test instable est un signal, pas du bruit
  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/e2e.json' }],
    ['html', { outputFolder: 'reports/e2e-html', open: 'never' }],
  ],
  use: {
    baseURL,
    timezoneId: 'Europe/Paris',
    locale: 'fr-FR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm run build && npm run preview', url: baseURL, reuseExistingServer: !process.env.CI },
});
