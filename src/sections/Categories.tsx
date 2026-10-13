import { motion } from 'framer-motion'
import { MenuImage } from '@/components/MenuImage'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { scrollToId } from '@/lib/scroll'
import { CATEGORIES } from '@/lib/types'
import { useMenuStore } from '@/store/menu'

/** Atalhos visuais: cada categoria abre o cardápio já filtrado. */
export function Categories() {
  const items = useMenuStore((s) => s.items)
  const setCategory = useMenuStore((s) => s.setCategory)

  return (
    <Section
      id="categorias"
      eyebrow="qual é a fome de hoje?"
      title="Escolha sua categoria"
      className="!pb-8"
    >
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c, i) => {
          const list = items.filter((it) => it.categoria === c && it.disponivel)
          const cover = list.find((it) => it.destaque) ?? list[0]
          return (
            <li key={c}>
              <Reveal delay={i * 0.06}>
                <motion.button
                  type="button"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setCategory(c)
                    scrollToId('cardapio')
                  }}
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[1.4rem] border border-line bg-surface text-left"
                >
                  {cover && (
                    <MenuImage
                      src={cover.imagem}
                      alt=""
                      categoria={c}
                      className="!aspect-auto h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[1.4rem] ring-2 ring-inset ring-transparent transition-all group-hover:ring-brand"
                  />
                  <span className="absolute inset-x-3 bottom-3">
                    <span className="block font-display text-[1.15rem] uppercase leading-none tracking-normal sm:text-2xl lg:text-[1.15rem] xl:text-[1.3rem]">
                      {c}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-white/70">
                      {list.length} {list.length === 1 ? 'opção' : 'opções'} →
                    </span>
                  </span>
                </motion.button>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
