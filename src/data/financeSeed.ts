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
  ing('i-blend', 'Blend bovino 160 g', 'Carnes', 'un', 130, 20, 60, 20),
  ing('i-frango-file', 'Filé de frango empanado 120 g', 'Carnes', 'un', 52, 20, 24, 10),
  ing('i-veggie', 'Burger vegetal (grão-de-bico)', 'Carnes', 'un', 54, 12, 6, 6),
  ing('i-costela', 'Costela desfiada defumada', 'Carnes', 'g', 48, 1000, 3500, 2000),
  ing('i-frango-desf', 'Frango desfiado', 'Carnes', 'g', 22, 1000, 4000, 2000),
  ing('i-calabresa', 'Calabresa artesanal', 'Carnes', 'g', 28, 1000, 3000, 1500),
  ing('i-bacon', 'Bacon fatiado', 'Carnes', 'g', 42, 1000, 1200, 1500),
  ing('i-pao', 'Pão brioche', 'Pães', 'un', 14, 8, 48, 24),
  ing('i-baguete', 'Baguete (pão)', 'Pães', 'un', 24, 10, 30, 12),
  ing('i-prato', 'Queijo prato fatiado', 'Laticínios', 'fatia', 45, 50, 200, 80),
  ing('i-cheddar', 'Cheddar fatiado', 'Laticínios', 'fatia', 55, 50, 120, 50),
  ing('i-cheddar-cremoso', 'Cheddar cremoso', 'Laticínios', 'g', 38, 1200, 2400, 1200),
  ing('i-requeijao', 'Requeijão cremoso', 'Laticínios', 'g', 36, 1500, 3000, 1500),
  ing('i-alface', 'Alface', 'Hortifruti', 'g', 12, 1000, 1500, 800),
  ing('i-tomate', 'Tomate', 'Hortifruti', 'g', 7, 1000, 2000, 1000),
  ing('i-cebola', 'Cebola', 'Hortifruti', 'g', 4.5, 1000, 3000, 1500),
  ing('i-picles', 'Picles', 'Hortifruti', 'g', 30, 2000, 1500, 600),
  ing('i-vinagrete', 'Vinagrete', 'Hortifruti', 'g', 9, 1000, 1500, 800),
  ing(
    'i-molho',
    'Molho artesanal Moriá (produção própria)',
    'Molhos',
    'ml',
    18,
    1000,
    4000,
    2000,
  ),
  ing('i-bbq', 'Molho barbecue', 'Molhos', 'ml', 16, 1000, 3000, 1500),
  ing('i-alho', 'Maionese de alho assado', 'Molhos', 'ml', 14, 1000, 3000, 1500),
  ing('i-batata', 'Batata congelada', 'Fritura', 'g', 22, 2000, 12000, 6000),
  ing('i-aneis', 'Anel de cebola empanado', 'Fritura', 'un', 28, 50, 200, 100),
  ing('i-oleo', 'Óleo de fritura', 'Fritura', 'ml', 8.5, 900, 5400, 1800),
  ing('i-lata', 'Refrigerante lata 350 ml', 'Bebidas', 'un', 36, 12, 48, 24),
  ing('i-1l', 'Refrigerante 1 L', 'Bebidas', 'un', 33, 6, 18, 12),
  ing('i-polpa', 'Polpa de fruta', 'Bebidas', 'g', 14, 1000, 4000, 2000),
  ing('i-emb-burger', 'Embalagem de hambúrguer', 'Embalagens', 'un', 85, 100, 140, 50),
  ing('i-emb-baguete', 'Embalagem de baguete', 'Embalagens', 'un', 78, 100, 90, 40),
  ing('i-emb-batata', 'Caixa de batata/anéis', 'Embalagens', 'un', 62, 100, 110, 40),
  ing('i-emb-molho', 'Potinho de molho 50 ml', 'Embalagens', 'un', 44, 200, 260, 100),
  ing('i-emb-copo', 'Copo de suco + tampa', 'Embalagens', 'un', 52, 100, 80, 40),
  ing('i-sacola', 'Sacola + guardanapo', 'Embalagens', 'un', 40, 200, 220, 80),
]

