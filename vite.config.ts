import { defineConfig } from 'vite';

// Sur GitHub Pages, l'appli est servie sous /<nom-du-repo>/.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
});
