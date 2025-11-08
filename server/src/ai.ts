import OpenAI from "openai";
import type { QuoteItem, AIResponse, TradeType } from "./types.js";
import { applyDefaultPricing } from "./pricing.js";
import { detectTradeType } from "./tradeDetection.js";
import { getTradeGuidance, getTradePricing } from "./tradeKnowledge.js";

const DEMO_QUOTE: AIResponse = {
  items: [
    { label: "Hedge trimming", qty: 2, unit: "hr", unitPrice: 90 },
    { label: "Lawn mowing", qty: 1.5, unit: "hr", unitPrice: 90 },
    { label: "Green waste removal", qty: 1, unit: "item", unitPrice: 25 }
  ],
  notes: "Includes disposal of all green waste. Weather permitting."
};

interface QuoteContext {
  customerName?: string;
  location?: string;
  propertyType?: string;
  urgency?: string;
}

export async function generateQuote(
  jobDescription: string,
  apiKey?: string,
  context?: QuoteContext
): Promise<AIResponse> {
  if (!apiKey) {
    console.log("⚠️  No API key provided, using demo quote");
    return DEMO_QUOTE;
  }

  try {
    console.log("🤖 Using OpenAI API to generate quote...");
    const openai = new OpenAI({ apiKey });

    // Detect trade type from job description
    const detectedTrade: TradeType = detectTradeType(jobDescription);
    const tradePricing = getTradePricing(detectedTrade);
    const tradeGuidance = getTradeGuidance(detectedTrade);
    
    if (detectedTrade !== "other") {
      console.log(`🔍 Detected trade type: ${detectedTrade} (default rate: $${tradePricing.defaultHourlyRate}/hr)`);
    }

    // Build context string
    const contextParts: string[] = [];
    if (context?.location) {
      contextParts.push(`Location: ${context.location}`);
    }
    if (context?.propertyType) {
      const propertyLabels: Record<string, string> = {
        'residential-house': 'Residential House',
        'residential-unit': 'Residential Unit/Apartment',
        'commercial': 'Commercial Property',
        'industrial': 'Industrial Property',
        'other': 'Other Property Type'
      };
      contextParts.push(`Property Type: ${propertyLabels[context.propertyType] || context.propertyType}`);
    }
    if (context?.urgency) {
      const urgencyLabels: Record<string, string> = {
        'asap': 'ASAP / Emergency (premium pricing may apply)',
        'this-week': 'This Week',
        'next-week': 'Next Week',
        'this-month': 'This Month',
        'flexible': 'Flexible / No Rush'
      };
      contextParts.push(`Urgency: ${urgencyLabels[context.urgency] || context.urgency}`);
    }
    if (detectedTrade !== "other") {
      contextParts.push(`Detected Trade Type: ${detectedTrade.charAt(0).toUpperCase() + detectedTrade.slice(1)}`);
    }

    const contextString = contextParts.length > 0 ? `\n\nAdditional Context:\n${contextParts.join('\n')}` : '';

    // Build trade-specific pricing guidance
    const tradePricingGuidance = detectedTrade !== "other" 
      ? `\n\nTRADE-SPECIFIC GUIDANCE:\n${tradeGuidance}\nTypical hourly rate range: $${tradePricing.minHourlyRate}-$${tradePricing.maxHourlyRate}/hr\nDefault rate: $${tradePricing.defaultHourlyRate}/hr\nCommon materials: ${tradePricing.typicalMaterials.join(", ")}\nPreferred units: ${tradePricing.commonUnits.join(", ")}`
      : "";

    const prompt = `You are a professional quote generator for Australian tradies (tradespeople). You understand Australian market rates, regional pricing variations, and Australian business practices.

IMPORTANT: All prices must be in Australian Dollars (AUD). Use realistic Australian market rates:
- Premium/emergency work: 20-50% surcharge
- Major cities (Sydney, Melbourne, Brisbane): Higher rates (typically 10-15% premium)
- Regional areas: Slightly lower rates (typically 5% reduction)
- Commercial/Industrial: Higher rates than residential (typically 20-30% premium)
- Materials: Price realistically for Australian market

${tradePricingGuidance}

Given the job details, generate a quote with 3-6 line items. Each item should have:
- A clear, customer-friendly label (plain English, professional)
- A reasonable quantity based on the job description
- A unit: "hr" (hours), "m2" (square meters), or "item"
- A unit price in whole Australian dollars (no cents)

Adjust pricing based on:
- Location (major cities vs regional)
- Property type (commercial/industrial = higher rates)
- Urgency (ASAP/emergency = premium pricing)
- Trade type (use the trade-specific guidance above)

Job Description: "${jobDescription}"${contextString}

Return ONLY valid JSON in this exact format:
{
  "items": [
    { "label": "Item name", "qty": 2, "unit": "hr", "unitPrice": 90 },
    ...
  ],
  "notes": "Optional notes here (e.g., 'Weather permitting', 'Includes materials', 'GST included')"
}

Make reasonable assumptions for missing details. Keep labels simple and professional. Consider Australian standards and practices.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a quote generator for Australian tradies. Always return valid JSON only. Never include markdown code blocks, just pure JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Log raw response for debugging
    console.log("📝 Raw AI response (first 300 chars):", content.substring(0, 300));

    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || [null, content];
    const jsonStr = jsonMatch[1] || content;

    let parsed: AIResponse;
    try {
      parsed = JSON.parse(jsonStr) as AIResponse;
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.error("❌ Content that failed to parse:", jsonStr.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate structure
    if (!Array.isArray(parsed.items)) {
      console.error("❌ AI returned non-array items:", typeof parsed.items, parsed.items);
      throw new Error("Invalid items array - not an array");
    }
    
    if (parsed.items.length < 3 || parsed.items.length > 6) {
      console.error("❌ AI returned invalid item count:", parsed.items.length, "Expected 3-6");
      throw new Error(`Invalid items array - got ${parsed.items.length} items, expected 3-6`);
    }

    // Validate each item
    for (let i = 0; i < parsed.items.length; i++) {
      const item = parsed.items[i];
      if (!item.label || typeof item.label !== "string") {
        console.error(`❌ Item ${i} missing or invalid label:`, item);
        throw new Error(`Invalid item structure - item ${i} missing label`);
      }
      if (typeof item.qty !== "number" || isNaN(item.qty)) {
        console.error(`❌ Item ${i} invalid qty:`, item.qty, typeof item.qty);
        throw new Error(`Invalid item structure - item ${i} invalid quantity`);
      }
      if (!["hr", "m2", "item"].includes(item.unit)) {
        console.error(`❌ Item ${i} invalid unit:`, item.unit);
        throw new Error(`Invalid item structure - item ${i} invalid unit`);
      }
      if (typeof item.unitPrice !== "number" || isNaN(item.unitPrice)) {
        console.error(`❌ Item ${i} invalid unitPrice:`, item.unitPrice, typeof item.unitPrice);
        throw new Error(`Invalid item structure - item ${i} invalid unit price`);
      }
    }

    // Apply default pricing with trade-specific rates
    const items = applyDefaultPricing(parsed.items, detectedTrade, context?.location);

    console.log(`✅ Successfully generated quote with ${items.length} items using OpenAI API`);
    
    return {
      items,
      notes: parsed.notes
    };
  } catch (error) {
    console.error("❌ AI generation failed:", error);
    console.log("⚠️  Falling back to demo quote");
    return DEMO_QUOTE;
  }
}

