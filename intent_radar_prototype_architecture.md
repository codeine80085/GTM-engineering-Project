# Intent Radar — Full Prototype Architecture
**Mapped to The Hog API · Live Endpoints Only**

---

## Overview

The Intent Radar is a browser-based live demo. No backend server. No external execution tools (HeyReach, Smartlead) — those are sandboxed. Every piece of intelligence — enrichment, people discovery, company search, deep research, Instagram signal scraping — runs through The Hog API directly from the client.

The demo answers one question in real time: **who is expressing pain right now, and what do we know about them — and are they actually worth contacting?**

The second question is as important as the first. A Reddit post from a student asking about Apollo is worthless. A Reddit post from a Series A founder with 30 employees, an Apollo contract, and two SDR job postings is a Tier 1 account. The system only surfaces the second type.

---

## Signal Source Strategy

### Deep Research as the Reddit / LinkedIn / X Layer

Before building separate scrapers, `POST /api/deep-research` should be tested as the primary source for Reddit, LinkedIn, and X pain signals. Most research APIs pull from the open web — if The Hog's Deep Research does too, it already surfaces forum posts, LinkedIn discussions, and X threads as part of its output.

**Test call — pain signal discovery:**
```json
{
  "company": "Rivelo AI",
  "domain": "rivelo.ai",
  "context": {
    "researchFocus": "find any public Reddit threads, LinkedIn posts, X threads, or forum discussions where this company's founders or employees have expressed frustration with outbound tooling, data quality, Apollo, or prospecting infrastructure"
  }
}
```

**Test call — keyword-based monitoring:**
```json
{
  "query": "B2B SaaS founders complaining about Apollo data quality OR enrichment accuracy OR SDR prospecting tools",
  "researchFocus": "surface recent public posts expressing pain with outbound tooling — include author name, company, platform, post date, and direct quote",
  "sources": ["reddit", "linkedin", "twitter", "forums", "communities"]
}
```

**If Deep Research returns structured sources with author + company + date:** it replaces Reddit, LinkedIn, and X scrapers entirely. One endpoint covers all three platforms.

**If it returns a text summary without sources:** use `POST /api/v1/platform/scrapers/web/scrape` to pull the specific URLs Deep Research surfaces, then extract the structured data from those pages.

**If neither works:** Reddit, LinkedIn, and X signals stay sandboxed for the prototype. The Instagram layer and enrichment signals are still live — the demo holds.

---

## The Lead Quality Gate — No Noise Enters the Pipeline

Every signal from every source — Reddit, LinkedIn, X, Instagram, web scrape, Deep Research — passes through a two-stage quality gate before it touches the scoring engine. This is what separates a signal from noise.

### Stage 1 — Signal Pre-Filter (before enrichment)

Run on the raw signal content before spending an enrichment credit:

```javascript
function preFilterSignal(signal) {

  // 1. Author role check (if author is identifiable)
  // Extract role from bio, profile, or post context
  const VALID_ROLES = [
    "founder", "co-founder", "ceo", "cto", "vp sales",
    "head of revenue", "head of growth", "revops", "revenue operations",
    "gtm engineer", "sales director", "outbound lead", "growth lead",
    "director of sales", "chief revenue officer", "cro"
  ]
  const INVALID_ROLES = [
    "student", "intern", "looking for work", "open to opportunities",
    "job seeker", "freelancer", "coach", "consultant" // unless company ≥ 10 employees
  ]

  if (signal.authorRole) {
    const role = signal.authorRole.toLowerCase()
    if (INVALID_ROLES.some(r => role.includes(r))) return { pass: false, reason: "invalid_role" }
    if (!VALID_ROLES.some(r => role.includes(r))) return { pass: false, reason: "unverified_role" }
  }

  // 2. Pain keyword relevance check
  const HIGH_INTENT_KEYWORDS = [
    "apollo", "clay", "zoominfo", "lusha", "enrichment", "data quality",
    "bounce rate", "contact accuracy", "outbound", "prospecting", "sdr",
    "gtm stack", "intent data", "signal", "revops", "sequencing",
    "alternative to", "looking for", "evaluating", "switching from",
    "replacement for", "frustrated with", "tired of"
  ]
  const keywordMatch = HIGH_INTENT_KEYWORDS.filter(k =>
    signal.rawContent.toLowerCase().includes(k)
  )
  if (keywordMatch.length === 0) return { pass: false, reason: "no_keyword_match" }

  // 3. Recency check
  const daysSincePost = (Date.now() - new Date(signal.timestamp)) / (1000 * 60 * 60 * 24)
  if (daysSincePost > 60) return { pass: false, reason: "stale_signal" }

  return { pass: true, keywordsMatched: keywordMatch, recencyDays: daysSincePost }
}
```

