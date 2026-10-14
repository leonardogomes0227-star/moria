import { seedFinanceSettings, seedIngredients, seedRecipes } from '../../src/data/financeSeed.ts'
import { menuItems } from '../../src/data/menu.ts'
import { buildContext } from '../../src/lib/finance/calc.ts'
import { rankByProfit } from '../../src/lib/finance/marginRank.ts'
import { defaultSettings } from '../../src/lib/config.ts'
import { defaultBotSettings } from '../../src/lib/finance/defaults.ts'
import { env } from './env.js'
import { isOpenAt } from './hours.js'
import type { BotStore, StoreInfo } from './types.js'

/**
 * Loja de demonstração: cardápio e horários de exemplo do próprio site, sem banco de dados.
 * Só serve para o chat de teste (`dryRun`): não cria pedido, não grava conversa, não avisa ninguém.
 */
export function createStaticStore(): BotStore {
  return {
    async loadStore(): Promise<StoreInfo> {
      const tz = env.timezone()
      return {
        name: env.storeName(),
        address: env.storeAddress(),
        instagram: env.storeInstagram(),
        timezone: tz,
        settings: defaultSettings,
        bot: { ...defaultBotSettings, ativo: true },
        menu: menuItems,
        open: isOpenAt(defaultSettings.hours, new Date(), tz),
        topProfit: rankByProfit(menuItems, buildContext(seedIngredients, seedRecipes), seedFinanceSettings).slice(0, 5).map((r) => r.item.nome),
      }
    },
    history: async () => [],
    createOrder: async () => ({ numero: 0 }),
    ordersOf: async () => [],
    requestHuman: async () => undefined,
  }
}
