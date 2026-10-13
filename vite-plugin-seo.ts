import type { Plugin } from 'vite'
import { config } from './src/lib/config.ts'
import { buildJsonLd } from './src/lib/jsonld.ts'

/** Injeta título, meta tags e JSON-LD no HTML a partir de src/lib/config.ts. */
export function seoPlugin(): Plugin {
  const title = `${config.name} | ${config.slogan}`
  const values: Record<string, string> = {
    SEO_TITLE: title,
    SEO_DESCRIPTION: config.description,
    SEO_URL: config.siteUrl,
    SEO_NAME: config.name,
    SEO_PRELOAD: `<link rel="preload" as="image" href="${config.hero.image}" fetchpriority="high" />`,
  }
  return {
    name: 'moria-seo',
    transformIndexHtml(html) {
      const replaced = html.replace(
        /%(SEO_[A-Z_]+)%/g,
        (_, key: string) => values[key] ?? '',
      )
      const ld = `<script type="application/ld+json">${JSON.stringify(buildJsonLd())}</script>`
      return replaced.replace('</head>', `    ${ld}\n  </head>`)
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify(
          {
            name: config.name,
            short_name: config.shortName,
            description: config.description,
            lang: 'pt-BR',
            start_url: '/',
            display: 'standalone',
            background_color: '#0B0F14',
            theme_color: '#0B0F14',
            icons: [
              { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
              {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
          },
          null,
          2,
        ),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${config.siteUrl}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${config.siteUrl}/</loc></url></urlset>\n`,
      })
    },
  }
}
