import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  bg: "var(--color-background-primary)",
  bg2: "var(--color-background-secondary)",
  bg3: "var(--color-background-tertiary)",
  text: "var(--color-text-primary)",
  muted: "var(--color-text-secondary)",
  hint: "var(--color-text-tertiary)",
  border: "var(--color-border-tertiary)",
  borderMid: "var(--color-border-secondary)",
  danger: "var(--color-background-danger)",
  dangerText: "var(--color-text-danger)",
  success: "var(--color-background-success)",
  successText: "var(--color-text-success)",
  info: "var(--color-background-info)",
  infoText: "var(--color-text-info)",
  warning: "var(--color-background-warning)",
  warningText: "var(--color-text-warning)",
};

const ICP_COLORS = {
  agency: { bg: "#EEEDFE", text: "#3C3489", label: "ICP 1 · Agency" },
  creator: { bg: "#E1F5EE", text: "#085041", label: "ICP 2 · Creator" },
  saas: { bg: "#E6F1FB", text: "#0C447C", label: "ICP 3 · SaaS" },
};

const BAND_COLORS = {
  A: { bg: "#EAF3DE", text: "#27500A", border: "#639922" },
  B: { bg: "#FAEEDA", text: "#633806", border: "#BA7517" },
  C: { bg: "#F1EFE8", text: "#444441", border: "#888780" },
  D: { bg: "#FCEBEB", text: "#791F1F", border: "#E24B4A" },
};

const ROUTE_LABELS = {
  heyreach: "HeyReach · LinkedIn",
  smartlead: "Smartlead · Email",
  partner_dm: "Partner DM",
};

const SIGNAL_ICONS = {
  expressed_pain: "ti-flame",
  hiring: "ti-briefcase",
  funding: "ti-coin",
  tech_stack: "ti-stack-2",
  instagram_comment: "ti-brand-instagram",
  competitor_follow: "ti-eye",
  founder_active: "ti-user",
  deep_research: "ti-telescope",
};

const SEED_ACCOUNTS = [
  {
    id: "apex",
    name: "Apex GTM Agency",
    domain: "apexgtm.io",
    icp: "agency",
    score: 0,
    band: "D",
    signals: [],
    status: "monitoring",
    route: null,
    enrichmentData: {
      employeeCount: 18,
      industry: "GTM Agency",
      techStack: ["Clay", "Smartlead", "Apollo", "HeyReach"],
      funding: null,
      hiring: [{ title: "GTM Engineer", postedDays: 3 }],
    },
    brief: null,
    contacts: [],
    preFilterPassed: true,
    icpValidation: { pass: true, icp: "agency", dealSize: "$200–500/mo" },
  },
  {
    id: "rivelo",
    name: "Rivelo AI",
    domain: "rivelo.ai",
    icp: "saas",
    score: 0,
    band: "D",
    signals: [],
    status: "monitoring",
    route: null,
    enrichmentData: {
      employeeCount: 34,
      industry: "B2B SaaS",
      techStack: ["Apollo", "HubSpot", "Outreach"],
      funding: { stage: "Series A", amount: "$4.2M", daysAgo: 42 },
      hiring: [
        { title: "SDR", postedDays: 12 },
        { title: "GTM Engineer", postedDays: 3 },
      ],
    },
    brief: null,
    contacts: [],
    preFilterPassed: true,
    icpValidation: { pass: true, icp: "saas", dealSize: "$800–1,500/mo" },
  },
  {
    id: "scrivo",
    name: "Scrivo Labs",
    domain: "scrivolabs.com",
    icp: "saas",
    score: 0,
    band: "D",
    signals: [],
    status: "monitoring",
    route: null,
    enrichmentData: {
      employeeCount: 22,
      industry: "B2B SaaS",
      techStack: ["Apollo", "Clay", "Salesforce"],
      funding: { stage: "Seed", amount: "$1.8M", daysAgo: 67 },
      hiring: [{ title: "SDR", postedDays: 8 }],
    },
    brief: null,
    contacts: [],
    preFilterPassed: true,
    icpValidation: { pass: true, icp: "saas", dealSize: "$800–1,500/mo" },
  },
  {
    id: "jordan",
    name: "Jordan Osei",
    domain: "jordanosei.com",
    icp: "creator",
    score: 0,
    band: "D",
    signals: [],
    status: "monitoring",
    route: null,
    enrichmentData: {
      employeeCount: 1,
      industry: "GTM Creator",
      techStack: ["Clay", "n8n", "Apollo"],
      funding: null,
      hiring: [],
      followerCount: 4200,
      engagementRate: 0.067,
    },
    brief: null,
    contacts: [],
    preFilterPassed: true,
    icpValidation: { pass: true, icp: "creator", dealSize: "$50–100 in credits" },
  },
  {
    id: "outbound_co",
    name: "Outbound Co",
    domain: "outboundco.io",
    icp: "agency",
    score: 0,
    band: "D",
    signals: [],
    status: "monitoring",
    route: null,
    enrichmentData: {
      employeeCount: 11,
      industry: "GTM Agency",
      techStack: ["Smartlead", "Apollo", "HeyReach"],
      funding: null,
      hiring: [],
    },
    brief: null,
    contacts: [],
    preFilterPassed: true,
    icpValidation: { pass: true, icp: "agency", dealSize: "$200–500/mo" },
  },
];

