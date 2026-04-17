# DESIGN SYSTEM DOCUMENT — Adventor-Inspired Travel Experience

## Reference Direction
Use the Adventor travel theme as visual inspiration only.
Translate the aesthetic into a modern Next.js product UI.
Do not recreate WordPress structure. Reinterpret the visual language.

## Brand Feel
- Premium adventure travel
- Warm, inspiring, trustworthy
- Large visual storytelling blocks
- Clean booking UX layered on top of editorial travel design

## Colour Tokens
- --color-primary: #E8642A
- --color-primary-dark: #C04E1A
- --color-secondary: #1A3C5E
- --color-accent: #F4C842
- --color-surface: #FFFFFF
- --color-surface-alt: #F8F5F1
- --color-dark: #0F1B2D
- --color-text: #1A1A2E
- --color-text-muted: #6B7280
- --color-success: #16A34A
- --color-danger: #DC2626
- --color-border: #E5E0D8

## Typography
- Heading: Playfair Display
- Body: Inter
- Mono: JetBrains Mono
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64

## Spacing
- Base unit: 4px
- Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96

## Component Standards
- Cards: rounded-2xl, medium shadow, generous spacing
- Buttons: primary solid orange, secondary navy outline, ghost transparent
- Touch targets: minimum 44x44px
- Ratings: gold stars + muted review count
- Price presentation: bold, high contrast, discount support
- Distance badge: outlined pill
- Open/closed state: green or red dot with text label
- Hero areas: large imagery with gradient overlays
- Skeleton loaders: same shape as final components

## Layout Standards
- Desktop max width: 1280px
- Desktop gutters: 24px
- Mobile gutters: 16px
- Grid: 12-column

## Key Screens
1. Home — hero, budget input, destination inspiration
2. Trip Planner — step flow from budget to itinerary
3. Transport Search — flight/train/bus results
4. Hotel Search — hotel listings with filters
5. Hotel Detail — gallery, pricing, nearby places tabs
6. Surprise Me — hidden deals and alerts
7. Checkout — booking review and payment
8. Profile — saved trips, bookings, traveller details

## SEO Design Rules
- Every public page must support strong H1 hierarchy
- Hotel pages must support structured data blocks
- Destination pages must support editorial content sections
- All SEO-critical content must render server-side
