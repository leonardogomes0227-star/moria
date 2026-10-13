import type { GalleryPhoto } from '@/lib/types'

/** EDITAR: fotos de exemplo (recortes da foto do Instagram). Troque por fotos reais em /public/gallery. */
const alts = [
  'Hambúrguer duplo com cheddar derretido',
  'Pão com gergelim dourado',
  'Dois blends suculentos com queijo',
  'Cebola roxa e picles no pão',
  'Hambúrguer artesanal na mão',
  'Cheddar derretido sobre o blend',
]

export const gallery: GalleryPhoto[] = alts.map((alt, i) => ({
  id: `g${i + 1}`,
  src: `/gallery/foto-${i + 1}.webp`,
  alt,
}))
