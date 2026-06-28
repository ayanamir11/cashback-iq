// Core domain types for Cashback IQ.
// Pure TypeScript — no React, Next.js, or browser APIs (see CLAUDE.md).
//
// Only the Category type is defined for Day 1. The remaining types
// (RewardRule, Card, UserData, Allocation, etc.) arrive on Day 2 with
// the engine implementation.

export type Category =
  | "groceries"
  | "dining"
  | "gas"
  | "travel"
  | "online"
  | "streaming"
  | "transit"
  | "other";