const I = (ref: string, qtd: number): RecipeLine => ({ tipo: 'ingrediente', ref, qtd })
const M = (ref: string, qtd: number): RecipeLine => ({ tipo: 'item', ref, qtd })

/** Ids dos itens do cardápio de exemplo (src/data/menu.ts). */
export const seedRecipes: Recipe[] = [
  {
    item_id: 'h1',
    linhas: [
      I('i-blend', 1),
      I('i-pao', 1),
      I('i-prato', 1),
      I('i-alface', 20),
      I('i-tomate', 30),
      I('i-molho', 30),
      I('i-emb-burger', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'h2',
    linhas: [
      I('i-blend', 1),
      I('i-pao', 1),
      I('i-cheddar', 1),
      I('i-bacon', 40),
      I('i-cebola', 30),
      I('i-bbq', 30),
      I('i-emb-burger', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'h3',
    linhas: [
      I('i-blend', 2),
      I('i-pao', 1),
      I('i-prato', 2),
      I('i-picles', 20),
      I('i-molho', 30),
      I('i-emb-burger', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'h4',
    linhas: [
      I('i-blend', 1),
      I('i-pao', 1),
      I('i-prato', 1),
      I('i-alface', 15),
      I('i-tomate', 40),
      I('i-alho', 30),
      I('i-emb-burger', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'h5',
    linhas: [
      I('i-frango-file', 1),
      I('i-pao', 1),
      I('i-prato', 1),
      I('i-alface', 20),
      I('i-molho', 30),
      I('i-emb-burger', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'h6',
    linhas: [
      I('i-veggie', 1),
      I('i-pao', 1),
      I('i-prato', 1),
      I('i-alface', 20),
      I('i-molho', 30),
      I('i-emb-burger', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'b1',
    linhas: [
      I('i-baguete', 1),
      I('i-costela', 120),
      I('i-prato', 2),
      I('i-molho', 30),
      I('i-emb-baguete', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'b2',
    linhas: [
      I('i-baguete', 1),
      I('i-frango-desf', 110),
      I('i-requeijao', 40),
      I('i-emb-baguete', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'b3',
    linhas: [
      I('i-baguete', 1),
      I('i-calabresa', 120),
      I('i-prato', 2),
      I('i-vinagrete', 40),
      I('i-emb-baguete', 1),
      I('i-sacola', 1),
    ],
  },
  {
    item_id: 'b4',
    linhas: [
      I('i-baguete', 1),
      I('i-blend', 1),
      I('i-cheddar-cremoso', 50),
      I('i-bacon', 30),
      I('i-emb-baguete', 1),
      I('i-sacola', 1),
    ],
  },
  { item_id: 'a1', linhas: [I('i-batata', 300), I('i-oleo', 30), I('i-emb-batata', 1)] },
  {
    item_id: 'a2',
    linhas: [
      I('i-batata', 300),
      I('i-oleo', 30),
      I('i-cheddar-cremoso', 60),
      I('i-bacon', 25),
      I('i-emb-batata', 1),
    ],
  },
  { item_id: 'a3', linhas: [I('i-aneis', 10), I('i-oleo', 40), I('i-emb-batata', 1)] },
  { item_id: 'm1', linhas: [I('i-molho', 50), I('i-emb-molho', 1)] },
  { item_id: 'm2', linhas: [I('i-bbq', 50), I('i-emb-molho', 1)] },
  { item_id: 'm3', linhas: [I('i-alho', 50), I('i-emb-molho', 1)] },
  { item_id: 'd1', linhas: [I('i-lata', 1)] },
  { item_id: 'd2', linhas: [I('i-1l', 1)] },
  { item_id: 'd3', linhas: [I('i-polpa', 100), I('i-emb-copo', 1)] },
  { item_id: 'c1', linhas: [M('h1', 1), M('a1', 1), M('d1', 1)] },
  { item_id: 'c2', linhas: [M('h1', 1), M('h2', 1), M('a2', 1), M('d1', 2)] },
  { item_id: 'c3', linhas: [M('b1', 1), M('a1', 1), M('d1', 1)] },
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
