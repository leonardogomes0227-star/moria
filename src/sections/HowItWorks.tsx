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
  return (
    <Section
      id="como-funciona"
      eyebrow="Simples e rápido"
      title="Como funciona o pedido"
      className="bg-surface/40"
    >
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Reveal delay={i * 0.12} className="h-full">
              <div className="card relative h-full p-7">
                <span
                  className="text-gradient font-display text-6xl font-extrabold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="mt-2 text-2xl">
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