Signals that fail Stage 1 are discarded. No enrichment credit spent. No API call made.

---

### Stage 2 — ICP & Deal Size Validation (after enrichment)

Only runs on signals that passed Stage 1. Enrichment fires here — this is where The Hog spends a credit. The enrichment result is immediately validated against ICP criteria before the account enters the scoring pipeline.

```javascript
const ICP_GATES = {

  // ICP 1 — Clay / GTM Agencies
  agency: {
    employeeCount: { min: 1, max: 50 },
    requiredTechStack: ["Clay", "Smartlead", "Apollo", "HeyReach", "n8n"],
    techStackMatchMin: 1,           // must use at least 1 of the above
    fundingRequired: false,
    estimatedDealSize: "$200–500/mo",
    disqualifyIf: ["enterprise", "non-GTM agency", "consumer brand"]
  },

  // ICP 2 — GTM Creators
  creator: {
    followerMin: 500,               // not a company gate — a reach gate
    engagementRateMin: 0.03,        // 3% minimum engagement
    topicsRequired: ["Clay", "outbound", "GTM", "enrichment", "SDR", "n8n"],
    topicMatchMin: 1,
    estimatedDealSize: "$50–100 in credits (indirect value)",
    disqualifyIf: ["non-GTM content", "follower count < 500"]
  },

  // ICP 3 — Funded B2B SaaS
  saas: {
    employeeCount: { min: 10, max: 500 },
    fundingStages: ["Seed", "Series A", "Series B"],
    fundingRecencyDays: 180,        // funded within last 6 months
    requiredHiring: ["SDR", "GTM Engineer", "RevOps", "Sales"],
    hiringMatchMin: 1,
    estimatedDealSize: "$800–1,500/mo",
    disqualifyIf: ["consumer", "B2C", "non-revenue-generating", "pre-product"]
  }
}

function validateICP(enrichmentData, detectedICP) {
  const gate = ICP_GATES[detectedICP]
  const reasons = []

  // Employee count check
  if (gate.employeeCount) {
    const emp = enrichmentData.employeeCount
    if (emp < gate.employeeCount.min || emp > gate.employeeCount.max) {
      reasons.push(`employee_count_out_of_range: ${emp}`)
    }
  }

  // Tech stack check (agency + saas)
  if (gate.requiredTechStack) {
    const matches = gate.requiredTechStack.filter(t =>
      enrichmentData.techStack?.includes(t)
    )
    if (matches.length < gate.techStackMatchMin) {
      reasons.push(`tech_stack_no_match`)
    }
  }

  // Funding check (saas)
  if (gate.fundingStages) {
    const fundingMatch = gate.fundingStages.includes(enrichmentData.funding?.stage)
    const fundingRecent = enrichmentData.funding?.daysAgo <= gate.fundingRecencyDays
    if (!fundingMatch || !fundingRecent) {
      reasons.push(`funding_stage_or_recency_fail`)
    }
  }

  // Hiring check (saas)
  if (gate.requiredHiring) {
    const hiringMatches = gate.requiredHiring.filter(h =>
      enrichmentData.hiring?.some(j => j.title.toLowerCase().includes(h.toLowerCase()))
    )
    if (hiringMatches.length < gate.hiringMatchMin) {
      reasons.push(`no_relevant_hiring_detected`)
    }
  }

  if (reasons.length > 0) {
    return { pass: false, reasons, dealSize: null }
  }

  return {
    pass: true,
    icp: detectedICP,
    dealSize: gate.estimatedDealSize,
    reasons: []
  }
}
```

