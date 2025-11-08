import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { generateQuote } from "./ai.js";
import { saveQuote, getQuote, generateSlug } from "./storage.js";
import {
  calculateSubtotal,
  calculateGST,
  calculateTotal
} from "./pricing.js";
import type { Quote, QuoteItem } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint for deployment platforms (before static files)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files in production (before API routes for assets)
if (process.env.NODE_ENV === "production") {
  const clientDist = join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
}

/**
 * POST /api/generate
 * Generate a quote from a job description using AI
 * Body: { jobDescription: string, customerName?: string, location?: string, propertyType?: string, urgency?: string }
 * Returns: { items: QuoteItem[], notes?: string, subtotal: number, gst: number, total: number }
 */
app.post("/api/generate", async (req, res) => {
  try {
    const { jobDescription, customerName, location, propertyType, urgency } = req.body;

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const aiResponse = await generateQuote(
      jobDescription.trim(),
      apiKey,
      {
        customerName: customerName?.trim(),
        location: location?.trim(),
        propertyType,
        urgency
      }
    );

    // Calculate totals
    const subtotal = calculateSubtotal(aiResponse.items, jobDescription);
    const gst = calculateGST(subtotal);
    const total = calculateTotal(subtotal, gst);

    res.json({
      items: aiResponse.items,
      notes: aiResponse.notes,
      subtotal,
      gst,
      total
    });
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: "Failed to generate quote" });
  }
});

/**
 * POST /api/save
 * Save a quote and get a shareable link
 * Body: { customerName?: string, location?: string, propertyType?: string, urgency?: string, jobDescription: string, items: QuoteItem[], notes?: string }
 * Returns: { slug: string, url: string }
 */
app.post("/api/save", (req, res) => {
  try {
    const { customerName, location, propertyType, urgency, jobDescription, items, notes } = req.body;

    if (!jobDescription || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid quote data" });
    }

    // Validate items
    for (const item of items) {
      if (!item.label || typeof item.label !== "string" || item.label.trim().length === 0) {
        return res.status(400).json({ error: "Each item must have a valid label" });
      }
      if (typeof item.qty !== "number" || item.qty < 0 || !isFinite(item.qty)) {
        return res.status(400).json({ error: "Each item must have a valid quantity (non-negative number)" });
      }
      if (!["hr", "m2", "item"].includes(item.unit)) {
        return res.status(400).json({ error: "Each item must have a valid unit (hr, m2, or item)" });
      }
      if (typeof item.unitPrice !== "number" || item.unitPrice < 0 || !isFinite(item.unitPrice)) {
        return res.status(400).json({ error: "Each item must have a valid unit price (non-negative number)" });
      }
    }

    // Calculate totals
    const subtotal = calculateSubtotal(items, jobDescription);
    const gst = calculateGST(subtotal);
    const total = calculateTotal(subtotal, gst);

    const quote: Quote = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      customerName: customerName || undefined,
      location: location || undefined,
      propertyType: propertyType || undefined,
      urgency: urgency || undefined,
      jobDescription,
      items,
      subtotal,
      gst,
      total,
      notes: notes || undefined,
      slug: generateSlug()
    };

    saveQuote(quote);

    res.json({
      slug: quote.slug,
      url: `/share/${quote.slug}`
    });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Failed to save quote" });
  }
});

/**
 * GET /api/share/:slug
 * Retrieve a saved quote by its slug
 * Returns: Quote object or 404 if not found
 */
app.get("/api/share/:slug", (req, res) => {
  try {
    const { slug } = req.params;
    const quote = getQuote(slug);

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.json(quote);
  } catch (error) {
    console.error("Get quote error:", error);
    res.status(500).json({ error: "Failed to get quote" });
  }
});

// Serve React app for all non-API routes (production only)
if (process.env.NODE_ENV === "production") {
  const clientDist = join(__dirname, "../../client/dist");
  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(clientDist, { maxAge: "1y", etag: false }));
  // Serve index.html for all non-API routes (SPA routing)
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(join(clientDist, "index.html"));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === "production") {
    console.log("Production mode: Serving React app from /client/dist");
  }
});

