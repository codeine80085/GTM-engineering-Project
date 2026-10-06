# Founding GTM Engineer Assignment — The Hog
**Adrian | Day One GTM Thesis**

---

## Strategic Belief

Most GTM tools answer: *who should I contact?*

The better question is: *who is actively experiencing a problem right now?*

Apollo helps teams find people. Smartlead helps teams send messages. Clay helps teams orchestrate workflows. The Hog should become the platform that understands market intent in real time — the intelligence layer that powers signal-driven, AI-native outbound.

This isn't another enrichment provider story. This is a category creation story.

**The positioning: The Intelligence Layer for AI-Native Outbound.**

---

## Part 1 — ICP & Segmentation

### Why signal-based segmentation beats list-based segmentation

Traditional outbound starts with accounts. You build a list, enrich it, sequence it. The problem is that the list represents who *could* have a problem — not who *does* have one right now. By the time intent data shows up in Bombora, it's already a list. By the time a hiring signal hits Apollo, every competitor has seen it too.

Signal-based segmentation flips the model. Instead of asking who fits the profile, you ask who is expressing pain today. That's the structural advantage The Hog creates — and the ICP strategy below is built entirely around it.

---

### The Full Filtering & Routing Pipeline

```
Step 1 — DISCOVER
  The Hog Company Search + Social Intelligence
  → surface accounts matching broad ICP criteria
  → inputs: industry, size, tech stack keywords, hiring keywords, social signals

Step 2 — ENRICH
  The Hog Enrichment API + People Search
  → pull firmographic data, tech stack, hiring activity, founder LinkedIn
  → identify decision makers: Founder, VP Sales, Head of Revenue, RevOps, GTM Engineer

Step 3 — SCORE
  Intent scoring engine (built in Clay, fed by The Hog)
  → assign points per signal (see scoring tables below)
  → calculate total Intent Score per account

Step 4 — TIER
  Score 70+   → Tier 1 — enters active outbound immediately
  Score 40–69 → Tier 2 — enters monitoring queue, re-scored weekly
  Score <40   → Tier 3 — discarded or watched passively

Step 5 — CLASSIFY
  Is this an Agency?    → ICP 1 route
  Is this a Creator?    → ICP 2 route
  Is this Funded SaaS?  → ICP 3 route

Step 6 — ROUTE
  ICP 1 Agency  → LinkedIn sequence via HeyReach
  ICP 2 Creator → partnership outreach workflow (manual + personal)
  ICP 3 SaaS    → email sequence via Smartlead

Step 7 — PERSONALIZE
  The Hog Deep Research generates account brief per contact
  → personalization hook injected into sequence automatically
  → no generic templates — every message references a real signal
```

This pipeline runs continuously. Every new signal that fires re-scores accounts in Tier 2. An account sitting at 55 jumps to 85 the day they post a GTM Engineer JD — and automatically enters outbound without manual intervention.

---

### ICP 1 — Clay & GTM Engineering Agencies

**Why this ICP first:**

These agencies already run outbound professionally across multiple client accounts, build and publish Clay workflows publicly, and understand enrichment and intent signals deeply. One successful agency relationship generates case studies, referrals, workflow templates, and downstream client adoption. A single agency managing 30 clients is a distribution channel, not just a customer.

**Target agency types:** Clay agencies · GTM engineering agencies · Outbound-as-a-service agencies · RevOps consultancies · AI SDR agencies · Sales automation consultancies

**Step 1 — Discover**

```json
{
  "query": "Clay agencies using Smartlead and Apollo",
  "includeSignals": true,
  "filters": {
    "companyType": ["agency", "consultancy"],
    "techStack": ["Clay", "Smartlead", "Apollo", "HeyReach", "n8n"],
    "hiring": ["GTM Engineer", "SDR", "RevOps", "Outbound Specialist"],
    "founderActivity": true,
    "employeeCount": "1-50"
  }
}
```

**Step 3 — Score: ICP 1 signal weights**

| Signal | Points | Why |
|---|---|---|
| Hiring GTM Engineer | 30 | Direct signal they are scaling outbound infrastructure |
| Uses Clay | 20 | Already in the workflow automation mindset |
| Hiring SDR | 20 | Scaling outbound volume = need for better intelligence |
| Founder active on LinkedIn (GTM topics) | 15 | Faster to convert — aware of tooling landscape |
| Uses Smartlead | 15 | Proven they invest in outbound tooling |
| Uses Apollo | 10 | Likely experiencing data quality frustration |
| Recent funding | 25 | Budget to invest in new tooling |

**Threshold: 70+ = Tier 1**

```
Apex GTM Agency
  Hiring GTM Engineer   → +30
  Uses Clay             → +20
  Uses Smartlead        → +15
  Founder active        → +15
  Uses Apollo           → +10
  ─────────────────────
  Total: 90 → Tier 1 → LinkedIn via HeyReach
```

**People Search priority:** Founder/Co-Founder → Head of GTM → Senior GTM Engineer

---

### ICP 2 — GTM Creators & Workflow Builders

**Why this ICP second:**

This segment doesn't generate the most immediate revenue. It generates the most distribution. Clay YouTubers, LinkedIn GTM creators, n8n builders, and AI SDR creators collectively influence purchasing decisions for thousands of practitioners. A single tutorial featuring The Hog reaches more qualified prospects than a thousand cold emails.

The critical insight: **do not sell.** The play is to offer genuine value — free credits, beta access, co-building workflow templates — and let the creator decide if The Hog belongs in their content.

**Step 1 — Discover**

```json
{
  "query": "GTM creators publishing Clay or outbound automation content",
  "platform": ["LinkedIn", "YouTube", "X", "Instagram"],
  "filters": {
    "contentTopics": ["Clay", "GTM engineering", "outbound automation", "AI SDR", "n8n"],
    "publishedLast": "14 days",
    "minEngagement": 50,
    "audienceType": "GTM practitioners"
  }
}
```

**Instagram signal layer — why it matters:**