const SIGNAL_EVENTS = [
  { accountId: "rivelo", t: 3000, signal: { type: "expressed_pain", source: "reddit", points: 30, rawContent: "Apollo data quality is killing our reply rates. Half our contacts bounce. Looking for alternatives.", recencyDays: 7 } },
  { accountId: "rivelo", t: 5500, signal: { type: "funding", source: "hog_enrichment", points: 25, rawContent: "Series A · $4.2M raised · 42 days ago", recencyDays: 42 } },
  { accountId: "apex", t: 7000, signal: { type: "hiring", source: "web_scrape", points: 30, rawContent: "GTM Engineer JD posted 3 days ago", recencyDays: 3 } },
  { accountId: "rivelo", t: 8500, signal: { type: "hiring", source: "web_scrape", points: 25, rawContent: "Hiring: GTM Engineer — JD posted 3 days ago", recencyDays: 3 } },
  { accountId: "apex", t: 10000, signal: { type: "tech_stack", source: "hog_enrichment", points: 20, rawContent: "Uses Clay · Smartlead · Apollo · HeyReach", recencyDays: 1 } },
  { accountId: "rivelo", t: 11500, signal: { type: "hiring", source: "web_scrape", points: 20, rawContent: "Hiring: SDR x2 — JD posted 12 days ago", recencyDays: 12 } },
  { accountId: "apex", t: 13000, signal: { type: "tech_stack", source: "hog_enrichment", points: 15, rawContent: "Uses Smartlead — multi-inbox sequencing confirmed", recencyDays: 1 } },
  { accountId: "apex", t: 14500, signal: { type: "founder_active", source: "deep_research", points: 15, rawContent: "Founder posted 3× this week on Clay workflow limitations", recencyDays: 2 } },
  { accountId: "rivelo", t: 16000, signal: { type: "tech_stack", source: "hog_enrichment", points: 10, rawContent: "Uses Apollo — likely experiencing data frustration at scale", recencyDays: 1 } },
  { accountId: "scrivo", t: 18000, signal: { type: "expressed_pain", source: "twitter", points: 30, rawContent: "Anyone else finding Clay enrichment expensive at scale? Evaluating alternatives rn", recencyDays: 4 } },
  { accountId: "jordan", t: 20000, signal: { type: "tech_stack", source: "instagram", points: 25, rawContent: "Tutorial published 4 days ago · 94 likes · 22 comments · Clay + Apollo workflow", recencyDays: 4 } },
  { accountId: "outbound_co", t: 22000, signal: { type: "instagram_comment", source: "instagram", points: 20, rawContent: "does this work with HubSpot? we're looking for enrichment alternatives", recencyDays: 1 } },
  { accountId: "scrivo", t: 24000, signal: { type: "hiring", source: "web_scrape", points: 20, rawContent: "Hiring: SDR — JD posted 8 days ago", recencyDays: 8 } },
  { accountId: "jordan", t: 25000, signal: { type: "expressed_pain", source: "instagram", points: 30, rawContent: "6 commenters asking about enrichment alternatives on latest Clay workflow Reel", recencyDays: 1 } },
  { accountId: "scrivo", t: 27000, signal: { type: "funding", source: "hog_enrichment", points: 25, rawContent: "Seed round · $1.8M · 67 days ago", recencyDays: 67 } },
  { accountId: "outbound_co", t: 29000, signal: { type: "competitor_follow", source: "instagram", points: 10, rawContent: "Follows Apollo, Clay, ZoomInfo on Instagram — active category awareness", recencyDays: 1 } },
  { accountId: "apex", t: 30000, signal: { type: "tech_stack", source: "hog_enrichment", points: 10, rawContent: "Uses Apollo — data quality pain likely given scale", recencyDays: 1 } },
  { accountId: "jordan", t: 32000, signal: { type: "founder_active", source: "instagram", points: 15, rawContent: "3,400+ followers · 60%+ GTM practitioners · engagement rate 6.7%", recencyDays: 1 } },
  { accountId: "outbound_co", t: 34000, signal: { type: "tech_stack", source: "hog_enrichment", points: 15, rawContent: "Uses Smartlead + Apollo + HeyReach", recencyDays: 1 } },
  { accountId: "scrivo", t: 36000, signal: { type: "tech_stack", source: "hog_enrichment", points: 15, rawContent: "Uses Clay — will understand The Hog immediately", recencyDays: 1 } },
  { accountId: "apex", t: 38000, signal: { type: "expressed_pain", source: "linkedin", points: 30, rawContent: "Enrichment is only as good as the data feeding it. Most tools are pulling from the same static DB.", recencyDays: 6 } },
  { accountId: "outbound_co", t: 40000, signal: { type: "hiring", source: "web_scrape", points: 20, rawContent: "Hiring: Outbound Specialist — JD posted 5 days ago", recencyDays: 5 } },
];