Accounts that fail Stage 2 are discarded before scoring. They never appear in the UI — not even in the Tier 3 bucket. The pipeline only shows accounts that have passed both gates.

**What this means for the demo:** every account visible on screen is a real ICP match with a validated deal size. The number on screen is small and high-quality — not a large noisy list. That is the point.

---

## The 14 Endpoints — Full Spec

### `POST /api/v1/companies/search`
**Role:** Seeds the account pipeline on demo load with pre-validated ICP matches.

The query is written to only surface accounts that will pass the ICP gate — so no enrichment credit is wasted on companies that would be immediately discarded.

```json
// REQUEST — ICP 3 (Funded SaaS)
{
  "query": "B2B SaaS companies hiring SDR or GTM Engineer after Series A funding",
  "filters": {
    "employeeCount": "10-200",
    "techStack": ["Apollo", "Clay", "HubSpot"],
    "hiring": ["SDR", "GTM Engineer", "RevOps"],
    "fundingStage": ["Series A", "Series B"],
    "fundingRecencyDays": 180,
    "industry": ["SaaS", "B2B Software", "Sales Technology"]
  },
  "limit": 3
}

// REQUEST — ICP 1 (Agencies)
{
  "query": "Clay agencies or GTM engineering agencies using outbound automation tools",
  "filters": {
    "companyType": ["agency", "consultancy"],
    "techStack": ["Clay", "Smartlead", "Apollo", "HeyReach"],
    "employeeCount": "1-50"
  },
  "limit": 2
}

// RESPONSE (what we use)
{
  "companies": [
    {
      "id": "string",
      "name": "string",
      "domain": "string",
      "employeeCount": number,
      "industry": "string",
      "fundingStage": "string",
      "techStack": ["string"],
      "hiringSignals": ["string"],
      "linkedinUrl": "string"
    }
  ]
}
```

**What the UI does:** Creates account cards. Only companies that already pass the ICP filter from the search query appear — the scoring pipeline starts clean.

---

### `POST /api/enrichments`
**Role:** Triggered only after a signal passes Stage 1 pre-filter. Pulls full firmographic data for Stage 2 ICP validation.

```json
// REQUEST
{
  "domain": "rivelo.ai",
  "include": ["techStack", "hiring", "funding", "founders", "socialProfiles", "employeeCount", "industry"]
}

// RESPONSE
{
  "operationId": "op_abc123"  // async — poll GET /api/operations/:id
}
```

**What the UI does:** Shows "Validating..." spinner on the signal card. When enrichment completes → runs ICP gate → if passes, creates account card and fires signal into scoring engine. If fails, signal is silently discarded — never shown in UI.

---

### `GET /api/enrichments/:id`
**Role:** Retrieves a completed enrichment result directly by ID.

```json
// REQUEST
GET /api/enrichments/enr_abc123

// RESPONSE
{
  "id": "enr_abc123",
  "domain": "rivelo.ai",
  "status": "completed",
  "data": {
    "companyName": "Rivelo AI",
    "employeeCount": 34,
    "industry": "B2B SaaS",
    "techStack": ["Apollo", "HubSpot", "Outreach"],
    "hiring": [
      { "title": "SDR", "postedDays": 12 },
      { "title": "GTM Engineer", "postedDays": 3 }
    ],
    "funding": { "stage": "Series A", "amount": "$4.2M", "daysAgo": 42 },
    "founders": [
      { "name": "string", "linkedinUrl": "string", "twitterHandle": "string" }
    ]
  }
}
```