Instagram is underused in GTM outreach. The Hog's native endpoints surface GTM engineers and RevOps operators building audiences there, particularly short-form workflow demos in Reels format. The real intelligence isn't in the post — it's in the comments. When 40 people comment asking "does this work with Apollo?" or "what do you use for enrichment?", those commenters are expressing active buying intent in public.

```
Step 1 — Find the profile         POST /api/v1/platform/scrapers/instagram/profile
Step 2 — Pull recent posts         POST /api/v1/platform/scrapers/instagram/posts
Step 3 — Check post engagement     POST /api/v1/platform/scrapers/instagram/post-details
Step 4 — Read the comments         POST /api/v1/platform/scrapers/instagram/post-comments
Step 5 — Check audience quality    POST /api/v1/platform/scrapers/instagram/followers
```

> ⚠️ **Architecture note:** Comment intent ≠ purchase intent. Many commenters are learners, not buyers. This layer needs a qualification filter before entering the scoring pipeline: role match (founder, VP, RevOps, GTM Engineer), company-level enrichment, and behaviour history (did they comment on multiple tool-related posts?). Without this filter, the Instagram layer amplifies signal noise rather than surfacing real buyers. See critical flags below.

**Creator Priority Score**

| Signal | Points |
|---|---|
| Content published in last 14 days | +30 |
| Audience engagement rate | +25 |
| Topic relevance (Clay / GTM / enrichment) | +25 |
| Community presence | +15 |
| Openness to tool comparisons | +15 |

**Threshold: 70+ = personal outreach**

**Outreach approach:** Contact creator directly · Offer free credits + beta access · Goal is co-built workflow or tutorial · No pitch, no demo push, no follow-up sequence.

---

### ICP 3 — Recently Funded B2B SaaS (Series A)

**Why this ICP third:**

Series A companies are in a specific, time-limited window. They've proven the product works. Now they need to scale revenue — which means hiring SDRs, building outbound infrastructure, and evaluating the GTM stack for the first time at real scale. The window is 60–90 days post-funding before the stack gets locked in.

**Step 3 — Score: ICP 3 signal weights**

| Signal | Points | Why |
|---|---|---|
| Expressed pain signal (public post/comment) | 30 | They told the internet they have the problem |
| Recent funding (Series A+, within 90 days) | 25 | Budget is live, urgency is real |
| Hiring GTM Engineer | 25 | Building infrastructure from scratch |
| Hiring SDR | 20 | Outbound volume is about to increase |
| Uses Apollo | 10 | Likely experiencing data frustration at scale |
| Uses Clay | 15 | Will understand The Hog immediately |
| Founder active on LinkedIn (GTM topics) | 10 | Accessible, engaged, market-aware |

**Threshold: 70+ = Tier 1 → Smartlead email sequence**

```
Rivelo AI
  Pain signal detected   → +30
  Series A (6 weeks ago) → +25
  Hiring GTM Engineer    → +25
  Hiring SDR x2          → +20
  Uses Apollo            → +10
  ─────────────────────
  Total: 110 → Tier 1 → Smartlead email sequence
```

**People Search priority:** Founder/CEO (if <50 employees) → VP Sales/Head of Revenue → RevOps Manager → GTM Engineer

---

### Segmentation Decision Tree

```
ACCOUNT ENTERS THE HOG PIPELINE
          │
          ▼
    Run Company Search + Social Intelligence
          │
          ▼
    Enrich via The Hog API
          │
          ▼
    Calculate Intent Score
          │
     ┌────┴────┐
    <40      40-69     70+
     │         │        │
  Discard   Monitor   ACTIVE OUTBOUND
            weekly        │
               ┌──────────┼──────────┐
            Agency     Creator     SaaS
               │           │          │
           HeyReach    Manual     Smartlead
           LinkedIn    Partner    Email Seq
           Sequence    Outreach
```

**The one principle the entire logic is built around:** expressed pain beats inferred fit. A company that publicly complained about Apollo data quality yesterday is more qualified than a funded company with a perfect tech stack that has never said a word about outbound problems.

---

## ⚠️ Critical Flags — Where the Thinking Is Still Early

*These are structural issues, not edge cases. Addressing them is what separates a demo-ready system from a production-grade one.*

---

### 1. The scoring model is deterministic — it needs a calibration loop

The current model assumes: **signal weights → accurate intent.**

In reality, signals are noisy and context changes meaning. "Hiring GTM Engineer" might signal urgency — or it might signal someone experimenting with a new function for the first time. Funding doesn't equal buying readiness. A pain post written 8 months ago is not the same as one written yesterday.

Fixed weights feel precise but drift wrong over time. The model needs:

- **Feedback-adjusted weights** — closed deals and positive replies should increase the weight of signals that correlated with conversion. Churned or non-responsive accounts should decrease them.
- **A calibration loop** — weekly or monthly review of which signals actually predicted meetings and activations, not just which ones looked good at the time of scoring.
- **Signal recency decay** — a pain post from last week should score higher than one from three months ago. Right now the model doesn't distinguish.

Without this, the system will report 90-point accounts that never convert and 55-point accounts that close fast — and you won't know why.

---

### 2. The false precision risk is real

The system looks extremely precise: 90 score, 70 threshold, exact routing. This is powerful for demos. In practice, GTM systems break when they project more certainty than the underlying data supports.

A 90 vs an 85 does not meaningfully represent a difference in purchase intent. The number creates false confidence that can cause the team to deprioritize accounts that don't fit the score — but actually have higher conversion probability based on context the system can't capture.

The upgrade is:

- **Confidence bands instead of hard scores** — "high likelihood" / "moderate likelihood" / "watch" is more honest than a number that implies precision you don't have.
- **Qualitative flags alongside scores** — surface the specific signals that drove the number so a human can sanity-check whether the context actually supports the score.
- **Threshold treated as a starting hypothesis, not a law** — the 70-point cutoff should be tuned based on observed conversion rates per ICP, not fixed from day one.

---

### 3. Three different systems are fused into one narrative

The current architecture combines three distinct layers:

