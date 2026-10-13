import { gallery as seedGallery } from '../../data/gallery.ts'
import { menuItems } from '../../data/menu.ts'
import { reviews as seedReviews } from '../../data/reviews.ts'
import type { MenuItem, Order } from '../types.ts'
import { buildDemoOrders } from './demoOrders.ts'
import type { Repo } from './repo.ts'

/** Modo demonstração: tudo fica no localStorage deste navegador. */
const KEY = {
  menu: 'moria-demo:menu',
  settings: 'moria-demo:settings',
  orders: 'moria-demo:orders',
  reviews: 'moria-demo:reviews',
  gallery: 'moria-demo:gallery',
}

const FULL_MSG =
  'O armazenamento do navegador encheu. Use fotos menores ou restaure os dados de demonstração.'

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error(FULL_MSG)
  }
}

function read<T>(key: string, seed: () => T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    /* cai no seed */
  }
  const value = seed()
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sem armazenamento: segue só com o seed em memória */
  }
  return value
}

const newId = () => crypto.randomUUID()
const seedMenu = (): MenuItem[] => menuItems.map((i, ordem) => ({ ...i, ordem }))

const menu = () => read<MenuItem[]>(KEY.menu, seedMenu)
const orders = () => read<Order[]>(KEY.orders, () => buildDemoOrders())
const sorted = (list: MenuItem[]) =>
  [...list].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

/** Reduz a foto para caber no localStorage (máx. 900 px, JPEG). */
function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem.'))
    }
    img.src = url
  })
}

export const localRepo: Repo = {
  mode: 'local',

  menu: {
    list: async () => sorted(menu()),
    async save(draft, nextOrder) {
      const list = menu()
      if (draft.id) {
        write(
          KEY.menu,
          list.map((i) => (i.id === draft.id ? { ...i, ...draft, id: i.id } : i)),
        )
      } else {
        write(KEY.menu, [...list, { ...draft, id: newId(), ordem: nextOrder }])
      }
    },
    async patch(id, patch) {
      write(
        KEY.menu,
        menu().map((i) => (i.id === id ? { ...i, ...patch } : i)),
      )
    },
    async remove(id) {
      write(
        KEY.menu,
        menu().filter((i) => i.id !== id),
      )
    },
    async swap(a, b) {
      write(
        KEY.menu,
        menu().map((i) =>
          i.id === a.id
            ? { ...i, ordem: b.ordem }
            : i.id === b.id
              ? { ...i, ordem: a.ordem }
              : i,
        ),
      )
    },
    async importMany(items) {
      write(
        KEY.menu,
        items.map((i, ordem) => ({ ...i, id: newId(), ordem })),
      )
    },
  },

  settings: {
    get: async () => read(KEY.settings, () => null),
    async save(s) {
      write(KEY.settings, s)
    },
  },

  orders: {
    async create(order) {
      const list = orders()
      const numero = Math.max(0, ...list.map((o) => o.numero)) + 1
      write(KEY.orders, [
        {
          ...order,
          id: newId(),
          numero,
          criado_em: new Date().toISOString(),
          status: 'novo',
        },
        ...list,
      ])
    },
    list: async () =>
      [...orders()].sort((a, b) => b.criado_em.localeCompare(a.criado_em)),
    async setStatus(id, status) {
      write(
        KEY.orders,
        orders().map((o) => (o.id === id ? { ...o, status } : o)),
      )
    },
  },

  reviews: {
    list: async () => read(KEY.reviews, () => seedReviews),
    async save(draft) {
      const list = read(KEY.reviews, () => seedReviews)
      write(
        KEY.reviews,
        draft.id
          ? list.map((r) => (r.id === draft.id ? { ...r, ...draft, id: r.id } : r))
          : [{ ...draft, id: newId() }, ...list],
      )
    },
    async remove(id) {
      write(
        KEY.reviews,
        read(KEY.reviews, () => seedReviews).filter((r) => r.id !== id),
      )
    },
  },

  gallery: {
    list: async () => read(KEY.gallery, () => seedGallery),
    async save(draft) {
      const list = read(KEY.gallery, () => seedGallery)
      write(
        KEY.gallery,
        draft.id
          ? list.map((p) => (p.id === draft.id ? { ...p, ...draft, id: p.id } : p))
          : [...list, { ...draft, id: newId() }],
      )
    },
    async remove(id) {
      write(
        KEY.gallery,
        read(KEY.gallery, () => seedGallery).filter((p) => p.id !== id),
      )
    },
  },

  uploadImage(file) {
    if (!file.type.startsWith('image/'))
      return Promise.reject(new Error('Envie um arquivo de imagem.'))
    return toDataUrl(file)
  },

  resetDemo() {
    Object.values(KEY).forEach((k) => localStorage.removeItem(k))
  },
}
