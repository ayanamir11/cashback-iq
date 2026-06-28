# CLAUDE.md

This file provides guidance to Claude Code when working with the Cashback IQ codebase.

## Project Overview

**Cashback IQ** is a privacy-first web application that recommends the optimal credit card to use for each spending category based on the user's portfolio and monthly spending. Users input the cards they own and approximate monthly spending; the app calculates per-category recommendations, projects annualized rewards, and supports "what-if" analysis for adding new cards.

**Core value proposition:** No accounts, no bank linking, no data transmission. All computation happens client-side.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Testing:** Vitest
- **Hosting:** Vercel (free tier)
- **Persistence:** Browser localStorage only

## Critical Architectural Rule

**The `src/core/` directory must remain pure TypeScript with zero React, Next.js, or browser API dependencies.**

This is the most important rule in the codebase. It exists because a future React Native (Expo) mobile port will reuse `src/core/` unchanged. If anything in `core/` imports from React, calls `localStorage`, or references `window`/`document`, the mobile port becomes a rewrite instead of a copy.

A quick test before committing anything to `core/`: could this file run in Node.js with no DOM? If no, it doesn't belong in `core/`.

## Folder Structure

```
src/
  core/                  ← pure TS, no React, no browser APIs
    cards.json           ← canonical card dataset
    optimizer.ts         ← allocation logic
    types.ts             ← shared types
    __tests__/           ← Vitest unit tests
  components/            ← React UI components
    ui/                  ← shadcn/ui primitives
    onboarding/          ← onboarding flow components
    dashboard/           ← dashboard components
    explore/             ← what-if explorer components
  app/                   ← Next.js App Router routes
    page.tsx             ← landing
    onboarding/page.tsx
    dashboard/page.tsx
    explore/page.tsx
    settings/page.tsx
  lib/
    storage.ts           ← localStorage wrapper (only file that touches browser persistence)
    constants.ts         ← shared constants (storage keys, category list, etc.)
```

**Import direction rules:**

- `core/` imports from nothing outside itself
- `lib/` may import from `core/`
- `components/` may import from `core/` and `lib/`
- `app/` may import from anywhere
- **Nothing may import from `app/` or `components/` into `core/` or `lib/`**

## Data Model

### Card Schema (`src/core/types.ts`)

```typescript
type Category =
  | "groceries"
  | "dining"
  | "gas"
  | "travel"
  | "online"
  | "streaming"
  | "transit"
  | "other";

interface RewardRule {
  category: Category;
  rate: number; // multiplier (4 = 4x points) or cashback % as decimal (0.04 = 4%)
  cap: number | null; // spend cap in USD per capPeriod; null if uncapped
  capPeriod: "quarterly" | "yearly" | null;
}

interface Card {
  id: string; // slug, e.g. "amex-gold"
  name: string;
  issuer: string;
  annualFee: number; // USD
  rewardType: "points" | "cashback";
  pointValueCents: number; // 1.0 for cashback, varies for points
  rewards: RewardRule[];
  welcomeBonus: {
    points: number;
    minSpend: number;
    months: number;
  } | null;
  credits: Array<{
    name: string;
    value: number;
    description: string;
  }>;
}
```

### User Data Schema (localStorage)

Stored under key `cashback-iq:user-data`:

```typescript
interface UserData {
  cards: string[]; // array of card IDs
  monthlySpend: Record<Category, number>;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}
```

### Allocation Output (engine return type)

```typescript
interface CategoryAllocation {
  category: Category;
  recommendedCardId: string;
  effectiveRate: number; // weighted rate after cap math
  monthlyRewardUSD: number;
}

interface Allocation {
  perCategory: CategoryAllocation[];
  totalMonthlyUSD: number;
  totalAnnualUSD: number;
  totalAnnualFees: number;
  netAnnualUSD: number;
}
```

## The Optimization Engine

The core algorithm lives in `src/core/optimizer.ts`. Key entry points:

- `optimizeAllocation(userCards: Card[], monthlySpend: Record<Category, number>): Allocation`
- `compareWithAddedCard(userCards: Card[], candidateCard: Card, monthlySpend: ...): { current: Allocation; projected: Allocation; deltaAnnualUSD: number }`
- `checkWelcomeBonusEligibility(card: Card, monthlySpend: ...): { eligible: boolean; monthsToHit: number | null }`

### Critical engine behaviors

These are the easy-to-get-wrong cases. Every change to the engine should have a test that covers these:

1. **Category caps.** If a card caps groceries at $25,000/year at 4x, and the user spends $30,000/year, the first $25K earns 4x and the remaining $5K earns the card's base rate (usually 1x). Tests must cover monthly-spend values that cross the annualized cap.

