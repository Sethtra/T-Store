---
name: T-Store
description: A clean, premium electronics storefront for Cambodian shoppers, in jade, crest gold and white.
colors:
  counter-jade: "#0a5c44"
  counter-jade-deep: "#084936"
  jade-mist: "#e6f2ec"
  on-jade: "#ffffff"
  daylight-white: "#ffffff"
  plinth: "#f3f3f1"
  plinth-deep: "#ebebe8"
  hairline: "#e6e6e3"
  hairline-strong: "#cfcfcb"
  ink: "#121212"
  ink-secondary: "#46464b"
  ink-muted: "#6b6b70"
  crest-gold: "#b08a3a"
  warning: "#b45309"
  error: "#c62828"
  info: "#1d4ed8"
  night-ground: "#0d1512"
  night-raised: "#141e1a"
  night-plinth: "#1b2722"
  night-plinth-deep: "#23302a"
  night-hairline: "#24302b"
  night-hairline-strong: "#33413a"
  night-text: "#f3f3f1"
  night-text-secondary: "#bcc6c1"
  night-text-muted: "#93a09a"
  night-jade: "#3fc79a"
  night-jade-bright: "#5fd6ad"
  night-on-jade: "#0d1512"
  night-crest-gold: "#cfa955"
typography:
  display:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.5rem)"
    fontWeight: 680
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"ss01\", \"cv11\""
  label:
    fontFamily: "Hanken Grotesk, Kantumruy Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  body-khmer:
    fontFamily: "Kantumruy Pro, Hanken Grotesk, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
rounded:
  sm: "6px"
  md: "10px"
  card: "12px"
  lg: "16px"
  full: "999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  section-gap: "24px"
  card-pad: "12px"
  panel-pad: "24px"
components:
  button-primary:
    backgroundColor: "{colors.counter-jade}"
    textColor: "{colors.on-jade}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.counter-jade-deep}"
    textColor: "{colors.on-jade}"
  button-outline:
    backgroundColor: "{colors.daylight-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.plinth}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.daylight-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "48px"
  card:
    backgroundColor: "{colors.daylight-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  product-card:
    backgroundColor: "{colors.daylight-white}"
    rounded: "{rounded.card}"
    padding: "12px"
  product-well:
    backgroundColor: "{colors.plinth}"
  badge:
    backgroundColor: "{colors.plinth}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  badge-sale:
    backgroundColor: "{colors.counter-jade}"
    textColor: "{colors.on-jade}"
---

<!-- Palette implemented on 2026-10-25 (live mode): Jade #0a5c44 for actions, Crest Gold #b08a3a for accent lines, white ground, neutral greys. Success uses the jade. Cards use a firmer edge and deeper photo well. The resting card shadow described under Elevation is not implemented yet. -->

# Design System: T-Store

## Overview

**Creative North Star: "The Bright Counter"**

T-Store should feel like a well-lit electronics counter: a clean white surface where each product sits on its own pale plinth, the price is printed plainly beside it, and the one jade thing in reach is the button you press to buy. Jade is the store's voice, gold its signature, and white the room they speak in.

It is a clean, premium, easy storefront: the category standard done with full craft. Products and prices lead. Brand lives in precise details: tight display tracking, tabular prices, hairline structure, a jade that only appears where the shopper acts or has chosen, and the gold crest. Surfaces are gently layered, so cards rest a few millimetres above the counter rather than being printed on it.

Most shoppers are on phones in daylight, often switching to their banking app to pay, so light mode is the default and every pattern has to work with one thumb. Dark mode mirrors the same roles on a near-black ground.

**Key Characteristics:**
- White ground, pale grey plinths under every product photo.
- Counter Jade for actions, selection and positive news; never for decoration.
- Near-black ink for all reading text.
- Soft resting shadows on cards; stronger lift on hover, menus and drawers.
- Tabular prices everywhere, in USD.
- Khmer gets its own face and taller line height.

## Colors

A jade, crest-gold and white palette over neutral greys, with plain status colors.

