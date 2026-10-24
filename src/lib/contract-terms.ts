// Fixed default contract clauses, used until each tenant can customize
// their own terms (planned for a later phase).
export const DEFAULT_CONTRACT_CLAUSES = [
  "O cliente será responsável por qualquer dano causado aos materiais locados.",
  "Será cobrada uma taxa de limpeza de R$ 10,00 por item entregue sujo (mesas, bandejas, tecidos, etc.).",
  "A locação é válida por prazo determinado. A devolução dos materiais locados deve ocorrer na data estipulada, sob pena de multa de R$ 40,00 por dia de atraso. O cliente está ciente quanto aos prazos de entrega e ao horário comercial.",
  "O transporte dos materiais, tanto na retirada quanto na devolução, é de responsabilidade do cliente.",
  "A reserva dos materiais será confirmada mediante pagamento de 50% do valor total, a ser realizado por depósito bancário ou diretamente na loja.",
  "O valor pago como entrada não é reembolsável; contudo, o cliente poderá utilizá-lo como crédito em locações futuras, no prazo máximo de 6 meses.",
  "Em caso de não devolução dos materiais locados, será cobrado o valor integral das peças.",
];

export function quoteTotals(items: { quantity: number; unit_price: number }[], discount: number, paidAmount: number) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const total = Math.max(0, subtotal - discount);
  const toReceive = Math.max(0, total - paidAmount);
  return { subtotal, total, toReceive };
}
