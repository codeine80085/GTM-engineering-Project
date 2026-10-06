import { getCopyForLead, MUTATION_RULES } from '../data/copyTemplates.js';

// Fallback logic if LLM fails
function generateFallbackHook(signal) {
  if (!signal) return "Noticed you're scaling up operations.";
  if (signal.type === 'expressed_pain') return `Saw your post on ${signal.source} about data quality issues. ${signal.rawContent ? `"${signal.rawContent.substring(0, 50)}..."` : ''} - completely understand the frustration.`;
  if (signal.type === 'funding') return `Congrats on the recent funding round! I imagine you're looking to scale the GTM team quickly now.`;
  if (signal.type === 'hiring') return `Noticed you're actively hiring SDRs and GTM roles right now.`;
  if (signal.type === 'tech_stack') return `Saw you're using tools like Clay and Apollo for outbound.`;
  if (signal.type === 'competitor_follow') return `Noticed you were exploring some of the other data providers recently.`;
  if (signal.type === 'instagram_comment' || signal.type === 'web_scrape_signal') return `Saw your comment about looking for alternatives in the outbound space.`;
  return "Noticed your recent activity scaling up outbound.";
}

export async function generateCopy(lead, signals, templateVersion = 1, options = {}) {
  const baseCopy = getCopyForLead(lead);
  const topSignal = (signals && signals.length > 0) ? [...signals].sort((a, b) => b.points - a.points)[0] : null;
  
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  let generatedHook = generateFallbackHook(topSignal);
  let generatedBy = options.skipLlm ? 'saved_snapshot' : 'fallback';

  if (!options.skipLlm && apiKey && topSignal) {
    try {
      const prompt = `You are an expert B2B copywriter writing a cold email to ${lead.name}.
Write ONLY the opening sentence (the 'hook') for an email. 
The hook MUST specifically mention this intent signal we found: Type is '${topSignal.type}' from '${topSignal.source}'. Detail: "${topSignal.rawContent || 'Unknown'}".
Make it sound extremely casual, short, and natural. Do not use corporate speak. Max 25 words. Do not wrap in quotes or add greetings.`;

      const response = await fetch('/nvidia-api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          generatedHook = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
          generatedBy = 'nvidia_llm';
        }
      }
    } catch (err) {
      console.warn("LLM hook generation failed, using fallback:", err);
    }
  }

  const processTemplate = (text) => {
    if (!text) return text;
    return text
      .replace(/{{name}}/g, 'FirstName')
      .replace(/{{company}}/g, lead.name)
      .replace(/{{signal_hook}}/g, generatedHook);
  };
  
  return {
    email: {
      subject: processTemplate(baseCopy.email.subject),
      body: processTemplate(baseCopy.email.body)
    },
    linkedin: {
      body: processTemplate(baseCopy.linkedin.body)
    },
    meta: {
      generatedBy,
      topSignal: topSignal ? {
        type: topSignal.type,
        source: topSignal.source,
        rawContent: topSignal.rawContent,
        points: topSignal.points
      } : null,
      hook: generatedHook
    }
  };
}

// Compute simple word-level diff
function computeDiff(oldText, newText) {
  // A naive structural diff block generator for visual UI
  const oldSentences = oldText.split(/(?<=\.|\?|\!)\s+/);
  const newSentences = newText.split(/(?<=\.|\?|\!)\s+/);
  
  const diff = [];
  
  // Find removed sentences
  oldSentences.forEach(s => {
    if (s.length > 5 && !newText.includes(s)) {
      diff.push({ type: 'removed', text: s });
    }
  });
  
  // Find added sentences
  newSentences.forEach(s => {
    if (s.length > 5 && !oldText.includes(s)) {
      diff.push({ type: 'added', text: s });
    }
  });
  
  if (diff.length === 0) {
    diff.push({ type: 'added', text: 'Minor grammar/tonal adjustments made.' });
  }
  
  return diff;
}

export async function mutateCopy(currentCopy, replyType, lead) {
  const rule = MUTATION_RULES[replyType];
  if (!rule || rule.action === 'keep') {
    return { 
      mutatedCopy: {
        ...currentCopy,
        meta: { ...(currentCopy.meta || {}), lastMutationBy: 'none', winningVariant: true }
      }, 
      diff: [], 
      ruleApplied: rule 
    };
  }
  
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  const mutatedCopy = JSON.parse(JSON.stringify(currentCopy));
  let oldBody = mutatedCopy.email.body;
  let newBody = oldBody;
  let mutationBy = 'fallback';

  if (apiKey) {
    try {
      const prompt = `You are a B2B sales expert refining a cold email sequence. 
The prospect replied with a "${replyType}" sentiment.
Our rule for this sentiment is: ${rule.changes.join(', ')}.

Here is the original email body:
"""
${oldBody}
"""

Rewrite the email body applying ONLY the rules above. Keep the exact same hook and opening, but change the Call To Action or closing paragraph as instructed.
Do not add any greetings like "Here is the rewritten email". Return ONLY the raw email text.`;

      const response = await fetch('/nvidia-api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          newBody = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
          mutationBy = 'nvidia_llm';
        }
      }
    } catch (err) {
      console.warn("LLM mutation failed, using fallback regex:", err);
      // Fallback regex logic from before
      if (replyType === 'not_now') {
        newBody = oldBody.replace(/Open to seeing how it works\?|Worth a 10-minute chat\?|Can I send over a quick video of how it works\?/g, 'No rush on this, but let me know when timing makes sense to connect.');
      } else if (replyType === 'wrong_person') {
        newBody = oldBody + "\n\nIf you aren't the right person for this, who leads outbound ops for your team?";
      } else if (replyType === 'objection') {
        newBody = oldBody.replace(/\n\nWe built a signal-based engine|\n\nWe help teams/g, '\n\nWe just helped a similar company increase meetings by 40% using this approach. We help teams');
      }
    }
  } else {
    // Fallback if no API key
    if (replyType === 'not_now') {
      newBody = oldBody.replace(/Open to seeing how it works\?|Worth a 10-minute chat\?|Can I send over a quick video of how it works\?/g, 'No rush on this, but let me know when timing makes sense to connect.');
    } else if (replyType === 'wrong_person') {
      newBody = oldBody + "\n\nIf you aren't the right person for this, who leads outbound ops for your team?";
    } else if (replyType === 'objection') {
      newBody = oldBody.replace(/\n\nWe built a signal-based engine|\n\nWe help teams/g, '\n\nWe just helped a similar company increase meetings by 40% using this approach. We help teams');
    }
  }

  mutatedCopy.email.body = newBody;
  mutatedCopy.meta = {
    ...(mutatedCopy.meta || {}),
    lastMutationBy: mutationBy,
    replyType,
    mutationRule: rule.action
  };
  const diff = computeDiff(oldBody, newBody);

  return { mutatedCopy, diff, ruleApplied: rule };
}

export function getCopyDiff(oldCopy, newCopy) {
  if (oldCopy.email.body === newCopy.email.body) return [{ type: 'unchanged', text: newCopy.email.body }];
  return computeDiff(oldCopy.email.body, newCopy.email.body);
}

const correlationData = {};
export function trackCorrelation(lead, replyType) {
  const signals = lead.signals || [];
  signals.forEach(s => {
    if (!correlationData[s.type]) {
      correlationData[s.type] = { interested: 0, not_now: 0, wrong_person: 0, objection: 0, total: 0 };
    }
    if (correlationData[s.type][replyType] !== undefined) correlationData[s.type][replyType]++;
    correlationData[s.type].total++;
  });
}
export function getCorrelationStats() { return correlationData; }
