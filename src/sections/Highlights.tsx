import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { BreadIcon, MeatIcon, SauceIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'

const items: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Baguetes exclusivas',
    text: 'Pão crocante por fora, macio por dentro, com recheios que você só encontra aqui.',
    icon: <BreadIcon size={30} />,
  },
  {
    title: 'Molho artesanal',
    text: 'Receita da casa, preparada todo dia, com toque defumado que assina cada pedido.',
    icon: <SauceIcon size={30} />,
  },
  {
    title: 'Carnes selecionadas',
    text: 'Cortes escolhidos a dedo, moídos e defumados lentamente para o ponto perfeito.',
    icon: <MeatIcon size={30} />,
  },
]

export function Highlights() {
  return (
    <Section
      id="destaques"
      eyebrow="Nossos diferenciais"
      title="Feito no fogo, feito com capricho"
    >
      <ul className="grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.title}>
            <Reveal delay={i * 0.1} className="h-full">
              <motion.article
                whileHover={{ y: -6 }}
                className="card group h-full p-7 transition-shadow duration-300 hover:border-brand/60 hover:shadow-glow"
              >
                <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow-ember">
                  {it.icon}
                </span>
                <h3 className="text-2xl">{it.title}</h3>
                <p className="mt-2 text-muted">{it.text}</p>
              </motion.article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
