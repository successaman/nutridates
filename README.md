# NutriDates — Shopify theme

Online Store 2.0 theme built for NutriDates. Cocoa / cream / gold palette, bold rounded
display type, pill buttons, card grids and marquee strips — the modern Indian D2C FMCG
pattern, tuned to the pouch.

## Getting it onto a store

```bash
npm install -g @shopify/cli @shopify/theme
```

```bash
shopify theme dev --store your-store.myshopify.com
```

`theme dev` gives you a live preview on your real store data without publishing.
When you're happy:

```bash
shopify theme push --unpublished
```

Then preview and publish from **Online Store → Themes** in the Shopify admin.

## Structure

```
assets/       base.css (design tokens + all shared UI), global.js, per-section CSS
config/       settings_schema.json (theme editor), settings_data.json (defaults)
layout/       theme.liquid
locales/      en.default.json
sections/     header, footer, cart drawer, and every homepage section
snippets/     product-card, price, icon, meta-tags
templates/    index.json, product.json, and the standard set
```

## Design tokens

Everything is driven by CSS variables defined in `assets/base.css` and overridden from
theme settings in `layout/theme.liquid`. Change a brand colour in
**Theme editor → Brand colours** and it flows everywhere.

| Token | Value | Role |
|---|---|---|
| `--nd-cocoa` | `#3A2017` | Primary brown |
| `--nd-cocoa-deep` | `#21110C` | Headings, dark sections |
| `--nd-gold` | `#F5A623` | Accent, CTAs, badges |
| `--nd-cream` | `#FFF6E9` | Alternating section background |
| `--nd-white` | `#FFFCF7` | Page background |
| `--nd-beige` | `#EEDCC7` | Chips, dividers |

Section backgrounds are selectable per section (`Warm white / Warm cream / Soft beige /
Cocoa`) so you can keep the roughly 60/20/10/5/5 ratio from the brand book.

## Sections

| Section | Used for |
|---|---|
| `hero` | Full-bleed hero with badge, stat chips, two CTAs |
| `icon-strip` | Quick benefits row |
| `featured-collection` | Product grid / horizontal scroller |
| `steps` | Three-step preparation |
| `content-cards` | Ingredients, occasions, recipes, audiences (image or icon cards) |
| `image-with-text` | Protein proposition, founder story |
| `nutrition-table` | Full panel + ingredients / allergens / storage callouts |
| `comparison` | NutriDates vs typical drink mix |
| `testimonials` | Reviews |
| `faq` | Accordion with FAQ structured data |
| `cta-banner` | Closing conversion block |
| `marquee` | Scrolling brand ticker |

All of them are `presets`-enabled, so they can be added to any page from the theme editor.

## Product page

`sections/main-product.liquid` is block-driven. The default `templates/product.json`
ships with: title, price, highlight chips, variant picker, quantity + add to cart,
dynamic checkout, trust list, description, and accordions for ingredients, nutrition,
preparation, allergens & storage, and shipping & returns.

## Compliance notes baked in

- Protein is worded as **"17g protein when made with milk"** everywhere, with the
  11g-per-serving powder figure stated separately.
- Nutrition, allergen (oats, nuts, soy; dairy/whey facility) and storage panels are
  first-class sections rather than buried in a description.
- `card_badge_2` ships empty on purpose — don't fill it with a claim the pack and lab
  report don't support.

## Before launch

1. Set the menus: `main-menu` and `footer` in **Navigation**.
2. Upload the logo and favicon in **Theme editor → Brand**.
3. Replace hero, step, ingredient and occasion images with real product photography.
4. Create the product with the ₹399 / 250g data and add real photos.
5. Check the free shipping threshold in **Theme editor → Cart**.