**What the UI does:** Enrichment data populates the account card after ICP validation passes — funding badge, tech stack pills, employee count, hiring signals.

---

### `GET /api/operations/:id`
**Role:** Polls async operations. Both enrichment and deep research are async.

```javascript
async function pollOperation(operationId, onComplete, onTimeout) {
  let attempts = 0
  const MAX_ATTEMPTS = 30  // 60 seconds max

  const poll = setInterval(async () => {
    attempts++
    if (attempts > MAX_ATTEMPTS) {
      clearInterval(poll)
      onTimeout(operationId)
      return
    }

    const res = await fetch(`/api/operations/${operationId}`)
    const data = await res.json()

    if (data.status === "completed") {
      clearInterval(poll)
      onComplete(data.result)
    }
  }, 2000)
}
```

**What the UI does:** Live progress bar on account card while polling. On timeout → card shows "Research unavailable" and falls back to sandboxed brief. Demo never freezes.

---

### `POST /api/v1/people/search`
**Role:** Called only when an account crosses the 70-point threshold AND has passed both quality gates. Zero credits spent on accounts that don't qualify.

```json
// REQUEST
{
  "company": "Rivelo AI",
  "domain": "rivelo.ai",
  "titles": ["Founder", "CEO", "VP Sales", "Head of Revenue", "RevOps", "GTM Engineer"],
  "limit": 3
}

// RESPONSE
{
  "people": [
    {
      "name": "string",
      "title": "string",
      "email": "string",
      "linkedinUrl": "string",
      "confidence": "high" | "medium" | "low"
    }
  ]
}
```

**What the UI does:** Populates CONTACTS tab in detail panel. Only high and medium confidence contacts are shown. Email masked for demo (`j***@rivelo.ai`). Primary contact auto-assigned to sandboxed sequence.

---

### `POST /api/deep-research`
**Role:** Generates the per-account brief on threshold crossing. Also used as the primary Reddit / LinkedIn / X signal discovery layer — test this first.

**Use 1 — Account brief (on threshold crossing):**
```json
{
  "company": "Rivelo AI",
  "domain": "rivelo.ai",
  "context": {
    "triggerSignals": [
      "Expressed pain: Apollo data quality is killing our reply rates (Reddit, 7 days ago)",
      "Series A funding: $4.2M, 42 days ago",
      "Hiring: GTM Engineer JD posted 3 days ago",
      "Hiring: SDR x2 JD posted 12 days ago"
    ],
    "techStack": ["Apollo", "HubSpot", "Outreach"],
    "researchFocus": "outbound infrastructure pain, tool evaluation signals, buying readiness, recommended outreach angle"
  }
}
```

**Use 2 — Pain signal discovery (test this first):**
```json
{
  "query": "B2B SaaS founders OR revenue leaders expressing frustration with Apollo OR enrichment tools OR outbound data quality",
  "researchFocus": "surface recent public posts with expressed pain — return author name, company, role, platform, post date, verbatim quote, and company domain for each result",
  "filters": {
    "authorRole": ["founder", "ceo", "vp sales", "head of revenue", "revops", "gtm"],
    "companyType": ["B2B SaaS", "agency"],
    "postRecencyDays": 14
  }
}
```

If Use 2 returns structured results with author + company + domain, every result is run through Stage 1 pre-filter → Stage 2 ICP gate → enrichment → scoring. Deep Research becomes the Reddit + LinkedIn + X signal layer.

```json
// COMPLETED RESULT — account brief
{
  "brief": "string",
  "painSummary": "string",
  "buyingReadiness": "high" | "medium" | "low",
  "recommendedAngle": "string",
  "keyFacts": ["string"],
  "sources": [
    { "platform": "reddit", "url": "string", "date": "string", "quote": "string" }
  ]
}
```

---

