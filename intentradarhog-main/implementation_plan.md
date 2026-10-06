# Intent Radar — Full Rebuild with 100 Leads, Reply Loop & Real Hog API

Build a production-ready React (Vite) application from the existing `intent-radar.jsx` + architecture docs. The app connects to the real Hog API for enrichment/signals while sandboxing Smartlead, HeyReach, and reply classification. 100 leads, copy mutation engine, reply simulation, and signal-to-copy linkage.

## User Review Required

> [!IMPORTANT]
> **Hog API Base URL** — The `.env` file will have a placeholder `VITE_HOG_API_BASE_URL`. What is the correct base URL? (e.g. `https://api.thehog.io`, `https://app.thehog.io/api`, etc.)

> [!IMPORTANT]  
> **Auth header format** — Does The Hog use `Authorization: Bearer <key>` or `x-api-key: <key>`? The code will default to `Authorization: Bearer` but can be changed.

## Proposed Changes

### Project Scaffolding

#### [NEW] Vite + React project
Initialize with `npx create-vite` in the existing `the hog` directory. Preserves the existing `.md` files.

#### [NEW] `.env`
```
VITE_HOG_API_KEY=your_hog_api_key_here
VITE_HOG_API_BASE_URL=https://api.thehog.io
VITE_HOG_AUTH_HEADER=Authorization
```

---

### Core Data Layer

#### [NEW] `src/data/leads.js`
100 sandboxed leads with realistic distribution:
- ~40 SaaS, ~35 Agency, ~25 Creator
- Each has: ICP type, tech stack, funding, employee count, 1-4 signals, score, band
- Pre-assigned reply types for enrolled leads (interested / not_now / wrong_person / objection / no_reply)
- Copy version tracking per lead

#### [NEW] `src/data/copyTemplates.js`
Email & LinkedIn copy templates per ICP + signal combination:
- Base templates for Agency / SaaS / Creator
- Signal-specific personalisation hooks (pain post → reference the quote, funding → reference the round, hiring → reference the JD)
- Copy mutation rules: which reply type triggers which copy change
- Version history structure so UI can show diffs

#### [NEW] `src/data/replySimulation.js`
Simulated reply content per reply type:
- `interested`: "This actually sounds useful, can you show me a workflow?"
- `not_now`: "Timing isn't right, maybe next quarter"
- `wrong_person`: "I'm not the right person, try reaching out to our VP Sales"
- `objection`: "We're locked into Apollo for 6 more months"
- Reply classification labels and routing rules

---

### Hog API Integration

#### [NEW] `src/api/hogClient.js`
Real API client wrapping the 14 endpoints:
- `companiesSearch(query, filters)` → `POST /api/v1/companies/search`
- `enrich(domain, include)` → `POST /api/enrichments`
- `getEnrichment(id)` → `GET /api/enrichments/:id`
- `pollOperation(operationId)` → `GET /api/operations/:id`
- `peopleSearch(company, domain, titles)` → `POST /api/v1/people/search`
- `deepResearch(payload)` → `POST /api/deep-research`
- `webScrape(url, extract)` → `POST /api/v1/platform/scrapers/web/scrape`
- Instagram endpoints: `profile`, `posts`, `postDetails`, `postComments`, `followers`, `following`
- All calls go through a wrapper with auth header, error handling, and API log emission

#### [NEW] `src/api/sandboxClient.js`
Sandbox wrappers for non-Hog tooling:
- `simulateSmartlead(lead, copy)` → returns fake enrollment confirmation
- `simulateHeyReach(lead, copy)` → returns fake LinkedIn sequence status
- `simulateReplyWebhook(lead)` → fires after delay, returns classified reply
- `simulateCopyMutation(currentCopy, replyType, signals)` → returns new copy version with diff

---

### Engine Layer

#### [NEW] `src/engine/scoring.js`
From the architecture doc — scoring engine with:
- `preFilterSignal(signal)` — Stage 1 quality gate
- `validateICP(enrichmentData, detectedICP)` — Stage 2 ICP gate
- `assignBand(score, signals)` — Confidence band with independence rule
- `calculateScore(signals)` — With recency decay multiplier

#### [NEW] `src/engine/copyEngine.js`
The self-improving copy loop:
- `generateCopy(lead, signals, template)` — produces personalised email/InMail from template + signal context
- `mutateCopy(currentCopy, replyClassification, signalContext)` — adjusts copy based on reply type:
  - `interested` → keep copy, mark as winning variant
  - `not_now` → soften CTA, add "when timing is better" hook
  - `wrong_person` → adjust title targeting, add referral ask
  - `objection` → add proof point, address specific objection
