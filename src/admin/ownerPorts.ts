import { config, defaultSettings } from '@/lib/config'
import { repo } from '@/lib/data'
import type { OwnerPorts } from '@/lib/ownerCommands'

/** Comandos do dono usando os dados do próprio painel (para testar no simulador, sem WhatsApp). */
export const panelOwnerPorts: OwnerPorts = {
  menu: () => repo.menu.list(),
  async setAvailable(ids, disponivel) {
    for (const id of ids) await repo.menu.patch(id, { disponivel })
  },
  async setPaused(paused) {
    const current = await repo.settings.get()
    await repo.settings.save({ ...defaultSettings, ...current, paused })
  },
  orders: () => repo.orders.list(),
  finance: async () => {
    const [ingredients, recipes] = await Promise.all([repo.finance.ingredients.list(), repo.finance.recipes.list()])
    return { ingredients, recipes }
  },
  now: () => new Date(),
  timeZone: config.timezone,
}
