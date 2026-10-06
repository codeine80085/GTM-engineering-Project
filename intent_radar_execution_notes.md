# Intent Radar Current Architecture

## What This Is Solving

Intent Radar finds high-intent GTM leads without wasting enrichment credits on noise.

The system is built for two ICPs:

1. Clay/Apollo/GTM agencies that already build outbound workflows for clients.
2. Individual Clay, Apollo, RevOps, or GTM automation experts who can buy directly or become distribution partners.

The core idea is simple: do not start with a giant lead list. Start with intent, prove the account fits the ICP, enrich only when it is worth it, then create copy from the strongest signal.

## Current Status

Working now:

- The Hog company search works for GTM/agency discovery.
- The Hog async polling is fixed for `queued`, `processing`, and `succeeded`.
- The Hog enrichment payload is fixed to use `identifiers: [...]`.
- NVIDIA LLM works for copy generation, reply simulation, and copy mutation.
- Smartlead, HeyReach, partner DM, and reply webhooks are sandboxed in the UI.
- The live engine is guarded to avoid burning credits.

Important credit rule:

- With 500 Hog credits, do not run deep research and enrichment on every lead.
- Run company search first, gate hard, then spend deep research/enrichment only on the best 1-2 leads.

## ICPs

### ICP 1: Clay / Apollo / GTM Agencies

Target:

- GTM engineering agencies
- Outbound agencies
- RevOps implementation shops
- Clay implementation partners
- Apollo-heavy outbound operators

Strong signals:

- Uses Clay, Apollo, Smartlead, HeyReach, n8n, or similar stack
- Talks about client outbound systems
- Posts about enrichment, deliverability, lead quality, or scraping
- Hiring for SDR, RevOps, GTM engineer, or outbound roles
- Shows agency/service positioning around GTM systems

Route:

- Primary route: HeyReach sandbox for LinkedIn-style outreach.
- Email route: Smartlead when a verified email exists.

Why:

- Agencies often sell through relationships and LinkedIn authority, so LinkedIn outreach is natural.
- If Hog enrichment finds a verified email, Smartlead becomes useful for structured cold email follow-up.
- Do not cold email agencies until there is a strong pain or stack signal, because generic agency lists are noisy.

Deal-size assumption:

- `$200-500/mo` near-term.
- Higher if it becomes client-facing infrastructure inside the agency.

### ICP 2: Individual GTM Experts

Target:

- Individual Clay experts
- Apollo experts
- RevOps builders
- GTM consultants
- Outbound automation operators
- Small expert-led workflow builders

Strong signals:

- Public posts about Clay/Apollo workflows
- Complaints about enrichment accuracy, Apollo data, scraping, or prospecting quality
- Reddit, LinkedIn, X, or Instagram comments asking about outbound workflows
- Bio or content mentions Clay, Apollo, RevOps, GTM engineering, n8n, enrichment, scraping, or outbound automation

Route:

- Primary route: partner/manual DM sandbox.
- Email route: Smartlead only if there is a verified email and the person is a clear direct buyer.

Why:

- Individual experts are often better reached with a personal DM or partner-style note than a standard sales sequence.
- They may not be large buyers immediately, but they can become distribution partners, affiliates, or implementation partners.
- Cold email should be used carefully here because the value may be channel value, not just monthly subscription value.

Deal-size assumption:

- `$100-300/mo or channel value`.

## Two Engine Modes

### Engine A: ICP -> Lead -> Signal -> Enrichment

Use this when you know the ICP first.

Flow:

1. Search The Hog for companies or people matching the ICP.
2. Keep only agency/expert-style leads.
3. Check signal quality: stack, hiring, social pain, public posts, comments, or enrichment complaints.
4. If signal passes, run decision-maker discovery.
5. If a LinkedIn URL or email exists, run Hog enrichment.
6. Use NVIDIA LLM to create signal-specific copy.
7. Route to the right sandbox automation.

Best for:

- Finding GTM agencies.
- Finding Clay/Apollo experts.
- Building a controlled prospect list.

### Engine B: Signal -> ICP -> Deal Size

Use this when the signal appears before the lead.

Flow:

1. Start from a raw signal: Reddit pain, LinkedIn post, X thread, Instagram comment, hiring page, or stack clue.
2. Run the cheap pre-filter first.
3. Reject stale, low-role, or no-keyword signals before enrichment.
4. Validate ICP and deal-size potential.
5. Only then spend on people search, enrichment, or deep research.
6. Generate copy based on the exact signal.

Best for:

- Avoiding noisy lists.
- Protecting credits.
- Finding intent that competitors miss.

## Hog API Usage

### Company Search

Endpoint:

- `POST /api/v1/companies/search`

Used for:

- Finding GTM agencies and automation companies.
- Seeding the Intent Radar with real companies.

Why it matters:

- This is the cheapest first move for account discovery.
- It gives the radar real company names, domains, industries, locations, and sometimes signals.

### People Search

Endpoint:

- `POST /api/v1/people/search`

Used for:

- Finding founders, CEOs, RevOps leads, heads of growth, or outbound operators.

Current lesson:

- People search can return `empty_clean` for narrow company-specific queries.
- It should not block the whole pipeline.
- If people search returns nothing, use deep research or company context before trying another expensive step.