1. **Data infrastructure** — The Hog APIs (enrichment, scraping, deep research)
2. **Decision engine** — scoring model, tier logic, routing rules
3. **Distribution strategy** — email copy, creator partnerships, LinkedIn sequences

These are different levels of abstraction. Tight fusion is good for storytelling and good for a first demo. It becomes a problem when:

- A signal source changes (Instagram API rate limits, LinkedIn blocks scraping) and the entire pipeline breaks rather than just the data layer
- The routing logic needs updating but it's entangled with enrichment logic
- Debugging a failed outbound sequence requires untangling three systems at once

The practical fix isn't a rewrite — it's naming the boundaries clearly. Each layer should have defined inputs, outputs, and failure modes. The scoring engine should be able to accept signals from any data source, not just The Hog. The routing logic should be independent of how scores were generated.

---

### 4. The Instagram comment layer needs a qualification filter before it's usable

The core idea — mining GTM creator comment sections for in-market buyers — is genuinely strong. The logic gap is: **comment intent ≠ purchase intent.**

A typical comment section on a Clay or Apollo workflow post will contain:

- Learners asking how to replicate it (high volume, low buyer intent)
- Practitioners expressing frustration (moderate buyer signal)
- Actual buyers evaluating tools (low volume, high signal)
- Spam and bots

Routing all commenters into the scoring pipeline amplifies noise. The layer needs a qualification filter before any commenter enters the enrichment step:

- **Role filter** — founder, VP Sales, RevOps, GTM Engineer. Exclude students, job seekers, and agencies already using competing tools.
- **Company filter** — B2B company, 10–500 employees, showing growth signals. Exclude solopreneurs unless they're a creator target.
- **Behaviour history** — did this person comment on multiple tool-comparison posts? That's a stronger signal than a single comment.
- **Engagement quality over volume** — one comment asking "what enrichment tool do you use for contact accuracy?" is worth more than 10 comments saying "great video".

Without this filter, Play 1 (creator audience mining) generates a large list that looks qualified but converts poorly — which wastes sequences and burns deliverability.

---

## Part 2 — 30 / 60 / 90 Day Plan

### Philosophy

Build the infrastructure before you scale the volume. The biggest mistake in outbound is sending high volume before the signal layer is working. Days 1–30 are about getting the machine right. Days 31–60 are about scaling it. Days 61–90 are about owning the category.

### GTM Stack

| Layer | Tool | Why |
|---|---|---|
| Intelligence | The Hog | Signal detection, enrichment, deep research, social intelligence |
| Workflow orchestration | Clay | Connects The Hog enrichment to outbound sequences |
| CRM | HubSpot | System of record, attribution, pipeline tracking |
| Email execution | Smartlead | Multi-inbox sending, warmup, deliverability |
| LinkedIn execution | HeyReach | Agency and operator LinkedIn sequences |
| Automation / glue | n8n | Alert routing, HubSpot writes, Slack notifications |
| Alerts | Slack | Real-time signal notifications for high-intent accounts |

---

### Days 1–30 — Ship the Outbound Engine

**Goal:** Build signal-driven outbound infrastructure from scratch. Nothing manual. Everything automated from signal detection to sequence enrollment.

**Deliverables**

1. **Signal discovery workflow** *(5 days)* — Company Search → Enrichment API → Intent Score → HubSpot. Continuous, automated, zero manual list-pulling.
2. **Intent scoring engine** *(4 days)* — Weighted signal model: hiring + funding + stack + founder activity. Only accounts above 70 enter outbound.
3. **Smartlead + HeyReach integration** *(4 days)* — Auto-push qualified accounts into the right sequence. Email for SaaS. LinkedIn-first for agencies.
4. **Creator outreach program** *(5 days)* — Identify Clay, GTM, and n8n creators. Offer free credits and beta access. Goal: 3 advocates by end of month.
5. **GTM dashboard** *(3 days)* — Accounts sourced, signals detected, meetings booked, activation events. Single view for everything.

**Day 30 Metrics**

*Deliverability (the foundation)*

| Metric | Target |
|---|---|
| Inbox placement rate | 90%+ |
| Bounce rate | <3% |
| Domain health score | Green across all sending domains |
| Spam complaint rate | <0.1% |

*Engagement*

| Metric | Target |
|---|---|
| Open rate | 40%+ |
| Reply rate | 12%+ |
| Positive reply rate | 5%+ |
| Meetings booked | 8–12 |

*ICP alignment*

| Metric | Target |
|---|---|
| % of meetings from ICP 1 (agencies) | 50%+ |
| % of meetings from ICP 3 (funded SaaS) | 30%+ |
| Signals detected per week | 150+ |
| Accounts scoring 70+ per week | 20+ |

---

### Days 31–60 — Scale Intelligence & Personalization

**Goal:** Make the system smarter, not just bigger.

**Deliverables**

1. **Automated signal monitoring** *(7 days)* — Continuous monitoring of hiring changes, funding rounds, LinkedIn activity. Slack alerts for high-intent accounts.
2. **AI context generator** *(10 days)* — The Hog Deep Research powers per-account briefs. Every email goes out with real context, not mail merge tokens.
3. **Public workflow library** *(7 days)* — Clay workflows, n8n automations, Smartlead playbooks published and SEO'd. Distribution channel as much as content play.
4. **Creator partnership program** *(5 days)* — Target Clay YouTubers, GTM creators, automation influencers. Goal: 3 published tutorials by day 60.
5. **Scoring calibration v1** *(3 days)* — First pass at feedback-adjusted weights. Pull reply and meeting data from HubSpot. Identify which signals actually correlated with conversion in weeks 1–4. Adjust weights accordingly.

**Day 60 Metrics**

*ICP conversion comparison*

| ICP | Expected sales cycle | Conversion signal |
|---|---|---|
| ICP 1 — Agencies | 7–14 days | They get the product immediately |
| ICP 2 — Creators | Not a sales cycle — a relationship | First tutorial published = success |
| ICP 3 — Funded SaaS | 21–45 days | Longer — more stakeholders |

