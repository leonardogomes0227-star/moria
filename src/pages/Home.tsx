import { Footer } from '@/sections/Footer'
import { Gallery } from '@/sections/Gallery'
import { Hero } from '@/sections/Hero'
import { Highlights } from '@/sections/Highlights'
import { Hours } from '@/sections/Hours'
import { HowItWorks } from '@/sections/HowItWorks'
import { Location } from '@/sections/Location'
import { Reviews } from '@/sections/Reviews'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Highlights />
        <HowItWorks />
        <Hours />
        <Reviews />
        <Gallery />
        <Location />
      </main>
      <Footer />
    </>
  )
}