### Deep Research

Endpoint:

- `POST /api/deep-research`

Used for:

- Finding LinkedIn, X, Reddit, and web pain points.
- Building account briefs.
- Finding likely decision makers when people search is empty.
- Creating stronger personalization hooks.

Why it matters:

- This is the best endpoint for proving intent, but it is expensive.
- Use it after a lead passes the cheap gate, not on every raw lead.

### Enrichment

Endpoint:

- `POST /api/enrichments`

Correct payload pattern:

```json
{
  "identifiers": [
    { "linkedin_url": "https://www.linkedin.com/in/example" }
  ],
  "fields": ["contact.email", "contact.phone", "name", "title", "company", "signals"]
}
```

Used for:

- Verified email/phone.
- Contact enrichment.
- Company/person context.
- Signal enrichment.

Rule:

- Only enrich when the system has a real identifier such as `linkedin_url` or `email`.
- Do not enrich placeholder contacts.

### Web / Social Scrape

Endpoints:

- `POST /api/v1/platform/scrapers/web/scrape`
- Instagram scraper endpoints where relevant

Used for:

- Website proof.
- Instagram/comment intent.
- Social proof signals that are not captured by company search.

Why it matters:

- Comment intent is a unique Hog advantage because comments often show buying intent before a company page does.

## Automation Routes

### Smartlead: Cold Email Sending

Use when:

- Hog enrichment returns a verified email.
- The lead has passed ICP and signal gates.
- The copy is based on a real signal, not generic personalization.

Why Smartlead:

- It is built for cold email sequencing.
- It manages sending schedules, inbox rotation, warm-up style workflows, unsubscribe handling, and reply tracking.
- It is the right place for email once the system has a verified contact.

How the app treats it now:

- Sandbox enrollment only.
- No real emails are sent.
- The UI shows what would be enrolled and what copy would be used.

### HeyReach: LinkedIn Outreach

Use when:

- The lead is an agency or LinkedIn-visible operator.
- The strongest signal is from LinkedIn, social posts, profile positioning, or public GTM content.
- Email is missing or LinkedIn context is stronger than email context.

Why HeyReach:

- Agencies and experts often respond better on LinkedIn when the hook references their public workflow or content.
- LinkedIn is useful before email when the contact is high-context but not fully enriched.
- It is better for relationship-led outreach than a cold email-only sequence.

How the app treats it now:

- Sandbox enrollment only.
- No real LinkedIn messages are sent.

### Partner / Manual DM Queue

Use when:

- The lead is an individual expert.
- The value is partnership, distribution, affiliate, implementation, or channel value.
- The contact should get a custom human-style note instead of a sequence.

Why manual/partner route:

- Individual experts can be more valuable as partners than direct subscribers.
- A heavy cold email sequence can feel wrong for a one-person expert.
- The right motion is often: research them, write a specific note, then decide if they are buyer or partner.

How the app treats it now:

- Sandbox/manual queue only.
- The UI simulates what would be queued.

### Reply Webhook Simulation

Use when:

- A sandboxed Smartlead, HeyReach, or partner DM route needs a reply event.

Why:

- It lets the demo show the learning loop without sending real outreach.
- NVIDIA simulates a reply, classifies the reply type, and mutates the next copy.

Reply treatments:

- `interested`: keep the copy as winning copy.
- `not_now`: soften CTA and add timing follow-up.
- `wrong_person`: ask for referral or retarget.
- `objection`: add proof, risk reversal, or integration detail.
- `no_reply`: wait for a new signal before mutating.

## Copy and Reply AI

NVIDIA LLM is used for:

- Writing first-touch copy from the strongest signal.
- Simulating a realistic reply.
- Classifying the reply.
- Mutating the next copy variant.

The copy should always be grounded in one of:

- Pain signal
- Tech stack
- Hiring signal
- Reddit/LinkedIn/X post
- Instagram/comment intent
- Deep research brief
- Enrichment result

Do not generate generic copy when no real signal exists. If there is no signal, the account should stay in watch mode.

## Best Current Pipeline With 500 Credits

Use this order:

1. Run Hog company search for the ICP.
2. Show 5 leads max in the UI.
3. Run cheap signal and ICP gate.
4. Pick the top 1-2 leads only.
5. Run deep research on those leads.
6. Use deep research to find a decision maker or stronger hook.
7. Run people search again with the better query.
8. Enrich only if a `linkedin_url` or `email` is found.
9. Generate NVIDIA copy.
10. Route to Smartlead, HeyReach, or partner/manual DM based on ICP and identifier.
11. Simulate reply.
12. Mutate copy based on reply treatment.

## What To Fix Next

1. Add a cheap/expensive mode toggle.
2. Make deep research the fallback when people search returns `empty_clean`.
3. Retry people search with decision-maker names found by deep research.
4. Use Smartlead route only when verified email exists.
5. Keep HeyReach as the default for agency LinkedIn motion.
6. Keep partner/manual DM as the default for individual experts.
7. Show endpoint provenance on every lead card: company search, deep research, people search, enrichment, scrape.
8. Track credit spend per stage so the demo explains why the gate saves money.
