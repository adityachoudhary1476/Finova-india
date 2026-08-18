import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const { PUBLIC_SITE_URL } = loadEnv(import.meta.env.MODE, process.cwd(), '');

export default defineConfig({
  site: PUBLIC_SITE_URL ?? 'https://finovaindia.netlify.app',
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