const DISCARDED_SIGNALS = [
  { t: 4500, content: "Apollo is great for our team", reason: "No pain keyword match", source: "Reddit · r/sales" },
  { t: 9000, content: "great video!! 🔥🔥🔥", reason: "Low-value pattern", source: "Instagram comment" },
  { t: 15000, content: "Student asking about Apollo pricing", reason: "Invalid role — student", source: "LinkedIn" },
  { t: 23000, content: "following for more content", reason: "Low-value pattern", source: "Instagram comment" },
  { t: 31000, content: "Intent data post from 90 days ago", reason: "Stale signal — >60 days", source: "Reddit · r/outbound" },
];

const BRIEFS = {
  rivelo: {
    painSummary: "Founder posted about Apollo data quality killing reply rates. Team actively evaluating alternatives.",
    buyingReadiness: "high",
    recommendedAngle: "Lead with contact accuracy and real-time signal freshness. Reference their Reddit post directly.",
    keyFacts: ["Series A $4.2M · 42 days ago", "Hiring GTM Engineer + 2× SDR", "Uses Apollo, HubSpot, Outreach", "Expressed pain: data quality public post"],
  },
  apex: {
    painSummary: "Founder posting consistently about Clay limitations and enrichment data staleness. Active build phase.",
    buyingReadiness: "high",
    recommendedAngle: "Agency-to-agency angle. They enrich for clients — show how The Hog makes their deliverables more accurate.",
    keyFacts: ["18 employees · GTM agency", "Uses Clay, Smartlead, Apollo, HeyReach", "Hiring GTM Engineer (3 days ago)", "Founder 3× posts this week"],
  },
  jordan: {
    painSummary: "Active GTM creator with 4.2k followers. 6 commenters on latest post asking about enrichment alternatives — audience is in-market.",
    buyingReadiness: "medium",
    recommendedAngle: "No pitch. Offer free credits + co-build a workflow. Let them decide if The Hog belongs in their content.",
    keyFacts: ["4,200 followers · 6.7% engagement", "Clay + n8n + Apollo workflows", "22 comments on latest post", "Audience 60%+ GTM practitioners"],
  },
};

