import { mutateCopy, trackCorrelation } from './copyEngine.js';

const REPLY_TREATMENTS = {
  interested: {
    label: 'Keep winning copy',
    nextAction: 'Route to founder/demo workflow and mark this signal-copy pairing as a winner.',
    shouldMutate: false
  },
  not_now: {
    label: 'Soften follow-up',
    nextAction: 'Move to a timing-based nurture path and rewrite the CTA around checking back later.',
    shouldMutate: true
  },
  wrong_person: {
    label: 'Retarget persona',
    nextAction: 'Ask for the correct owner, widen the title targeting, and queue a referral-style follow-up.',
    shouldMutate: true
  },
  objection: {
    label: 'Add proof',
    nextAction: 'Address the specific concern with proof, switching-risk reduction, or integration detail.',
    shouldMutate: true
  },
  no_reply: {
    label: 'Wait',
    nextAction: 'No mutation yet. Keep the account in sequence until a real reply signal appears.',
    shouldMutate: false
  }
};

export function classifyReply(replyText) {
  // Mock classifier - in production this uses an LLM
  const lower = replyText.toLowerCase();
  
  if (lower.includes('show me') || lower.includes('demo') || lower.includes('chat') || lower.includes('interesting timing')) {
    return { type: 'interested', confidence: 0.92 };
  }
  
  if (lower.includes('not right now') || lower.includes('contract') || lower.includes('timing') || lower.includes('next quarter') || lower.includes('frozen')) {
    return { type: 'not_now', confidence: 0.88 };
  }
  
  if (lower.includes('not the right person') || lower.includes('reach out to') || lower.includes('try speaking with') || lower.includes('remove me')) {
    return { type: 'wrong_person', confidence: 0.95 };
  }
  
  if (lower.includes('expensive') || lower.includes('already tried') || lower.includes('don\'t believe') || lower.includes('months')) {
    return { type: 'objection', confidence: 0.85 };
  }
  
  return { type: 'no_reply', confidence: 1.0 };
}

export async function processReply(lead, reply) {
  const classification = classifyReply(reply.content);
  const treatment = REPLY_TREATMENTS[classification.type] || REPLY_TREATMENTS.no_reply;
  
  // Track correlation for analytics
  trackCorrelation(lead, classification.type);
  
  // Trigger async copy mutation via LLM
  const { mutatedCopy, diff, ruleApplied } = await mutateCopy(lead.currentCopy, classification.type, lead);
  const didMutate = treatment.shouldMutate && ruleApplied?.action !== 'keep';
  
  return {
    classification,
    treatment,
    mutatedCopy,
    diff,
    ruleApplied,
    leadUpdates: { 
      replyReceived: true, 
      replyType: classification.type, 
      replySimulatedBy: reply.simulatedBy || 'sandbox_template',
      replyClassificationConfidence: classification.confidence,
      replyTreatment: treatment,
      copyVersion: didMutate ? (lead.copyVersion || 1) + 1 : (lead.copyVersion || 1),
      copyMutations: didMutate ? (lead.copyMutations || 0) + 1 : (lead.copyMutations || 0),
      currentCopy: mutatedCopy,
      nextAction: treatment.nextAction
    }
  };
}

export function runCalibration(leads) {
  // Placeholder for the calibration loop that updates templates
  // based on aggregate signal-to-reply performance
  return {
    calibratedAt: new Date().toISOString(),
    adjustments: [
      { signal: 'funding', weightChange: -0.1, reason: 'Low interested reply rate' },
      { signal: 'expressed_pain', weightChange: +0.2, reason: 'High conversion to interested' }
    ]
  };
}
