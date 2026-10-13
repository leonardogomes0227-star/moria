import type { Addon, Category, MenuItem } from '../lib/types.ts'

/**
 * Cardápio de exemplo (fallback quando o Supabase não está configurado).
 * EDITAR: todos os nomes, descrições e preços abaixo são fictícios.
 */

/** Imagem de cada item: foto (recortes da foto do Instagram) ou ilustração de estúdio gerada por scripts/gen-products.mjs. */
const photos: Record<string, string> = {
  h1: '/menu/burger-1.webp',
  h2: '/menu/burger-2.webp',
  h3: '/menu/burger-3.webp',
  h4: '/menu/burger-4.webp',
  h5: '/menu/frango.svg',
  h6: '/menu/veggie.svg',
  b1: '/menu/baguete-costela.svg',
  b2: '/menu/baguete-frango.svg',
  b3: '/menu/baguete-calabresa.svg',
  b4: '/menu/baguete-bacon.svg',
  a1: '/menu/batata.svg',
  a2: '/menu/batata-cheddar.svg',
  a3: '/menu/aneis-cebola.svg',
  m1: '/menu/molho-artesanal.svg',
  m2: '/menu/molho-barbecue.svg',
  m3: '/menu/molho-alho.svg',
  d1: '/menu/refrigerante-lata.svg',
  d2: '/menu/refrigerante-1l.svg',
  d3: '/menu/suco.svg',
  c1: '/menu/combo-classico.svg',
  c2: '/menu/combo-casal.svg',
  c3: '/menu/combo-baguete.svg',
}

const burgerAddons: Addon[] = [
  { nome: 'Bacon crocante', preco: 5 },
  { nome: 'Queijo extra', preco: 4 },
  { nome: 'Molho artesanal extra', preco: 3 },
  { nome: 'Ovo', preco: 3 },
]

const baguetteAddons: Addon[] = [
  { nome: 'Queijo extra', preco: 4 },
  { nome: 'Bacon crocante', preco: 5 },
  { nome: 'Molho artesanal extra', preco: 3 },
]

const make = (
  id: string,
  categoria: Category,
  nome: string,
  descricao: string,
  preco: number,
  extra: Partial<Pick<MenuItem, 'destaque' | 'disponivel' | 'adicionais'>> = {},
): MenuItem => ({
  id,
  categoria,
  nome,
  descricao,
  preco,
  imagem: photos[id] ?? '',
  destaque: extra.destaque ?? false,
  disponivel: extra.disponivel ?? true,
  adicionais: extra.adicionais ?? [],
})

export const menuItems: MenuItem[] = [
  make(
    'h1',
    'Hambúrgueres',
    'Moriá Clássico',
    'Blend bovino defumado de 160g, queijo prato, alface, tomate e molho artesanal no pão brioche.',
    28,
    { destaque: true, adicionais: burgerAddons },
  ),
  make(
    'h2',
    'Hambúrgueres',
    'Vulcão Bacon',
    'Blend defumado 160g, cheddar derretido, bacon crocante, cebola caramelizada e molho barbecue da casa.',
    34,
    { destaque: true, adicionais: burgerAddons },
  ),
  make(
    'h3',
    'Hambúrgueres',
    'Brasa Dupla',
    'Dois blends de 120g, queijo prato duplo, picles e maionese defumada.',
    38,
    { adicionais: burgerAddons },
  ),
  make(
    'h4',
    'Hambúrgueres',
    'Fumaça Suprema',
    'Blend 180g defumado por 6h, queijo provolone, rúcula, tomate confit e aioli de alho assado.',
    36,
    { adicionais: burgerAddons },
  ),
  make(
    'h5',
    'Hambúrgueres',
    'Frango Defumado',
    'Filé de frango empanado crocante, queijo, alface americana e molho da casa.',
    26,
    { adicionais: burgerAddons },
  ),
  make(
    'h6',
    'Hambúrgueres',
    'Moriá Veggie',
    'Burger de grão-de-bico e cogumelos, queijo, rúcula e molho de ervas.',
    27,
    { adicionais: burgerAddons, disponivel: false },
  ),
  make(
    'b1',
    'Baguetes',
    'Baguete Costela Defumada',
    'Baguete crocante recheada com costela desfiada defumada, queijo derretido e molho artesanal.',
    32,
    { destaque: true, adicionais: baguetteAddons },
  ),
  make(
    'b2',
    'Baguetes',
    'Baguete Frango Cremoso',
    'Frango desfiado temperado, catupiry, milho e batata palha na baguete tostada.',
    26,
    { adicionais: baguetteAddons },
  ),
  make(
    'b3',
    'Baguetes',
    'Baguete Calabresa Brasa',
    'Calabresa artesanal grelhada, queijo, vinagrete e molho picante da casa.',
    27,
    { adicionais: baguetteAddons },
  ),
  make(
    'b4',
    'Baguetes',
    'Baguete Bacon & Cheddar',
    'Hambúrguer 120g, muito cheddar, bacon crocante e cebola crispy.',
    33,
    { adicionais: baguetteAddons },
  ),
  make(
    'a1',
    'Acompanhamentos',
    'Batata Frita Crocante',
    'Porção de 300g com sal defumado.',
    16,
  ),
  make(
    'a2',
    'Acompanhamentos',
    'Batata com Cheddar e Bacon',
    'Porção de 300g coberta com cheddar cremoso e bacon.',
    24,
    { destaque: true },
  ),
  make('a3', 'Acompanhamentos', 'Anéis de Cebola', '10 anéis empanados e dourados.', 18),
  make(
    'm1',
    'Molhos',
    'Molho Artesanal Moriá',
    'Receita da casa, levemente defumado. Pote de 50ml.',
    4,
  ),
  make(
    'm2',
    'Molhos',
    'Barbecue Brasa',
    'Barbecue agridoce com toque de fumaça. Pote de 50ml.',
    4,
  ),
  make(
    'm3',
    'Molhos',
    'Maionese de Alho Assado',
    'Cremosa, feita todo dia. Pote de 50ml.',
    4,
  ),
  make('d1', 'Bebidas', 'Refrigerante Lata', 'Coca-Cola, Guaraná ou Sprite (350ml).', 6),
  make('d2', 'Bebidas', 'Refrigerante 1L', 'Consulte os sabores disponíveis.', 11),
  make('d3', 'Bebidas', 'Suco Natural 400ml', 'Laranja, limão ou maracujá.', 9),
  make(
    'c1',
    'Combos',
    'Combo Moriá Clássico',
    'Moriá Clássico + batata frita + refrigerante lata.',
    46,
    { destaque: true },
  ),
  make(
    'c2',
    'Combos',
    'Combo Casal',
    '2 hambúrgueres à escolha + batata com cheddar e bacon + 2 refrigerantes.',
    89,
  ),
  make(
    'c3',
    'Combos',
    'Combo Baguete',
    'Baguete à escolha + batata frita + refrigerante lata.',
    48,
  ),
]
