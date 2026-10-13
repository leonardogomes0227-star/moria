import { Button } from '@/components/Button'
import { Embers } from '@/components/Embers'
import { HeroScene } from '@/components/HeroScene'
import { config } from '@/lib/config'
import { scrollToId } from '@/lib/scroll'

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-smoke-gradient pt-24"
    >
      <Embers count={22} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(214,31,31,0.25),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,26,0.15),transparent)]"
      />

      <div className="container-x relative grid min-h-[calc(100svh-6rem)] items-center gap-6 pb-10 lg:grid-cols-2">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="mb-3 inline-block rounded-pill border border-ember/40 bg-ember/10 px-4 py-1 text-sm font-semibold text-ember">
            Rio Verde de MS · Artesanal
          </p>
          <h1 id="hero-title" className="text-5xl leading-[1.05] sm:text-6xl xl:text-7xl">
            O autêntico sabor <span className="text-gradient">defumado</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80 lg:mx-0">
            Baguetes exclusivas, molho artesanal e carnes selecionadas. Monte seu pedido e
            envie direto pelo WhatsApp de {config.name}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button onClick={() => scrollToId('cardapio')}>Fazer pedido</Button>
            <Button variant="ghost" onClick={() => scrollToId('cardapio')}>
              Ver cardápio
            </Button>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <HeroScene />
        </div>
      </div>
    </section>
  )
}
