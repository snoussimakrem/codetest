import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const external=process.env.PREVIEW_URL;
export default defineConfig({
  testDir:'./tests',testMatch:'*.spec.ts',workers:1,timeout:45000,
  use:{baseURL:external || 'http://localhost:3100',headless:true,launchOptions:{...(existsSync('/usr/bin/google-chrome')?{executablePath:'/usr/bin/google-chrome'}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader']}},
  webServer:external?undefined:{command:'npm run dev -w @venturex/web -- --port 3100',url:'http://localhost:3100',reuseExistingServer:!process.env.CI,timeout:120000}
});
