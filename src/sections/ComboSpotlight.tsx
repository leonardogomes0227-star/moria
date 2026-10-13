import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { MenuImage } from '@/components/MenuImage'
import { Reveal } from '@/components/Reveal'
import { addToCart } from '@/lib/cartActions'
import { formatPrice } from '@/lib/format'
import { scrollToId } from '@/lib/scroll'
import { useMenuStore } from '@/store/menu'

/** Banner do combo campeão: preço grande, imagem flutuando e pedido em 1 clique. */
export function ComboSpotlight() {
  const items = useMenuStore((s) => s.items)
  const setCategory = useMenuStore((s) => s.setCategory)
  const combo =
    items.find((i) => i.categoria === 'Combos' && i.destaque && i.disponivel) ??
    items.find((i) => i.categoria === 'Combos' && i.disponivel)
  if (!combo) return null

  return (
    <section aria-labelledby="combo-title" className="py-10">
      <div className="container-x">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-brand via-[#9a1414] to-[#3a0707] p-6 shadow-glow sm:p-12">
            <div aria-hidden="true" className="grill absolute inset-0 -z-10" />
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(255,180,80,0.5),transparent)]"
            />
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div className="text-center md:text-left">
                <p className="-rotate-2 font-script text-2xl text-[#FFD9A8]">
                  promoção da casa
                </p>
                <h2 id="combo-title" className="mt-1 text-5xl leading-[0.95] sm:text-7xl">
                  {combo.nome}
                </h2>
                <p className="mx-auto mt-4 max-w-md text-lg text-white/90 md:mx-0">
                  {combo.descricao}
                </p>
                <span className="mt-6 block font-display text-6xl leading-none sm:text-7xl">
                  {formatPrice(combo.preco)}
                </span>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row md:justify-start">
                  <Button
                    className="justify-center whitespace-nowrap bg-white !text-bg shadow-card hover:!bg-white/90"
                    onClick={(e) => {
                      if (combo.adicionais.length > 0) {
                        setCategory(combo.categoria)
                        scrollToId('cardapio')
                        return
                      }
                      addToCart(
                        {
                          itemId: combo.id,
                          nome: combo.nome,
                          preco: combo.preco,
                          adicionais: [],
                          qtd: 1,
                          obs: '',
                        },
                        e.currentTarget,
                      )
                    }}
                  >
                    Quero esse combo
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-center whitespace-nowrap"
                    onClick={() => {
                      setCategory('Combos')
                      scrollToId('cardapio')
                    }}
                  >
                    Ver todos os combos
                  </Button>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.9, rotate: -4 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="relative animate-float"
              >
                <MenuImage
                  src={combo.imagem}
                  alt={combo.nome}
                  categoria={combo.categoria}
                  className="rounded-3xl shadow-card"
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-4 grid h-24 w-24 rotate-12 place-items-center rounded-full bg-[#FFD23A] text-center font-display text-lg uppercase leading-none text-bg shadow-card sm:h-28 sm:w-28 sm:text-xl"
                >
                  Mais
                  <br />
                  pedido
                </span>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
