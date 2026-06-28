# Cashback IQ

Cashback IQ is a privacy-first web application that recommends the optimal credit
card to use for each spending category based on the user's portfolio and monthly
spending. Users input the cards they own and approximate monthly spending; the app
calculates per-category recommendations, projects annualized rewards, and supports
"what-if" analysis for adding new cards. No accounts, no bank linking, no data
transmission — all computation happens client-side.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Testing:** Vitest
- **Hosting:** Vercel
- **Persistence:** Browser localStorage only

## Development

```bash
npm run dev            # start the Next.js dev server
npm run build          # production build
npm run start          # run the production build locally
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run test           # run Vitest tests once
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Vitest with coverage report
```

See [CLAUDE.md](./CLAUDE.md) for architecture, data model, and contribution guidelines.
