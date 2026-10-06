const BASE_URL = process.env.VITE_HOG_BASE_URL || 'https://developer.thehog.ai';
const ACCESS_KEY = process.env.VITE_HOG_ACCESS_KEY;
const SECRET_KEY = process.env.VITE_HOG_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error("❌ Credentials are not set in .env");
  process.exit(1);
}

const headers = {
  'X-Access-Key': ACCESS_KEY,
  'X-Secret-Key': SECRET_KEY,
  'Content-Type': 'application/json'
};

// Polling utility
async function pollOperation(operationId) {
  let attempts = 0;
  while (attempts < 30) {
    console.log(`⏳ Polling operation ${operationId} (Attempt ${attempts + 1}/30)...`);
    const res = await fetch(`${BASE_URL}/api/operations/${operationId}`, { headers });
    const data = await res.json();
    
    if (data.status === 'completed' || data.status === 'done' || data.data || data.result) {
      return data;
    }
    
    if (data.status === 'failed' || data.status === 'error') {
      throw new Error(`Operation failed: ${JSON.stringify(data)}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    attempts++;
  }
  throw new Error('Polling timed out.');
}

async function testDeepResearch() {
  console.log("🚀 Testing POST /api/deep-research with Reddit/X/LinkedIn Prompt...");

  try {
    const prompt = `Research Y Combinator (ycombinator.com). Specifically, search Reddit, X (Twitter), and LinkedIn for anyone at this company expressing pain points about outbound sales, lead generation, or data enrichment. Evaluate their B2B outbound strategy and buying readiness for a signal-based routing platform. Keep summaries concise.`;
    
    const schema = {
      type: "object",
      properties: {
        painSummary: { type: "string" },
        buyingReadiness: { type: "string" },
        recommendedAngle: { type: "string" },
        keyFacts: { type: "array", items: { type: "string" } }
      },
      required: ["painSummary", "buyingReadiness", "recommendedAngle", "keyFacts"]
    };

    const res = await fetch(`${BASE_URL}/api/deep-research`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        schema,
        budget: { maxCredits: 1000 },
        urls: ["https://ycombinator.com", "https://reddit.com/r/ycombinator", "https://linkedin.com/company/y-combinator"]
      })
    });
    
    const data = await res.json();
    console.log(`✅ Status: ${res.status}`);
    
    let resultData = data;
    if (data.operationId || data.id) {
      const opId = data.operationId || data.id;
      console.log(`➡️ Async operation detected: ${opId}. Starting poll...`);
      resultData = await pollOperation(opId);
    }
    
    console.log("\n🎯 Deep Research Results:");
    console.log(JSON.stringify(resultData.data || resultData.result || resultData, null, 2));

  } catch (error) {
    console.error("❌ Error running deep research test:", error.message);
  }
}

testDeepResearch();