*Buzz signals*

| Metric | Target |
|---|---|
| Creator mentions of The Hog | 5+ |
| Workflow downloads from public library | 200+ |
| Inbound demo requests (not from outbound) | 3–5 |

---

### Days 61–90 — Own the Category

**Goal:** Position The Hog as the intelligence platform for signal-driven outbound. Not just a tool — a category.

**Deliverables**

1. **Public case studies** *(10 days)* — Real numbers. Real accounts. Real workflow screenshots. Answer one question: *what would this have looked like with a static list?*
2. **Community-led growth engine** *(10 days)* — Tutorials, templates, automation examples published consistently.
3. **Advanced account scoring v2** *(7 days)* — Combine funding, hiring, social engagement, technographics, and intent signals. Add confidence bands alongside raw scores. Add recency decay. The scoring engine becomes a product differentiator — and it reflects real conversion data, not assumed weights.

**Day 90 Metrics**

*Pipeline and revenue*

| Metric | Target |
|---|---|
| Pipeline generated | $200k+ |
| Opportunities created | 15+ |
| Closed revenue | $40–80k |
| Product activations | 50+ |

*ICP comparison — the verdict*

| | ICP 1 — Agencies | ICP 2 — Creators | ICP 3 — Funded SaaS |
|---|---|---|---|
| Sales cycle | 7–14 days | N/A | 21–45 days |
| CAC (estimated) | $200–500 | $50–100 in credits | $800–1,500 |
| ACV / MRR potential | Medium | Low direct / high indirect | High |
| Compounding value | High — downstream clients | Very high — one tutorial = thousands of impressions | Low — each deal standalone |
| Best for | Fast revenue + case studies | Distribution + brand | Long-term MRR + enterprise expansion |

**The verdict:** Agencies close fastest and cheapest — the right first motion. Funded SaaS has higher MRR potential but longer cycle — the right second motion once agency case studies provide proof. Creators don't generate direct revenue but de-risk the entire GTM by creating inbound demand that makes every other metric easier.

---

## Part 3 — Outbound Copy

### Email 1 — Clay Agency Founder
*Signal trigger: Clay + Smartlead usage detected, active hiring for SDR or GTM Engineer*

**Subject: noticed your Clay workflows**

Hey {{first_name}},

Saw your team is heavily invested in Clay and outbound automation.

One thing I've noticed is that most outbound systems still rely on static enrichment and stale intent signals — you're enriching data that was already outdated when the list was built.

We've been testing workflows using The Hog that continuously monitor hiring activity, funding events, GTM discussions, and engagement signals, then automatically generate account research and outbound context.

The result feels much closer to real-time GTM intelligence than traditional list building.

Would love to show you one workflow we've built for agencies managing multiple client accounts.

– Adrian

---

### Email 2 — Series A SaaS, VP Sales or Head of Revenue
*Signal trigger: funding announcement detected + SDR hiring signals active*

**Subject: noticed you're scaling outbound**

Hey {{first_name}},

Saw the funding announcement and noticed you're hiring SDRs.

That's usually the point where prospecting, enrichment, and outbound workflows start becoming significantly more complex — more reps, more volume, more variance in data quality.

I've been building workflows using The Hog that combine hiring signals, funding intelligence, LinkedIn activity, and technographic data to identify high-intent accounts and generate contextual outreach automatically.

No more static lists. No more enriching accounts that aren't actually in-market.

Happy to share a live workflow if useful.

– Adrian

---

### Email 3 — GTM Creator / Clay Builder
*Signal trigger: published workflow tutorial in last 7 days*

**Subject: loved the workflow you published**

Hey {{first_name}},

Your recent Clay workflow tutorial was genuinely one of the better ones I've seen — most people either go too basic or too deep into the weeds.

I'm building GTM infrastructure at The Hog, a platform that combines company search, people search, deep research, and social intelligence in a single API.

We've been thinking about what it would look like to give creators like you early access and work together on something — a workflow template, a co-built tutorial, whatever makes sense for your audience.

No pitch. Just want to see if there's something interesting here.

– Adrian

---

### LinkedIn InMail
*Trigger: GTM leader or founder evaluating a Founding GTM Engineer hire*

**Subject: how I'd build the first 90 days**

Hey {{first_name}},

Most GTM engineers start day one with the CRM. I'd start with the signal layer — because volume without intelligence just burns good domains.

Days 1–30: build the engine. Signal discovery workflow, intent scoring model (nothing enters outbound below 70), Smartlead + HeyReach routing automatically by ICP type. Target: 8–12 meetings, 150+ signals detected per week.

Days 31–60: scale the intelligence. Continuous signal monitoring, AI-generated account briefs via Deep Research, public workflow library live as a distribution channel.

Days 61–90: own the category. Real case studies with real pipeline numbers, scoring v2 adding expressed pain signals, community-led growth engine running consistently.

The stack: The Hog as the intelligence layer, Clay for orchestration, HubSpot as system of record, Smartlead + HeyReach for execution, n8n as the glue.

Happy to walk through any part of this.

— Adrian

---

## Part 4 — The Intent Radar (Creative Build)

### The core insight

> *"By the time intent data shows up in Bombora, it's already a list. We catch the conversation before it becomes a list."*

- Bombora seeing someone visit 3 competitor websites = inferred intent
- A founder posting "Apollo's data quality is killing our reply rates" on LinkedIn = expressed pain

The Intent Radar is built around expressed pain — not inferred intent. This is not a feature addition to The Hog. It is the GTM case study. Every meeting booked using this system is proof that signal-driven outbound works — and the story you tell every prospect is: *we used this to find you, and now you're here.*

### What the prototype does

A live interactive demo shows the Intent Radar running in real time. It pulls a continuous signal feed from LinkedIn, Reddit, X, and Instagram. Each signal fires against an account, adds weighted points to the intent score, and when the score crosses 70 the account is routed to the right sequence automatically — no human intervention. A personalised brief is generated per account showing exactly what Deep Research produces.