const CONTACTS = {
  rivelo: [
    { name: "M. Patel", title: "Founder & CEO", email: "m***@rivelo.ai", confidence: "high" },
    { name: "J. Kim", title: "Head of Revenue", email: "j***@rivelo.ai", confidence: "high" },
  ],
  apex: [
    { name: "D. Okonkwo", title: "Founder", email: "d***@apexgtm.io", confidence: "high" },
    { name: "S. Walsh", title: "Head of GTM", email: "s***@apexgtm.io", confidence: "medium" },
  ],
  jordan: [
    { name: "Jordan Osei", title: "Creator / Founder", email: "j***@jordanosei.com", confidence: "high" },
  ],
};

function assignBand(score) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 40) return "C";
  return "D";
}

function ScoreMeter({ score }) {
  const pct = Math.min(100, score);
  const color = score >= 70 ? "#639922" : score >= 40 ? "#BA7517" : "#888780";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--color-border-tertiary)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", minWidth: 28, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function BandBadge({ band }) {
  const c = BAND_COLORS[band];
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: c.bg, color: c.text, border: `0.5px solid ${c.border}` }}>
      Band {band}
    </span>
  );
}

function ICPBadge({ icp }) {
  const c = ICP_COLORS[icp];
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

function StatusDot({ status }) {
  const colors = {
    monitoring: "#888780",
    enriching: "#BA7517",
    validating: "#BA7517",
    triggered: "#639922",
    enrolled: "#185FA5",
    disqualified: "#A32D2D",
  };
  return (
    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: colors[status] || "#888780", marginRight: 5 }} />
  );
}

function SignalRow({ signal, compact }) {
  const icon = SIGNAL_ICONS[signal.type] || "ti-activity";
  const sourceColors = {
    reddit: "#D85A30",
    linkedin: "#185FA5",
    twitter: "#185FA5",
    instagram: "#993556",
    hog_enrichment: "#534AB7",
    web_scrape: "#3B6D11",
    deep_research: "#0F6E56",
  };
  const color = sourceColors[signal.source] || "#888780";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: compact ? "5px 0" : "7px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14, color, marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 11 : 12, color: "var(--color-text-secondary)", textTransform: "capitalize", marginBottom: 1 }}>
          {signal.source.replace(/_/g, " ")} · +{signal.points}
        </div>
        <div style={{ fontSize: compact ? 11 : 12, color: "var(--color-text-primary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {signal.rawContent}
        </div>
      </div>
      <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0 }}>{signal.recencyDays}d</span>
    </div>
  );
}

function DiscardRow({ item }) {
  return (
    <div style={{ padding: "6px 10px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-secondary)", marginBottom: 6, opacity: 0.7 }}>
      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{item.source}</div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: 3 }}>"{item.content}"</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <i className="ti ti-x" style={{ fontSize: 10, color: "var(--color-text-danger)" }} aria-hidden="true" />
        <span style={{ fontSize: 10, color: "var(--color-text-danger)" }}>{item.reason} — discarded</span>
      </div>
    </div>
  );
}

