import type { QuoteItem, TradeType } from "./types.js";
import { getTradeDefaultRate } from "./tradeKnowledge.js";
import { DEFAULT_HOURLY_RATE, GREEN_WASTE_FEE, GREEN_WASTE_KEYWORDS } from "./constants.js";

/**
 * Check if job description mentions green waste
 */
export function hasGreenWaste(jobDescription: string): boolean {
  const lower = jobDescription.toLowerCase();
  return GREEN_WASTE_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Calculate subtotal from items, adding green waste fee if applicable
 */
export function calculateSubtotal(items: QuoteItem[], jobDescription: string): number {
  const itemsTotal = items.reduce((sum, item) => {
    return sum + (item.qty * item.unitPrice);
  }, 0);
  
  const greenWasteFee = hasGreenWaste(jobDescription) ? GREEN_WASTE_FEE : 0;
  
  // Round to whole dollars
  return Math.round(itemsTotal + greenWasteFee);
}

/**
 * Calculate GST (10% of subtotal, rounded)
 */
export function calculateGST(subtotal: number): number {
  return Math.round(subtotal * 0.1);
}

/**
 * Calculate total (subtotal + GST)
 */
export function calculateTotal(subtotal: number, gst: number): number {
  return subtotal + gst;
}

/**
 * Format number as Australian currency (no cents)
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Ensure items have default hourly rate if not specified
 * Optionally uses trade-specific rates when provided
 */
export function applyDefaultPricing(
  items: QuoteItem[],
  tradeType?: TradeType,
  location?: string
): QuoteItem[] {
  const defaultRate = tradeType 
    ? getTradeDefaultRate(tradeType, location)
    : DEFAULT_HOURLY_RATE;

  return items.map(item => ({
    ...item,
    unitPrice: item.unitPrice || (item.unit === "hr" ? defaultRate : item.unitPrice)
  }));
}