The three things to land in any live demo:

1. The expressed pain contrast — point at a Reddit signal ("Apollo data quality is killing our reply rates") and compare it to what Bombora would show. Bombora gives a score. The Hog gives the sentence the founder typed at 11pm.
2. The Instagram comment layer — creator accounts score from Reel comment sections, not from the creator themselves. Six people commented asking about enrichment alternatives. The Hog scraped them, matched them to companies, and routed the high-intent ones. That is a prospect list no other tool in the market thought to build. *(Note: this layer needs the qualification filter described in the critical flags section to be demo-safe — unfiltered, it generates noise.)*
3. The routing logic — same threshold, three different destinations. HeyReach for agencies, Smartlead for funded SaaS, partner DM for creators. The system knows the difference and routes without anyone touching it.

### Prototype accounts tracked

| Account | ICP | Trigger signals | Route |
|---|---|---|---|
| Apex GTM Agency | ICP 1 — Agency | LinkedIn pain post + GTM Engineer JD + founder activity | HeyReach LinkedIn |
| Rivelo AI | ICP 3 — Funded SaaS | Series A + SDR hiring + Reddit pain post | Smartlead email |
| Scrivo Labs | ICP 3 — Funded SaaS | X pain thread + SDR hiring + stack change | Smartlead email |
| Outbound Co | ICP 1 — Agency | Instagram comment + competitor follow | HeyReach LinkedIn |
| Momentum HQ | ICP 3 — Funded SaaS | Two separate expressed pain signals (Reddit + X) | Smartlead email |
| Jordan Osei | ICP 2 — Creator | Tutorial published + comment section buyer signals | Partnership DM |

### Workflow architecture

**Step 1 — Detect pain signals**

Monitor Reddit, LinkedIn, X, YouTube, Instagram, and community forums for active expressions of buying intent:

- *"Looking for a better Apollo alternative"* — Reddit post
- *"Clay enrichment is getting expensive"* — LinkedIn comment
- *"Apollo data quality is terrible, half our contacts bounce"* — X thread
- *"does this work with HubSpot?"* — Instagram comment on GTM creator's Reel
- *"what enrichment tool are you using here?"* — Instagram comment on Clay workflow demo

**Step 2 — Research via Deep Research**

```json
{
  "company": "Acme Corp",
  "stage": "Series A",
  "stack": ["Apollo", "HubSpot", "Outreach"],
  "hiring": ["SDR x3", "RevOps Manager"],
  "founderActivity": "High — posted yesterday about data quality",
  "intentScore": 95
}
```

**Step 3 — Discover decision makers** via People Search (Founder, Head of Revenue, VP Sales, RevOps Lead, GTM Engineer)

**Step 4 — Generate account brief**

*"Founder posted yesterday about contact accuracy issues with Apollo. Team is actively evaluating alternatives. Hiring RevOps Manager — outbound infrastructure is a live priority. Uses HubSpot and Outreach. Likely comparing Apollo, ZoomInfo, and The Hog."*

**Step 5 — Route automatically**

| Account type | Route |
|---|---|
| Agency | LinkedIn sequence via HeyReach |
| Creator | Partnership workflow |
| Series A SaaS | Smartlead email sequence |
| Enterprise | Founder-led outbound alert via Slack |

### The Instagram intelligence plays

**Play 1 — Creator audience mining**

Turn a GTM creator's Instagram comment section into a qualified prospect list:

```
1. Identify 10–15 GTM creators active on Instagram
2. Pull recent posts → filter for Clay, Apollo, enrichment, SDR topics
3. Scrape comments → flag commenters asking tool/pricing/integration questions
4. Profile each flagged commenter → extract bio, company, role
5. Apply qualification filter → role match + company enrichment + behaviour history
6. Enrich via The Hog → score → route high-scorers into outbound
```

> ⚠️ Step 5 is not optional. Without role + company qualification, this play generates a list of learners, not buyers. The filter is what makes the intelligence layer signal — not noise.

**Play 2 — Competitor follower intelligence**

Find people who follow Apollo, Clay, ZoomInfo, or Lusha on Instagram — they are actively aware of the category and likely evaluating tools. Filter by bio keywords: "founder", "GTM", "RevOps", "SDR". Outreach angle: they already know the category, no education needed.

**Play 3 — Following graph intelligence**

If 5+ high-signal GTM operators all follow the same account, that account is a hub — either a creator, a thought leader, or a highly connected operator worth prioritizing for partnership or direct outreach.

---

## Appendix — Full Intent Scoring Formula

```
Intent Score =
  Expressed Pain Signal (Reddit/LinkedIn/X/Instagram)       → +30
  Recent Funding (Series A+)                                → +25
  Hiring GTM Engineer                                       → +25
  Hiring SDR                                                → +20
  Commented on GTM creator post with buying signal          → +20
  Uses Clay                                                 → +15–20
  Uses Smartlead                                            → +15
  Founder Active on LinkedIn                                → +10–15
  Uses Apollo                                               → +10
  Recent technology change                                  → +10
  Follows competitor on Instagram (Apollo, Clay, ZoomInfo)  → +10

Threshold: 70+ = enters outbound queue
```

> **Note on scoring calibration:** These weights are a starting hypothesis, not a ground truth. They should be treated as v1 assumptions to be tested against conversion data in weeks 2–4. The weights that correlate with meetings and activations stay or increase. The weights that don't get reduced or removed. Signal recency decay (a pain post from last week outweighs one from three months ago) is not yet modelled — this is a known gap in v1.

### The Hog Endpoints Used

