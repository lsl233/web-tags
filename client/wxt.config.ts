import { resolve } from 'node:path';
import { defineConfig } from 'wxt';
import { Manifest } from 'wxt/browser';

// See https://wxt.dev/api/config.html
export default defineConfig({
  hooks: {
    'build:manifestGenerated': (_, manifest) => {
      let newValue = manifest as { options_page?: string } & Manifest.WebExtensionManifest
      if (newValue.options_page !== undefined) newValue.options_ui = undefined
      manifest = newValue
    }
  },
  manifest: {
    permissions: [
      "storage",
      "activeTab",
      "tabs",
      "scripting"
    ],
    options_page: 'options.html'
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  alias: {
    '@': resolve(__dirname, './')
  }
});