- `getCopyDiff(v1, v2)` → returns highlighted diff for UI display
- Tracks: which signals correlated with positive replies → feeds back into template selection

#### [NEW] `src/engine/replyLoop.js`
Reply classification + feedback loop:
- `classifyReply(replyText)` → buckets into interested/not_now/wrong_person/objection/referral
- `processReply(lead, reply)` → updates lead status, triggers copy mutation, logs outcome
- `runCalibration(leads)` → every N replies, recalculates which signal→copy combos produce best replies

---

### UI Components (React)

#### [MODIFY] `intent-radar.jsx` → split into proper React components

#### [NEW] `src/components/Dashboard.jsx`
Main layout — 3 columns:
1. Signal feed (left) — live signals + discards
2. Account pipeline (center) — Tier 1/2/monitoring with 100 leads, pagination/virtualization
3. Detail panel (right) — tabs: Brief | Signals | Confidence | Outreach | Copy | Replies

#### [NEW] `src/components/AccountCard.jsx`
Per-account card (from existing JSX) with additions:
- Reply status indicator (envelope icon with colour)
- Copy version badge ("v3")
- Mutation count

#### [NEW] `src/components/CopyPanel.jsx`
The copy tab in detail panel:
- Current copy version displayed
- Signal-to-copy mapping shown (which signals drove which lines)
- Copy diff view: red/green highlighting of what changed between versions
- Copy history timeline (v1 → v2 → v3 with mutation reason)

#### [NEW] `src/components/ReplyPanel.jsx`
The reply tab in detail panel:
- Simulated reply content displayed
- Reply classification badge
- What the copy engine changed in response
- Before/after copy comparison

#### [NEW] `src/components/CopyEvolution.jsx`
Global view (accessible from header):
- Table of all 100 leads with their current copy version
- Which reply type triggered each mutation
- Aggregated stats: "Pain signals → 3.2x more interested replies than funding signals"
- Signal-to-reply correlation heatmap

#### [NEW] `src/components/ApiLog.jsx`
API call log (existing, enhanced):
- Real Hog API calls shown with actual response times
- Sandboxed calls shown with "(sandbox)" tag
- Expandable to see request/response payloads

---

### Styling

#### [NEW] `src/index.css`
Design system with:
- Dark mode by default (premium GTM dashboard feel)
- CSS custom properties for all colours (mapping to the existing `COLORS` object but with actual values instead of CSS var references)
- Glassmorphism cards
- Smooth transitions and micro-animations
- Monospace font for API log
- Inter/Outfit from Google Fonts for UI text

---

### Project Structure
```
the hog/
├── .env                          ← API keys
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── api/
│   │   ├── hogClient.js
│   │   └── sandboxClient.js
│   ├── data/
│   │   ├── leads.js
│   │   ├── copyTemplates.js
│   │   └── replySimulation.js
│   ├── engine/
│   │   ├── scoring.js
│   │   ├── copyEngine.js
│   │   └── replyLoop.js
│   └── components/
│       ├── Dashboard.jsx
│       ├── AccountCard.jsx
│       ├── DetailPanel.jsx
│       ├── SignalFeed.jsx
│       ├── CopyPanel.jsx
│       ├── ReplyPanel.jsx
│       ├── CopyEvolution.jsx
│       ├── ApiLog.jsx
│       └── common/
│           ├── ScoreMeter.jsx
│           ├── BandBadge.jsx
│           ├── ICPBadge.jsx
│           └── StatusDot.jsx
├── intent-radar.jsx              ← original (preserved)
├── intent_radar_prototype_architecture.md
└── the_hog_gtm_thesis.md
```

## Verification Plan

### Automated Tests
- `npm run dev` — app starts without errors
- All 100 leads render in the pipeline view
- Clicking Start fires the simulation loop
- Reply simulation triggers copy mutations visible in the Copy tab
- API log shows real Hog calls (with key) and sandboxed calls
- Copy diff view highlights changes between versions

### Manual Verification
- Visual check: dark mode, glassmorphism, animations feel premium
- Click through 5-10 leads and verify: signals, copy, reply, copy mutation all display correctly
- Verify `.env` is loaded and Hog API calls fire with the correct auth header
