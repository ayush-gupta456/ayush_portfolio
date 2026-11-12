import { existsSync } from "node:fs";
import process from "node:process";
import { defineConfig } from '@playwright/test';

const executablePath = [process.env.PLAYWRIGHT_CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe"].find(path => path && existsSync(path));

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'chrome',
    launchOptions: { executablePath },
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
});
