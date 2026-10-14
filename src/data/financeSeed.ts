import type {
  Employee,
  Expense,
  FinanceSettings,
  Ingredient,
  Recipe,
  RecipeLine,
} from '../lib/types.ts'

/**
 * EXEMPLO: valores fictícios para o painel de custos não nascer vazio.
 * Substitua pelos preços reais de compra, salários e despesas da loja.
 */

const ing = (
  id: string,
  nome: string,
  grupo: Ingredient['grupo'],
  unidade: Ingredient['unidade'],
  preco_compra: number,
  qtd_compra: number,
  estoque: number,
  estoque_min: number,
): Ingredient => ({
  id,
  nome,
  grupo,
  unidade,
  preco_compra,
  qtd_compra,
  estoque,
  estoque_min,
})

export const seedIngredients: Ingredient[] = [
  ing('i-blend160', 'Hambúrguer artesanal 160 g', 'Carnes', 'un', 100, 20, 60, 20),
  ing('i-blend150', 'Hambúrguer artesanal 150 g', 'Carnes', 'un', 90, 20, 50, 20),
  ing('i-blend100', 'Hambúrguer 100 g', 'Carnes', 'un', 60, 20, 60, 20),
  ing('i-frango-grel', 'Filé de frango grelhado 160 g', 'Carnes', 'un', 56, 20, 30, 10),
  ing('i-frango-desf', 'Frango desfiado', 'Carnes', 'g', 22, 1000, 4000, 2000),
  ing('i-costela', 'Costela desfiada', 'Carnes', 'g', 42, 1000, 3500, 2000),
  ing('i-calabresa', 'Calabresa artesanal', 'Carnes', 'g', 28, 1000, 3000, 1500),
  ing('i-bacon', 'Bacon fatiado', 'Carnes', 'g', 36, 1000, 1200, 1500),
  ing('i-salsicha', 'Salsicha', 'Carnes', 'un', 14, 20, 40, 20),
  ing('i-presunto', 'Presunto fatiado', 'Laticínios', 'fatia', 22, 100, 300, 100),
  ing('i-ovo', 'Ovo', 'Outros', 'un', 18, 30, 120, 60),
  ing('i-pao', 'Pão brioche', 'Pães', 'un', 11, 8, 48, 24),
  ing('i-pao-x', 'Pão de lanche prensado', 'Pães', 'un', 7, 12, 60, 24),
  ing('i-cheddar', 'Cheddar fatiado', 'Laticínios', 'fatia', 38, 50, 120, 50),
  ing('i-mussarela', 'Mussarela fatiada', 'Laticínios', 'fatia', 30, 50, 150, 60),
  ing('i-cream', 'Cream cheese', 'Laticínios', 'g', 36, 1000, 2000, 1000),
  ing('i-caipira', 'Queijo caipira', 'Laticínios', 'g', 44, 1000, 2000, 1000),
  ing('i-canastra', 'Queijo artesanal meia-cura', 'Laticínios', 'g', 58, 1000, 1500, 800),
  ing('i-alface', 'Alface', 'Hortifruti', 'g', 12, 1000, 1500, 800),
  ing('i-rucula', 'Rúcula', 'Hortifruti', 'g', 10, 200, 600, 300),
  ing('i-tomate', 'Tomate', 'Hortifruti', 'g', 7, 1000, 2000, 1000),
  ing('i-cebola', 'Cebola roxa', 'Hortifruti', 'g', 6, 1000, 3000, 1500),
  ing('i-cebola-car', 'Cebola caramelizada', 'Hortifruti', 'g', 14, 1000, 2000, 1000),
  ing('i-picles', 'Picles', 'Hortifruti', 'g', 30, 2000, 1500, 600),
  ing('i-maionese', 'Maionese especial da casa', 'Molhos', 'ml', 14, 1000, 4000, 2000),
  ing('i-bbq', 'Molho barbecue', 'Molhos', 'ml', 16, 1000, 3000, 1500),
  ing('i-molho-moria', 'Molho exclusivo Moriá', 'Molhos', 'ml', 18, 1000, 2000, 1000),
  ing('i-geleia-abacaxi', 'Geleia de abacaxi artesanal', 'Molhos', 'g', 30, 500, 1500, 600),
  ing('i-geleia-pimenta', 'Geleia de pimenta artesanal', 'Molhos', 'g', 32, 500, 1500, 600),
  ing('i-mel', 'Mel artesanal', 'Molhos', 'g', 40, 500, 1000, 400),
  ing('i-lata', 'Coca-Cola lata 350 ml', 'Bebidas', 'un', 36, 12, 48, 24),
  ing('i-guarana1l', 'Guaraná 1 L', 'Bebidas', 'un', 33, 6, 18, 12),
  ing('i-coca2l', 'Coca-Cola 2 L', 'Bebidas', 'un', 66, 6, 18, 12),
  ing('i-emb-burger', 'Embalagem de hambúrguer', 'Embalagens', 'un', 85, 100, 140, 50),
  ing('i-emb-x', 'Embalagem de lanche prensado', 'Embalagens', 'un', 60, 100, 120, 50),
  ing('i-sacola', 'Sacola + guardanapo', 'Embalagens', 'un', 40, 200, 220, 80),
]