### `POST /api/v1/platform/scrapers/web/scrape`
**Role:** Two uses — job board scraping for hiring signals, and scraping specific URLs surfaced by Deep Research.

```json
// REQUEST — careers page
{
  "url": "https://rivelo.ai/careers",
  "extract": ["jobTitles", "jobDescriptions"]
}

// REQUEST — Reddit thread (URL from Deep Research output)
{
  "url": "https://reddit.com/r/sales/comments/[thread]",
  "extract": ["postAuthor", "postContent", "commentAuthors", "toolsMentioned"]
}

// RESPONSE
{
  "url": "string",
  "extractedData": {
    "jobTitles": ["SDR", "GTM Engineer"],
    "postAuthor": "string",
    "postContent": "string",
    "toolsMentioned": ["Apollo", "Clay"]
  },
  "rawText": "string"
}
```

**What the UI does:** Hiring signals from careers pages add to account score. Pain content from scraped Reddit/forum URLs runs through Stage 1 pre-filter → if it passes, fires as an `expressed_pain` signal with the scraped quote as `rawContent`.

---

### `POST /api/v1/platform/scrapers/instagram/profile`
**Role:** Pulls creator profile for ICP 2 scoring and commenter enrichment.

```json
// REQUEST
{ "username": "jordanosei" }

// RESPONSE (what we use)
{
  "username": "string",
  "fullName": "string",
  "bio": "string",
  "followerCount": number,
  "isVerified": boolean,
  "avgEngagementRate": number,
  "isBusinessAccount": boolean
}
```

**ICP 2 gate applied here:** `followerCount >= 500` AND `avgEngagementRate >= 0.03` AND bio contains GTM/outbound/Clay keywords. Fails gate → discarded.

For commenters: bio extracted → role keyword check (Stage 1) → if passes, company extracted from bio → enrichment fired (Stage 2).

---

### `POST /api/v1/platform/scrapers/instagram/posts`
**Role:** Finds GTM-relevant posts from a creator to pass to comment scraper.

```json
// REQUEST
{ "username": "jordanosei", "limit": 10 }

// RESPONSE (what we use)
{
  "posts": [
    {
      "id": "string",
      "caption": "string",
      "likeCount": number,
      "commentCount": number,
      "timestamp": "string",
      "mediaType": "image" | "video" | "reel"
    }
  ]
}
```

**Filter applied:** Caption must contain at least one of `["Clay", "Apollo", "enrichment", "outbound", "SDR", "GTM", "n8n", "prospecting"]`. Post must have `commentCount > 15`. First matching post passed to `post-details` and `post-comments`. Posts older than 30 days discarded.

---

### `POST /api/v1/platform/scrapers/instagram/post-details`
**Role:** Full engagement data for the selected post. Used to confirm the post is worth scraping comments on.

```json
// REQUEST
{ "postId": "string" }

// RESPONSE (what we use)
{
  "id": "string",
  "caption": "string",
  "likeCount": number,
  "commentCount": number,
  "engagementRate": number,
  "topComments": [
    { "username": "string", "text": "string", "likeCount": number }
  ]
}
```

**Gate:** `engagementRate >= 0.03` AND at least one top comment contains an intent keyword. If neither condition is met, skip `post-comments` call — no credit spent.

---

### `POST /api/v1/platform/scrapers/instagram/post-comments`
**Role:** Full comment scrape. The buyer signal source.

```json
// REQUEST
{ "postId": "string", "limit": 100 }

// RESPONSE
{
  "comments": [
    {
      "username": "string",
      "text": "string",
      "timestamp": "string",
      "likeCount": number
    }
  ]
}
```

**Full qualification filter — applied to every comment:**

