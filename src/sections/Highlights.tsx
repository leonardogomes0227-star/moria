import type { ReactNode } from 'react'
import { BreadIcon, MeatIcon, SauceIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { SpotlightCard } from '@/components/SpotlightCard'

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
              <SpotlightCard className="card h-full p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/60 hover:shadow-glow">
                <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow-ember transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                  {it.icon}
                </span>
                <h3 className="text-2xl">{it.title}</h3>
                <p className="mt-2 text-muted">{it.text}</p>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