const I = (ref: string, qtd: number): RecipeLine => ({ tipo: 'ingrediente', ref, qtd })

/** Fichas técnicas de exemplo: os ids são os itens do cardápio (src/data/menu.ts). */
const base = [I('i-pao', 1), I('i-emb-burger', 1), I('i-sacola', 1)]
const prensado = [I('i-pao-x', 1), I('i-blend100', 1), I('i-presunto', 1), I('i-mussarela', 1), I('i-maionese', 20), I('i-emb-x', 1), I('i-sacola', 1)]
const salada = [I('i-alface', 20), I('i-tomate', 30)]
const R = (item_id: string, ...linhas: RecipeLine[]): Recipe => ({ item_id, linhas })

export const seedRecipes: Recipe[] = [
  R('h1', ...base, I('i-blend160', 1), I('i-bacon', 40), I('i-cheddar', 2), I('i-maionese', 25), I('i-rucula', 15), I('i-tomate', 30), I('i-cebola', 25)),
  R('h2', ...base, I('i-blend160', 1), I('i-cheddar', 1), I('i-cebola-car', 30), I('i-rucula', 15), I('i-tomate', 30)),
  R('h3', ...base, I('i-blend150', 1), I('i-mussarela', 1), I('i-cream', 20), I('i-geleia-abacaxi', 20), I('i-bacon', 40), I('i-rucula', 15), I('i-tomate', 30), I('i-maionese', 25)),
  R('h4', ...base, I('i-blend150', 1), I('i-mussarela', 1), I('i-geleia-abacaxi', 20), I('i-bacon', 40), I('i-rucula', 15), I('i-tomate', 30), I('i-maionese', 25)),
  R('h5', ...base, I('i-blend150', 1), I('i-mussarela', 1), I('i-cream', 20), I('i-geleia-pimenta', 20), I('i-bacon', 40), I('i-rucula', 15), I('i-tomate', 30), I('i-maionese', 25)),
  R('h6', ...base, I('i-frango-grel', 1), I('i-caipira', 30), I('i-rucula', 15), I('i-cebola', 20), I('i-tomate', 30), I('i-picles', 15), I('i-maionese', 25)),
  R('h7', ...base, I('i-blend160', 2), I('i-bacon', 80), I('i-cheddar', 2), I('i-maionese', 25), I('i-bbq', 20), I('i-rucula', 15), I('i-tomate', 40), I('i-cebola', 25)),
  R('h8', ...base, I('i-blend160', 1), I('i-cheddar', 1), I('i-alface', 20), I('i-tomate', 30), I('i-cebola', 20)),
  R('h9', ...base, I('i-blend160', 2), I('i-cheddar', 2), I('i-cebola', 20), I('i-picles', 20)),
  R('h10', ...base, I('i-blend160', 1), I('i-canastra', 30), I('i-bacon', 40), I('i-mel', 15), I('i-rucula', 15), I('i-picles', 15)),
  R('h11', ...base, I('i-blend160', 3), I('i-bacon', 40), I('i-caipira', 60), I('i-ovo', 2), I('i-molho-moria', 30), I('i-cebola', 25)),
  R('h12', ...base, I('i-blend160', 1), I('i-costela', 100), I('i-bacon', 40), I('i-mussarela', 1), I('i-cream', 20), I('i-bbq', 20), I('i-maionese', 25), I('i-rucula', 15), I('i-tomate', 30), I('i-cebola-car', 25)),
  R('h13', ...base, I('i-blend150', 1), I('i-geleia-pimenta', 20), I('i-cheddar', 2), I('i-bacon', 40), I('i-alface', 20), I('i-tomate', 30), I('i-cebola', 20)),
  R('h14', ...base, I('i-blend160', 1), I('i-bacon', 40), I('i-mussarela', 1), I('i-cream', 20), I('i-rucula', 15), I('i-tomate', 30)),
  R('h15', ...base, I('i-blend100', 3), I('i-bacon', 80), I('i-cheddar', 4), I('i-maionese', 25), I('i-bbq', 20), I('i-rucula', 15), I('i-tomate', 40), I('i-cebola', 25)),
  R('h16', ...base, I('i-blend150', 1), I('i-geleia-pimenta', 20), I('i-mussarela', 1), I('i-costela', 100), I('i-bacon', 40), I('i-rucula', 15), I('i-tomate', 30)),
  R('h17', ...base, I('i-blend100', 1), I('i-mussarela', 1), I('i-maionese', 15)),
  R('t1', ...prensado),
  R('t2', ...prensado, ...salada),
  R('t3', ...prensado, I('i-ovo', 1), ...salada),
  R('t4', ...prensado, I('i-bacon', 30), ...salada),
  R('t5', ...prensado, I('i-ovo', 1), I('i-bacon', 30), ...salada),
  R('t6', ...prensado, I('i-calabresa', 40), ...salada),
  R('t7', ...prensado, I('i-ovo', 1), I('i-calabresa', 40), ...salada),
  R('t8', ...prensado, I('i-frango-desf', 50), ...salada),
  R('t9', ...prensado, I('i-ovo', 1), I('i-frango-desf', 50), ...salada),
  R('t10', ...prensado, I('i-frango-desf', 40), I('i-salsicha', 1), I('i-calabresa', 40), I('i-bacon', 30), I('i-ovo', 1), ...salada),
  R('d1', I('i-lata', 1), I('i-sacola', 1)),
  R('d2', I('i-guarana1l', 1), I('i-sacola', 1)),
  R('d3', I('i-coca2l', 1), I('i-sacola', 1)),
]