```javascript
const INTENT_KEYWORDS = [
  "does this work with", "what do you use for", "how much",
  "alternative to", "vs apollo", "which enrichment", "looking for a",
  "recommendation", "trying to find", "can this integrate", "switching from",
  "we use", "we're using", "evaluating", "any experience with"
]

const LOW_VALUE_PATTERNS = [
  /^(🔥+|❤️+|👍+|😍+)$/,   // emoji only
  /^(great|amazing|nice|love this|thanks|wow|yes|no)[\s!.]*$/i,
  /^following$/i,
  /^saved$/i
]

async function processComment(comment) {
  // 1. Low-value pattern check — instant discard, no API call
  if (LOW_VALUE_PATTERNS.some(p => p.test(comment.text.trim()))) {
    return { pass: false, reason: "low_value_pattern" }
  }

  // 2. Intent keyword check — instant discard if no match
  const intentMatch = INTENT_KEYWORDS.some(k =>
    comment.text.toLowerCase().includes(k)
  )
  if (!intentMatch && comment.likeCount < 5) {
    return { pass: false, reason: "no_intent_keyword" }
  }

  // 3. Pull commenter profile — spend the API call
  const profile = await fetchInstagramProfile(comment.username)

  // 4. Role filter
  const bio = profile.bio.toLowerCase()
  const validRole = VALID_ROLES.some(r => bio.includes(r))
  const invalidRole = INVALID_ROLES.some(r => bio.includes(r))
  if (invalidRole) return { pass: false, reason: "invalid_role" }
  if (!validRole && !profile.isBusinessAccount) return { pass: false, reason: "no_role_detected" }

  // 5. Extract company from bio — pass to enrichment
  const companyHint = extractCompanyFromBio(profile.bio)
  if (!companyHint) return { pass: false, reason: "no_company_in_bio" }

  // 6. Fire enrichment → ICP gate (Stage 2)
  const enrichment = await enrichCompany(companyHint)
  const icpResult = validateICP(enrichment, detectICP(enrichment))
  if (!icpResult.pass) return { pass: false, reason: `icp_fail: ${icpResult.reasons.join(", ")}` }

  // 7. Passed all gates — create signal
  return {
    pass: true,
    signal: {
      type: "instagram_comment",
      source: "instagram",
      points: intentMatch ? 20 : 10,
      rawContent: comment.text,
      authorUsername: comment.username,
      authorRole: extractRoleFromBio(profile.bio),
      companyDomain: enrichment.domain,
      icpType: icpResult.icp,
      dealSize: icpResult.dealSize
    }
  }
}
```

**Expected pass rate: 5–12% of comments.** Below 3% = wrong creator audience. Above 15% = filter too loose.

---

### `POST /api/v1/platform/scrapers/instagram/followers`
**Role:** Competitor follower intelligence — finds people who follow Apollo, Clay, ZoomInfo.

```json
// REQUEST
{ "username": "apolloio", "limit": 200 }

// RESPONSE
{
  "followers": [
    {
      "username": "string",
      "fullName": "string",
      "bio": "string",
      "followerCount": number,
      "isBusinessAccount": boolean
    }
  ]
}
```

**Filter applied before any profile call:**
- Bio must contain a valid role keyword
- `isBusinessAccount === true` OR follower count suggests professional account
- Bio must NOT contain invalid role keywords

Passing followers → `instagram/profile` for full data → Stage 2 ICP gate → if passes, enter pipeline with +10 "competitor follower" signal pre-applied.

---

### `POST /api/v1/platform/scrapers/instagram/following`
**Role:** Network graph — identifies hub accounts followed by multiple high-signal GTM operators.

```json
// REQUEST
{ "username": "jordanosei" }

// RESPONSE
{
  "following": [
    {
      "username": "string",
      "fullName": "string",
      "bio": "string",
      "followerCount": number
    }
  ]
}
```

**Hub detection logic:**

```javascript
function detectHubs(followingLists) {
  // followingLists = array of following arrays from 3-4 seeded GTM operators
  const frequency = {}
  for (const list of followingLists) {
    for (const account of list) {
      frequency[account.username] = (frequency[account.username] || 0) + 1
    }
  }
  // Hub = appears in 3+ following lists
  return Object.entries(frequency)
    .filter(([_, count]) => count >= 3)
    .map(([username]) => username)
}
```

