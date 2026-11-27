import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    passWithNoTests: true,
    reporters: process.env.CI ? ['default', 'json'] : ['default'],
    outputFile: { json: 'reports/unit.json' },
  },
});
