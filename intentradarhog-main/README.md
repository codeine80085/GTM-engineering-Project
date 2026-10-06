# Intent Radar

Intent Radar is a GTM engineering prototype for finding high-intent leads, filtering noise before spending enrichment credits, generating signal-specific outreach copy, and simulating reply-driven copy improvement.

The project is built around one core belief:

```text
Signal first -> ICP gate -> enrich only when worth it -> AI copy -> channel routing -> reply learning loop
```

Instead of buying a broad lead list and enriching everything, Intent Radar starts with intent. It uses The Hog for discovery, research, enrichment, and signal collection, then uses NVIDIA LLM calls to create outreach copy and simulate reply feedback.

## What It Solves

Most outbound systems waste time and credits because they:

- Start from generic lists.
- Enrich too many low-fit leads.
- Send copy that is not tied to real buyer intent.
- Treat every lead like it belongs in the same channel.
- Do not learn from replies.

Intent Radar fixes that by:

- Searching for companies and people inside a specific ICP.
- Checking pain, stack, hiring, social, and research signals.
- Rejecting stale or low-quality signals before enrichment.
- Running expensive research only on the best leads.
- Generating copy from the strongest signal.
- Routing each lead to the best outreach motion.
- Simulating replies and mutating copy based on reply type.

## Why This Is Better GTM Engineering

### 1. Lower CAC Through Intent-First Prospecting

Traditional outbound burns money because teams enrich massive databases before proving intent.

Apollo-heavy workflows usually look like this:

```text
Pull 5,000 leads
  -> enrich all of them
  -> email everyone
  -> discover only a small percentage were relevant
```

Intent Radar flips that motion:

```text
Find signals
  -> run cheap gates
  -> validate ICP
  -> research only qualified accounts
  -> enrich only when there is a real reason
```

Instead of moving from `5,000 enrichments -> 50 interested buyers`, the system is designed to move closer to `200 researched signals -> 40 highly qualified buyers`.

That means:

- Fewer enrichment credits
- Fewer wasted API calls
- Fewer inboxes needed
- Fewer SDR hours wasted
- Lower infrastructure cost per opportunity

This is CAC compression through systems design.

### 2. Better Conversion Because Outreach Starts From Pain

Most outbound copy is identity-based:

```text
Saw you're Head of Growth...
```

Intent Radar is signal-based:

```text
Noticed your team is hiring RevOps while also discussing enrichment accuracy issues...
```

That difference matters. Buyers respond to pain recognition, not personalization tokens.

Intent Radar uses:

- Hiring signals
- Tooling signals
- Scraping signals
- Social intent
- Workflow pain indicators
- GTM stack detection
- Public conversations

This creates micro-contextual outbound: pain-first hooks, dynamic copy mutation, and channel-aware messaging.

### 3. Lower Spam Risk and Better Domain Health

Most outbound systems damage domains because they:

- Blast too many cold leads
- Send weak-fit messaging
- Ignore buying intent
- Overuse email

Intent Radar reduces that risk because:

- Low-fit leads never get enriched.
- Weak signals are filtered early.
- LinkedIn and partner routes are used when email is weak.
- Only high-confidence leads enter Smartlead-style sequences.

The expected result is:

- Higher open rates
- Higher positive replies
- Lower complaint rates
- Fewer unsubscribes
- Healthier sending domains
- Less inbox rotation pressure

This is routing intelligence, intent scoring, and channel arbitration working together to protect deliverability.

### 4. Better Prioritization Creates Higher Revenue Density

Most CRMs are list storage systems. Intent Radar behaves more like a real-time opportunity ranking engine.

It prioritizes:

- Active pain
- Active hiring
- Active stack signals
- Active workflow discussion
- Current operational friction

That means sales effort goes toward companies already feeling the problem, not companies that merely fit a static persona.

This improves:

- Revenue per lead touched
- Sales efficiency
- Pipeline quality
- SDR productivity

### 5. The Hog API Is Used as an Intelligence Layer

Most teams would use The Hog like a normal enrichment API. Intent Radar uses it as an async intelligence orchestration layer.

The system combines:

- Company search
- People search
- Deep research
- Enrichment
- Scraping
- Signal extraction
- Async operation polling

That creates adaptive prospecting, dynamic enrichment, signal-aware routing, and research-informed outreach.

