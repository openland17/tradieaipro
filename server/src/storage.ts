import type { Quote } from "./types.js";

// In-memory storage (simple for MVP)
// Note: Quotes are lost on server restart. For production, replace with a database.
const quotes = new Map<string, Quote>();

/**
 * Save a quote to in-memory storage
 * @param quote - The quote to save
 */
export function saveQuote(quote: Quote): void {
  quotes.set(quote.slug, quote);
}

/**
 * Retrieve a quote by its slug
 * @param slug - The 8-character slug identifier
 * @returns The quote if found, undefined otherwise
 */
export function getQuote(slug: string): Quote | undefined {
  return quotes.get(slug);
}

/**
 * Generate a random 8-character alphanumeric slug
 * @returns A unique slug string
 */
export function generateSlug(): string {
  // Simple slug generator: 8 random alphanumeric characters
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

