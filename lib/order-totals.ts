/** Total em R$ dos itens de um pedido. */
export function orderItemsTotal(
  items: { price: number; quantity: number }[],
): number {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}