Hub accounts → shown in Network Hubs section (separate from outbound pipeline). These are partnership targets, not outbound. No sequence enrollment. Manual outreach only.

---

### `POST /api/v1/platform/scrapers/tiktok/profile`
**Role:** TikTok creator discovery — parallel to Instagram creator play.

```json
// REQUEST
{ "username": "string" }

// RESPONSE (what we use)
{
  "username": "string",
  "displayName": "string",
  "bio": "string",
  "followerCount": number,
  "likeCount": number,
  "videoCount": number,
  "verified": boolean
}
```

**Gate:** Same as Instagram creator — `followerCount >= 500`, bio contains GTM topics, engagement signals present. TikTok creators get a 🎵 badge in the UI. Fires after T+90s in demo — shows the system isn't Instagram-only.

---

## Full API Call Sequence — With Quality Gates

```
DEMO LOAD (T+0)
├── POST /api/v1/companies/search (ICP 3 query)   → 3 SaaS accounts, pre-filtered
├── POST /api/v1/companies/search (ICP 1 query)   → 2 agency accounts, pre-filtered
├── POST /api/enrichments (×5)                    → enrichment fires on all seeded accounts
│   └── GET /api/operations/:id (polling)
│       └── [on complete] → validateICP() → if passes, card appears in UI
├── POST /api/v1/platform/scrapers/instagram/profile  → Jordan Osei
│   └── [ICP 2 gate: follower + engagement check]
├── POST /api/v1/platform/scrapers/instagram/posts    → find GTM post
│   └── [filter: GTM keywords + commentCount > 15]
└── POST /api/v1/platform/scrapers/instagram/post-details → engagement gate

T+3s — Deep Research pain signal fires (if Use 2 works)
├── POST /api/deep-research (pain discovery query)
│   └── [on complete] → for each result:
│       → preFilterSignal()         Stage 1
│       → POST /api/enrichments     Stage 2 enrichment
│       → validateICP()             Stage 2 ICP gate
│       → [if passes] → fire signal into scoring engine

T+8s — Rivelo AI crosses 70 (passes both gates already)
├── POST /api/deep-research (account brief)
│   └── GET /api/operations/:id (polling) → brief in detail panel
└── POST /api/v1/people/search             → decision makers

T+22s — Instagram comment signal layer
├── POST /api/v1/platform/scrapers/instagram/post-comments
│   └── [for each comment]
│       → LOW_VALUE_PATTERNS check    → discard if match
│       → INTENT_KEYWORDS check       → discard if no match
│       → POST instagram/profile      → role filter
│       → POST /api/enrichments       → ICP gate
│       → [if passes] → fire signal + add account to pipeline

T+35s — Competitor follower scan
├── POST /api/v1/platform/scrapers/instagram/followers (apolloio)
│   └── [bio role filter → isBusinessAccount check]
│       → POST instagram/profile (passing accounts only)
│       → POST /api/enrichments → ICP gate
│       → [if passes] → add to pipeline with +10 signal

T+60s — Jordan Osei crosses 70
├── POST /api/deep-research (creator brief)
├── GET /api/operations/:id
├── POST /api/v1/people/search
└── POST /api/v1/platform/scrapers/instagram/following → hub detection

T+90s+ — Random mode, all patterns repeat
```

---

## State Shape

