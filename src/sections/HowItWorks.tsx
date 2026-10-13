import { motion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'

const steps = [
  {
    title: 'Escolha',
    text: 'Navegue pelo cardápio, personalize com adicionais e monte seu carrinho.',
  },
  {
    title: 'Envie pelo WhatsApp',
    text: 'Informe seus dados e finalize: o pedido já vai pronto na conversa.',
  },
  {
    title: 'Receba',
    text: 'Confirmamos o pedido e levamos quentinho até você, ou você retira no balcão.',
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
      eyebrow="Simples e rápido"
      title="Como funciona o pedido"
      className="bg-surface/40"
    >
      <ol ref={ref} className="relative grid gap-5 md:grid-cols-3">
        {/* trilho + linha de progresso (horizontal no desktop, vertical no mobile) */}
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-[1.6rem] top-6 w-0.5 rounded-full bg-white/10 md:hidden"
        />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: progress }}
          className="absolute bottom-6 left-[1.6rem] top-6 w-0.5 origin-top rounded-full bg-brand-gradient md:hidden"
        />
        <span
          aria-hidden="true"
          className="absolute left-[16%] right-[16%] top-10 hidden h-0.5 rounded-full bg-white/10 md:block"
        />
        <motion.span
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute left-[16%] right-[16%] top-10 hidden h-0.5 origin-left rounded-full bg-brand-gradient md:block"
        />
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <Reveal delay={i * 0.12} className="h-full">
              <div className="card relative h-full p-7 pl-16 md:pl-7">
                <span
                  aria-hidden="true"
                  className="absolute left-3 top-6 grid h-8 w-8 place-items-center rounded-full bg-brand-gradient font-bold shadow-glow md:static md:mb-3 md:h-14 md:w-14 md:text-2xl"
                >
                  {i + 1}
                </span>
                <h3 className="text-2xl">
                  <span className="sr-only">Passo {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
