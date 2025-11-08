import assert from "node:assert";
import {
  hasGreenWaste,
  calculateSubtotal,
  calculateGST,
  calculateTotal,
  formatCurrency,
  applyDefaultPricing
} from "../pricing.js";
import type { QuoteItem } from "../types.js";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

describe("Pricing Logic", () => {
  test("hasGreenWaste: should detect green waste keywords", () => {
    assert.strictEqual(hasGreenWaste("trim hedges"), true);
    assert.strictEqual(hasGreenWaste("mow lawn"), true);
    assert.strictEqual(hasGreenWaste("remove tree waste"), true);
    assert.strictEqual(hasGreenWaste("garden cleanup"), true);
    assert.strictEqual(hasGreenWaste("green waste removal"), true);
  });

  test("hasGreenWaste: should not detect green waste when absent", () => {
    assert.strictEqual(hasGreenWaste("paint house"), false);
    assert.strictEqual(hasGreenWaste("fix electrical"), false);
  });

  test("calculateSubtotal: should calculate subtotal without green waste", () => {
    const items: QuoteItem[] = [
      { label: "Painting", qty: 2, unit: "hr", unitPrice: 90 },
      { label: "Materials", qty: 1, unit: "item", unitPrice: 50 }
    ];
    const subtotal = calculateSubtotal(items, "paint house");
    assert.strictEqual(subtotal, 230); // 2*90 + 50 = 230
  });

  test("calculateSubtotal: should add green waste fee when applicable", () => {
    const items: QuoteItem[] = [
      { label: "Hedge trimming", qty: 2, unit: "hr", unitPrice: 90 }
    ];
    const subtotal = calculateSubtotal(items, "trim hedges");
    assert.strictEqual(subtotal, 205); // 2*90 + 25 = 205
  });

  test("calculateSubtotal: should round to whole dollars", () => {
    const items: QuoteItem[] = [
      { label: "Service", qty: 1, unit: "hr", unitPrice: 90.7 }
    ];
    const subtotal = calculateSubtotal(items, "service");
    assert.strictEqual(subtotal, 91);
  });

  test("calculateGST: should calculate 10% GST and round", () => {
    assert.strictEqual(calculateGST(100), 10);
    assert.strictEqual(calculateGST(230), 23);
    assert.strictEqual(calculateGST(205), 21); // 20.5 rounded to 21
  });

  test("calculateTotal: should add subtotal and GST", () => {
    assert.strictEqual(calculateTotal(100, 10), 110);
    assert.strictEqual(calculateTotal(230, 23), 253);
  });

  test("formatCurrency: should format as AU currency without cents", () => {
    assert.strictEqual(formatCurrency(100), "$100");
    assert.strictEqual(formatCurrency(1234), "$1,234");
    assert.strictEqual(formatCurrency(0), "$0");
  });

  test("applyDefaultPricing: should apply default hourly rate when missing", () => {
    const items: QuoteItem[] = [
      { label: "Work", qty: 1, unit: "hr", unitPrice: 0 }
    ];
    const result = applyDefaultPricing(items);
    assert.strictEqual(result[0].unitPrice, 90);
  });

  test("applyDefaultPricing: should preserve existing prices", () => {
    const items: QuoteItem[] = [
      { label: "Work", qty: 1, unit: "hr", unitPrice: 100 }
    ];
    const result = applyDefaultPricing(items);
    assert.strictEqual(result[0].unitPrice, 100);
  });

  test("applyDefaultPricing: should use trade-specific rate when provided", () => {
    const items: QuoteItem[] = [
      { label: "Electrical work", qty: 1, unit: "hr", unitPrice: 0 }
    ];
    const result = applyDefaultPricing(items, "electrical");
    // Electrical default rate is 130
    assert.strictEqual(result[0].unitPrice, 130);
  });

  test("applyDefaultPricing: should adjust for major city location", () => {
    const items: QuoteItem[] = [
      { label: "Plumbing work", qty: 1, unit: "hr", unitPrice: 0 }
    ];
    const result = applyDefaultPricing(items, "plumbing", "Sydney");
    // Plumbing default is 120, major city adds ~12% = ~134
    assert.strictEqual(result[0].unitPrice, 134);
  });
});

console.log("\nAll tests passed!");

