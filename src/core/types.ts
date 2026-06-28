// Core domain types for Cashback IQ.
// Pure TypeScript — no React, Next.js, or browser APIs (see CLAUDE.md).

export type Category =
  | "groceries"
  | "dining"
  | "gas"
  | "travel"
  | "online"
  | "streaming"
  | "transit"
  | "other";

// A single bonus (or base) earning rule on a card.
// For points cards, `rate` is a whole-number multiplier (4 = 4x points).
// For cashback cards, `rate` is a decimal (0.02 = 2% cashback).
export interface RewardRule {
  category: Category;
  rate: number;
  cap: number | null; // spend cap in USD per capPeriod; null if uncapped
  capPeriod: "quarterly" | "yearly" | null;
}

// Sign-up / welcome bonus terms.
export interface WelcomeBonus {
  points: number;
  minSpend: number; // USD required to unlock the bonus
  months: number; // window (in months) to hit minSpend
}

// A statement/usage credit surfaced separately from rewards math.
export interface Credit {
  name: string;
  value: number; // annual USD value
  description: string;
}

// A single credit card definition. Mirrors entries in cards.json.
export interface Card {
  id: string; // slug, e.g. "amex-gold"
  name: string; // display name
  issuer: string;
  annualFee: number; // USD
  rewardType: "points" | "cashback";
  pointValueCents: number; // baseline cents-per-point; 1.0 for cashback
  rewards: RewardRule[];
  welcomeBonus: WelcomeBonus | null;
  credits: Credit[];
}
