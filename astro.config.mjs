import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://finovaindia.netlify.app',
  trailingSlash: 'never',
  integrations: [
    react(),
    sitemap({
      filter: (page) => ![
        '/404',
        '/robots.txt',
        '/privacy',
        '/terms',
        '/disclaimer',
      ].some((path) => page.endsWith(path)),
    }),
  ],
  server: {
    host: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
