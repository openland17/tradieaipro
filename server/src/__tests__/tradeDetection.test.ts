import assert from "node:assert";
import { detectTradeType, getTradeDetectionConfidence } from "../tradeDetection.js";
import type { TradeType } from "../types.js";

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

describe("Trade Detection", () => {
  describe("Plumbing Detection", () => {
    test("should detect plumbing from 'fix blocked drain'", () => {
      assert.strictEqual(detectTradeType("fix blocked drain"), "plumbing");
    });

    test("should detect plumbing from 'install new tap'", () => {
      assert.strictEqual(detectTradeType("install new tap in kitchen"), "plumbing");
    });

    test("should detect plumbing from 'toilet repair'", () => {
      assert.strictEqual(detectTradeType("repair toilet that won't flush"), "plumbing");
    });

    test("should detect plumbing from 'hot water system'", () => {
      assert.strictEqual(detectTradeType("replace hot water system"), "plumbing");
    });

    test("should detect plumbing from 'bathroom renovation'", () => {
      assert.strictEqual(detectTradeType("bathroom renovation with new fixtures"), "plumbing");
    });
  });

  describe("Electrical Detection", () => {
    test("should detect electrical from 'install power point'", () => {
      assert.strictEqual(detectTradeType("install new power point"), "electrical");
    });

    test("should detect electrical from 'wiring'", () => {
      assert.strictEqual(detectTradeType("rewire house"), "electrical");
    });

    test("should detect electrical from 'lighting'", () => {
      assert.strictEqual(detectTradeType("install new lighting"), "electrical");
    });

    test("should detect electrical from 'safety switch'", () => {
      assert.strictEqual(detectTradeType("install safety switch"), "electrical");
    });

    test("should detect electrical from 'ceiling fan'", () => {
      assert.strictEqual(detectTradeType("install ceiling fan"), "electrical");
    });
  });

  describe("Gardening Detection", () => {
    test("should detect gardening from 'mow lawn'", () => {
      assert.strictEqual(detectTradeType("mow the lawn"), "gardening");
    });

    test("should detect gardening from 'hedge trimming'", () => {
      assert.strictEqual(detectTradeType("trim hedges"), "gardening");
    });

    test("should detect gardening from 'tree pruning'", () => {
      assert.strictEqual(detectTradeType("prune trees"), "gardening");
    });

    test("should detect gardening from 'landscaping'", () => {
      assert.strictEqual(detectTradeType("landscaping work"), "gardening");
    });

    test("should detect gardening from 'mulching'", () => {
      assert.strictEqual(detectTradeType("mulch garden beds"), "gardening");
    });
  });

  describe("Painting Detection", () => {
    test("should detect painting from 'paint house'", () => {
      assert.strictEqual(detectTradeType("paint exterior of house"), "painting");
    });

    test("should detect painting from 'interior paint'", () => {
      assert.strictEqual(detectTradeType("interior painting"), "painting");
    });

    test("should detect painting from 'render'", () => {
      assert.strictEqual(detectTradeType("render and paint walls"), "painting");
    });
  });

  describe("Roofing Detection", () => {
    test("should detect roofing from 'roof repair'", () => {
      assert.strictEqual(detectTradeType("repair roof leak"), "roofing");
    });

    test("should detect roofing from 'gutter replacement'", () => {
      assert.strictEqual(detectTradeType("replace gutters"), "roofing");
    });

    test("should detect roofing from 'tile roof'", () => {
      assert.strictEqual(detectTradeType("replace tile roof"), "roofing");
    });
  });

  describe("Carpentry Detection", () => {
    test("should detect carpentry from 'build deck'", () => {
      assert.strictEqual(detectTradeType("build new deck"), "carpentry");
    });

    test("should detect carpentry from 'cabinet install'", () => {
      assert.strictEqual(detectTradeType("install kitchen cabinets"), "carpentry");
    });

    test("should detect carpentry from 'framing'", () => {
      assert.strictEqual(detectTradeType("frame new wall"), "carpentry");
    });
  });

  describe("Concrete Detection", () => {
    test("should detect concrete from 'concrete driveway'", () => {
      assert.strictEqual(detectTradeType("pour concrete driveway"), "concrete");
    });

    test("should detect concrete from 'slab'", () => {
      assert.strictEqual(detectTradeType("concrete slab for shed"), "concrete");
    });

    test("should detect concrete from 'pathway'", () => {
      assert.strictEqual(detectTradeType("concrete pathway"), "concrete");
    });
  });

  describe("Handyman Detection", () => {
    test("should detect handyman from 'general repair'", () => {
      assert.strictEqual(detectTradeType("general repairs and maintenance"), "handyman");
    });

    test("should detect handyman from 'tv mount'", () => {
      assert.strictEqual(detectTradeType("mount tv"), "handyman");
    });

    test("should detect handyman from 'install blinds'", () => {
      assert.strictEqual(detectTradeType("install window blinds"), "handyman");
    });
  });

  describe("Edge Cases", () => {
    test("should return 'other' for ambiguous descriptions", () => {
      assert.strictEqual(detectTradeType("some work needed"), "other");
    });

    test("should return 'other' for empty description", () => {
      assert.strictEqual(detectTradeType(""), "other");
    });

    test("should prioritize more specific trades when multiple keywords present", () => {
      // Plumbing should win over handyman due to higher priority and more specific keywords
      assert.strictEqual(detectTradeType("fix blocked drain and install tap"), "plumbing");
    });

    test("should detect strongest match when multiple trades mentioned", () => {
      // Electrical has higher priority and more specific keywords than handyman
      assert.strictEqual(detectTradeType("install power point and lighting"), "electrical");
    });
  });

  describe("Confidence Levels", () => {
    test("should return low confidence for 'other'", () => {
      const confidence = getTradeDetectionConfidence("general work", "other");
      assert.strictEqual(confidence, 0.3);
    });

    test("should return higher confidence with multiple keyword matches", () => {
      const trade = detectTradeType("install new power point and lighting");
      const confidence = getTradeDetectionConfidence("install new power point and lighting", trade);
      assert(confidence > 0.5, `Expected confidence > 0.5, got ${confidence}`);
    });

    test("should return reasonable confidence for single keyword match", () => {
      const trade = detectTradeType("mow lawn");
      const confidence = getTradeDetectionConfidence("mow lawn", trade);
      assert(confidence >= 0.5, `Expected confidence >= 0.5, got ${confidence}`);
    });
  });
});

console.log("\nAll trade detection tests passed!");