2. **Quarterly caps reset.** Chase Freedom Flex–style cards cap at $1,500/quarter at 5%. For annualized rewards, that's $6,000/year at 5% → then base rate above that. Don't model as $6,000/year cap; model as $1,500 × 4 quarters with quarterly reset (otherwise you over-credit users who spend $6,000 in one quarter).

3. **Point valuation normalization.** Always convert points to USD via `pointValueCents` before comparing across cards. A 3x points card at 2¢/point (6% effective) beats a 4% cashback card.

4. **Annual fee accounting.** `netAnnualUSD` subtracts all annual fees from gross rewards. `compareWithAddedCard`'s `deltaAnnualUSD` must account for the candidate card's fee.

5. **No double-counting credits.** Card credits (e.g., Amex Gold's $120 dining credit) are NOT automatically added to rewards. They're surfaced separately. Users may not actually use them, so don't bake them into the comparison math by default.

## Coding Standards

### TypeScript

- `strict: true` in tsconfig
- No `any` outside of test scaffolding
- Prefer `type` over `interface` for non-extended shapes; use `interface` for objects that may be extended
- Exhaustive switch statements use `never` assertion for the default case

### React / Next.js

- All components are functional with hooks
- Server Components by default; mark Client Components with `"use client"` only when needed (state, effects, event handlers)
- The dashboard and explore pages are Client Components; the landing page is a Server Component
- No global state library — `useState` and `useReducer` are sufficient for v1.0
- Persist via `lib/storage.ts`, never call `localStorage` directly from components

### Styling

- Tailwind utilities first
- shadcn/ui for primitives (Button, Input, Card, Dialog, etc.)
- No inline styles except for dynamic values that Tailwind can't express
- Color palette: neutral base (zinc/slate), single accent color for CTAs, avoid alarmist reds and aggressive greens

### Testing

- Every function in `src/core/` must have unit tests
- Target: 90%+ coverage on `core/`
- UI components don't need full test coverage for v1.0; smoke tests are sufficient
- Run tests with `npm run test`

## Commands

```bash
npm run dev          # start Next.js dev server
npm run build        # production build
npm run start        # run production build locally
npm run test         # run Vitest tests
npm run test:watch   # watch mode
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

## Working on the Card Dataset

The dataset in `src/core/cards.json` is the hand-maintained core of the product. When adding or updating a card:

1. Source from the issuer's official page first; cross-check with NerdWallet or The Points Guy for category interpretations.
2. Express cashback percentages as decimals: 2% = `"rate": 0.02`. Express points multipliers as whole numbers: 4x = `"rate": 4`.
3. The `pointValueCents` is the baseline cashback redemption value, not the maximum transfer-partner value. For Amex MR redeemed as cashback, use 1.0. For Chase UR with Sapphire Preferred (portal redemption at 1.25x), use 1.25.
4. The `"other"` category is the catch-all. Every card must have an `"other"` rule (it's the base rate for spending that doesn't fit a bonus category).
5. After editing, run tests — the engine has assertions that catch malformed card definitions.

## Privacy Constraints

These are product-defining constraints, not preferences. Violating them defeats the purpose of the project:

- **No analytics scripts that transmit user spending or card data.** Vercel Analytics for page views is acceptable; nothing that sees the user's portfolio.
- **No external API calls from the client.** The card dataset is bundled at build time, not fetched.
- **No accounts, no auth, no email collection.** Even for "save your data across devices" features. If that becomes important post-v1.0, it requires explicit privacy review.
- **HTTPS only.** Vercel handles this by default.

## What's Out of Scope for v1.0

Don't build these without explicit discussion:

- Mobile apps (planned for post-v1.0 via React Native/Expo, reusing `src/core/`)
- Bank account linking, Plaid integration, transaction import
- User accounts, authentication, cross-device sync
- Business credit cards
- Transfer-partner point optimization (e.g., "transfer Amex MR to Hyatt for 4¢/point value")
- Affiliate links or any monetization
- Internationalization
- Card application tracking or referral functionality

## Common Pitfalls

- **Importing from `app/` or `components/` into `core/`.** This breaks the architectural rule; engine becomes non-portable to React Native.
- **Calling `localStorage` directly from a component.** Always go through `lib/storage.ts`. This keeps the persistence layer swappable.
- **Forgetting that monthly spend can cross annual caps.** A user spending $2,500/month on groceries hits Amex Gold's $25K cap in October. The engine must handle this; tests must cover it.
- **Mixing percentages and multipliers in card definitions.** Cashback as decimal (0.02), points as multiplier (2). The engine relies on `rewardType` to disambiguate.
- **Adding analytics that see user data.** Even well-intentioned tracking violates the project's core promise.

## When in Doubt

If a feature request would require server-side computation, accounts, or data transmission, push back and ask whether the value justifies breaking the privacy-first positioning. The answer is usually no — privacy-first is the product's defining differentiator, not a nice-to-have.
