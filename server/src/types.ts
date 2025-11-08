export type Unit = "hr" | "m2" | "item";

export type TradeType = 
  | "gardening"
  | "plumbing"
  | "electrical"
  | "painting"
  | "handyman"
  | "roofing"
  | "carpentry"
  | "concrete"
  | "other";

export interface QuoteItem {
  label: string;
  qty: number;
  unit: Unit;
  unitPrice: number; // whole dollars
}

export interface Quote {
  id: string;
  createdAt: number; // epoch ms
  customerName?: string;
  location?: string;
  propertyType?: string;
  urgency?: string;
  jobDescription: string;
  items: QuoteItem[]; // 3-6 items
  subtotal: number; // whole dollars
  gst: number;
  total: number;
  notes?: string;
  slug: string;
}

export interface AIResponse {
  items: QuoteItem[];
  notes?: string;
}
