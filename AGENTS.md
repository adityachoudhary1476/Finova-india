# AGENTS.md

## Project overview

FInova is an Astro 5 static site with interactive Indian financial calculators. Astro serves pages; React 19 handles the interactive calculator UIs; Tailwind CSS 4 styles everything.

## Commands

```sh
npm run dev          # Astro dev server
npm run build        # astro check && astro build (runs type-checking first)
npm run test         # tsx --test src/lib/__tests__/*.test.ts
npm run preview      # serve the production build
```

`npm run build` runs `astro check` before building — type errors will fail the build.

Tests use Node's built-in test runner (`node:test` + `node:assert/strict`). There is no vitest/jest. To run a single test: `npx tsx --test src/lib/__tests__/sip.test.ts`.

## Architecture

Three-layer pattern for each calculator:

1. **Pure logic** — `src/lib/calculators/[name].ts`
   Export a `calculate*` function, input interface, and result interface. No React or DOM imports. Shared helpers (`assertFiniteNonNegative`, `assertFinitePositive`, `GrowthPoint`) are in `src/lib/calculators/shared.ts`.

2. **React UI** — `src/components/calculator/react/calculators/[Name]Calculator.tsx`
   Client-only component using `client:load` in the Astro page. Reads/writes URL query params via `urlState.ts`. Imports logic from layer 1.

3. **Astro page** — `src/pages/calculators/[slug].astro`
   Wraps the React component in `CalculatorShell.astro` (provides layout, breadcrumbs, SEO structured data, related calculators, disclaimer). Defines assumptions, formula display, and education content in Astro frontmatter.

Adding a new calculator requires touching all three layers plus registering it in `src/data/calculators.ts` (metadata, categories, SEO, related IDs) and optionally `src/data/calculatorReferences.ts`.

## Key files

| File | Purpose |
|---|---|
| `src/data/calculators.ts` | Calculator and category registry — metadata, routes, SEO, related IDs |
| `src/data/types.ts` | `CalculatorItem`, `CalculatorCategory`, `GuideDefinition` types |
| `src/lib/formatters.ts` | Indian locale formatting (`formatINR`, `formatIndianNumber`, `parseNumericInput`) |
| `src/lib/validation.ts` | Input validation (`validateNumericValue`, `hasValidationErrors`) |
| `src/lib/calculators/shared.ts` | Shared assertion helpers and `GrowthPoint` type |
| `src/styles/tokens.css` | Design tokens — both CSS custom properties (`--pc-*`) and Tailwind `@theme` block |
| `src/config/site.ts` | Contact email config via `PUBLIC_CONTACT_EMAIL` env var |
| `astro.config.mjs` | Site URL (`PUBLIC_SITE_URL`), trailing slash, integrations |

## TypeScript config

Extends `astro/tsconfigs/strictest`. Notable strict flags:
- `noUncheckedIndexedAccess` — array/object index access returns `T | undefined`
- `exactOptionalPropertyTypes` — `?: T` means property can be absent but not `undefined`
- JSX configured for React (`jsxImportSource: "react"`)

## Conventions

- All monetary values use Indian formatting (`en-IN` locale, `₹` symbol, no space between symbol and number).
- Calculator components read initial state from URL query params and push state changes back via `history.replaceState`.
- CSS uses custom properties under `--pc-` prefix for non-Tailwind usage, plus a Tailwind `@theme` block for utility integration.
- Pages use `trailingSlash: 'never'` (config enforced).
- Sitemap excludes `/404`, `/robots.txt`, `/privacy`, `/terms`, `/disclaimer`.
- Content is India-specific: tax rules in `src/config/taxRules.ts`, financial rules in `src/config/financialRules.ts`.

## Gotchas

- `npm run build` is actually `astro check && astro build`. A `tsc`-level error that `astro check` catches will fail deployment even if the Astro pages compile.
- Calculator logic must remain pure (no browser APIs). Tests run via `tsx` in Node, not a browser.
- Tailwind v4 uses the `@tailwindcss/vite` plugin directly (not PostCSS). Config lives in `astro.config.mjs` vite plugins, not a separate tailwind config file.
- Env vars `PUBLIC_SITE_URL` and `PUBLIC_CONTACT_EMAIL` are read at build time via `import.meta.env`, not runtime.
