// Stage 1: pre-filter signals before enrichment.
// Signals that fail this gate are discarded with zero credits spent.

const VALID_ROLES = [
  "founder", "co-founder", "ceo", "cto", "vp sales",
  "head of revenue", "head of growth", "revops", "revenue operations",
  "gtm engineer", "sales director", "outbound lead", "growth lead",
  "director of sales", "chief revenue officer", "cro", "clay expert",
  "apollo expert", "gtm consultant", "automation consultant"
];

const INVALID_ROLES = [
  "student", "intern", "looking for work", "open to opportunities",
  "job seeker", "freelancer", "coach", "consultant"
];

const HIGH_INTENT_KEYWORDS = [
  "apollo", "clay", "zoominfo", "lusha", "enrichment", "data quality",
  "bounce rate", "contact accuracy", "outbound", "prospecting", "sdr",
  "gtm stack", "intent data", "signal", "revops", "sequencing",
  "alternative to", "looking for", "evaluating", "switching from",
  "replacement for", "frustrated with", "tired of"
];

export function preFilterSignal(signal) {
  if (signal.authorRole) {
    const role = signal.authorRole.toLowerCase();
    if (INVALID_ROLES.some(r => role.includes(r))) {
      return { pass: false, reason: 'invalid_role', detail: `Role "${signal.authorRole}" is disqualified` };
    }
    if (!VALID_ROLES.some(r => role.includes(r))) {
      return { pass: false, reason: 'unverified_role', detail: `Role "${signal.authorRole}" not in valid list` };
    }
  }

  const content = (signal.rawContent || '').toLowerCase();
  const keywordMatch = HIGH_INTENT_KEYWORDS.filter(k => content.includes(k));
  if (keywordMatch.length === 0 && content.length > 0) {
    return { pass: false, reason: 'no_keyword_match', detail: 'No high-intent keywords detected' };
  }

  const recencyDays = signal.recencyDays ?? 0;
  if (recencyDays > 60) {
    return { pass: false, reason: 'stale_signal', detail: `Signal is ${recencyDays} days old (max 60)` };
  }

  return { pass: true, keywordsMatched: keywordMatch, recencyDays };
}

// Stage 2: ICP and deal-size validation after enrichment.
// Only runs on signals that passed Stage 1.

export const ICP_GATES = {
  agency: {
    employeeCount: { min: 1, max: 50 },
    requiredTechStack: ["Clay", "Smartlead", "Apollo", "HeyReach", "n8n"],
    techStackMatchMin: 1,
    fundingRequired: false,
    estimatedDealSize: "$200-500/mo",
    disqualifyIf: ["enterprise", "non-GTM agency", "consumer brand"]
  },

  expert: {
    followerMin: 500,
    engagementRateMin: 0.03,
    topicsRequired: ["Clay", "Apollo", "outbound", "GTM", "enrichment", "RevOps", "n8n"],
    topicMatchMin: 1,
    estimatedDealSize: "$100-300/mo or channel value",
    disqualifyIf: ["non-GTM content", "general creator", "student audience"]
  }
};

export function validateICP(enrichmentData, detectedICP) {
  if (!detectedICP || !ICP_GATES[detectedICP]) {
    return { pass: false, reasons: ['no_icp_detected'], dealSize: null };
  }

  const gate = ICP_GATES[detectedICP];
  const reasons = [];

  if (gate.employeeCount) {
    const emp = enrichmentData.employeeCount || 0;
    if (emp < gate.employeeCount.min || emp > gate.employeeCount.max) {
      reasons.push(`employee_count_out_of_range: ${emp} (need ${gate.employeeCount.min}-${gate.employeeCount.max})`);
    }
  }

  if (gate.requiredTechStack) {
    const stack = enrichmentData.techStack || [];
    const matches = gate.requiredTechStack.filter(t =>
      stack.some(s => s.toLowerCase().includes(t.toLowerCase()))
    );
    if (matches.length < gate.techStackMatchMin) {
      reasons.push('tech_stack_no_match');
    }
  }

  if (gate.followerMin) {
    const followers = enrichmentData.followerCount || 0;
    if (followers < gate.followerMin) {
      reasons.push(`follower_count_too_low: ${followers} (need ${gate.followerMin}+)`);
    }
  }

  if (gate.topicsRequired) {
    const bio = (enrichmentData.bio || '').toLowerCase();
    const topicMatches = gate.topicsRequired.filter(t => bio.includes(t.toLowerCase()));
    if (topicMatches.length < gate.topicMatchMin) {
      reasons.push('no_gtm_topic_match_in_bio');
    }
  }

  if (reasons.length > 0) {
    return { pass: false, reasons, dealSize: null, icp: detectedICP };
  }

  return {
    pass: true,
    icp: detectedICP,
    dealSize: gate.estimatedDealSize,
    reasons: []
  };
}

const EVENT_GROUPS = {
  hiring:  ["hiring", "hiring_gtm", "hiring_sdr"],
  pain:    ["expressed_pain"],
  social:  ["founder_active", "instagram_comment", "web_scrape_signal"],
  funding: ["funding"],
  stack:   ["tech_stack", "competitor_follow"],
  research: ["deep_research"]
};

export function countIndependentSignals(signals) {
  const seen = new Set();
  let count = 0;
  for (const s of (signals || [])) {
    const group = Object.entries(EVENT_GROUPS).find(([_, types]) =>
      types.includes(s.type)
    )?.[0] || s.type;
    if (!seen.has(group)) {
      seen.add(group);
      count++;
    }
  }
  return count;
}

export function calculateScore(signals) {
  if (!signals || signals.length === 0) return 0;

  return signals.reduce((total, signal) => {
    const days = signal.recencyDays ?? 0;
    const recencyMultiplier = days <= 7 ? 1.0
      : days <= 30 ? 0.75
      : days <= 60 ? 0.5
      : 0.25;

    return total + Math.round((signal.points || 0) * recencyMultiplier);
  }, 0);
}

export function assignBand(score, signals) {
  const independent = countIndependentSignals(signals);

  if (score >= 85 && independent >= 3) return 'A';
  if (score >= 70 && independent >= 2) return 'B';
  if (score >= 70 && independent < 2)  return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