| Endpoint | Used for |
|---|---|
| `POST /api/v1/companies/search` | ICP discovery |
| `POST /api/v1/people/search` | Decision maker identification |
| `POST /api/enrichments` | Firmographic enrichment, tech stack, hiring data |
| `POST /api/deep-research` | Per-account brief generation, personalization hooks |
| `POST /api/v1/platform/scrapers/web/scrape` | Scrape public pages, job boards |
| `POST /api/v1/platform/scrapers/instagram/profile` | Creator and commenter enrichment |
| `POST /api/v1/platform/scrapers/instagram/posts` | Pull creator post history |
| `POST /api/v1/platform/scrapers/instagram/post-details` | Full post data including engagement |
| `POST /api/v1/platform/scrapers/instagram/post-comments` | Mine comments for pain signals |
| `POST /api/v1/platform/scrapers/instagram/followers` | Competitor follower intelligence |
| `POST /api/v1/platform/scrapers/instagram/following` | Network graph — find hub accounts |
| `GET /api/operations/:id` | Poll async operation status |

---

## Part 6 — Sample Emails (Live Positioning)

### ICP 1 — GTM / Clay Agency
*Signal trigger: Clay + Smartlead detected · Hiring GTM Engineer · Intent score: 90*

**Signal fired:** Apex GTM Agency posted a GTM Engineer JD 3 days ago. Founder published 3 LinkedIn posts this week about Clay workflow limitations. Uses Clay, Smartlead, Apollo.

**Channel:** Email via Smartlead · Day 1 of sequence

---

**Subject: your Clay setup**

Hey {{first_name}},

Noticed you're hiring a GTM Engineer and your team runs Clay pretty heavily.

One thing that comes up a lot at agencies your size — enrichment is only as good as the data feeding it. Most tools, including Apollo and a lot of Clay tables, are pulling from the same static databases. By the time a signal shows up, everyone's already seen it.

The Hog is different. Live scraping from the internet — hiring signals, funding events, LinkedIn activity, tech stack changes — all in real time, not refreshed quarterly. Leads, enrichment, and signals in one place instead of stitching three tools together.

We've benchmarked it against Clay and Apollo. It outperformed on contact accuracy and signal freshness.

If it's not worth it after two weeks, full refund — no conversation needed.

Worth a look?

— Adrian

---

*Why this works: opens on a signal they already know (their own hiring), frames the pain as a data freshness problem not a tool problem, benchmark claim adds proof, refund offer removes friction to try.*

*What changes first: if reply rate is low, the subject line is the problem not the body. Test "quick question about your Clay setup" vs "your Clay setup".*

---

### ICP 2 — GTM Creator / Workflow Builder
*Signal trigger: published Clay workflow tutorial in last 7 days · 80+ engagements · comments show data quality questions*

**Signal fired:** Creator posted a Clay + Apollo enrichment workflow 4 days ago. 94 likes, 22 comments. 6 commenters asked about data quality and alternatives. 3,400 followers, 60%+ GTM practitioners.

**Channel:** LinkedIn DM (manual) · Single send, no follow-up sequence

---

**Subject: re: your Clay + Apollo workflow**

Hey {{first_name}},

Saw the workflow you posted — the way you structured the enrichment loop was genuinely clean, most people overcomplicate that step.

Noticed a few people in the comments asking about data quality and whether it works with fresher signals. That's actually the problem we built The Hog around — real-time scraping from the internet instead of pulling from static databases. So hiring signals, funding events, LinkedIn activity — live, not cached from 6 months ago.

It slots into Clay and Apollo setups without replacing them. Just makes the data better.

We'd love to give you free credits to test it with a real workflow. No pitch — if it's useful for your audience, great. If not, useful feedback for us.

Interested?

— Adrian

---

*Why this works: opens with a genuine observation tied to something specific in their post (not generic "love your content"), connects their audience's comments to the product naturally, positions free credits as a test not a bribe, one soft close at the end.*

*Why no follow-up: if you follow up on a creator cold DM, you've already lost. One send, let them come to you.*

### Copy iteration logic

These emails are not static. They evolve based on what the data says:

| Signal | What it means | What changes |
|---|---|---|
| ICP 1 reply rate low | Subject line problem, not body | Test "quick question about your Clay setup" vs current |
| ICP 2 replies but doesn't activate | Onboarding after free credits is the leak | Fix the activation flow, not the copy |
| Refund offer feels transactional | Closing line friction | Test "happy to set up a live workflow together" instead |
| Benchmark claim gets challenged | Need specific numbers | Replace with real data: "X% higher contact accuracy vs Apollo in our test" |
| Creator converts but doesn't post | Partnership framing too vague | Make the co-build offer more concrete: "want to build one workflow together on a live call?" |

The goal is not great copy. The goal is more users and more ARR. Copy is just the variable we tune until the meetings and activations prove the message is right.

---

---

## Part 7 — Solving the Four Critical Bugs

*These aren't cosmetic fixes. Each one addresses a structural failure mode that would cause the system to look right in a demo and drift wrong in production.*

---

### Fix 1 — Calibration Loop: Feedback-Adjusted Signal Weights

**The bug:** Signal weights are fixed assumptions. They don't learn from what actually converts.

**The solution:** A closed feedback loop that adjusts weights every two weeks based on observed conversion outcomes — meetings booked, deals closed, and activations completed — traced back to the signals that triggered each account's entry into outbound.

#### How it works

Every account that enters outbound is logged with the exact signals that fired and their weights at the time of scoring. When an outcome is recorded in HubSpot (meeting booked, deal closed, churned, no-show), that outcome is written back against the signal record.

After 4+ weeks of data, you can calculate **conversion rate per signal** — not just "how often did this signal appear" but "when this signal appeared, what % of accounts converted to a meeting?"

```
Signal Conversion Rate =
  (Accounts with signal X that booked a meeting) /
  (All accounts with signal X that entered outbound)
```

#### Weight adjustment formula

```
New Weight = Base Weight × Conversion Multiplier

Conversion Multiplier:
  Signal CVR > 20%  → ×1.5  (signal is outperforming — increase weight)
  Signal CVR 10–20% → ×1.0  (baseline — no change)
  Signal CVR 5–10%  → ×0.75 (weak signal — reduce weight)
  Signal CVR < 5%   → ×0.5  (near-noise — halve the weight)
```

#### Recency decay

A pain signal posted yesterday is materially different from one posted 90 days ago. The scoring engine does not currently account for this.

