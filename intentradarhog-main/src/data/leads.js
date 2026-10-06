import { generateCopy } from '../engine/copyEngine.js';

const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Jamie', 'Chris', 'Pat'];
const icpTypes = ['agency', 'saas', 'creator'];
const techStacks = [['Clay', 'Smartlead'], ['Apollo', 'Salesforce'], ['HubSpot', 'ZoomInfo'], ['Outreach', 'Clearbit']];
const replyTypes = ['interested', 'not_now', 'wrong_person', 'objection', 'no_reply'];
const bandWeights = [
  { band: 'A', scoreRange: [85, 100] },
  { band: 'B', scoreRange: [70, 84] },
  { band: 'C', scoreRange: [40, 69] },
  { band: 'D', scoreRange: [10, 39] }
];

const generatedLeads = Array.from({ length: 100 }).map((_, index) => {
  const icp = icpTypes[index % 3]; // approx 33 each
  // Create a distribution: ~15 A, ~20 B, ~30 C, ~35 D
  let bandObj;
  if (index < 15) bandObj = bandWeights[0];
  else if (index < 35) bandObj = bandWeights[1];
  else if (index < 65) bandObj = bandWeights[2];
  else bandObj = bandWeights[3];
  
  const score = Math.floor(Math.random() * (bandObj.scoreRange[1] - bandObj.scoreRange[0] + 1)) + bandObj.scoreRange[0];
  const name = `Company ${index + 1} (${icp})`;
  
  const lead = {
    id: `lead_${index}`,
    name: name,
    domain: `company${index}.com`,
    icp: icp,
    score: score,
    band: bandObj.band,
    signals: [
      { type: 'expressed_pain', source: 'reddit', points: 30, recencyDays: Math.floor(Math.random() * 5) + 1, rawContent: 'Anyone else seeing Apollo bounce rates spike?' }
    ],
    status: score >= 70 ? 'enrolled' : 'monitoring',
    route: score >= 70 ? (icp === 'agency' ? 'heyreach' : icp === 'saas' ? 'smartlead' : 'partner_dm') : null,
    funding: icp === 'saas' ? { stage: 'Series A', amount: '$4.8M', daysAgo: Math.floor(Math.random() * 60) } : null,
    employeeCount: Math.floor(Math.random() * 50) + 5,
    techStack: techStacks[index % techStacks.length],
    replyType: score >= 70 ? replyTypes[index % replyTypes.length] : 'no_reply',
    replyReceived: false, // will flip to true during simulation
    copyVersion: 1,
    copyMutations: 0,
    dealSize: icp === 'saas' ? '$1k-2k/mo' : '$500-1k/mo',
    icpValidation: { pass: true, icp: icp, dealSize: '$500-1k/mo' },
    brief: score >= 70 ? {
      painSummary: 'Struggling with data decay and manual list building',
      buyingReadiness: 'High - active evaluation mode',
      recommendedAngle: 'Focus on signal-to-noise ratio and automated routing',
      keyFacts: ['Recently raised funding', 'Hiring 3 SDRs']
    } : null,
    contacts: score >= 70 ? [
      { name: firstNames[index % firstNames.length] + ' Smith', title: 'VP Sales', email: `vp@company${index}.com`, confidence: 0.95 }
    ] : []
  };
  
  // Copy will be generated asynchronously by App.jsx
  lead.currentCopy = null;
  return lead;
});

export const SEED_LEADS = generatedLeads;

