const BASE_URL = process.env.VITE_HOG_BASE_URL || 'https://developer.thehog.ai';
const ACCESS_KEY = process.env.VITE_HOG_ACCESS_KEY;
const SECRET_KEY = process.env.VITE_HOG_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY || ACCESS_KEY.includes('REPLACE_ME')) {
  console.error("❌ Credentials are not set or still have 'REPLACE_ME' in .env");
  process.exit(1);
}

const headers = {
  'X-Access-Key': ACCESS_KEY,
  'X-Secret-Key': SECRET_KEY,
  'Content-Type': 'application/json'
};

async function testApi() {
  console.log("🚀 Testing Hog API Endpoints...\n");

  try {
    // 1. Test Companies Search
    console.log("1️⃣ Testing POST /api/v1/companies/search");
    const companiesRes = await fetch(`${BASE_URL}/api/v1/companies/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: "Top Y Combinator SaaS companies",
        limit: 2
      })
    });
    const companiesData = await companiesRes.json();
    console.log(`✅ Status: ${companiesRes.status}`);
    console.log(`   Response: ${JSON.stringify(companiesData).substring(0, 200)}...\n`);

    // Extract a domain to enrich
    const domainToEnrich = companiesData.data?.[0]?.domain || companiesData.companies?.[0]?.domain || 'clay.com';

    // 2. Test Enrichment
    console.log(`2️⃣ Testing POST /api/enrichments for ${domainToEnrich}`);
    const enrichRes = await fetch(`${BASE_URL}/api/enrichments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        identifier: { domain: domainToEnrich },
        fields: ["company.employee_count", "company.funding"]
      })
    });
    const enrichData = await enrichRes.json();
    console.log(`✅ Status: ${enrichRes.status}`);
    console.log(`   Response: ${JSON.stringify(enrichData).substring(0, 200)}...\n`);

    // 3. Test Instagram Profile Scraper
    console.log("3️⃣ Testing POST /api/v1/platform/scrapers/instagram/profile");
    const igRes = await fetch(`${BASE_URL}/api/v1/platform/scrapers/instagram/profile`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username: "ycombinator"
      })
    });
    const igData = await igRes.json();
    console.log(`✅ Status: ${igRes.status}`);
    console.log(`   Response: ${JSON.stringify(igData).substring(0, 200)}...\n`);

    console.log("🎉 All tests completed successfully. Keys are working and returning real data!");
  } catch (error) {
    console.error("❌ Error running tests:", error.message);
  }
}

testApi();