function AccountCard({ account, selected, onClick }) {
  const icp = ICP_COLORS[account.icp];
  const band = BAND_COLORS[account.band];
  const isActive = account.score >= 70;
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 14px",
        borderRadius: "var(--border-radius-lg)",
        border: `${selected ? "1.5px" : "0.5px"} solid ${selected ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`,
        background: "var(--color-background-primary)",
        cursor: "pointer",
        marginBottom: 8,
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <StatusDot status={account.status} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{account.name}</span>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <ICPBadge icp={account.icp} />
            <BandBadge band={account.band} />
            {isActive && account.route && (
              <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: "var(--color-background-info)", color: "var(--color-text-info)" }}>
                {ROUTE_LABELS[account.route]}
              </span>
            )}
          </div>
        </div>
        {account.enrichmentData?.funding && (
          <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: "var(--border-radius-md)", background: "#EAF3DE", color: "#27500A", whiteSpace: "nowrap" }}>
            {account.enrichmentData.funding.stage}
          </span>
        )}
      </div>
      <ScoreMeter score={account.score} />
      {account.enrichmentData && (
        <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          {account.enrichmentData.employeeCount > 1 && (
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              <i className="ti ti-users" style={{ fontSize: 11, marginRight: 3 }} aria-hidden="true" />
              {account.enrichmentData.employeeCount} emp.
            </span>
          )}
          {account.enrichmentData.techStack?.slice(0, 2).map(t => (
            <span key={t} style={{ fontSize: 10, padding: "1px 5px", borderRadius: 99, background: "var(--color-background-tertiary)", color: "var(--color-text-secondary)" }}>{t}</span>
          ))}
          {account.icpValidation?.dealSize && (
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{account.icpValidation.dealSize}</span>
          )}
        </div>
      )}
    </div>
  );
}

