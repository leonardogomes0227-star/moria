import { motion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { MenuIcon, WhatsappIcon, PinIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'

const steps = [
  {
    title: 'Escolha',
    text: 'Navegue pelo cardápio, personalize com adicionais e monte o carrinho.',
    icon: <MenuIcon size={30} />,
  },
  {
    title: 'Envie pelo WhatsApp',
    text: 'Informe seus dados e finalize: o pedido já vai pronto na conversa.',
    icon: <WhatsappIcon size={30} />,
  },
  {
    title: 'Receba',
    text: 'Confirmamos e levamos quentinho até você, ou você retira no balcão.',
    icon: <PinIcon size={30} />,
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null)
  // A linha "acende" conforme os passos entram na tela.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  return (
    <Section
      id="como-funciona"
      eyebrow="simples e rápido"
      title="Pedir é fácil"
      tone="red"
    >
      <ol ref={ref} className="relative grid gap-5 md:grid-cols-3">
        <span
          aria-hidden="true"
          className="absolute left-[16%] right-[16%] top-11 hidden h-1 rounded-full bg-black/25 md:block"
        />
        <motion.span
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute left-[16%] right-[16%] top-11 hidden h-1 origin-left rounded-full bg-white md:block"
        />
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <Reveal delay={i * 0.12} className="h-full">
              <div className="relative h-full rounded-[1.6rem] bg-bg/90 p-7 text-center shadow-card backdrop-blur">
                <span className="relative z-10 mx-auto mb-4 grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full border-4 border-brand bg-bg text-ember">
                  {s.icon}
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-brand font-display text-lg text-white"
                  >
                    {i + 1}
                  </span>
                </span>
                <h3 className="text-3xl">
                  <span className="sr-only">Passo {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-2 text-white/75">{s.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
