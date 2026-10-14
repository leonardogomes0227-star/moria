import type { ReactNode } from 'react'
import { BreadIcon, MeatIcon, SauceIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { SpotlightCard } from '@/components/SpotlightCard'

const items: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Brioche selado',
    text: 'Pão brioche macio, selado na manteiga, para segurar toda a suculência do hambúrguer.',
    icon: <BreadIcon size={34} />,
  },
  {
    title: 'Molhos e geleias da casa',
    text: 'Maionese especial, barbecue e geleias artesanais de pimenta e abacaxi que fazem a diferença.',
    icon: <SauceIcon size={34} />,
  },
  {
    title: 'Assado na brasa',
    text: 'Hambúrguer de 160g assado na brasa, suculento e com sabor defumado.',
    icon: <MeatIcon size={34} />,
  },
]

export function Highlights() {
  return (
    <Section
      id="destaques"
      eyebrow="por que pedir na Moriá"
      title="Feito no fogo, feito com capricho"
    >
      <ul className="grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.title}>
            <Reveal delay={i * 0.1} className="h-full">
              <SpotlightCard className="card h-full p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brand/60 hover:shadow-glow">
                <span
                  aria-hidden="true"
                  className="outline-text absolute right-5 top-2 font-display text-8xl leading-none"
                >
                  0{i + 1}
                </span>
                <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow-ember transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                  {it.icon}
                </span>
                <h3 className="text-3xl">{it.title}</h3>
                <p className="mt-3 text-muted">{it.text}</p>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