function DetailPanel({ account, onClose }) {
  const [tab, setTab] = useState("brief");
  if (!account) return null;

  const TABS = ["brief", "signals", "confidence", "outreach"];

  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{account.name}</span>
            <BandBadge band={account.band} />
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <ICPBadge icp={account.icp} />
            {account.route && (
              <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 99, background: "var(--color-background-info)", color: "var(--color-text-info)" }}>
                {ROUTE_LABELS[account.route]}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-text-secondary)" }}>
          <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
        </button>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 16px" }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 10px",
              fontSize: 12, fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              borderBottom: tab === t ? "1.5px solid var(--color-text-primary)" : "1.5px solid transparent",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
        {tab === "brief" && (
          <div>
            {account.brief ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Buying readiness</div>
                  <span style={{
                    fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 99,
                    background: account.brief.buyingReadiness === "high" ? "#EAF3DE" : "#FAEEDA",
                    color: account.brief.buyingReadiness === "high" ? "#27500A" : "#633806",
                  }}>
                    {account.brief.buyingReadiness}
                  </span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Pain summary</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)", margin: 0 }}>{account.brief.painSummary}</p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Recommended angle</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)", margin: 0 }}>{account.brief.recommendedAngle}</p>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Key facts</div>
                  {account.brief.keyFacts.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                      <i className="ti ti-point-filled" style={{ fontSize: 10, marginTop: 3, color: "var(--color-text-tertiary)" }} aria-hidden="true" />
                      <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                {account.contacts?.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Decision makers</div>
                    {account.contacts.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "var(--color-text-info)", flexShrink: 0 }}>
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{c.title} · {c.email}</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: 10, padding: "1px 6px", borderRadius: 99, background: c.confidence === "high" ? "#EAF3DE" : "#FAEEDA", color: c.confidence === "high" ? "#27500A" : "#633806" }}>
                          {c.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>
                <i className="ti ti-telescope" style={{ fontSize: 24, display: "block", marginBottom: 8 }} aria-hidden="true" />
                Brief generates when account crosses 70 threshold
              </div>
            )}
          </div>
        )}

        {tab === "signals" && (
          <div>
            {account.signals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>
                <i className="ti ti-activity" style={{ fontSize: 24, display: "block", marginBottom: 8 }} aria-hidden="true" />
                No signals yet
              </div>
            ) : (
              account.signals.map((s, i) => <SignalRow key={i} signal={s} />)
            )}
          </div>
        )}

        {tab === "confidence" && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Intent score</span>
                <span style={{ fontSize: 20, fontWeight: 500 }}>{account.score}</span>
              </div>
              <ScoreMeter score={account.score} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Confidence band</div>
              <div style={{ padding: "10px 12px", borderRadius: "var(--border-radius-md)", background: BAND_COLORS[account.band].bg, border: `0.5px solid ${BAND_COLORS[account.band].border}` }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: BAND_COLORS[account.band].text, marginBottom: 3 }}>Band {account.band}</div>
                <div style={{ fontSize: 12, color: BAND_COLORS[account.band].text, opacity: 0.8 }}>
                  {account.band === "A" && "High confidence — immediate outbound. 3+ independent signals."}
                  {account.band === "B" && "Moderate confidence — enter outbound with human review flag."}
                  {account.band === "C" && "Watch — monitoring queue, re-scored weekly."}
                  {account.band === "D" && "Insufficient signal — no current outbound."}
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Signal breakdown</div>
              {account.signals.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 12 }}>
                  <span style={{ color: "var(--color-text-secondary)", textTransform: "capitalize" }}>{s.type.replace(/_/g, " ")}</span>
                  <span style={{ fontWeight: 500 }}>+{s.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "outreach" && (
          <div>
            {account.route ? (
              <div>
                <div style={{ padding: "10px 12px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-info)", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-info)", fontWeight: 500 }}>
                    <i className="ti ti-send" style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
                    Enrolled — {ROUTE_LABELS[account.route]}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Sandboxed sequence preview</div>
                <div style={{ padding: "12px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-secondary)", fontSize: 12, lineHeight: 1.7, color: "var(--color-text-primary)" }}>
                  {account.icp === "saas" && <>
                    <strong style={{ display: "block", marginBottom: 4 }}>Subject: noticed you're scaling outbound</strong>
                    Hey {"{first_name}"},<br /><br />
                    Saw the funding announcement and noticed you're hiring SDRs...<br />
                    I've been building workflows using The Hog that combine hiring signals, funding intelligence, LinkedIn activity, and technographic data to identify high-intent accounts automatically.<br /><br />
                    Happy to share a live workflow if useful.<br /><br />
                    — Adrian
                  </>}
                  {account.icp === "agency" && <>
                    <strong style={{ display: "block", marginBottom: 4 }}>Subject: your Clay setup</strong>
                    Hey {"{first_name}"},<br /><br />
                    Noticed you're hiring a GTM Engineer and your team runs Clay pretty heavily.<br />
                    The Hog benchmarks better than Apollo on contact accuracy and signal freshness — relevant if you're enriching for clients.<br /><br />
                    Worth a look?<br /><br />
                    — Adrian
                  </>}
                  {account.icp === "creator" && <>
                    <strong style={{ display: "block", marginBottom: 4 }}>Re: your Clay + Apollo workflow</strong>
                    Hey {"{first_name}"},<br /><br />
                    Saw the workflow you posted — the way you structured the enrichment loop was genuinely clean.<br />
                    We'd love to give you free credits to test The Hog with a real workflow. No pitch — if it's useful for your audience, great.<br /><br />
                    Interested?<br /><br />
                    — Adrian
                  </>}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>
                <i className="ti ti-send" style={{ fontSize: 24, display: "block", marginBottom: 8 }} aria-hidden="true" />
                Outreach enrolls when account crosses Band B/A
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntentRadar() {
  const [accounts, setAccounts] = useState(() => SEED_ACCOUNTS.map(a => ({ ...a })));
  const [signalFeed, setSignalFeed] = useState([]);
  const [discardFeed, setDiscardFeed] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [apiLog, setApiLog] = useState([]);
  const startRef = useRef(null);
  const firedSignals = useRef(new Set());
  const firedDiscards = useRef(new Set());

  const logApi = useCallback((call) => {
    setApiLog(prev => [{ ...call, ts: Date.now() }, ...prev].slice(0, 12));
  }, []);

  useEffect(() => {
    if (!isLive) return;
    if (!startRef.current) startRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now() - startRef.current;
      setElapsed(now);

      SIGNAL_EVENTS.forEach((ev, idx) => {
        if (now >= ev.t && !firedSignals.current.has(idx)) {
          firedSignals.current.add(idx);
          setAccounts(prev => prev.map(acc => {
            if (acc.id !== ev.accountId) return acc;
            const newSignals = [...acc.signals, { ...ev.signal, passedPreFilter: true }];
            const newScore = Math.min(150, newSignals.reduce((s, sig) => s + sig.points, 0));
            const newBand = assignBand(newScore);
            const wasTriggered = acc.score >= 70;
            const isTriggered = newScore >= 70;
            const route = isTriggered ? (acc.icp === "agency" ? "heyreach" : acc.icp === "creator" ? "partner_dm" : "smartlead") : acc.route;
            const status = isTriggered ? (wasTriggered ? "enrolled" : "triggered") : acc.status;
            const brief = isTriggered && !acc.brief ? (BRIEFS[acc.id] || null) : acc.brief;
            const contacts = isTriggered && acc.contacts.length === 0 ? (CONTACTS[acc.id] || []) : acc.contacts;
            if (!wasTriggered && isTriggered) {
              logApi({ method: "POST", path: `/api/deep-research`, account: acc.name, status: 202 });
              logApi({ method: "POST", path: `/api/v1/people/search`, account: acc.name, status: 200 });
            }
            if (newSignals.length === 1) {
              logApi({ method: "POST", path: `/api/enrichments`, account: acc.name, status: 202 });
            }
            return { ...acc, signals: newSignals, score: newScore, band: newBand, status, route, brief, contacts };
          }));
          setSignalFeed(prev => [{ ...ev.signal, accountName: ev.accountId, ts: now }, ...prev].slice(0, 20));
        }
      });

      DISCARDED_SIGNALS.forEach((ev, idx) => {
        if (now >= ev.t && !firedDiscards.current.has(idx)) {
          firedDiscards.current.add(idx);
          setDiscardFeed(prev => [ev, ...prev].slice(0, 8));
          logApi({ method: "DISCARD", path: "pre-filter", reason: ev.reason, status: "—" });
        }
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isLive, logApi]);

  const reset = () => {
    setAccounts(SEED_ACCOUNTS.map(a => ({ ...a })));
    setSignalFeed([]);
    setDiscardFeed([]);
    setElapsed(0);
    setApiLog([]);
    setIsLive(false);
    startRef.current = null;
    firedSignals.current = new Set();
    firedDiscards.current = new Set();
    setSelectedId(null);
  };

  const selectedAccount = accounts.find(a => a.id === selectedId);
  const tier1 = accounts.filter(a => a.score >= 70).sort((a, b) => b.score - a.score);
  const tier2 = accounts.filter(a => a.score >= 40 && a.score < 70).sort((a, b) => b.score - a.score);
  const monitoring = accounts.filter(a => a.score < 40).sort((a, b) => b.score - a.score);

  const totalScore = accounts.reduce((s, a) => s + a.score, 0);
  const enrolled = accounts.filter(a => a.status === "enrolled" || a.status === "triggered").length;

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", minHeight: 600 }}>
      <h2 className="sr-only">Intent Radar — live signal monitoring dashboard</h2>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 0 12px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <i className="ti ti-radar" style={{ fontSize: 18, color: "var(--color-text-secondary)" }} aria-hidden="true" />
            <span style={{ fontSize: 16, fontWeight: 500 }}>Intent Radar</span>
            <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 99, background: isLive ? "#EAF3DE" : "var(--color-background-secondary)", color: isLive ? "#27500A" : "var(--color-text-secondary)", border: isLive ? "0.5px solid #639922" : "0.5px solid var(--color-border-tertiary)" }}>
              {isLive ? "● live" : "paused"}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>The Hog API · {Math.floor(elapsed / 1000)}s elapsed · {firedSignals.current.size}/{SIGNAL_EVENTS.length} signals</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={reset} style={{ fontSize: 12, padding: "5px 10px" }}>
            <i className="ti ti-refresh" style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
            Reset
          </button>
          <button
            onClick={() => { setIsLive(l => !l); if (!isLive && !startRef.current) startRef.current = Date.now() - elapsed; }}
            style={{ fontSize: 12, padding: "5px 10px", background: isLive ? "var(--color-background-danger)" : "var(--color-background-success)", color: isLive ? "var(--color-text-danger)" : "var(--color-text-success)", border: `0.5px solid ${isLive ? "var(--color-border-danger)" : "var(--color-border-success)"}` }}
          >
            <i className={`ti ${isLive ? "ti-player-pause" : "ti-player-play"}`} style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
            {isLive ? "Pause" : "Start"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Signals detected", value: firedSignals.current.size },
          { label: "Tier 1 accounts", value: tier1.length },
          { label: "Enrolled", value: enrolled },
          { label: "Discarded", value: firedDiscards.current.size },
        ].map(s => (
          <div key={s.label} style={{ padding: "8px 10px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-secondary)" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main 3-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: selectedId ? "220px 1fr 260px" : "220px 1fr", gap: 12 }}>
        {/* Col 1 — Signal feed */}
        <div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Signal feed</div>
          {signalFeed.length === 0 && discardFeed.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", padding: "12px 0" }}>
              {isLive ? "Monitoring..." : "Press Start to begin"}
            </div>
          )}
          {discardFeed.slice(0, 2).map((d, i) => <DiscardRow key={`d${i}`} item={d} />)}
          {signalFeed.slice(0, 10).map((s, i) => (
            <div key={i} style={{ padding: "7px 10px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 2, textTransform: "capitalize" }}>
                {s.source?.replace(/_/g, " ")} · {s.accountName}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.4, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {s.rawContent}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 99, background: "#EAF3DE", color: "#27500A" }}>✓ +{s.points}</span>
                <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{s.recencyDays}d ago</span>
              </div>
            </div>
          ))}
        </div>

        {/* Col 2 — Account pipeline */}
        <div>
          {tier1.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tier 1 · Active outbound</span>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: "#EAF3DE", color: "#27500A" }}>{tier1.length}</span>
              </div>
              {tier1.map(a => (
                <AccountCard key={a.id} account={a} selected={selectedId === a.id} onClick={() => setSelectedId(selectedId === a.id ? null : a.id)} />
              ))}
            </div>
          )}

          {tier2.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tier 2 · Monitoring</span>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: "#FAEEDA", color: "#633806" }}>{tier2.length}</span>
              </div>
              {tier2.map(a => (
                <AccountCard key={a.id} account={a} selected={selectedId === a.id} onClick={() => setSelectedId(selectedId === a.id ? null : a.id)} />
              ))}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Monitoring</span>
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>{monitoring.length}</span>
            </div>
            {monitoring.map(a => (
              <AccountCard key={a.id} account={a} selected={selectedId === a.id} onClick={() => setSelectedId(selectedId === a.id ? null : a.id)} />
            ))}
          </div>

          {/* API log */}
          {apiLog.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>API log</div>
              {apiLog.slice(0, 6).map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", padding: "3px 0", fontSize: 11, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <span style={{
                    fontSize: 10, padding: "1px 5px", borderRadius: 99, fontFamily: "var(--font-mono)",
                    background: l.method === "DISCARD" ? "#FAEEDA" : l.status >= 400 ? "#FCEBEB" : "#EAF3DE",
                    color: l.method === "DISCARD" ? "#633806" : l.status >= 400 ? "#791F1F" : "#27500A",
                  }}>
                    {l.method === "DISCARD" ? "GATE" : l.method}
                  </span>
                  <span style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{l.path}</span>
                  {l.account && <span style={{ color: "var(--color-text-tertiary)", fontSize: 10, flexShrink: 0 }}>{l.account}</span>}
                  <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 10, flexShrink: 0 }}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 3 — Detail panel */}
        {selectedId && (
          <DetailPanel account={selectedAccount} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
