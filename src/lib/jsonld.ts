import { menuItems } from '../data/menu.ts'
import { CATEGORIES } from './types.ts'
import { config } from './config.ts'

const SCHEMA_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: config.name,
    description: config.description,
    url: config.siteUrl,
    image: `${config.siteUrl}/og.png`,
    servesCuisine: ['Hambúrguer artesanal', 'Defumados'],
    priceRange: '$$',
    telephone: `+${config.whatsapp}`,
    sameAs: [config.instagram.url],
    hasMenu: `${config.siteUrl}/#cardapio`,
    address: {
      '@type': 'PostalAddress',
      ...(config.address.street ? { streetAddress: config.address.street } : {}),
      addressLocality: config.address.city,
      addressRegion: config.address.state,
      ...(config.address.zip ? { postalCode: config.address.zip } : {}),
      addressCountry: 'BR',
    },
    openingHoursSpecification: config.hours.flatMap((h, day) =>
      h
        ? [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: SCHEMA_DAYS[day],
              opens: h.open,
              closes: h.close,
            },
          ]
        : [],
    ),
    menu: {
      '@type': 'Menu',
      hasMenuSection: CATEGORIES.map((categoria) => ({
        '@type': 'MenuSection',
        name: categoria,
        hasMenuItem: menuItems
          .filter((i) => i.categoria === categoria && i.disponivel)
          .map((i) => ({
            '@type': 'MenuItem',
            name: i.nome,
            description: i.descricao,
            offers: {
              '@type': 'Offer',
              price: i.preco.toFixed(2),
              priceCurrency: config.currency,
            },
          })),
      })),
    },
  }
}