```
Recency Multiplier:
  Signal age 0–7 days    → ×1.0  (full weight)
  Signal age 8–30 days   → ×0.75
  Signal age 31–60 days  → ×0.5
  Signal age 60+ days    → ×0.25 (deprioritise — likely stale context)
```

Apply recency decay at score calculation time, not at signal ingestion. This means a 30-point pain signal posted 45 days ago contributes 15 points, not 30.

#### Calibration cadence

| Cycle | Action |
|---|---|
| Week 2 | First data pull — enough volume to spot obvious outliers |
| Week 4 | First weight adjustment — apply conversion multipliers |
| Week 8 | Full recalibration — include recency decay, re-tier existing accounts |
| Monthly ongoing | Automated recalibration with manual review of any weight change >20% |

#### Where this lives in the stack

- Signal log: HubSpot custom properties per account (signals fired, weights at time of scoring, score at entry)
- Outcome tracking: HubSpot deal stage → webhook → n8n → updates signal performance table
- Weight store: Clay lookup table, updated manually every 2 weeks from the calibration report
- Reporting: GTM dashboard shows signal conversion rates alongside meeting and pipeline metrics

**What this changes in practice:** By week 8, the scoring model reflects real conversion data, not assumed intent. Accounts that would have scored 90 on stale signals but never converted drop in the queue. Accounts with signals that actually predict meetings get surfaced faster.

---

### Fix 2 — Confidence Bands: Replacing False Precision with Likelihood Tiers

**The bug:** A score of 90 and a score of 72 are treated as meaningfully different. They're not. The point difference is noise, not signal. Hard thresholds create false certainty that causes the team to route accounts incorrectly and miss context that numbers can't capture.

**The solution:** Replace raw scores with confidence bands that reflect the actual reliability of the underlying signals — and surface the specific signals driving each account's classification so a human can sanity-check it in 10 seconds.

#### Confidence band structure

```
Band A — HIGH CONFIDENCE (score 85+, 3+ independent signals)
  → Enter outbound immediately
  → System has multiple corroborating data points
  → Example: funding + SDR hiring + expressed pain post = three independent signals pointing same direction

Band B — MODERATE CONFIDENCE (score 70–84, or 85+ with only 1–2 signals)
  → Enter outbound with human review flag
  → Score meets threshold but signal base is thin
  → Example: one large pain signal carrying most of the score — needs context check before sequencing

Band C — WATCH (score 40–69)
  → Monitoring queue — re-scored weekly
  → Not enough signal yet, but account has shown some intent
  → Automated alert when any new signal fires

Band D — DISCARD (score <40)
  → No current signal — removed from active monitoring
```

#### The independence rule

Two signals that come from the same underlying event do not count as independent:

- Hiring GTM Engineer (JD posted) + Hiring SDR (JD posted same week) → **1 independent signal** (both from the same hiring push)
- Hiring GTM Engineer + Expressed pain post on LinkedIn + Series A funding → **3 independent signals** (three separate data sources, three separate events)

The more independent the signals, the higher the confidence. An account scoring 90 from one large pain signal is Band B. An account scoring 80 from three independent signals is Band A.

#### Human review flag — what it surfaces

For any Band B account before sequence enrollment, the system generates a one-line context check:

```
Account: Rivelo AI
Score: 78 | Band: B (moderate — single signal driving most of score)
Primary signal: Series A funding 6 weeks ago (+25)
Supporting: Hiring SDR (+20) · Uses Apollo (+10) · Founder LinkedIn active (+10) · Uses Clay (+15) — but no expressed pain signal detected
Flag: No direct expression of outbound pain. Funding + hiring may indicate growth mode, not tool evaluation. Recommend: check founder's recent LinkedIn posts before enrolling.
```

This takes 10 seconds to read. It catches the accounts where the score is technically high but the context doesn't support the conclusion.

#### What changes in practice

The 70-point threshold doesn't disappear — it becomes the floor for Band C/B consideration. The routing decision shifts from "score ≥ 70 → outbound" to "Band A → immediate, Band B → human check, Band C → monitor." The system becomes less brittle to a single noisy signal inflating an account's score past the threshold.

---

### Fix 3 — Modular Architecture: Separating the Three Systems

**The bug:** Data infrastructure, decision engine, and distribution strategy are tightly fused. When one breaks, everything breaks. When one needs updating, you have to untangle three systems to change one thing.

**The solution:** Define hard boundaries between the three layers with explicit contracts (inputs, outputs, failure modes) at each boundary. The layers stay connected — but they become separable, debuggable, and independently replaceable.

#### The three layers, properly defined

```
LAYER 1 — DATA INFRASTRUCTURE
  Responsibility: collect and normalise raw signals
  Inputs: The Hog API endpoints, Instagram scrapers, LinkedIn, Reddit, X, job boards
  Output contract: structured signal objects with source, type, timestamp, raw content, entity ID
  Failure mode: source goes down (Instagram API rate limit, LinkedIn block) → emit null signal, log error, continue
  Does NOT know about: scoring logic, routing rules, copy, sequences

LAYER 2 — DECISION ENGINE
  Responsibility: score accounts, assign confidence bands, determine routing destination
  Inputs: structured signal objects from Layer 1 (any source, same format)
  Output contract: account record with score, band, confidence flags, routing destination, signal log
  Failure mode: insufficient signals → assign Band D, log reason, do not route
  Does NOT know about: where signals came from, which tool executes the sequence

LAYER 3 — DISTRIBUTION STRATEGY
  Responsibility: execute outbound in the right channel with the right message
  Inputs: account record with routing destination from Layer 2
  Output contract: sequence enrollment confirmation, delivery status, reply/outcome logged back to HubSpot
  Failure mode: sequence tool down → queue account, retry in 4 hours, alert via Slack
  Does NOT know about: how the account was scored, which signals fired
```

#### Why the contracts matter

The contract between Layer 1 and Layer 2 is a structured signal object:

