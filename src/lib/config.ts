import {
  PAYMENT_METHODS,
  type DeliveryFee,
  type StoreSettings,
  type WeekHours,
} from './types.ts'

/**
 * Fonte única dos dados da loja. Tudo que estiver marcado com "EDITAR" é placeholder.
 * Este arquivo é importado também pelo vite.config.ts (SEO estático), então não use
 * APIs de navegador nem import.meta.env aqui.
 */

const defaultHours: WeekHours = [
  { open: '18:00', close: '23:00' }, // domingo      — EDITAR
  null, //                              segunda      — EDITAR (fechado)
  { open: '18:00', close: '23:00' }, // terça        — EDITAR
  { open: '18:00', close: '23:00' }, // quarta       — EDITAR
  { open: '18:00', close: '23:00' }, // quinta       — EDITAR
  { open: '18:00', close: '00:00' }, // sexta        — EDITAR
  { open: '18:00', close: '00:00' }, // sábado       — EDITAR
]

const defaultDeliveryFee: DeliveryFee = { mode: 'fixed', amount: 5 } // EDITAR (ou { mode: 'tbd' })

export const config = {
  name: 'Moriá Hamburgueria',
  shortName: 'Moriá',
  slogan: 'O autêntico sabor defumado em Rio Verde de MS',
  description:
    'Hambúrguer artesanal defumado em Rio Verde de Mato Grosso (MS). Baguetes exclusivas, molho artesanal e carnes selecionadas. Peça direto pelo WhatsApp.',
  siteUrl: 'https://moria-hamburgueria.vercel.app', // EDITAR: domínio final
  timezone: 'America/Campo_Grande',
  currency: 'BRL',

  whatsapp: '5567998022571', // número divulgado no Instagram da loja — confirme. Formato: 55 + DDD + número
  instagram: {
    handle: 'moria_hamburgueria',
    url: 'https://instagram.com/moria_hamburgueria',
  },
  credit: { label: 'STCK.Labs', url: 'https://instagram.com/stck.labs' },

  address: {
    street: 'Rua Exemplo, 000 (EDITAR)',
    district: 'Centro (EDITAR)',
    city: 'Rio Verde de Mato Grosso',
    state: 'MS',
    zip: '79480-000', // EDITAR
  },
  /** Link "Como chegar" — EDITAR com o link real do Google Maps. */
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rio+Verde+de+Mato+Grosso+MS',
  /** URL do iframe (modo embed sem chave). EDITAR com o endereço real. */
  mapsEmbedUrl: 'https://www.google.com/maps?q=Rio+Verde+de+Mato+Grosso+MS&output=embed',

  /** Imagem principal do hero. `mode: '3d'` usa a cena Three.js (e /models/burger.glb, se existir). */
  hero: {
    mode: 'photo' as 'photo' | '3d',
    image: '/hero/burger.webp',
    imageSmall: '/hero/burger-640.webp',
    smallWidth: 640,
    width: 940,
    height: 652,
    alt: 'Hambúrguer artesanal duplo com queijo cheddar derretido, segurado com as mãos',
  },

  hours: defaultHours,
  deliveryFee: defaultDeliveryFee,
  notice: '', // aviso de topo, ex.: "Hoje fechamos às 23h"

  /** Acesso do painel quando o Supabase NÃO está configurado (dados ficam só neste navegador). */
  demo: { email: 'demo@moria.com', password: 'moria123' },

  messages: {
    orderTitle: '*Novo pedido - Moriá Hamburgueria*',
    headerWhatsapp:
      'Olá! Vim pelo site da Moriá Hamburgueria e gostaria de fazer um pedido.',
    emptyCart: 'Seu carrinho está vazio. Escolha algo no cardápio!',
    deliveryTbd: 'a combinar',
  },
} as const

export const defaultSettings: StoreSettings = {
  whatsapp: config.whatsapp,
  hours: config.hours,
  deliveryFee: config.deliveryFee,
  notice: config.notice,
  paused: false,
  pauseMessage:
    'Estamos com a cozinha lotada no momento. Tente novamente em alguns minutos.',
  payments: [...PAYMENT_METHODS],
  minOrder: 0,
}

export const DAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const

export const fullAddress = (): string =>
  `${config.address.street} - ${config.address.district}, ${config.address.city}/${config.address.state}`
