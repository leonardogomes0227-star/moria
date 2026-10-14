import { gallery as seedGallery } from '../../data/gallery.ts'
import { menuItems } from '../../data/menu.ts'
import { reviews as seedReviews } from '../../data/reviews.ts'
import {
  seedExpenses,
  seedFinanceSettings,
  seedIngredients,
  seedRecipes,
  seedStaff,
} from '../../data/financeSeed.ts'
import { defaultBotSettings } from '../finance/defaults.ts'
import type {
  BotConversation,
  BotSettings,
  Employee,
  Expense,
  FinanceSettings,
  Ingredient,
  MenuItem,
  Order,
  Recipe,
} from '../types.ts'
import { buildDemoConversations } from './demoBot.ts'
import { buildDemoOrders } from './demoOrders.ts'
import type { Crud, Repo } from './repo.ts'

/** Modo demonstração: tudo fica no localStorage deste navegador. */
const KEY = {
  menu: 'moria-demo:menu',
  settings: 'moria-demo:settings',
  orders: 'moria-demo:orders-v2',
  reviews: 'moria-demo:reviews',
  gallery: 'moria-demo:gallery',
  ingredients: 'moria-demo:ingredients',
  recipes: 'moria-demo:recipes',
  expenses: 'moria-demo:expenses',
  staff: 'moria-demo:staff',
  finance: 'moria-demo:finance',
  bot: 'moria-demo:bot',
  botChats: 'moria-demo:bot-chats',
}

/**
 * Versão dos dados de exemplo. Quem já abriu a demonstração tem o cardápio/pedidos antigos salvos no navegador:
 * quando esta versão muda, esses dados são descartados e o exemplo novo entra sozinho.
 * Mude o valor sempre que alterar os dados de exemplo (cardápio, fichas, pedidos…).
 */
const DEMO_DATA_VERSION = '2026-10-cardapio-real-1'
const VERSION_KEY = 'moria-demo:version'

function dropStaleDemoData() {
  try {
    if (localStorage.getItem(VERSION_KEY) === DEMO_DATA_VERSION) return
    Object.values(KEY).forEach((k) => localStorage.removeItem(k))
    localStorage.setItem(VERSION_KEY, DEMO_DATA_VERSION)
  } catch {
    /* sem armazenamento: nada a limpar */
  }
}
dropStaleDemoData()

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

/** CRUD genérico sobre uma lista guardada no localStorage. */
function localCrud<T extends { id: string }>(key: string, seed: () => T[]): Crud<T> {
  return {
    list: async () => read<T[]>(key, seed),
    async save(draft) {
      const list = read<T[]>(key, seed)
      if (draft.id) {
        write(
          key,
          list.map((x) => (x.id === draft.id ? ({ ...x, ...draft } as T) : x)),
        )
      } else {
        write(key, [...list, { ...draft, id: newId() } as T])
      }
    },
    async remove(id) {
      write(
        key,
        read<T[]>(key, seed).filter((x) => x.id !== id),
      )
    },
  }
}

const botChats = () =>
  read<BotConversation[]>(KEY.botChats, () => buildDemoConversations())

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
    async markStock(id, baixado) {
      write(
        KEY.orders,
        orders().map((o) => (o.id === id ? { ...o, estoque_baixado: baixado } : o)),
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

  finance: {
    ingredients: localCrud<Ingredient>(KEY.ingredients, () => seedIngredients),
    expenses: localCrud<Expense>(KEY.expenses, () => seedExpenses),
    staff: localCrud<Employee>(KEY.staff, () => seedStaff),
    recipes: {
      list: async () => read<Recipe[]>(KEY.recipes, () => seedRecipes),
      async save(recipe) {
        const list = read<Recipe[]>(KEY.recipes, () => seedRecipes)
        write(KEY.recipes, [...list.filter((r) => r.item_id !== recipe.item_id), recipe])
      },
      async remove(itemId) {
        write(
          KEY.recipes,
          read<Recipe[]>(KEY.recipes, () => seedRecipes).filter(
            (r) => r.item_id !== itemId,
          ),
        )
      },
    },
    settings: {
      get: async () => read<FinanceSettings>(KEY.finance, () => seedFinanceSettings),
      async save(s) {
        write(KEY.finance, s)
      },
    },
  },

  bot: {
    settings: {
      get: async () => ({ ...defaultBotSettings, ...read<BotSettings>(KEY.bot, () => defaultBotSettings) }),
      async save(s) {
        write(KEY.bot, s)
      },
    },
    conversations: async () =>
      [...botChats()].sort((a, b) => b.ultima_em.localeCompare(a.ultima_em)),
    async setHuman(telefone, ate) {
      write(
        KEY.botChats,
        botChats().map((c) => (c.telefone === telefone ? { ...c, humano_ate: ate } : c)),
      )
    },
    async usage(month) {
      const msgs = botChats()
        .flatMap((c) => c.mensagens)
        .filter((m) => m.criado_em.startsWith(month))
      return {
        mensagens: msgs.length,
        tokens_in: msgs.reduce((n, m) => n + m.tokens_in, 0),
        tokens_out: msgs.reduce((n, m) => n + m.tokens_out, 0),
        tokens_cache: msgs.reduce((n, m) => n + m.tokens_cache, 0),
      }
    },
    async stats(month) {
      const pedidos = orders().filter((o) => o.origem === 'whatsapp' && o.status !== 'cancelado' && o.criado_em.startsWith(month))
      const chats = botChats().filter((c) => c.mensagens.some((m) => m.criado_em.startsWith(month)))
      // Demonstração: as conversas de exemplo são poucas, então estimamos que ~4 em cada 10 conversas viram pedido.
      const conversas = Math.max(chats.length, Math.round(pedidos.length / 0.4))
      return {
        conversas,
        mensagens: chats.reduce((n, c) => n + c.mensagens.length, 0) + (conversas - chats.length) * 9,
        pedidos: pedidos.length,
        faturamento: pedidos.reduce((n, o) => n + o.total, 0),
        atendimentoHumano: Math.max(chats.filter((c) => c.humano_ate).length, Math.round(conversas * 0.06)),
      }
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