### Primary
- **Counter Jade** (`counter-jade`): primary buttons, the add-to-cart bar, selected filters and swatches, cart count badges, focus rings, text selection, the sale tag, and positive messages ("Save $20", "In stock", "Paid"). Hover and press deepen to **Deep Jade** (`counter-jade-deep`).
- **Jade Mist** (`jade-mist`): the 3px focus halo around inputs, selected-row fills, and quiet confirmation backgrounds. Never behind body text that needs to read as plain.
- **On Jade** (`on-jade`): text and icons placed on Counter Jade.

### Secondary
- **Crest Gold** (`crest-gold`): the logo crest, the 3px underline under section titles, and the 2px underline under the active navigation link. At 3.2:1 on white it passes for lines and marks but fails for text, so it never carries text, prices or buttons.

### Neutral
- **Daylight White** (`daylight-white`): page, header, footer, cards, drawers, dialogs.
- **Plinth** (`plinth`): product image wells, summary panels, search fields at rest, secondary buttons. Hover deepens to **Deep Plinth** (`plinth-deep`).
- **Hairline** (`hairline`) and **Strong Hairline** (`hairline-strong`): dividers and card edges; input and outline-button borders.
- **Ink** (`ink`), **Ink Secondary** (`ink-secondary`), **Ink Muted** (`ink-muted`): primary text, supporting text, and meta or captions. All three clear 4.5:1 on white and on Plinth.

### Status
- **Warning** (`warning`): low stock ("Only 3 left") and pending payment.
- **Error** (`error`): failed payments, validation errors, destructive actions.
- **Info** (`info`): neutral system notices.
- Status fills are the status color at 12–14% over the surface, with the full color for the text.

### Dark mode
Night Ground (`night-ground`) for the page, Night Raised (`night-raised`) for cards and drawers, Night Plinth (`night-plinth`) for wells and inputs, Night Text in three steps, and Night Jade (`night-jade`) for actions, with Night On Jade (`night-on-jade`) as its text: 8.7:1. Crest gold lifts to `night-crest-gold`.

### Named Rules
**The One Green Rule.** Jade is the only green in the system. Success and positive status use Counter Jade itself, so a "Save $20" never sits beside a button in a slightly different green.

**The Jade Marks Intent Rule.** Jade appears only where the shopper can act, has chosen, or has received good news. Headlines, borders, icons at rest, and backgrounds stay neutral. If removing the jade from an element changes nothing about what the shopper can do or knows, it should not be jade.

**The Gold Is a Line Rule.** Gold appears only as the crest and as thin accent lines (underlines, rules). Never as a fill behind text, never as text, never on a button.

## Typography

**Display Font:** Hanken Grotesk (with ui-sans-serif, system-ui)
**Khmer Font:** Kantumruy Pro, applied to the whole page when the language is Khmer
**Body Font:** Hanken Grotesk

**Character:** A crisp, slightly technical grotesque with tight display tracking and stylistic alternates (`ss01`, `cv11`). It sounds like a confident spec sheet, not a fashion magazine. Kantumruy Pro carries the same plainness into Khmer.

### Hierarchy
- **Display** (680, clamp(2.5rem, 5.2vw, 4.5rem), 1.02, -0.035em): the home hero headline (admin-editable) and the About title.
- **Headline** (700, 1.5rem, 1.15): page titles in the account and admin areas.
- **Section title** (700 for the emphasised part and 600 for the lead-in, 1.125rem on phones and 1.375rem from `sm`): "Grab the best deal on **Phones**" rows, sitting on a hairline with a gold underline.
- **Title** (600, 0.9375rem, 1.375): product names on cards (two lines at most), panel headings.
- **Body** (400, 1rem, 1.6): descriptions and explanations, at most 60–65ch wide.
- **Label** (600, 0.6875rem, 0.08em, uppercase): category captions on product cards. Khmer labels are never uppercased or letter-spaced.
- **Prices** always use tabular figures and the shared `formatUSD()` helper: "$1,209.00".