```javascript
{
  accounts: [
    {
      id: "string",
      name: "string",
      domain: "string",
      icp: "agency" | "creator" | "saas",

      // Quality gate results
      preFilterPassed: boolean,
      icpValidation: {
        pass: boolean,
        icp: "string",
        dealSize: "string",
        reasons: []
      },

      // Scoring
      score: number,
      band: "A" | "B" | "C" | "D",
      signals: [
        {
          type: "string",
          source: "deep_research" | "instagram" | "web_scrape" | "hog_enrichment" | "tiktok",
          points: number,
          recencyMultiplier: number,
          effectivePoints: number,
          rawContent: "string",
          timestamp: "string",
          passedPreFilter: boolean
        }
      ],

      // Status
      status: "enriching" | "validating" | "monitoring" | "triggered" | "enrolled" | "disqualified",
      route: null | "smartlead" | "heyreach" | "partner_dm",

      // API data
      enrichmentData: null,
      brief: null,
      contacts: [],
      pendingOperations: [],

      // Sandboxed outreach
      sandboxedEmail: null,
      sandboxedReply: null,
      sandboxedInMail: null
    }
  ],

  // Feeds
  signalFeed: [],       // last 20 signals that PASSED both gates
  discardedFeed: [],    // last 10 discarded signals — shown as grey in UI to contrast quality
  outboundQueue: [],

  // Detail panel
  selectedAccountId: null,
  selectedTab: "brief" | "signals" | "confidence" | "outreach" | "api",

  // Network
  networkHubs: [],

  // Controls
  isLive: true,
  elapsed: 0,
  apiCallLog: []
}
```

---

## The Discard Feed — Why It's in the UI

The signal feed in Column 1 shows two types of cards:

**Live signals (colour)** — passed both gates, in the pipeline, being scored.

**Discarded signals (grey, smaller)** — failed Stage 1 or Stage 2, shown briefly before fading out.

```
[grey]  Reddit · r/sales
        "Apollo is great for our team"
        ✗ No pain keyword match — discarded

[red]   Reddit · r/outboundsales
        "Apollo data quality is killing our reply rates"
        ✓ Expressed pain · Series A match · +30
```

This contrast is a demo moment. Point at the grey cards and say: *"that's what Bombora gives you — a list that includes both. We only pass the second type."*

---

## Confidence Band Logic

```javascript
function assignBand(account) {
  const independent = countIndependentSignals(account.signals)

  if (account.score >= 85 && independent >= 3) return "A"  // high confidence — immediate outbound
  if (account.score >= 70 && independent >= 2) return "B"  // moderate — human review flag
  if (account.score >= 70 && independent < 2)  return "B"  // high score, thin signal base — flag
  if (account.score >= 40)                      return "C"  // watch
  return "D"
}

function countIndependentSignals(signals) {
  // Signals from the same underlying event are not independent
  const eventGroups = {
    hiring:  ["hiring_gtm", "hiring_sdr"],           // same hiring push = 1
    pain:    ["expressed_pain"],                      // each pain post = independent
    social:  ["founder_active", "instagram_comment"], // same social presence = 1
    funding: ["funding"],                             // one funding event = 1
    stack:   ["tech_stack", "competitor_follow"]      // same tooling context = 1
  }
  const seen = new Set()
  let count = 0
  for (const s of signals) {
    const group = Object.entries(eventGroups).find(([_, types]) =>
      types.includes(s.type)
    )?.[0] || s.type
    if (!seen.has(group)) { seen.add(group); count++ }
  }
  return count
}
```

---

## What You Need Before Building

1. **Hog API key** — for all 14 endpoints
2. **Base URL** — confirm exact base (e.g. `https://api.thehog.io/v1` or similar)
3. **Auth header** — `Authorization: Bearer <key>` or `x-api-key: <key>`
4. **Test: Deep Research as signal source** — run the two test calls in the Signal Source Strategy section before building anything. The answer determines the entire signal architecture.
5. **Instagram rate limits** — how many scraper calls per minute before throttling
6. **Async timeout behaviour** — what happens if an operation never completes

Everything else is self-contained. The quality gate logic, scoring engine, confidence bands, sandboxed replies, and UI state are all ready to build the moment API access is confirmed and the Deep Research test is run.

---

*Intent Radar prototype architecture — Adrian · The Hog*
