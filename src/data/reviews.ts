import type { Review } from '@/lib/types'

/** EDITAR: depoimentos fictícios de exemplo. Troque por feedbacks reais de clientes. */
export const reviews: Review[] = [
  {
    id: 'r1',
    nome: 'Cliente Exemplo 1',
    texto:
      'O defumado é diferente de tudo que já provei na cidade. A carne chega suculenta e o molho é viciante.',
    nota: 5,
    origem: 'Instagram',
  },
  {
    id: 'r2',
    nome: 'Cliente Exemplo 2',
    texto:
      'O Pineapple Cheese é absurdo de bom. Pedi pelo WhatsApp e chegou rápido e quentinho.',
    nota: 5,
    origem: 'WhatsApp',
  },
  {
    id: 'r3',
    nome: 'Cliente Exemplo 3',
    texto:
      'Atendimento atencioso e hambúrguer de verdade, com ingrediente de qualidade. Já virou rotina de fim de semana.',
    nota: 5,
    origem: 'Google',
  },
  {
    id: 'r4',
    nome: 'Cliente Exemplo 4',
    texto:
      'O Bacon Supremo é obrigatório. Preço justo pela qualidade que entregam.',
    nota: 4,
    origem: 'Instagram',
  },
]
