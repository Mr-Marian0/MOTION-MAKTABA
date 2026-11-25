import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Multi-page setup: index.html + every library/*.html is registered
 * automatically, so a new category page only needs its HTML file.
 */
const root = import.meta.dirname;
const libraryDir = resolve(root, 'library');

const libraryPages = existsSync(libraryDir)
  ? Object.fromEntries(
      readdirSync(libraryDir)
        .filter((f) => f.endsWith('.html'))
        .map((f) => [`library/${f.replace('.html', '')}`, resolve(libraryDir, f)])
    )
  : {};

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        ...libraryPages,
      },
    },
  },
});
