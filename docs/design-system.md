# FInova Design System

FInova is an editorial financial utility: neutral by default, precise in its use of numbers, and teal only where attention or action is useful.

## Foundations

The canonical design tokens live in `src/styles/tokens.css`. Tailwind theme aliases are declared in the same file, while shared base and layout rules live in `src/styles/global.css`.

### Colour

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--pc-canvas` / `canvas` | `#FAFAF9` |
| Surface | `--pc-surface` / `surface` | `#FFFFFF` |
| Primary ink | `--pc-ink` / `ink` | `#0C0A09` |
| Body copy | `--pc-text` / `copy` | `#44403C` |
| Muted copy | `--pc-muted` / `muted` | `#78716C` |
| Border | `--pc-border` / `line` | `#E7E5E4` |
| Accent | `--pc-accent` / `accent` | `#0F766E` |
| Accent wash | `--pc-accent-light` | `#CCFBF1` |
| Error | `--pc-error` / `error` | `#B91C1C` |

Use teal to identify action, focus, status or a key financial number. Do not turn whole surfaces teal without a functional reason.

### Typography

- **Display and editorial headings:** Fraunces Variable
- **Body and interface:** Public Sans Variable
- **Small references and folios:** system monospace
- **Financial values:** always use `.tabular-nums` for aligned lining figures

The display system uses Fraunces optical sizing and restrained italic emphasis to create a recognizable editorial voice. UI labels remain compact, plain and highly legible.

### Space, shape and depth

- Spacing follows a 4px base progression, exposed as `--pc-space-*` tokens.
- Section spacing is fluid through `--pc-section-space`.
- Radii stay between 6px and 14px. Full pills are reserved for true status elements.
- Shadows are never structural. Use `--pc-shadow-subtle` only for temporary elevation or important result surfaces.
- Borders and whitespace establish most grouping.

### Responsive breakpoints

| Alias | Width |
| --- | --- |
| `xs` | 30rem |
| `sm` | 40rem |
| `md` | 48rem |
| `lg` | 64rem |
| `xl` | 80rem |

Components start as a single-column mobile layout and gain columns when their content has enough room; desktop is not merely scaled down.

## Reusable components

### Global shell

- `BaseLayout.astro`: metadata, self-hosted fonts, language, skip link, navigation and footer
- `Navigation.astro`: desktop navigation and no-JavaScript mobile disclosure menu
- `Footer.astro`: compact calculator, resource and legal navigation

### UI primitives

- `Icon.astro`: one consistent thin-line SVG icon set
- `Brand.astro`: text-based FInova wordmark
- `Button.astro`: primary, secondary and quiet link-buttons
- `SectionHeader.astro`: numbered editorial section heading

### Content patterns

- `CalculatorCard.astro`: high-priority calculator discovery card
- `CategoryCard.astro`: scalable grouped calculator index
- `ArticleCard.astro`: editorial guide preview
- `TrustStrip.astro`: compact factual value statements
- `HeroVisual.astro`: non-interactive example projection panel
- `CalculatorSearch.tsx`: the only hydrated homepage island; filters structured calculator metadata and links results to the catalogue

## Interaction rules

- Hover and focus transitions run for approximately 170ms.
- Card hover uses only a small lift, border refinement and arrow shift.
- Focus uses a solid teal outline plus offset; focus must never be removed.
- Interactive mobile targets are at least 44px tall.
- Reduced-motion preferences disable non-essential transitions and smooth scrolling.

## Content rules

- Name the calculator directly: “EMI Calculator”, not “Loan intelligence solution”.
- Explain the output in one sentence.
- Separate examples from actual results with an explicit “Example” or “Illustrative” label.
- Show formulas, assumptions, source/update dates and estimate status on future calculator pages.
- Never use invented trust metrics, testimonials, awards or urgency.

## Extending to calculator pages

Future calculator pages should reuse the global shell, type and token layers. A recommended page structure is:

1. Breadcrumb and calculator title
2. Input panel and result panel
3. Result breakdown or schedule
4. Formula and assumptions
5. “Last updated” and source information
6. Plain-English guide
7. Related calculator links
8. Informational disclaimer

Do not implement calculator mathematics inside visual components. Keep calculation functions typed, tested and independent from presentation.
