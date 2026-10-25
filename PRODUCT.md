# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary shoppers:** people in Cambodia, mostly on mobile phones, who read Khmer or English. They browse tech products, add them to a cart and pay. Most pay with ABA KHQR from their banking app; some pay by card through Stripe.

**Store operator:** a single admin who manages the catalog, stock, orders, users, homepage content and site branding from the admin dashboard.

**Evaluators:** T-Store is a portfolio showcase. Employers and clients will judge it by whether it behaves like a credible, production-grade store, not a demo.

## Product Purpose

T-Store is a full-stack e-commerce platform built by one developer to show production-level skill across a React storefront, a Laravel API, real payment integrations and a complete admin suite.

It succeeds if a reviewer can shop end to end, from browsing to KHQR or card payment to order tracking, and as admin run the store, without hitting dead ends, placeholder behavior or anything that breaks trust. "Credible as a real store" is the bar, even though no real store is operating yet.

## Positioning

A store built for Cambodian shoppers rather than a generic Western template: Khmer is a full language alongside English, ABA PayWay KHQR is a first-class payment method next to Stripe, and delivery is priced for Phnom Penh. A generic e-commerce demo can't honestly claim that local fit.

## Operating Context

- Shoppers mostly use phones, often switching between the store and their ABA banking app to scan or pay a KHQR code.
- The storefront is a React SPA at t-store.site, with the Laravel API at api.t-store.site.
- The admin works on desktop in the dashboard: products, categories, category display, landing sections, orders, inventory ledger, users, reports, notifications and settings.
- Uploaded assets are stored through Supabase or local storage. Auth is Laravel Sanctum, plus Google OAuth.

## Capabilities and Constraints

**Confirmed:**
- Prices are in **USD**.
- Delivery within **Phnom Penh costs $2**.
- **Free shipping on orders over $100** (confirmed 2026-10-25).
- Payments run through Stripe (card) and ABA PayWay (KHQR), with signature-verified webhooks and callbacks.
- English and Khmer localization (`frontend/src/locales/en.json`, `kh.json`), plus light and dark themes.
- Storefront features: search, filters, sorting, product variants and colors, a cloud-synced cart, order history, invoices and payment retry.
- Admin features: CRUD, inventory ledger, CSV exports, role and suspension controls, and editable site name, logo, favicon and hero copy.

**Undecided (do not invent):**
- Delivery outside Phnom Penh: cost and whether it's offered.
- Tax: the 10% in checkout code is not a confirmed policy.
- Whether in-store or local pickup is a real option (checkout code offers it).
- Catalog scope: the current copy says premium tech and electronics, but this is not confirmed as a hard limit.

**Known gaps:**
- `frontend/src/pages/CheckoutPage.tsx` hardcodes $9.99 shipping and a $50 free-shipping threshold, which contradicts the confirmed $2 Phnom Penh rate and $100 threshold. It also applies the unconfirmed 10% tax.
- The Support, FAQ, shipping, returns, privacy and terms pages are linked but not built.
- Public `/test` and `/ui-test` routes expose internal test pages to shoppers and reviewers.

## Brand Commitments

- Name: **T-Store**. The site name, logo and favicon can be changed in admin settings, so the UI must render whatever brand assets are configured.
- Every customer-facing string must work in both Khmer and English.
- **Standing visual preference (confirmed 2026-10-13, reconfirmed 2026-10-25):** a clean, premium, user-friendly modern e-commerce look, the category standard done with full craft. The user rejected themed or conceptual worlds (receipt, street map, calendar, collage) after two rounds. Do not propose themed concepts again unless they ask.
- **Rejected:** "AI slop" styling, meaning gradient text, glassmorphism, floating blur blobs, pulsing pill labels and neon glows. Also anything template-like, plain, or "cultural/touristy" (Angkor or temple ornaments), and anything that slows phone shopping.
- **Keep:** the gold crest emblem logo.

## Evidence on Hand

- Working end-to-end flows: catalog, cart, Stripe and ABA PayWay checkout, orders and admin.
- Demo accounts (admin and customer) are documented in `README.md`.
- An About page tells the solo-developer story (`frontend/src/pages/AboutPage.tsx`).
- **None of the following exist, so none may be fabricated:** real customers, testimonials, reviews, sales or traffic figures, press, partner logos, warranties or delivery-time guarantees. Product imagery is stock or seeded.

## Product Principles

1. **Credible before impressive.** Correct money, stock and order behavior, and honest copy, matter more than visual effects. One dead link or wrong total undoes the showcase.
2. **Local by default.** Design for Khmer readers on phones paying with KHQR, then extend to English and cards. Never the other way round.
3. **Never fake it.** No invented proof, policies or numbers. Leave an undecided fact out, or label it clearly as a demo.
4. **Every path ends somewhere.** Each link, error and empty state leads to a real next step.
5. **Operator-configurable.** Branding and homepage content come from admin settings, so layouts must hold up for any content the admin enters.

## Accessibility & Inclusion

- Khmer script needs real support everywhere: correct fonts, line height that leaves room for stacked vowel and subscript marks, and no truncation that breaks clusters. Any layout must be checked in both languages.
- Mobile-first touch targets and flows, including the hand-off to and back from the ABA app.
- Respect reduced-motion preferences and keyboard and screen-reader access. Aim for WCAG 2.2 AA.
