import type { TradeType } from "./types.js";

export interface TradePricing {
  minHourlyRate: number; // AUD
  maxHourlyRate: number; // AUD
  defaultHourlyRate: number; // AUD
  typicalMaterials: string[];
  commonUnits: ("hr" | "m2" | "item")[];
}

const TRADE_KNOWLEDGE: Record<TradeType, TradePricing> = {
  gardening: {
    minHourlyRate: 70,
    maxHourlyRate: 100,
    defaultHourlyRate: 85,
    typicalMaterials: ["mulch", "plants", "fertilizer", "soil", "turf", "paving materials"],
    commonUnits: ["hr", "m2", "item"]
  },
  plumbing: {
    minHourlyRate: 90,
    maxHourlyRate: 150,
    defaultHourlyRate: 120,
    typicalMaterials: ["pipes", "fittings", "taps", "toilets", "water heaters", "valves"],
    commonUnits: ["hr", "item"]
  },
  electrical: {
    minHourlyRate: 95,
    maxHourlyRate: 160,
    defaultHourlyRate: 130,
    typicalMaterials: ["cable", "switches", "power points", "light fixtures", "circuit breakers"],
    commonUnits: ["hr", "item"]
  },
  painting: {
    minHourlyRate: 60,
    maxHourlyRate: 100,
    defaultHourlyRate: 80,
    typicalMaterials: ["paint", "primer", "brushes", "rollers", "drop sheets", "tape"],
    commonUnits: ["hr", "m2"]
  },
  handyman: {
    minHourlyRate: 70,
    maxHourlyRate: 110,
    defaultHourlyRate: 90,
    typicalMaterials: ["screws", "nails", "brackets", "hardware", "tools"],
    commonUnits: ["hr", "item"]
  },
  roofing: {
    minHourlyRate: 100,
    maxHourlyRate: 180,
    defaultHourlyRate: 140,
    typicalMaterials: ["tiles", "metal sheeting", "guttering", "insulation", "flashing"],
    commonUnits: ["hr", "m2"]
  },
  carpentry: {
    minHourlyRate: 85,
    maxHourlyRate: 140,
    defaultHourlyRate: 110,
    typicalMaterials: ["timber", "plywood", "hardware", "screws", "nails", "glue"],
    commonUnits: ["hr", "m2", "item"]
  },
  concrete: {
    minHourlyRate: 80,
    maxHourlyRate: 120,
    defaultHourlyRate: 100,
    typicalMaterials: ["concrete", "rebar", "formwork", "sealant", "aggregate"],
    commonUnits: ["hr", "m2"]
  },
  other: {
    minHourlyRate: 70,
    maxHourlyRate: 110,
    defaultHourlyRate: 90,
    typicalMaterials: ["materials", "supplies"],
    commonUnits: ["hr", "m2", "item"]
  }
};

/**
 * Get pricing information for a specific trade
 */
export function getTradePricing(tradeType: TradeType): TradePricing {
  return TRADE_KNOWLEDGE[tradeType];
}

/**
 * Get default hourly rate for a trade, adjusted for location
 */
export function getTradeDefaultRate(tradeType: TradeType, location?: string): number {
  const pricing = getTradePricing(tradeType);
  let rate = pricing.defaultHourlyRate;

  // Adjust for major cities (higher rates)
  if (location) {
    const lowerLocation = location.toLowerCase();
    const majorCities = ["sydney", "melbourne", "brisbane", "perth", "adelaide"];
    const isMajorCity = majorCities.some(city => lowerLocation.includes(city));

    if (isMajorCity) {
      // Increase by 10-15% for major cities
      rate = Math.round(rate * 1.12);
    } else {
      // Slightly lower for regional (5% reduction)
      rate = Math.round(rate * 0.95);
    }
  }

  return rate;
}

/**
 * Get trade-specific guidance for AI prompt
 */
export function getTradeGuidance(tradeType: TradeType): string {
  const pricing = getTradePricing(tradeType);
  
  const guidance: Record<TradeType, string> = {
    gardening: `Gardening/Landscaping: Focus on outdoor work, plants, lawns, and landscaping. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: mowing, hedge trimming, planting, mulching, paving.`,
    plumbing: `Plumbing: Specialized trade requiring licenses. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: repairs, installations, blocked drains, hot water systems. Materials often significant cost.`,
    electrical: `Electrical: Licensed trade, safety critical. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: wiring, power points, lighting, safety switches. Must comply with Australian standards.`,
    painting: `Painting: Interior/exterior painting and preparation. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: walls, ceilings, trim, doors. Preparation work (sanding, filling) is significant.`,
    handyman: `Handyman: General repairs and installations. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: mounting, assembly, minor repairs, odd jobs.`,
    roofing: `Roofing: Specialized and potentially dangerous work. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: repairs, replacements, guttering, skylights.`,
    carpentry: `Carpentry: Woodwork and construction. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: framing, decks, cabinets, doors, windows.`,
    concrete: `Concrete: Driveways, paths, slabs. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr. Common tasks: pouring, finishing, exposed aggregate, rendering.`,
    other: `General trade work. Typical rates $${pricing.minHourlyRate}-$${pricing.maxHourlyRate}/hr.`
  };

  return guidance[tradeType] || guidance.other;
}

