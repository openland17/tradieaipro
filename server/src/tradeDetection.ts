import type { TradeType } from "./types.js";

interface TradeKeywords {
  trade: TradeType;
  keywords: string[];
  priority: number; // Higher = more specific/important
}

const TRADE_KEYWORDS: TradeKeywords[] = [
  {
    trade: "plumbing",
    keywords: [
      "plumb", "pipe", "tap", "faucet", "toilet", "bathroom", "kitchen sink",
      "drain", "blocked", "leak", "water", "hot water", "shower", "basin",
      "sewer", "waterproof", "downpipe", "water heater", "gas",
      "bathroom renovation", "bathroom install", "toilet install", "tap install"
    ],
    priority: 10
  },
  {
    trade: "electrical",
    keywords: [
      "electrical", "electric", "wiring", "wire", "rewire", "power point", "socket", "outlet",
      "light", "lighting", "switch", "circuit", "fuse", "breaker", "panel",
      "ceiling fan", "exhaust fan", "downlight", "led", "safety switch",
      "smoke alarm", "security light", "solar", "solar panel"
    ],
    priority: 10
  },
  {
    trade: "gardening",
    keywords: [
      "garden", "lawn", "mow", "mowing", "hedge", "trim", "trimming",
      "tree", "prune", "pruning", "landscaping", "mulch", "mulching",
      "weeding", "weed", "plant", "planting", "turf", "sod", "irrigation",
      "sprinkler", "paving", "retaining wall", "fence", "fencing"
    ],
    priority: 8
  },
  {
    trade: "painting",
    keywords: [
      "paint", "painting", "brush", "roller", "primer", "undercoat",
      "exterior paint", "interior paint", "wall", "ceiling", "trim",
      "door", "window", "render", "rendering", "spray paint"
    ],
    priority: 9
  },
  {
    trade: "roofing",
    keywords: [
      "roof", "roofing", "tile", "gutter", "downpipe", "eaves", "fascia",
      "valley", "ridge", "skylight", "roof repair", "roof replacement",
      "metal roof", "tile roof", "colorbond", "roof leak"
    ],
    priority: 10
  },
  {
    trade: "carpentry",
    keywords: [
      "carpenter", "carpentry", "cabinet", "cupboard", "shelf", "shelving",
      "deck", "decking", "verandah", "veranda", "pergola", "wall frame",
      "framing", "stud", "joist", "beam", "door install", "window install",
      "skirting", "architrave", "moulding", "molding", "frame wall", "frame new"
    ],
    priority: 10
  },
  {
    trade: "concrete",
    keywords: [
      "concrete", "cement", "slab", "driveway", "pathway", "path", "patio",
      "footpath", "foundation", "footing", "render", "rendering", "stencil",
      "exposed aggregate", "polished concrete"
    ],
    priority: 9
  },
  {
    trade: "handyman",
    keywords: [
      "handyman", "general", "repair", "fix", "install", "assembly",
      "mount", "hang", "shelf", "picture", "tv mount", "blinds", "curtain",
      "door handle", "lock", "hinge", "maintenance", "odd jobs"
    ],
    priority: 5
  }
];

/**
 * Detect trade type from job description using keyword matching
 * Returns the trade type with highest confidence score
 */
export function detectTradeType(jobDescription: string): TradeType {
  const lower = jobDescription.toLowerCase();
  const scores: Map<TradeType, number> = new Map();

  // Initialize all trades with 0
  const allTrades: TradeType[] = ["gardening", "plumbing", "electrical", "painting", "handyman", "roofing", "carpentry", "concrete", "other"];
  allTrades.forEach(trade => scores.set(trade, 0));

  // Score each trade based on keyword matches
  for (const { trade, keywords, priority } of TRADE_KEYWORDS) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      // Score = (match count * priority) + bonus for multiple matches
      const score = (matchCount * priority) + (matchCount > 1 ? matchCount * 2 : 0);
      scores.set(trade, (scores.get(trade) || 0) + score);
    }
  }

  // Find trade with highest score
  let maxScore = 0;
  let detectedTrade: TradeType = "other";

  for (const [trade, score] of scores.entries()) {
    if (score > maxScore) {
      maxScore = score;
      detectedTrade = trade;
    }
  }

  // If no clear match (score too low), return "other"
  if (maxScore < 5) {
    return "other";
  }

  return detectedTrade;
}

/**
 * Get confidence level of trade detection (0-1)
 */
export function getTradeDetectionConfidence(jobDescription: string, detectedTrade: TradeType): number {
  if (detectedTrade === "other") {
    return 0.3; // Low confidence for "other"
  }

  const lower = jobDescription.toLowerCase();
  const tradeData = TRADE_KEYWORDS.find(t => t.trade === detectedTrade);
  
  if (!tradeData) {
    return 0.5;
  }

  let matchCount = 0;
  for (const keyword of tradeData.keywords) {
    if (lower.includes(keyword)) {
      matchCount++;
    }
  }

  // Confidence based on number of keyword matches
  // More matches = higher confidence
  const confidence = Math.min(0.95, 0.5 + (matchCount * 0.1));
  return confidence;
}