This is closer to a GTM operating system than a lead tool.

### 6. Multi-Channel Intelligence Instead of Email Everything

Most outbound tools assume email is always the answer. Intent Radar chooses the channel based on context.

Examples:

- GTM agency founder posting workflows on LinkedIn -> HeyReach-style relationship outreach
- Operator with verified email and clear buying signal -> Smartlead sequence
- Respected Clay consultant -> partner/manual DM motion

Channel-context fit affects conversion. This is outbound orchestration, not just outbound automation.

### 7. Reply Learning Loop as Primitive Autonomous GTM

Most systems stop at sending messages.

Intent Radar:

- Simulates replies
- Classifies objections
- Mutates copy
- Adapts future messaging

Over time, this creates a feedback loop:

```text
Signal -> response -> optimization -> stronger signal weighting
```

That is the foundation for autonomous GTM infrastructure.

### 8. Why This Can Increase MRR

Higher MRR comes from better lead quality, better conversion, healthier outbound performance, and less deliverability decay.

Intent Radar improves pipeline generation per dollar spent by improving:

- Precision
- Routing
- Timing
- Relevance
- Signal quality

Instead of needing more SDRs, inboxes, enrichment, and lead volume, the system compounds outbound efficiency.

### The Real Differentiator

Most GTM tools optimize sending. Intent Radar optimizes qualification before sending.

That is the correct layer to optimize because the biggest outbound problem is not volume. It is irrelevance.

Intent Radar attacks irrelevance at the architecture level.

## Current ICPs

### 1. Clay / Apollo / GTM Agencies

Targets:

- GTM engineering agencies
- Clay implementation partners
- Apollo-heavy outbound operators
- RevOps implementation shops
- Outbound agencies

Strong signals:

- Uses Clay, Apollo, Smartlead, HeyReach, n8n, or similar tools
- Talks about client outbound systems
- Mentions enrichment, deliverability, scraping, or contact accuracy
- Hiring for SDR, RevOps, GTM engineer, or outbound roles

Primary route:

- HeyReach-style LinkedIn outreach when LinkedIn/social context is strongest
- Smartlead-style cold email when a verified email exists

### 2. Individual GTM Experts

Targets:

- Individual Clay experts
- Apollo experts
- RevOps builders
- GTM consultants
- Outbound automation operators

Strong signals:

- Public Clay/Apollo workflow posts
- Enrichment or prospecting pain
- Reddit, LinkedIn, X, or Instagram comment intent
- Bio/content mentions GTM engineering, RevOps, Clay, Apollo, scraping, or automation

Primary route:

- Partner/manual DM workflow
- Smartlead only when there is a verified email and clear direct-buyer intent

## Architecture

Intent Radar is a browser-based GTM intelligence loop. It has four major layers:

1. Frontend radar UI
2. The Hog intelligence layer
3. Scoring, gating, and routing engine
4. NVIDIA copy and reply-learning loop

At a high level, the app works like this:

```text
User starts engine or selects a lead
  -> Intent Radar loads seeded or Hog-discovered accounts
  -> The Hog finds companies, people, signals, or research context
  -> cheap gates reject weak signals before spend
  -> qualified leads get scored and ranked
  -> the best lead signal is sent into NVIDIA copy generation
  -> the lead is routed to Smartlead, HeyReach, or partner/manual DM
  -> sandbox reply webhook fires
  -> NVIDIA simulates/classifies the reply
  -> reply treatment mutates the next copy version
```

The goal is not just to find leads. The goal is to decide which leads deserve spend, which channel they belong in, and what exact pain should drive the message.

### System Map

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Intent Radar UI                         │
│  Dashboard | Lead Cards | Signal Feed | Copy Panel | Reply Loop │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Engine Orchestrator                      │
│  lead limit | live/paused mode | selected lead preview | logs    │
└───────────────┬───────────────────────┬─────────────────────────┘
                │                       │
                ▼                       ▼
┌─────────────────────────────┐   ┌───────────────────────────────┐
│       The Hog API Layer      │   │        NVIDIA LLM Layer        │
│ company search               │   │ signal-specific copy           │
│ people search                │   │ simulated replies              │
│ deep research                │   │ objection classification        │
│ enrichment                   │   │ copy mutation                   │
│ web/social scrape            │   └───────────────────────────────┘
│ async operation polling      │
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Qualification + Scoring Engine                │
│ pre-filter | ICP gate | deal-size estimate | confidence band     │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Channel Router                           │
│ Smartlead sandbox | HeyReach sandbox | Partner/manual DM sandbox │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend Layer