```json
{
  "signal_id": "sig_8821",
  "entity_id": "acct_rivelo_ai",
  "source": "reddit",
  "type": "expressed_pain",
  "timestamp": "2025-05-22T14:33:00Z",
  "recency_days": 7,
  "raw_content": "Apollo data quality is killing our reply rates",
  "matched_keywords": ["Apollo", "data quality", "reply rates"],
  "confidence": "high"
}
```

Layer 2 doesn't care if this signal came from Reddit, LinkedIn, or Instagram. It processes the same object regardless of source. This means: if Instagram gets blocked tomorrow, you update the scraper in Layer 1 and nothing downstream changes.

#### Practical separation in the current stack

| Layer | Current implementation | Separation fix |
|---|---|---|
| Data infrastructure | The Hog endpoints called directly inside Clay tables | Move all API calls to dedicated n8n workflows with standardised output format. Clay only receives the structured signal object. |
| Decision engine | Scoring logic embedded in Clay columns alongside enrichment | Separate Clay table for scoring only. Inputs: signal objects. Output: score, band, routing flag. No enrichment logic in the scoring table. |
| Distribution strategy | Sequence enrollment triggered directly from enrichment result | n8n routing node reads the routing destination from the scoring output. Enrolls in HeyReach or Smartlead based on destination field only. |

#### Debugging becomes linear

When something breaks:
- Meetings stop booking → is the scoring table routing correctly? (Layer 2 check)
- Accounts aren't being scored → are signals arriving in the right format? (Layer 1/2 boundary check)
- Sequences aren't enrolling → is the routing destination field populated? (Layer 2/3 boundary check)

Each question has one place to look. That's the value of the separation.

---

### Fix 4 — Instagram Qualification Filter: Turning Comment Noise into Buyer Signal

**The bug:** Comment intent ≠ purchase intent. Routing all commenters into the scoring pipeline generates a list of learners, not buyers. The Instagram layer amplifies noise rather than surfacing real signal.

**The solution:** A four-stage qualification filter that runs every commenter through role, company, behaviour, and comment quality checks before they touch the scoring pipeline. Only accounts that pass all four stages enter enrichment.

#### The four-stage filter

**Stage 1 — Role filter**

Extract bio from Instagram profile. Match against target role keywords.

```
PASS roles:  Founder, Co-Founder, CEO, VP Sales, Head of Revenue,
             RevOps, GTM Engineer, Head of Growth, Sales Director,
             Outbound Lead, Revenue Operations

FAIL roles:  Student, Intern, Job seeker, Freelancer (solo),
             Content creator (unless dual role), Coach, Consultant
             (unless company ≥ 10 employees — then re-evaluate)

NO BIO:      Flag for manual review — do not auto-discard
             (some founders don't fill bios)
```

**Stage 2 — Company filter**

Pull company from bio or linked profile. Enrich via The Hog.

```
PASS:  B2B company, 10–500 employees, showing at least one growth signal
       (hiring in last 90 days, funding in last 12 months, or tech stack
       includes outbound tooling)

FAIL:  Solopreneur (unless ICP 2 creator target)
       Consumer brand
       Company not found / enrichment returns null
       Agency already identified as a client or competitor

EDGE:  0–10 employees → pass only if founder role confirmed
```

**Stage 3 — Behaviour history filter**

Pull comment history across posts from the same creator (last 30 days).

```
Strong signal (add +10 to score):
  Commented on 2+ tool-related posts from same creator
  Asked a specific product or pricing question in any comment
  Replied to another commenter's question (shows active evaluation mindset)

Weak signal (no adjustment):
  One comment, generic ("great video", "thanks for sharing")
  One comment, relevant but vague ("interesting, will try this")

Disqualify:
  Comment history is exclusively promotional (spam account)
  All comments identical or near-identical (bot pattern)
```

**Stage 4 — Comment quality filter**

Score the specific comment that triggered the flag.

```
HIGH INTENT comments (pass + add signal weight):
  "Does this work with [specific tool]?"
  "What do you use for [specific function]?"
  "We're currently using X, is The Hog better for Y?"
  "How much does [tool] cost for a team of [N]?"
  "We had the same problem with Apollo — how did you solve it?"

MEDIUM INTENT comments (pass, no additional weight):
  "This is exactly what we need"
  "Going to test this with our team"
  "Saved — will come back to this"

LOW INTENT comments (fail):
  "Great content!"
  "🔥🔥🔥"
  "Following for more"
  Single emoji responses
```

#### Full filter flow

```
INSTAGRAM COMMENTER DETECTED
          │
          ▼
  Stage 1 — Role filter
  FAIL → discard
  PASS → continue
          │
          ▼
  Stage 2 — Company filter
  FAIL → discard
  EDGE → manual review queue
  PASS → continue
          │
          ▼
  Stage 3 — Behaviour history
  Disqualify → discard
  Weak → continue (no bonus)
  Strong → continue (+10 to eventual score)
          │
          ▼
  Stage 4 — Comment quality
  LOW → discard
  MEDIUM → enter enrichment (standard scoring)
  HIGH → enter enrichment (add +20 "expressed intent" signal)
          │
          ▼
  ENTERS THE HOG ENRICHMENT PIPELINE
  → scored like any other account
  → routed based on ICP classification
```

#### What this changes in practice

Before the filter: scraping a GTM creator's comment section with 80 comments produces ~70 accounts entering enrichment. Most are learners. Conversion from comment to meeting is low. Deliverability suffers from sequencing bad-fit contacts.

After the filter: the same 80 comments produce ~8–12 accounts entering enrichment. All have confirmed role, confirmed company, confirmed buying behaviour signals. Conversion from comment to meeting is materially higher. The Instagram layer becomes a genuine signal source, not a noise amplifier.

**The target ratio:** if more than 15% of scraped commenters are passing the filter, the filter is too loose. If fewer than 3% are passing, either the creator's audience is wrong for this ICP or the filter thresholds need calibration. The 5–12% pass rate is the signal that the filter is working correctly.

---

*Built by Adrian — Founding GTM Engineer candidate, The Hog*
