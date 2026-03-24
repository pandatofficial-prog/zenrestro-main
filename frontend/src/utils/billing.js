/**
 * POS Billing Calculation Utility
 * Handles mathematically accurate calculation of discounts, taxes (CGST/SGST), and subtotals.
 * Specifically rounds floats to exactly 2 decimals to prevent Javascript precision bugs.
 * 
 * @param {Array} items - Array of cart items { quantity, price, total }
 * @param {number} discountPercent - Discount to apply (0-100)
 * @param {boolean} isGstEnabled - Whether to apply 18% GST (9% CGST + 9% SGST)
 * @returns {Object} { subtotal, discountAmount, discountedSubtotal, cgst, sgst, tax, finalTotal }
 */
export const calculateBilling = (items = [], discountPercent = 0, isGstEnabled = true, taxRate = 18) => {
  // Safe rounder
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // 1. Calculate Base Subtotal
  let subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  subtotal = round(subtotal);

  // 2. Calculate Discount
  let cappedDiscount = Math.max(0, Math.min(100, discountPercent)); // Cap between 0-100%
  let discountAmount = round(subtotal * (cappedDiscount / 100));

  // 3. Post-Discount Subtotal
  const discountedSubtotal = round(subtotal - discountAmount);

  // 4. Calculate Tax
  let cgst = 0;
  let sgst = 0;
  let tax = 0;

  if (isGstEnabled) {
    const halfRate = taxRate / 2;
    cgst = round(discountedSubtotal * (halfRate / 100));
    sgst = round(discountedSubtotal * (halfRate / 100));
    tax = round(cgst + sgst);
  }

  // 5. Final Total
  let finalTotal = round(discountedSubtotal + tax);
  if (finalTotal < 0) finalTotal = 0;

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    cgst,
    sgst,
    tax,
    finalTotal
  };
};
