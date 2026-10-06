import { getReplyForType } from '../data/replySimulation.js';
import { emitApiLog } from './hogClient.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function emitSandboxLog(action, accountName) {
  emitApiLog({
    method: 'SANDBOX',
    path: action,
    account: accountName,
    status: '200',
    timeMs: Math.floor(Math.random() * 500 + 100),
    type: 'sandbox',
  });
}

async function generateAiSimulatedReply(lead) {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  if (!apiKey || lead.replyType === 'no_reply') return null;

  const topSignal = lead.signals?.[0];
  const prompt = `You are simulating a realistic B2B prospect reply for a live demo.
This is NOT a real outbound send. Write one concise reply only.

Company: ${lead.name}
ICP: ${lead.icp}
Route: ${lead.route || 'unknown'}
Expected reply type: ${lead.replyType}
Intent signal: ${topSignal?.type || 'unknown'} from ${topSignal?.source || 'unknown'} - "${topSignal?.rawContent || 'No signal text'}"
Original outreach:
"""
${lead.currentCopy?.email?.body || lead.currentCopy?.linkedin?.body || ''}
"""

Rules:
- Return only the reply body.
- Make it sound like a real founder/revenue/operator response.
- Keep it under 45 words.
- Match the expected reply type exactly:
  interested = asks for demo/workflow/pricing
  not_now = timing/budget/contract delay
  wrong_person = redirects to the right person
  objection = raises a concrete concern about switching, trust, ROI, integrations, or AI copy.`;

  try {
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
        temperature: 0.65,
        max_tokens: 120
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim().replace(/^"|"$/g, '') || null;
  } catch {
    return null;
  }
}

export const sandbox = {
  // Simulate Smartlead enrollment
  async simulateSmartlead(lead, copy) {
    emitSandboxLog('Smartlead Enrollment', lead.name);
    await delay(800);
    return { enrolled: true, campaignId: `sl_${lead.id}`, sequenceStep: 1, channel: 'email' };
  },
  
  // Simulate HeyReach LinkedIn enrollment  
  async simulateHeyReach(lead, copy) {
    emitSandboxLog('HeyReach Enrollment', lead.name);
    await delay(600);
    return { enrolled: true, sequenceId: `hr_${lead.id}`, channel: 'linkedin' };
  },

  async simulatePartnerDM(lead, copy) {
    emitSandboxLog('Expert Partner DM', lead.name);
    await delay(500);
    return { enrolled: true, sequenceId: `partner_${lead.id}`, channel: 'manual_dm' };
  },
  
  // Simulate reply webhook - fires after delay, returns classified reply
  async simulateReplyWebhook(lead, delayMs = 3000) {
    await delay(delayMs);
    if (lead.replyType === 'no_reply') return null;
    
    emitSandboxLog('Webhook Received', lead.name);
    const aiReply = await generateAiSimulatedReply(lead);
    const replyContent = aiReply || getReplyForType(lead.replyType, lead.icp);
    return { 
      leadId: lead.id, 
      replyType: lead.replyType, 
      content: replyContent, 
      simulatedBy: aiReply ? 'nvidia_llm' : 'sandbox_template',
      receivedAt: new Date().toISOString() 
    };
  }
};