### Named Rules
**The Khmer Room Rule.** Khmer text gets line height 1.8 for body and 1.45 for headings, letter spacing 0, and no truncation that could cut a cluster in half. Every layout is checked in both languages before it ships.

**The Tabular Price Rule.** Any number a shopper compares (price, quantity, total, stock count) uses tabular figures so columns line up.

## Layout

The storefront sits in a 1320px column with side gutters of 16px on phones, 24px from `md` and 32px from `lg`. The hero is a 12-column split: copy in 5 columns and the featured product in 7 on desktop, stacked on phones. Product grids run 2 columns on phones, 3 on tablets and 4 on desktop; deal rows scroll sideways on phones.

Section headings sit 20–24px above their content. Density is medium: products get room, but a phone screen always shows at least one full product card plus the start of the next row.

On phones a fixed 60px bottom navigation (Home, Products, Cart, Orders, Account) sits above the safe area, and the top bar stays at 64px. Touch targets are at least 44px, except for color swatches, which are 14px visually with an enlarged invisible hit area.

**The Thumb Reach Rule.** On phones, the primary action of a screen is reachable at the bottom: the bottom nav, a sticky add-to-cart bar, or a checkout button that stays in view.

## Elevation & Depth

Gently layered. Cards and panels rest on the white page with a faint, jade-tinted shadow, so the store feels like objects on a counter rather than boxes drawn on paper. Hover lifts a card one step; menus, the mega-menu, the cart drawer and dialogs sit highest. Shadows are always offset downward and soft. Never a glow or halo.

### Shadow Vocabulary
- **Rest** (`0 1px 2px rgb(16 32 26 / 0.05), 0 2px 8px -2px rgb(16 32 26 / 0.06)`): product cards, content cards, summary panels at rest.
- **Lift** (`0 6px 16px -4px rgb(16 32 26 / 0.10), 0 2px 4px rgb(16 32 26 / 0.04)`): a card on hover, the touch quick-add button.
- **Float** (`0 18px 40px -12px rgb(16 32 26 / 0.18), 0 4px 10px rgb(16 32 26 / 0.05)`): menus, the mega-menu, the cart drawer, dialogs.
- Dark mode replaces the tint with black: Rest `0 1px 2px rgb(0 0 0 / 0.4)`, Lift `0 8px 20px -6px rgb(0 0 0 / 0.6)`, Float `0 20px 44px -12px rgb(0 0 0 / 0.7)`.

### Named Rules
**The Three Heights Rule.** There are exactly three heights (Rest, Lift and Float). A new component picks one of them; it never invents a fourth shadow.

## Shapes

Gently rounded and consistent. Small controls and badges use 6px, buttons and inputs 10px, product cards 12px, and larger cards, drawers, menus and the hero image 16px. Circles are kept for avatars, swatches, count badges and the touch quick-add button. The sale tag is the one asymmetric shape: square except for its rounded bottom-left corner, tucked into the top-right of the photo.

Edges are hairline borders, 1px. Product photos sit inside their plinth with about 9% padding and are never cropped. Products show whole, the way they would sit on a counter.

## Components

### Buttons
Confident and quiet: one solid jade action, everything else neutral.
- **Shape:** gently rounded (10px), semibold label, icons 16px with an 8px gap.
- **Sizes:** small 36px, medium 44px, large 52px tall.
- **Primary:** Counter Jade fill with white text. Hover goes to Deep Jade; press nudges the button 1px down. Rest shadow.
- **Outline:** white with a Strong Hairline border and ink text; hover darkens the border to ink.
- **Secondary:** Plinth fill and ink text; hover goes to Deep Plinth.
- **Ghost:** text only in Ink Secondary, with a Plinth fill on hover.
- **Danger:** Error fill with white text, for destructive admin actions only.
- **Loading:** a 16px spinner before the label, and the button stays the same width.
- **Focus:** a 2px jade outline, offset by 2px.

