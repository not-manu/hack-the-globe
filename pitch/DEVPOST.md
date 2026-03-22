# ScrapYard — Devpost Submission

## Inspiration

Ontario needs 1.5 million new homes by 2031, but construction and demolition waste makes up 25–30% of everything going into Ontario landfills — over 2 million tonnes a year. Durable materials like stone, brick, concrete, and steel get dumped because there's no efficient way to resell them. Contractors pay $120–170/tonne in tipping fees while builders down the road pay full retail for the exact same products. We built ScrapYard to close that gap.

## What does our solution do?

ScrapYard is a construction surplus marketplace where contractors list leftover materials and buyers purchase them at 30–60% below retail. Every transaction auto-calculates carbon savings and generates compliance-ready reports.

**Core user flows:**

1. **Scan to Sell** — Contractor photographs surplus materials. Our AI vision model identifies each item, estimates condition, suggests a price, and calculates CO2 savings. The system auto-matches detected materials against open buyer pools and creates listings in one tap.

2. **Request Pools** — Buyers describe what they need in natural language (e.g. "I need about 50 red bricks for a garden wall"). An AI model parses this into a structured request with category, quantity, unit, budget, and urgency. The request becomes a live pool that multiple sellers can contribute to, tracked by a fulfillment progress bar.

3. **Carbon Impact Dashboard** — Every transaction logs CO2 avoided (kg equivalent). Users see aggregate stats, category breakdowns, and monthly trends via interactive charts.

4. **Waitlist System** — Materials with no matching pool enter a waitlist. When a new request pool opens in that category, the seller gets notified. This bridges the supply-demand timing gap.

## How we built it

### Architecture

```
Next.js 16 (Pages Router) + React 19
        │
        ├── /api/scan          →  Gemini 3.1 Flash Lite (vision)
        ├── /api/parse-request  →  Gemini 3.1 Flash Lite (text)
        │
        └── Convex (real-time serverless backend)
              ├── 5 tables: listings, requests, contributions, waitlist, messages
              ├── 23 backend functions (queries + mutations)
              └── File storage (multi-image uploads)
```

### Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| UI | Shadcn (Radix), Lucide icons, Recharts, React Leaflet |
| Backend | Convex (real-time DB, mutations, queries, file storage) |
| AI | Google Gemini 3.1 Flash Lite via OpenRouter + Vercel AI SDK |
| Validation | Zod 4 structured output for AI responses |

### AI Pipeline — Material Detection (`/api/scan`)

- Input: base64-encoded photo from device camera or gallery
- Model: `google/gemini-3.1-flash-lite` via OpenRouter
- Structured output via Zod schema — the model returns a typed array of detected items
- Per item: material name, category (9 types), condition (4 grades), confidence %, suggested price, description, carbon saved (kg CO2e)
- Multi-material detection: a single photo of a job site returns all identifiable items
- Output feeds directly into listing creation and pool matching

### AI Pipeline — Request Parsing (`/api/parse-request`)

- Input: free-form text from a chat-style interface
- Same model, text-only mode
- Structured output: title, category, quantity, unit, budget range, urgency level, confirmation reply
- Parsed request becomes a pool in the `requests` table with `fulfilledQuantity` tracking

### Real-time Backend (Convex)

- **Listings**: full CRUD + search index on title with category filter. Auto-generates `originalPrice` (1.6x listed price for discount display), random lat/lng offset within Toronto for map pins.
- **Request Pools**: status state machine (`open` → `fulfilled` → `closed`). Contributions mutation validates available quantity and auto-transitions status when `fulfilledQuantity >= quantity`.
- **Contributions**: linked to requests by ID. Supports image proof via Convex storage. Quantity validation prevents over-fulfillment.
- **Waitlist**: indexed by `(category, status)` for fast matching against new pools. Status: `waiting` → `matched` | `cancelled`.
- **Messages**: real-time chat per listing, ordered ascending. Convex subscriptions push new messages to all connected clients instantly.

### Map Integration

- React Leaflet with CartoDB light basemap tiles
- Listings plotted by lat/lng with category-based markers
- All positions offset from a Toronto center point (43.66°N, 79.39°W)

### Mobile-First UI

- 430px max-width container (native app feel)
- 5-tab bottom navigation: Home, Hold, +Request (center CTA), Impact, Profile
- Multi-image carousel on listing detail pages
- Fulfillment progress bars with color transitions (gray → green → emerald → gold)
- Skeleton loading states throughout

## Challenges we faced

- **Multi-material detection accuracy** — Getting the vision model to reliably identify multiple distinct materials in a single cluttered job-site photo required extensive prompt engineering. We used Zod structured output to enforce consistent response shapes and added confidence scores so low-confidence detections can be flagged.
- **Pool matching logic** — The contribution system needed to handle partial fulfillment, prevent over-contribution, and auto-close pools atomically. Convex's transactional mutations made this possible without race conditions.
- **Cold start problem** — A marketplace with no listings is useless. The request board / pool system lets buyers signal demand before supply exists, and the waitlist captures supply before demand arrives. Both sides have a reason to join from day one.

## Accomplishments / Learnings

- End-to-end AI pipeline from camera → structured data → database in a single user action
- Real-time pooling system where multiple sellers contribute to a single buyer request with live progress tracking
- Convex's reactive queries meant zero polling code — every list, counter, and progress bar updates automatically
- Zod structured output with the Vercel AI SDK gave us typed, validated AI responses without post-processing hacks

## What's next?

**Short-term (1–2 weeks):**
- Integrate EC3 (Environmental Product Declarations) API for real carbon calculations instead of AI estimates
- Add seller ratings and transaction history
- Payment processing via Stripe
- Push notifications for pool matches and waitlist alerts

**Long-term (scaling):**
- **Depot model**: when request board data shows concentrated demand in a neighbourhood, open a physical collection point — buy surplus from contractors, hold inventory, resell in flexible quantities
- Partner with Ontario contractor associations (OGCA, OHBA) for distribution
- Expand beyond GTA to Hamilton, Ottawa, and any city with active construction and waste diversion mandates
- Compliance reporting exports aligned with Toronto Chapter 844 (70% C&D diversion) and Ontario Reg 103/94
