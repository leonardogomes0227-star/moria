import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Section } from '@/components/Section'

const steps = [
  {
    n: '01',
    title: 'Carnes selecionadas',
    text: 'Escolhemos o blend com critério. Carne boa é a base de tudo.',
    img: '/menu/burger-2.webp',
  },
  {
    n: '02',
    title: 'Defumado na brasa',
    text: 'O fogo faz o trabalho: crosta suculenta e o sabor defumado que virou assinatura.',
    img: '/gallery/foto-6.webp',
  },
  {
    n: '03',
    title: 'Molhos da casa',
    text: 'Maionese especial, barbecue e geleias artesanais amarram pão, queijo e carne.',
    img: '/menu/burger-4.webp',
  },
  {
    n: '04',
    title: 'Montado na hora',
    text: 'Cada pedido é montado quando você pede, e sai quentinho para a sua mesa.',
    img: '/menu/burger-1.webp',
  },
]

function Step({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const flip = index % 2 === 1
  return (
    <li ref={ref} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
      <motion.div
        initial={{ opacity: 0, x: flip ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`relative overflow-hidden rounded-[2rem] border border-line shadow-card ${flip ? 'md:order-2' : ''}`}
      >
        <motion.img
          style={{ y: imgY, scale: 1.18 }}
          src={step.img}
          alt=""
          width={640}
          height={480}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: flip ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={flip ? 'md:order-1 md:text-right' : ''}
      >
        <span
          aria-hidden="true"
          className="outline-text block font-display text-8xl leading-[0.8] sm:text-9xl"
        >
          {step.n}
        </span>
        <h3 className="mt-2 text-4xl sm:text-5xl">{step.title}</h3>
        <p className="mt-3 max-w-md text-lg text-muted md:inline-block">{step.text}</p>
      </motion.div>
    </li>
  )
}

export function Story() {
  return (
    <Section
      id="historia"
      eyebrow="do fogo ao prato"
      title="Como nasce um Moriá"
      className="overflow-hidden"
    >
      <ol className="space-y-16 md:space-y-24">
        {steps.map((s, i) => (
          <Step key={s.n} step={s} index={i} />
        ))}
      </ol>
    </Section>
  )
}
