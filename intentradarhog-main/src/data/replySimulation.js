export const REPLY_CONTENT = {
  interested: {
    agency: [
      "This actually sounds really useful. We run Clay for 12 clients and data quality is a constant headache. Can you show me a live workflow?",
      "Been looking for something like this. Our Apollo enrichment has been garbage lately. When can we do a quick call?",
      "Interesting timing. We're currently evaluating our outbound stack for Q3. Do you have a deck I can review?"
    ],
    expert: [
      "This is exactly the kind of signal-first workflow I build in Clay. Can you show me how The Hog finds the pain posts?",
      "Interesting. I use Apollo and Clay a lot, but the signal quality is always the bottleneck. Can we compare workflows?",
      "This could be useful for my clients. Does it return sources from LinkedIn, Reddit, and X?"
    ]
  },
  not_now: {
    agency: [
      "Sounds cool, but we just signed an annual contract with another vendor. Reach out in 6 months.",
      "We're currently heads down on a massive client launch. Timing isn't right. Maybe next quarter."
    ],
    expert: [
      "Looks useful, but I'm heads down on client delivery this month. Circle back next quarter.",
      "I already have a Clay stack I like right now. Maybe worth revisiting after this sprint."
    ]
  },
  wrong_person: {
    agency: [
      "I'm not the right person for this. You should reach out to our VP of Sales.",
      "I handle client strategy, not internal operations. Try speaking with our RevOps lead."
    ],
    expert: [
      "I mostly advise on strategy. You probably want to talk to the person running outbound ops day to day.",
      "I don't own tool buying for this client. Their RevOps lead would be the right person."
    ]
  },
  objection: {
    agency: [
      "We already tried something similar and it didn't scale well. How are you different from standard intent data providers?",
      "This looks too expensive for our current margins. What's the ROI guarantee?"
    ],
    expert: [
      "How is this different from just scraping LinkedIn posts and pushing them into Clay?",
      "Signal quality sounds great in theory, but how do you avoid noisy Reddit and X posts?"
    ]
  }
};

export function getReplyForType(type, icp) {
  if (type === 'no_reply') return null;
  const pool = REPLY_CONTENT[type]?.[icp] || REPLY_CONTENT[type]?.['expert'] || ['Thanks for reaching out, but I am not interested at this time.'];
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