export const SIGNAL_EVENTS = [
  // These should PASS Stage 1 (have intent keywords + valid roles)
  { type: 'expressed_pain', source: 'reddit', points: 30, recencyDays: 1, rawContent: 'Apollo data quality is killing our reply rates — bounce rates above 40% this month', authorRole: 'VP Sales' },
  { type: 'expressed_pain', source: 'linkedin', points: 30, recencyDays: 2, rawContent: 'Evaluating alternatives to Apollo and ZoomInfo. Data enrichment accuracy is terrible lately.', authorRole: 'Head of Revenue' },
  { type: 'hiring', source: 'greenhouse', points: 20, recencyDays: 3, rawContent: 'New post: SDR Manager — must have experience with outbound prospecting tools', authorRole: 'CEO' },
  { type: 'funding', source: 'crunchbase', points: 25, recencyDays: 5, rawContent: 'Raised $4.2M Series A to scale outbound GTM stack and SDR team', authorRole: 'Founder' },
  { type: 'tech_stack', source: 'hog_enrichment', points: 15, recencyDays: 0, rawContent: 'Detected Clay + Smartlead in tech stack — actively using outbound sequencing tools', authorRole: null },
  { type: 'expressed_pain', source: 'twitter', points: 30, recencyDays: 1, rawContent: 'Frustrated with our current enrichment provider. Contact accuracy below 50%. Looking for a replacement for ZoomInfo.', authorRole: 'Co-Founder' },
  { type: 'competitor_follow', source: 'instagram', points: 10, recencyDays: 0, rawContent: 'Founder follows Apollo, Clay, and HeyReach accounts — evaluating GTM stack options', authorRole: 'Founder' },
  { type: 'expressed_pain', source: 'reddit', points: 30, recencyDays: 4, rawContent: 'Switching from Apollo to something better. Tired of bad data quality and high bounce rates on outbound.', authorRole: 'Growth Lead' },
  { type: 'hiring', source: 'linkedin', points: 20, recencyDays: 7, rawContent: 'Hiring GTM Engineer to build our RevOps infrastructure from scratch', authorRole: 'CTO' },
  { type: 'founder_active', source: 'linkedin', points: 15, recencyDays: 0, rawContent: 'CEO posted about rebuilding their entire outbound prospecting workflow with Clay and intent data', authorRole: 'CEO' },
  { type: 'expressed_pain', source: 'reddit', points: 30, recencyDays: 2, rawContent: 'Our SDR team is drowning in bad leads from Lusha. Need a signal-based approach to prospecting.', authorRole: 'Sales Director' },
  { type: 'deep_research', source: 'deep_research', points: 35, recencyDays: 0, rawContent: 'Deep research found multiple Reddit threads where company founders are evaluating Apollo alternatives for outbound enrichment', authorRole: null },
  { type: 'instagram_comment', source: 'instagram', points: 20, recencyDays: 1, rawContent: 'Does this Clay workflow integrate with Smartlead? Looking for a better outbound sequencing setup.', authorRole: 'Founder' },
  { type: 'expressed_pain', source: 'twitter', points: 30, recencyDays: 3, rawContent: 'Our contact accuracy with ZoomInfo dropped to 30%. Alternative to their enrichment? Frustrated with the data quality.', authorRole: 'Director of Sales' },
  { type: 'hiring', source: 'greenhouse', points: 20, recencyDays: 10, rawContent: 'SDR x3 open roles — must have prospecting and outbound experience', authorRole: 'VP Sales' },
  { type: 'tech_stack', source: 'web_scrape', points: 15, recencyDays: 0, rawContent: 'Careers page mentions Apollo, HubSpot, and Outreach — active outbound stack with data quality concerns', authorRole: null },
  { type: 'expressed_pain', source: 'linkedin', points: 30, recencyDays: 1, rawContent: 'Just cancelled our Lusha contract. Bounce rate was embarrassing. Evaluating Clay + custom enrichment stack.', authorRole: 'Head of Growth' },
  { type: 'funding', source: 'crunchbase', points: 25, recencyDays: 14, rawContent: 'Closed $8M Series B to double their outbound SDR team and rebuild GTM stack', authorRole: 'Founder' },
  { type: 'expressed_pain', source: 'reddit', points: 30, recencyDays: 6, rawContent: 'We tried every enrichment tool — Apollo, Lusha, Clearbit. Contact accuracy is still garbage for outbound.', authorRole: 'RevOps' },
  { type: 'competitor_follow', source: 'instagram', points: 10, recencyDays: 0, rawContent: 'CRO follows ZoomInfo, Apollo, and Gong accounts — clearly evaluating GTM stack upgrades', authorRole: 'Chief Revenue Officer' },
  { type: 'expressed_pain', source: 'linkedin', points: 30, recencyDays: 0, rawContent: 'Looking for an alternative to our current prospecting setup. Apollo data quality has dropped significantly.', authorRole: 'CEO' },
  { type: 'hiring', source: 'linkedin', points: 20, recencyDays: 2, rawContent: 'Hiring a RevOps lead to overhaul our outbound sequencing and enrichment pipeline', authorRole: 'CTO' },
  { type: 'deep_research', source: 'deep_research', points: 35, recencyDays: 0, rawContent: 'Research reveals company is actively evaluating intent data providers and switching from Apollo for prospecting', authorRole: null },
  { type: 'expressed_pain', source: 'twitter', points: 30, recencyDays: 5, rawContent: 'If anyone has found a good replacement for ZoomInfo enrichment, DM me. Tired of the bounce rates.', authorRole: 'Founder' },
  { type: 'founder_active', source: 'linkedin', points: 15, recencyDays: 1, rawContent: 'Founder posted a detailed thread about rebuilding their Clay outbound workflow with signal-based routing', authorRole: 'Founder' },
];

