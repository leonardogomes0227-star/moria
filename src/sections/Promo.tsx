import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/Button'
import { WhatsappIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { config } from '@/lib/config'
import { scrollToId } from '@/lib/scroll'
import { whatsappUrl } from '@/lib/whatsapp'
import { useSettings } from '@/store/settings'

/** Banner de chamada para o pedido, com a foto do hero como fundo. */
export function Promo() {
  const whatsapp = useSettings((s) => s.settings.whatsapp)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <section aria-labelledby="promo-title" className="py-10">
      <div className="container-x">
        <Reveal>
          <div
            ref={ref}
            className="relative isolate overflow-hidden rounded-[2rem] border border-brand/40 bg-surface shadow-glow"
          >
            <motion.img
              style={{ y: imgY }}
              src={config.hero.image}
              alt=""
              width={config.hero.width}
              height={config.hero.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[70%_50%] opacity-60 md:w-3/4"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/85 to-transparent"
            />
            <div className="max-w-xl space-y-5 p-8 sm:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">
                Autenticidade que vem do fogo
              </p>
              <h2 id="promo-title" className="text-4xl sm:text-5xl">
                Hambúrguer feito na <span className="text-gradient">brasa</span>, como
                deve ser
              </h2>
              <p className="text-white/80">
                Peça agora o seu artesanal: monte o carrinho e finalize em segundos pelo
                WhatsApp.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => scrollToId('cardapio')}>Pedir agora</Button>
                <Button
                  variant="whatsapp"
                  href={whatsappUrl(whatsapp, config.messages.headerWhatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsappIcon size={20} /> Falar no WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
