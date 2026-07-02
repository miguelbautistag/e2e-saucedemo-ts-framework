import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

// Modern ESM-safe path resolution relative to the working project directory root
const AUTH_STATE_PATH = path.resolve('auth/standard_user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Enforce 1 retry on CI pipelines to catch environmental flakiness, 0 locally
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  
  // Explicitly direct failure screenshots and trace assets to the requested directory
  outputDir: 'test-results/',

  // CRITICAL FIX: Global configuration properties inherited by all project workers
  use: {
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    // 1. Dedicated Single-Threaded Setup Phase
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // 2. Main Parallel Execution UI Suites dependent on the setup task clearing
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH, // Automatically hydrates the worker contexts with the setup output
      },
      dependencies: ['setup'], // Blocks execution until the setup project succeeds
      testIgnore: /.*\.setup\.ts/,
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: AUTH_STATE_PATH,
      },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    }
  ],
});