const exp = (
  id: string,
  nome: string,
  grupo: Expense['grupo'],
  valor: number,
): Expense => ({
  id,
  nome,
  grupo,
  valor,
  recorrencia: 'mensal',
  mes: '',
})

export const seedExpenses: Expense[] = [
  exp('e1', 'Aluguel do ponto', 'Aluguel', 1800),
  exp('e2', 'Energia elétrica', 'Energia', 650),
  exp('e3', 'Água', 'Água', 180),
  exp('e4', 'Gás de cozinha', 'Gás', 420),
  exp('e5', 'Internet', 'Internet', 120),
  exp('e6', 'Contador', 'Contador', 350),
  exp('e7', 'Anúncios no Instagram', 'Marketing', 400),
  exp('e8', 'Manutenção de equipamentos', 'Manutenção', 150),
]

export const seedStaff: Employee[] = [
  {
    id: 's1',
    nome: 'Chapeiro',
    funcao: 'Cozinha',
    pagamento: 'mensal',
    valor: 2200,
    dias_mes: 26,
    horas_mes: 0,
    encargos_pct: 30,
    ativo: true,
  },
  {
    id: 's2',
    nome: 'Auxiliar de cozinha',
    funcao: 'Cozinha',
    pagamento: 'mensal',
    valor: 1700,
    dias_mes: 26,
    horas_mes: 0,
    encargos_pct: 30,
    ativo: true,
  },
  {
    id: 's3',
    nome: 'Atendente / caixa',
    funcao: 'Atendimento',
    pagamento: 'diaria',
    valor: 90,
    dias_mes: 22,
    horas_mes: 0,
    encargos_pct: 0,
    ativo: true,
  },
]

export const seedFinanceSettings: FinanceSettings = {
  courier_modo: 'por_entrega',
  courier_valor: 6,
  courier_dias: 22,
  taxa_cartao_pct: 3,
  imposto_pct: 6,
  meta_lucro_pct: 20,
  baixa_estoque: false,
}
