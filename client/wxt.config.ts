import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: [
      "storage",
      "activeTab",
      "tabs",
      "scripting"
    ],
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  alias: {
    '@': resolve(__dirname, './')
  }
});
