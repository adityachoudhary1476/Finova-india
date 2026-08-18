# FInova Calculator Architecture

## Layers

FInova keeps financial mathematics, interactive state and static educational content separate.

1. **Metadata — `src/data/calculators.ts`**
   - Canonical slug and route
   - Category, naming, description and aliases
   - Availability (`live` or `planned`)
   - SEO title and description
   - Related calculator IDs
2. **Pure calculation functions — `src/lib/calculators/`**
   - No React, DOM or display formatting
   - Deterministic typed inputs and outputs
   - Explicit validation for non-finite and out-of-domain values
3. **Shared formatting and validation — `src/lib/`**
   - Indian number grouping and INR formatting
   - Duration and percentage formatting
   - Display-string parsing separated from numeric state
   - Reusable user-input constraints
4. **Interactive components — `src/components/calculator/react/`**
   - Typed numeric, money, percentage, duration, slider and select controls
   - Shared result metrics, charts, breakdowns, actions and schedules
   - One React island per calculator page
5. **Static calculator page system — `src/components/calculator/`**
   - Breadcrumbs and calculator header
   - Formula, assumptions, education, related tools and disclaimer
   - Server-rendered by Astro for speed and SEO
6. **Routes — `src/pages/calculators/`**
   - Thin page composition files provide calculator-specific copy and select the correct interactive island.

## Live routes

- `/calculators`
- `/calculators/emi`
- `/calculators/sip`
- `/calculators/compound-interest`
- `/calculators/home-loan-emi`
- `/calculators/car-loan-emi`
- `/calculators/salary`
- `/calculators/fd`
- `/calculators/gratuity`
- `/calculators/ppf`
- `/calculators/epf`
- `/calculators/gst`
- `/calculators/income-tax`

## Adding a calculator

1. Add or promote its metadata entry in `src/data/calculators.ts`.
2. Add a pure typed function under `src/lib/calculators/`.
3. Add independently verified unit tests under `src/lib/__tests__/`.
4. Compose the existing input, result and chart primitives in a small calculator island.
5. Create an Astro route using `CalculatorShell.astro`.
6. Supply formula variables, assumptions, educational sections and related metadata.
7. Test invalid, empty, zero, decimal, high-value and long-duration inputs.
8. Check desktop, tablet and mobile widths before running `npm run build`.

## URL state

Live calculator islands validate supported query parameters before applying them and then update the current URL with valid state. A copied link therefore reproduces the current calculation without making URL state mandatory.

## Chart approach

No chart dependency is installed. The shared chart system uses accessible SVG for growth curves and a small SVG ring for contribution breakdowns. Text values remain present beside every visual, so a chart is never the only source of information.

## SEO and deployment

Canonical URLs use Astro’s configured `site`. Set `PUBLIC_SITE_URL` in deployment to override the default `https://finova.in`. Calculator pages output genuine `WebApplication` structured data with a free INR offer; no review or rating markup is used.

## Verification

- `npm test` runs the pure formula and formatter tests through Node’s test runner with `tsx`.
- `npm run build` runs strict Astro/TypeScript diagnostics before producing the static build.
