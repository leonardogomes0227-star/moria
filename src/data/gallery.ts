import type { GalleryPhoto } from '@/lib/types'

/** EDITAR: troque os placeholders por fotos reais (coloque em /public/gallery). */
export const gallery: GalleryPhoto[] = Array.from({ length: 8 }, (_, i) => ({
  id: `g${i + 1}`,
  src: `/placeholders/galeria-${i + 1}.svg`,
  alt: `Foto ${i + 1} da chapa da Moriá Hamburgueria (ilustrativa)`,
}))
