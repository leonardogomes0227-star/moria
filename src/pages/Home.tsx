import { lazy, Suspense } from 'react'
import { Header } from '@/components/Header'
import { Marquee } from '@/components/Marquee'
import { ScrollProgress } from '@/components/ScrollProgress'
import { Hero } from '@/sections/Hero'

const Sections = lazy(() => import('./Sections'))
const Overlays = lazy(() => import('./Overlays'))

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <ScrollProgress />
      <Header />
      <main id="conteudo">
        <Hero />
        <Marquee />
        <Suspense fallback={<div className="min-h-[200vh]" aria-hidden="true" />}>
          <Sections />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Overlays />
      </Suspense>
    </>
  )
}
