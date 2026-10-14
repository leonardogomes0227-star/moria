import type { Category, MenuItem } from '../lib/types.ts'

/**
 * Cardápio da Moriá Hamburgueria (nomes, descrições e preços informados pela loja).
 * Os preços marcados "a partir de" são o valor base: as opções (queijo, folhas, cebola) não mudam o preço.
 * É também o cardápio de demonstração quando o Supabase não está configurado.
 */

/** Imagem de cada item: recortes da foto do Instagram ou ilustração de estúdio (scripts/gen-products.mjs). */
const photos: Record<string, string> = {
  h1: '/menu/burger-2.webp',
  h2: '/menu/burger-1.webp',
  h3: '/menu/burger-3.webp',
  h4: '/menu/burger-4.webp',
  h5: '/menu/burger-5.webp',
  h6: '/menu/frango.svg',
  h7: '/menu/burger-2.webp',
  h8: '/menu/burger-1.webp',
  h9: '/menu/burger-3.webp',
  h10: '/menu/burger-4.webp',
  h11: '/menu/burger-5.webp',
  h12: '/menu/burger-2.webp',
  h13: '/menu/burger-1.webp',
  h14: '/menu/burger-3.webp',
  h15: '/menu/burger-4.webp',
  h16: '/menu/burger-5.webp',
  h17: '/menu/x-burguer.svg',
  t1: '/menu/x-burguer.svg',
  t2: '/menu/x-burguer.svg',
  t3: '/menu/x-burguer.svg',
  t4: '/menu/x-bacon.svg',
  t5: '/menu/x-bacon.svg',
  t6: '/menu/x-bacon.svg',
  t7: '/menu/x-bacon.svg',
  t8: '/menu/x-frango.svg',
  t9: '/menu/x-frango.svg',
  t10: '/menu/x-bacon.svg',
  d1: '/menu/refrigerante-lata.svg',
  d2: '/menu/refrigerante-1l.svg',
  d3: '/menu/refrigerante-1l.svg',
}

const FROM = ' Preço a partir deste valor, conforme as opções escolhidas.'

type Row = [id: string, categoria: Category, nome: string, preco: number, descricao: string, opts?: { destaque?: boolean; from?: boolean }]