The UI is the operating surface for the GTM loop.

Main views:

- Dashboard: shows the demo timeline, stage progress, and high-level counts.
- Lead cards: show account score, ICP, confidence band, route, and current status.
- Signal feed: shows passed and rejected signals, including grey rejected noise.
- Detail panel: shows brief, contacts, outreach, confidence, copy, and reply state.
- Copy evolution: shows how copy changes after simulated replies.
- API log: shows real Hog/NVIDIA calls and sandbox automation events.

The UI is intentionally not just a CRM table. It is built to show the decision process: why a lead passed, what endpoint produced the data, what signal drove the copy, and which channel the system chose.

### Intelligence Layer: The Hog

The Hog is used as the live data and research system.

The app uses it for:

- Company discovery
- Decision-maker discovery
- Deep research across public web context
- Contact enrichment
- Web and social scraping
- Async operation polling

The most important architecture decision is that The Hog is not treated like a simple enrichment database. It is treated as the intelligence layer that can discover, validate, and research leads before the outreach system spends effort on them.

Async behavior matters:

```text
POST company/people/deep-research request
  -> receive 202 and operationId
  -> poll GET /api/operations/:id
  -> wait for succeeded / failed / partial_success / cancelled
  -> extract result
  -> update lead state and UI
```

This lets long-running discovery and research jobs happen without freezing the UI.

### Qualification Layer

The qualification engine protects credits and inbox reputation.

It has two stages:

```text
Stage 1: cheap signal gate
  -> role check
  -> pain keyword check
  -> recency check
  -> reject weak signals before enrichment

Stage 2: ICP and deal-size validation
  -> agency or expert fit
  -> tech stack / topic checks
  -> estimated deal size
  -> confidence band
```

This is the core GTM engineering move. The system does not enrich every lead. It asks, "Is this worth learning more about?" before it spends credits.

### Scoring Model

Signals are scored by strength and freshness.

Examples:

- Expressed pain: high-value signal
- Hiring: strong operational timing signal
- Tech stack: fit signal
- Deep research: strong context signal
- Instagram/comment intent: early social intent signal
- Stale signal: rejected or heavily discounted

The engine also groups independent signals so one repeated event does not fake high confidence.

Confidence bands:

- A: high confidence, ready for immediate route
- B: good signal, may need review or more context
- C: watchlist
- D: rejected or low priority

### Copy Layer: NVIDIA LLM

NVIDIA handles the adaptive copy loop.

The copy engine receives:

- Lead ICP
- Account name
- Strongest signal
- Signal source
- Tech stack or pain context
- Route/channel
- Existing copy version

It returns:

- First-touch email or DM copy
- A hook based on the real signal
- Metadata showing whether copy came from NVIDIA, saved snapshot, or fallback template

The rule is simple: no real signal, no generic copy. If the lead does not have a meaningful hook, it should stay in watch mode.

### Routing Layer

The routing engine decides where the lead should go.

```text
Agency + LinkedIn/social context
  -> HeyReach-style LinkedIn route

Verified email + clear buying signal
  -> Smartlead-style cold email route

Individual expert / channel value
  -> partner/manual DM route
```

This avoids treating every lead as an email target. Channel fit is part of the qualification system.

### Reply Learning Layer

Replies are simulated through the sandbox webhook so the demo can show the full learning loop without sending real outreach.

Reply flow:

```text
Sandbox enrollment
  -> simulated reply webhook
  -> NVIDIA reply generation
  -> reply classification
  -> treatment selection
  -> copy mutation
  -> updated next action
```

Reply treatments:

- `interested`: keep the copy as the winning variant.
- `not_now`: soften CTA and add timing-based follow-up.
- `wrong_person`: retarget the role or ask for a referral.
- `objection`: add proof, risk reversal, or integration detail.
- `no_reply`: wait for a new signal before mutating.

This turns outbound from a static sequence into a feedback loop.

### Data Flow Example

Example: Clay/Apollo agency lead

