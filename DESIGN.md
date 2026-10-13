---
name: T-Store
colors:
  page: "#ffffff"
  well: "#f3f3f1"
  well-hover: "#ebebe8"
  ink: "#121212"
  ink-hover: "#2c2c2e"
  text-secondary: "#46464b"
  text-muted: "#6b6b70"
  hairline: "#e6e6e3"
  hairline-strong: "#cfcfcb"
  crest-gold: "#b08a3a"
  success: "#15803d"
  warning: "#b45309"
  error: "#c62828"
  info: "#1d4ed8"
  dark-page: "#0e0e0f"
  dark-elevated: "#18181a"
  dark-well: "#222226"
  dark-ink: "#f4f4f2"
typography:
  display:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.5rem)"
    fontWeight: 680
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  section: "112px"
  container: "1320px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "48px"
  product-well:
    backgroundColor: "{colors.well}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "48px"
---

# Design System: T-Store

## Overview

**Creative North Star: "The Bright Counter."** T-Store should feel like a well-lit electronics counter: a clean white surface where each product sits on its own soft grey plinth, the price is printed plainly beside it, and the only dark thing in the room is the button you press to buy.

It is a clean, premium, easy-to-use storefront, the category standard done with full craft (the user's confirmed choice). Products and prices lead. Brand lives in precise details: tight display tracking, tabular prices, hairline structure, and the gold crest. **Anti-references:** gradient text, glassmorphism, floating blur blobs, pulsing pill labels, neon glows, purple/indigo gradients, scroll-jacked sections, and anything "cultural/touristy" (Angkor or temple ornament).

## Colors

The color strategy is restrained: neutrals plus ink. Colour comes from product photography, not chrome.

### Primary
- **Counter Ink** (#121212): primary buttons, active navigation underline, selected states, count badges, focus outlines. In dark mode it inverts to **Paper Ink** (#f4f4f2), with text on it switching via `--color-on-primary`.

### Neutral
- **Daylight White** (#ffffff): page, header, footer, drawers.
- **Plinth Grey** (#f3f3f1): product image wells, summary panels, inputs at rest in search, quiet fills. Hover deepens to #ebebe8.
- **Hairline** (#e6e6e3) / **Strong Hairline** (#cfcfcb): dividers, input and outline-button borders.
- **Text:** primary #121212, secondary #46464b, muted #6b6b70 (≥4.5:1 on white).

### Brand mark
- **Crest Gold** (#b08a3a): reserved for the logo crest. It is never used for text or buttons.

### Status
Success #15803d, warning #b45309, error #c62828, info #1d4ed8. These are used as text plus a small dot, or as an 8–14% tint fill. Never use a saturated block.

### Named Rules
- **One dark thing per view.** The main action is the only solid ink block in its region.
- **No decorative colour.** If a colour isn't a product photo, a status, or the crest, it is a neutral.

## Typography

**Hanken Grotesk** for Latin, with **Kantumruy Pro** as the Khmer face (both from Google Fonts, loaded in `index.html`). Under `[lang="kh"]` the Khmer face leads, body line-height rises to 1.8 and headings to 1.45, with tracking reset to 0 so stacked vowels and subscripts are never clipped.

### Hierarchy
- **Display** (680, clamp(2.5rem, 5.2vw, 4.5rem), 1.02, -0.035em): home hero headline (admin-editable) and About title.
- **Headline** (600, 1.875–2.375rem, -0.03em): page titles (Products, Checkout, product name).
- **Section title** (600, 1.5–1.875rem, -0.025em): "Featured products", "Shop by category".
- **Title** (600, 1–1.125rem): card and panel headings.
- **Body** (400, 0.9375–1.0625rem, 1.6): descriptions, max 60–65ch.
- **Label** (500, 0.8125–0.875rem): category captions, field labels, meta.
- **Prices** always use `.tabular` (tabular figures) and the shared `formatUSD()` helper (`src/utils/money.ts`): "$1,209.00".

### Named Rules
- Sentence case for all UI copy ("Add to cart", not "Add To Cart").
- No eyebrows or kicker labels above headings.

## Layout

- Container max width 1320px; gutters 16 / 24 / 32px (mobile / tablet / desktop).
- Sections are separated by 80–112px (`mt-20 md:mt-28`), with the heading and "View all" link on one baseline row.
- Product grids: 2 columns on phones, 3 on tablet / shop page, 4 on desktop home. Gaps are 16–24px horizontal and 32–40px vertical.
- The header is sticky (64px) with a bottom hairline. On mobile a 5-tab bottom bar (Home, Products, Cart, Orders, Menu) respects `env(safe-area-inset-bottom)`; the footer pads for it.
- Product detail: a 7/5 split, with the buy box sticky on desktop and a fixed purchase bar on mobile.

## Elevation & Depth

The system is mostly flat, built from tonal layering (white page → grey wells) and hairlines. Shadows are reserved for things that float:

- **sm** (`0 1px 2px rgb(18 18 18 / .06)`): primary buttons, small floating chips.
- **md** (`0 6px 16px -4px rgb(18 18 18 / .1), 0 2px 4px rgb(18 18 18 / .04)`): hovered cards (rare).
- **lg** (`0 18px 40px -12px rgb(18 18 18 / .18), 0 4px 10px rgb(18 18 18 / .05)`): menus, drawers, dialogs, toasts.

Never use coloured halos or zero-offset glows.

## Shapes

Radii are 6px (badges, small controls), 10px (buttons, inputs, choice cards) and 16px (product wells, panels, drawers). Use full rounding only for count dots, avatars and icon-only round buttons.

## Components

### Buttons
- **Primary:** Counter Ink fill, white text, 10px radius, 44–48px tall, semibold. Hover goes to #2c2c2e; press nudges 1px down.
- **Outline:** transparent, strong-hairline border, ink text. Hover darkens the border to ink.
- **Secondary / ghost:** Plinth Grey fill, or text-only with a grey hover.

### Product card
A grey 1:1 well (16px radius) with the cutout contained at ~9% padding, followed by the category (muted label), name (medium, 2-line clamp), and tabular price. Hover deepens the well and scales the image 1.04×. Sold-out items dim and desaturate with a small white "Sold out" tag. No borders, no description.

### Inputs
48px tall, white, strong-hairline border, 10px radius. Focus turns the border ink and adds a 3px soft ring. Errors show a red border plus a message linked with `aria-describedby`.

### Choice cards (delivery, payment)
Radio cards with a hairline border. When selected: an ink border plus an inset ring and Plinth Grey fill.

### Navigation
Text links with a 2px ink underline for the active route; categories open in a mega-menu panel. EN/ខ្មែរ toggle, theme toggle, cart with an ink count dot.

### Motion
One entrance (`.rise-in`: 8px rise, 520ms, ease-out) on page heroes. Hover transitions run 150–300ms. Drawers and sheets slide with `cubic-bezier(.22,1,.36,1)`. Everything collapses under `prefers-reduced-motion`. Avoid scroll-triggered reveals that hide content by default.