const rows: Row[] = [
  ['h8', 'Hambúrgueres', 'Clássico Moriá', 28, 'Pão brioche selado, hambúrguer artesanal de 160g assado na brasa, queijo à escolha (cheddar cremoso ou queijo caipira derretido), alface americana, tomate e cebola roxa.', { destaque: true, from: true }],
  ['h1', 'Hambúrgueres', 'Bacon Supremo 1.0', 31.9, 'Pão brioche, hambúrguer de 160g assado na brasa (suculento e defumado), bacon crocante em tiras, cheddar derretido, maionese especial da casa, rúcula ou alface, tomate e cebola roxa ou caramelizada. Barbecue opcional.', { destaque: true, from: true }],
  ['h2', 'Hambúrgueres', 'Clássico Brasa', 29, 'Pão brioche selado na manteiga, hambúrguer de 160g assado na brasa, queijo cheddar, cebola caramelizada, rúcula fresca e tomate em rodelas.'],
  ['h3', 'Hambúrgueres', 'Pineapple Cheese', 35, 'Pão brioche, hambúrguer de 150g assado na brasa, mussarela e cream cheese, geleia de abacaxi artesanal com leve toque apimentado, bacon crocante, rúcula ou alface, tomate e maionese da casa.', { destaque: true }],
  ['h4', 'Hambúrgueres', 'Pineapple Bacon', 32, 'Pão brioche, hambúrguer de 150g assado na brasa, mussarela, geleia de abacaxi artesanal com leve toque apimentado, bacon crocante, rúcula ou alface, tomate e maionese da casa.'],
  ['h5', 'Hambúrgueres', 'Cheese Pepper', 35, 'Pão brioche, hambúrguer de 150g assado na brasa, mussarela e cream cheese, geleia de pimenta artesanal, bacon crocante, rúcula ou alface, tomate e maionese da casa.'],
  ['h6', 'Hambúrgueres', 'Frango Clássico', 30, 'Pão brioche selado, 160g de filé de frango fatiado, grelhado e bem temperado, queijo caipira derretido, rúcula, cebola roxa, tomate, picles e molho tradicional da casa.', { from: true }],
  ['h7', 'Hambúrgueres', 'Bacon Supremo 2.0', 39.9, 'Pão brioche selado na manteiga, 2 hambúrgueres de 160g assados na brasa, bacon crocante e cheddar em dobro, maionese especial da casa e molho barbecue, rúcula ou alface americana, tomate italiano e cebola roxa ou caramelizada.', { from: true }],
  ['h9', 'Hambúrgueres', 'Duplo Burguer', 38, 'Pão brioche selado, 2 hambúrgueres artesanais de 160g assados na brasa, duplo cheddar, cebola roxa em fatias finas e picles fatiado.', { from: true }],
  ['h10', 'Hambúrgueres', 'Mel e Brasa', 30, 'Pão brioche selado na manteiga, hambúrguer artesanal de 160g (blend bovino), queijo artesanal derretido (tipo Canastra ou meia-cura), bacon crocante, toque de mel artesanal, rúcula ou alface americana e picles.', { destaque: true, from: true }],
  ['h11', 'Hambúrgueres', 'Monte Moriá', 48, 'Pão brioche selado, três hambúrgueres artesanais de 160g assados na brasa, bacon crocante, queijo caipira em dobro, dois ovos caipiras fritos, molho exclusivo Moriá e cebola roxa ou caramelizada.', { destaque: true, from: true }],
  ['h12', 'Hambúrgueres', 'Moriá Especial 1.0', 39, 'Pão brioche selado na manteiga, hambúrguer de 160g assado na brasa, 100g de costela desfiada, bacon crocante, mussarela e cream cheese, molho barbecue e maionese da casa, rúcula ou alface americana, tomate e cebola caramelizada.', { from: true }],
  ['h13', 'Hambúrgueres', 'Chilli Pepper Bacon', 30, 'Pão brioche macio, hambúrguer artesanal de 150g assado na brasa e geleia de pimenta (doçura e ardência na medida), cheddar em dobro bem cremoso, bacon crocante, alface, tomate e cebola roxa.', { from: true }],
  ['h14', 'Hambúrgueres', 'Bacon Cheese', 32.9, 'Pão brioche selado na manteiga, hambúrguer de 160g assado na brasa, bacon crocante, mussarela e cream cheese, rúcula fresca e tomate em rodelas.', { from: true }],
  ['h15', 'Hambúrgueres', 'Golias Supremo', 45, 'Pão brioche selado na manteiga, 3 hambúrgueres de 100g assados na brasa, 2 porções de bacon crocante, 4 de cheddar derretido, maionese especial da casa e molho barbecue, rúcula, tomate e cebola roxa ou caramelizada.', { from: true }],
  ['h16', 'Hambúrgueres', 'Chili Pepper', 39, 'Pão brioche macio, hambúrguer artesanal de 150g assado na brasa com geleia de pimenta especial, mussarela derretida, costela desfiada, bacon crocante, rúcula fresca e tomate em rodelas.', { from: true }],
  ['h17', 'Hambúrgueres', 'Moriá Kids', 21, 'Pão brioche selado na chapa, maionese tradicional, hambúrguer de 100g e queijo mussarela ou cheddar.'],
  ['t1', 'Tradicionais', 'X Burguer', 16, 'Pão, hambúrguer, queijo, presunto e maionese da casa.', { from: true }],
  ['t2', 'Tradicionais', 'X-Salada', 19, 'Pão, hambúrguer, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['t3', 'Tradicionais', 'X-Egg', 20, 'Pão, hambúrguer, ovo, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['t4', 'Tradicionais', 'X-Bacon', 22, 'Pão, hambúrguer, bacon crocante, queijo, presunto, alface, tomate e maionese da casa.', { destaque: true, from: true }],
  ['t5', 'Tradicionais', 'X-Egg Bacon', 25, 'Pão, hambúrguer, ovo, bacon, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['t6', 'Tradicionais', 'X-Calabresa', 21, 'Pão, hambúrguer, calabresa, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['t7', 'Tradicionais', 'X-Egg Calabresa', 25, 'Pão, hambúrguer, ovo, calabresa, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['t8', 'Tradicionais', 'X-Frango', 17, 'Pão, hambúrguer, frango desfiado, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['t9', 'Tradicionais', 'X-Egg Frango', 20, 'Pão, hambúrguer, ovo, frango, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['t10', 'Tradicionais', 'X-Tudo', 35, 'Pão, hambúrguer, frango, salsicha, calabresa, bacon, ovo, queijo, presunto, alface, tomate e maionese da casa.', { from: true }],
  ['d1', 'Bebidas', 'Coca-Cola 350ml', 6, 'Lata 350ml.'],
  ['d2', 'Bebidas', 'Guaraná 1L', 8, 'Garrafa 1 litro.'],
  ['d3', 'Bebidas', 'Coca-Cola 2L', 15, 'Garrafa 2 litros.'],
]

export const menuItems: MenuItem[] = rows.map(([id, categoria, nome, preco, descricao, opts], ordem) => ({
  id,
  categoria,
  nome,
  descricao: `${descricao}${opts?.from ? FROM : ''}`,
  preco,
  imagem: photos[id] ?? '',
  destaque: opts?.destaque ?? false,
  disponivel: true,
  adicionais: [],
  ordem,
}))