export const DISCARDED_SIGNALS = [
  // These should FAIL Stage 1 — shown as grey cards in the discard feed
  { type: 'noise', source: 'twitter', rawContent: 'I love outbound marketing! Great vibes today 🔥', authorRole: 'Student', discardReason: 'invalid_role', discardDetail: 'Role "Student" is disqualified' },
  { type: 'noise', source: 'reddit', rawContent: 'What is the best CRM for a small business?', authorRole: 'Freelancer', discardReason: 'invalid_role', discardDetail: 'Role "Freelancer" is disqualified' },
  { type: 'noise', source: 'linkedin', rawContent: 'Just finished my internship! Open to opportunities in sales.', authorRole: 'Intern', discardReason: 'invalid_role', discardDetail: 'Role "Intern" is disqualified' },
  { type: 'noise', source: 'reddit', rawContent: 'Apollo is great for our team, no complaints at all', authorRole: 'VP Sales', discardReason: 'no_keyword_match', discardDetail: 'No pain or evaluation intent detected' },
  { type: 'noise', source: 'instagram', rawContent: '🔥🔥🔥 Great post!', authorRole: null, discardReason: 'no_keyword_match', discardDetail: 'No high-intent keywords detected' },
  { type: 'noise', source: 'twitter', rawContent: 'Thinking about getting into sales someday', authorRole: 'Job Seeker', discardReason: 'invalid_role', discardDetail: 'Role "Job Seeker" is disqualified' },
  { type: 'noise', source: 'reddit', rawContent: 'I heard Clay is cool but never tried it. Anyone use it for personal stuff?', authorRole: 'Looking for work', discardReason: 'invalid_role', discardDetail: 'Role "Looking for work" is disqualified' },
  { type: 'stale', source: 'linkedin', rawContent: 'We switched from Apollo to ZoomInfo two years ago. Much better enrichment data quality.', authorRole: 'CEO', recencyDays: 90, discardReason: 'stale_signal', discardDetail: 'Signal is 90 days old (max 60)' },
  { type: 'noise', source: 'twitter', rawContent: 'Sales coaching changed my life! DM for free consultation', authorRole: 'Coach', discardReason: 'invalid_role', discardDetail: 'Role "Coach" is disqualified' },
  { type: 'noise', source: 'reddit', rawContent: 'Following this thread for later', authorRole: null, discardReason: 'no_keyword_match', discardDetail: 'No high-intent keywords detected' },
];
