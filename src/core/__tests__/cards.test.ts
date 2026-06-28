import { describe, it, expect } from "vitest";

import { cards } from "../cards";
import { CATEGORIES } from "@/lib/constants";

// Dataset validator. The dataset is currently empty, so most assertions pass
// vacuously — the point is to catch malformed entries as cards get added in
// later phases. Every invariant here mirrors a rule in CLAUDE.md.

const VALID_CATEGORIES = new Set(CATEGORIES);

describe("card dataset", () => {
  it("loads as an array", () => {
    expect(Array.isArray(cards)).toBe(true);
  });

  it("has unique card ids", () => {
    const ids = cards.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(cards.map((card) => [card.id || "(missing id)", card] as const))(
    "%s is a well-formed card",
    (_label, card) => {
      // Required string identity fields are non-empty.
      expect(typeof card.id).toBe("string");
      expect(card.id.length).toBeGreaterThan(0);
      expect(typeof card.name).toBe("string");
      expect(card.name.length).toBeGreaterThan(0);
      expect(typeof card.issuer).toBe("string");
      expect(card.issuer.length).toBeGreaterThan(0);

      // Numeric invariants.
      expect(card.annualFee).toBeGreaterThanOrEqual(0);
      expect(card.pointValueCents).toBeGreaterThan(0);

      // Reward type.
      expect(["points", "cashback"]).toContain(card.rewardType);

      // At least one rule, including the mandatory "other" catch-all.
      expect(card.rewards.length).toBeGreaterThan(0);
      const categories = card.rewards.map((rule) => rule.category);
      expect(categories).toContain("other");

      // Each rule references a valid category, and cap/capPeriod are paired.
      for (const rule of card.rewards) {
        expect(VALID_CATEGORIES.has(rule.category)).toBe(true);
        expect(rule.cap === null).toBe(rule.capPeriod === null);
      }
    },
  );
});
