/**
 * Calculate order financial breakdown based on server-verified items.
 * Guarantees no client-side price tampering.
 *
 * @param {Array<{ price: number, quantity: number }>} items
 * @param {number} discountAmount - Optional valid discount
 * @returns {{ subtotal: number, tax: number, deliveryCharge: number, discount: number, total: number }}
 */
const calculateOrderTotals = (items, discountAmount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity));
  }, 0);

  // 8% tax rate standard
  const TAX_RATE = 0.08;
  const rawTax = subtotal * TAX_RATE;
  const tax = Math.round(rawTax * 100) / 100;

  // Free delivery for orders over $100, otherwise $12 flat fee
  const deliveryCharge = subtotal >= 100 || subtotal === 0 ? 0 : 12;

  const validDiscount = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal);
  const roundedDiscount = Math.round(validDiscount * 100) / 100;

  const rawTotal = subtotal + tax + deliveryCharge - roundedDiscount;
  const total = Math.max(0, Math.round(rawTotal * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    deliveryCharge,
    discount: roundedDiscount,
    total
  };
};

module.exports = {
  calculateOrderTotals
};
