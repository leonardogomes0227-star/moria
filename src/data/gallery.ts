import type { GalleryPhoto } from '@/lib/types'

/** EDITAR: fotos de exemplo (arte e recortes da foto do Instagram). Troque por fotos reais em /public/gallery ou pelo painel. */
export const gallery: GalleryPhoto[] = [
  {
    id: 'g1',
    src: '/gallery/post.webp',
    alt: 'Arte da Moriá: hambúrguer feito na brasa, como deve ser',
  },
  { id: 'g2', src: '/gallery/foto-2.webp', alt: 'Pão com gergelim dourado' },
  { id: 'g3', src: '/gallery/foto-3.webp', alt: 'Dois blends suculentos com queijo' },
  { id: 'g4', src: '/gallery/foto-4.webp', alt: 'Cebola roxa e picles no pão' },
  { id: 'g5', src: '/gallery/foto-5.webp', alt: 'Hambúrguer artesanal na mão' },
  { id: 'g6', src: '/gallery/foto-6.webp', alt: 'Cheddar derretido sobre o blend' },
]
