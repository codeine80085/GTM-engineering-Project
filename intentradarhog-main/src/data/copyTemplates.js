export const COPY_TEMPLATES = {
  agency: {
    email: {
      v1: { 
        subject: "Clay + Apollo intent signals for {{company}}", 
        body: "Hey {{name}},\n\n{{signal_hook}}\n\nIf you're running Clay/Apollo workflows for clients, the hard part is not building another list. It's knowing which accounts are actually showing pain right now.\n\nWe use The Hog to catch those signals, enrich the decision maker, and route only high-intent accounts into outreach.\n\nOpen to seeing the workflow?"
      }
    },
    linkedin: {
      v1: { body: "Hey {{name}} - {{signal_hook}} I had an idea for Clay/Apollo signal routing that could help your client outbound workflows." }
    }
  },
  expert: {
    email: {
      v1: {
        subject: "Signal workflow idea for {{company}}",
        body: "Hi {{name}},\n\n{{signal_hook}}\n\nYou already think in workflows, so I wanted to share a sharper way to find in-market accounts: start with pain signals from LinkedIn, Reddit, X, hiring, or tech stack changes, then enrich only the ones that match your ICP.\n\nThe Hog handles the signal + enrichment layer, and the copy adapts based on reply type.\n\nWorth comparing notes?"
      }
    },
    linkedin: {
      v1: { body: "Hi {{name}} - {{signal_hook}} Thought this could be useful for your Clay/Apollo workflows: signal-first enrichment before outreach." }
    }
  },
  creator: {
    email: {
      v1: {
        subject: "Brand deal tracking",
        body: "Hey {{name}},\n\n{{signal_hook}}\n\nI know keeping track of inbound brand deals and outbound sponsor hunting gets messy as you scale.\n\nWe built a tool that automatically identifies brands that are actively spending on sponsorships in your niche.\n\nCan I send over a quick video of how it works?"
      }
    },
    linkedin: {
      v1: { body: "Love the channel {{name}}. We're helping creators automate their sponsor outreach using intent signals. Would love to connect and share more." }
    }
  }
};

export const MUTATION_RULES = {
  interested: { action: 'keep', note: 'Winning variant — no changes' },
  not_now: { action: 'soften_cta', changes: ['Remove urgency', 'Add "when timing is better" hook', 'Soften close'] },
  wrong_person: { action: 'retarget', changes: ['Adjust title targeting', 'Add referral ask', 'Broaden role language'] },
  objection: { action: 'add_proof', changes: ['Add benchmark data', 'Address specific objection', 'Add risk reversal'] }
};

export function getCopyForLead(lead) {
  const icpTemplates = COPY_TEMPLATES[lead.icp] || COPY_TEMPLATES['expert'];
  return {
    email: { ...icpTemplates.email.v1 },
    linkedin: { ...icpTemplates.linkedin.v1 }
  };
}