### Inputs / Fields
- **Style:** white field, Strong Hairline border, 10px radius, 48px tall, 16px text (prevents zoom on iOS). Label above in 14px medium ink.
- **Focus:** the border turns Counter Jade, plus a 3px Jade Mist halo.
- **Error:** Error border, with the message below in Error at 14px, announced to screen readers.
- **Search:** Plinth fill with no border at rest; it turns white with a jade border on focus.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Daylight White on the page; Night Raised in dark mode.
- **Shadow Strategy:** Rest at rest, Lift on hover for clickable cards (see Elevation & Depth).
- **Border:** 1px Hairline, darkening to Strong Hairline on hover.
- **Internal Padding:** 24px, with 20px header and footer bands separated by hairlines.

### Product Card (signature)
The store's most repeated object.
- **Visibility (confirmed 2026-10-25 in live mode):** cards use a firmer edge than the general Hairline (`--color-card-edge` #d4d4d0, darkening to #b4b4af on hover) and a deeper photo well (`--color-card-well` #eaeae7). This exists so older and low-vision shoppers can see where each card begins; never lighten it back to the general Hairline.
- A 4:5 well holding the product photo, which scales gently (4%) on hover.
- The sale tag sits top-right in jade: percent over "OFF".
- On pointer devices, a panel slides up from the bottom of the photo on hover or keyboard focus, showing three key specs and a full-width jade add-to-cart bar. On touch screens a 36px round jade quick-add button sits on the photo instead.
- Below the photo: an uppercase category caption with the chosen color, up to four color swatches (+N beyond that), a two-line name, and the tabular price, with the struck original price and a jade "Save $X" when discounted. Low stock shows in Warning.
- Sold-out products show a grey, faded photo and a "Sold out" chip.
- The whole card is one link; swatches and the add button sit above that link layer.

### Badges / Chips
- **Default:** Plinth fill, Ink Secondary text, 6px radius.
- **Status:** the status color at 12–14% fill with full-color text. Positive status uses jade.
- **Count badge:** an 18px jade circle with white tabular digits and a ring in the page color.

### Navigation
- **Top bar:** sticky, 64px, white with a hairline bottom edge. It may blend slightly over scrolled content (85% opacity with a light blur where supported). This is the only blurred surface in the system, and it exists for legibility, not effect.
- **Links:** 15px medium Ink Secondary; hover and active turn ink, and the active link carries a 2px Crest Gold underline.
- **Mega-menu:** a Float-height white panel, 16px radius, with categories in three columns.
- **Phone bottom nav:** five items with 22px icons and 11px labels. The active item is jade, with a heavier icon stroke.

### Section Header
A title on a full-width hairline, with a 3px Crest Gold bar under the title text only. "View all ›" sits right-aligned in Ink Secondary.

## Do's and Don'ts

### Do:
- **Do** use Counter Jade for the one main action in each region, and for selected and positive states.
- **Do** keep all reading text in Ink, Ink Secondary or Ink Muted. Jade text is allowed only for positive status and links that need it.
- **Do** put every product photo on a Plinth well, uncropped, with about 9% padding.
- **Do** give cards the Rest shadow and lift them to Lift on hover.
- **Do** set prices in tabular figures through `formatUSD()`.
- **Do** check every layout in Khmer and English, light and dark, at 375px and desktop widths.
- **Do** render whatever logo, site name and hero copy the admin has configured, at any length.

### Don't:
- **Don't** use gradient text, glassmorphism, floating blur blobs, pulsing pill labels or neon glows.
- **Don't** add a second green, or any decorative color. If a color isn't a product photo, a status, jade intent or the crest, it's a neutral.
- **Don't** use Crest Gold for text, prices, buttons or fills; it is for the crest and thin accent lines only.
- **Don't** use Angkor, temple or other "cultural/touristy" ornament.
- **Don't** propose themed or conceptual worlds (receipt, street map, calendar, collage) unless the user asks.
- **Don't** invent a fourth shadow height or a glow.
- **Don't** uppercase or letter-space Khmer text.
