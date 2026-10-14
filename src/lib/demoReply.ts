/** Respostas de mentira, só para a demonstração sem servidor (o robô de verdade usa IA). */
export function demoReply(text: string): string[] {
  const t = text.toLowerCase()
  if (/hor[aá]rio|aberto|abre|fecha/.test(t)) return ['Abrimos hoje a partir das 18h30. 🍔', 'Quer ver o cardápio?']
  if (/card[aá]pio|menu|op[cç][õo]es/.test(t)) return ['Temos hambúrgueres, baguetes, acompanhamentos, molhos, bebidas e combos.', 'Qual você quer conhecer primeiro?']
  if (/pix|pagamento|cart[aã]o/.test(t)) return ['Aceitamos Pix, cartão e dinheiro.', 'O Pix pode ser feito na entrega, é só avisar.']
  if (/atendente|humano|pessoa/.test(t)) return ['Claro! Vou chamar um atendente. 🙏', 'O robô fica em silêncio e a conversa continua com uma pessoa.']
  if (/quero|pedir|pedido|xb|burger|hamb/.test(t)) return ['Boa escolha! 😋', 'Vai querer entrega ou retirada? E me diga o nome para anotar o pedido.']
  return ['Oi! Eu sou o Mori, assistente da hamburgueria. 🍔', 'Posso mostrar o cardápio, tirar dúvidas e anotar seu pedido. Como posso ajudar?']
}