```text
1. Hog company search finds a GTM agency.
2. Signal gate detects Clay/Apollo/outbound workflow relevance.
3. Lead passes agency ICP gate.
4. Hog deep research looks for public pain, stack, or decision-maker context.
5. Hog people search attempts to find founder / CEO / RevOps contact.
6. Hog enrichment runs only if LinkedIn URL or email exists.
7. NVIDIA writes copy around the strongest signal.
8. Route chooses HeyReach if LinkedIn context is strongest.
9. Sandbox reply webhook simulates response.
10. Reply loop mutates copy based on interest, objection, timing, or wrong-person result.
```

Example: individual GTM expert

```text
1. Signal appears from public content, comment intent, or expert profile.
2. Cheap gate checks role, topic, pain keyword, and recency.
3. Expert ICP gate checks Clay/Apollo/GTM topic fit.
4. Deal value is treated as direct subscription or channel value.
5. NVIDIA writes a more personal partner-style note.
6. Route chooses partner/manual DM unless verified email and direct buying intent exist.
7. Reply loop decides whether to keep, soften, retarget, or add proof.
```

### Failure and Fallback Behavior

The architecture is designed to keep moving even when an endpoint returns no data.

Examples:

- If people search returns `empty_clean`, the lead does not get fake contacts.
- If no LinkedIn URL or email exists, enrichment is skipped.
- If NVIDIA is unavailable, the app falls back to local copy templates.
- If deep research is still processing, the UI keeps the lead in research/pending state.
- If a signal fails the gate, it appears as rejected noise instead of entering outreach.

This matters because the demo should be honest. No placeholder contacts, no fake enrichment, no fake sending.

### Production Architecture Direction

The current prototype calls APIs from the browser for speed of demo development. A production version should move API calls server-side.

Production shape:

```text
React UI
  -> backend API
  -> job queue for Hog async work
  -> database for leads/signals/replies/copy versions
  -> secure Hog/NVIDIA API clients
  -> real Smartlead/HeyReach integrations
  -> webhook receiver for replies
  -> analytics and credit ledger
```

Production upgrades needed:

- Server-side API keys
- Auth
- Database persistence
- Credit ledger per operation
- Background job queue
- Real webhook receiver
- Real Smartlead and HeyReach integrations
- Human approval before live sending

## Engine Modes

Intent Radar has two engine modes.

### Engine A: ICP -> Lead -> Signal -> Enrichment

Use this when the ICP is known first.

```text
ICP search
  -> company/person discovery
  -> signal check
  -> decision-maker search
  -> enrichment
  -> NVIDIA copy
  -> channel route
  -> reply simulation
  -> copy mutation
```

Best for:

- Finding GTM agencies
- Finding Clay/Apollo experts
- Building a controlled prospect list

### Engine B: Signal -> ICP -> Deal Size

Use this when the signal appears before the lead.

```text
Raw signal
  -> cheap pre-filter
  -> ICP validation
  -> deal-size check
  -> enrichment only if qualified
  -> outreach copy
```

Best for:

- Protecting credits
- Avoiding noisy leads
- Catching intent from Reddit, LinkedIn, X, Instagram comments, hiring pages, and web research

## API Integrations

### The Hog

The Hog is the intelligence layer.

Used endpoints:

- `POST /api/v1/companies/search`
- `POST /api/v1/people/search`
- `POST /api/deep-research`
- `POST /api/enrichments`
- `GET /api/operations/:id`
- `POST /api/v1/platform/scrapers/web/scrape`
- Instagram scraper endpoints where relevant

Important behavior:

- Company search, people search, and deep research are async.
- Async jobs return `202` with an `operationId`.
- Poll `GET /api/operations/:id` until status is `succeeded`, `failed`, `partial_success`, or `cancelled`.
- Enrichment must use `identifiers: [...]`, not a single `identifier`.

Correct enrichment shape:

```json
{
  "identifiers": [
    { "linkedin_url": "https://www.linkedin.com/in/example" }
  ],
  "fields": ["contact.email", "contact.phone", "name", "title", "company", "signals"]
}
```

### NVIDIA LLM

NVIDIA is the AI copy and learning layer.

Used for:

- First-touch copy generation
- Signal-specific hooks
- Simulated replies
- Reply classification
- Copy mutation after reply treatment

The app falls back to local templates if the LLM call is unavailable.

### Smartlead

Smartlead is represented as a sandboxed cold email route.

Use when:

- A verified email exists.
- The lead passed ICP and signal gates.
- The copy is grounded in a real signal.

Why:

- Smartlead is the right motion for structured cold email sequences, sending schedules, inbox management, unsubscribe handling, and reply tracking.

Current state:

- Sandboxed only. No real emails are sent.

### HeyReach

HeyReach is represented as a sandboxed LinkedIn outreach route.

Use when:

- The lead is an agency, operator, or expert with strong LinkedIn context.
- The strongest hook comes from public profile/content/workflow signals.
- Email is missing or weaker than LinkedIn context.

Why:

- Agencies and individual GTM builders often respond better to relationship-led LinkedIn outreach than generic cold email.

Current state:

- Sandboxed only. No real LinkedIn messages are sent.

### Partner / Manual DM

The partner/manual DM route is for individual experts.

Use when:

- The lead may be more valuable as a partner, affiliate, channel, or implementation expert than as a direct subscription buyer.
- The message should be highly specific and human-reviewed.

Why:

- A one-person expert should not always be treated like a cold email prospect. The value may come from distribution or implementation leverage.

Current state:

- Sandboxed/manual queue only.

## Credit Guardrails

This project is designed to protect API credits.

Current guardrails:

- Live engine processes only the first 5 leads.
- Hog client has a hard API call cap.
- Paused mode can generate NVIDIA copy/reply previews for the selected account.
- Expensive Hog steps should run only after cheap gates pass.

Recommended flow for a 500-credit account:

1. Run company search.
2. Show up to 5 leads.
3. Run cheap ICP/signal checks.
4. Pick the top 1-2 leads.
5. Run deep research only on those.
6. Use deep research to improve the people-search query.
7. Enrich only when a LinkedIn URL or email exists.
8. Generate copy.
9. Route to the correct sandbox automation.

## Real vs Sandboxed

Real:

- The Hog company search
- The Hog async operation polling
- The Hog people search
- The Hog deep research
- The Hog enrichment payload shape
- NVIDIA copy/reply/mutation calls

Sandboxed:

- Smartlead enrollment
- HeyReach enrollment
- Partner/manual DM queue
- Reply webhook timing

## Tech Stack

- React 19
- Vite
- Plain CSS
- The Hog API
- NVIDIA LLM API

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```bash
cp .env.example .env
```

Fill in:

```env
VITE_HOG_ACCESS_KEY=your_hog_access_key
VITE_HOG_SECRET_KEY=your_hog_secret_key
VITE_HOG_BASE_URL=https://developer.thehog.ai
VITE_NVIDIA_API_KEY=your_nvidia_api_key
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Security Note

This is currently a browser-based prototype, so `VITE_` environment variables are exposed to the client bundle.

For a real production deployment:

- Move The Hog and NVIDIA calls behind a backend.
- Keep API keys server-side only.
- Add per-user auth.
- Add credit accounting and rate limits.
- Never commit `.env`.

## Important Files

- `src/App.jsx` - main app orchestration and live engine flow
- `src/api/hogClient.js` - The Hog API client and polling
- `src/api/sandboxClient.js` - sandboxed Smartlead, HeyReach, partner DM, and reply simulation
- `src/engine/scoring.js` - signal pre-filter and ICP gates
- `src/engine/copyEngine.js` - NVIDIA copy generation and mutation
- `src/engine/replyLoop.js` - reply classification and treatment logic
- `src/data/copyTemplates.js` - fallback copy templates
- `intent_radar_execution_notes.md` - current architecture notes
- `intent_radar_prototype_architecture.md` - larger prototype thesis and original design

## Upload Checklist

Before uploading:

- Confirm `.env` is not committed.
- Use `.env.example` for placeholder config.
- Run `npm run build`.
- Keep sandbox labels clear so nobody thinks real cold emails are being sent.
- Keep the 5-lead guardrail unless credit limits are raised.

## Roadmap

Next improvements:

- Add a cheap/expensive mode toggle.
- Add visible credit estimate per stage.
- Use deep research as fallback when people search returns empty.
- Retry people search with decision-maker names discovered by deep research.
- Only enable Smartlead route when a verified email exists.
- Show endpoint provenance on every lead card.
- Make Instagram/comment intent its own first-class section.
- Add production backend for safe key handling.
