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

async function poll(opId) {
  let attempts = 0;
  while (attempts < 15) {
    console.log(`   ⏳ Polling ${opId}...`);
    const res = await fetch(`${BASE_URL}/api/operations/${opId}`, { headers });
    const data = await res.json();
    if (data.status === 'completed' || data.status === 'done' || data.data || data.result) return data;
    await new Promise(r => setTimeout(r, 3000));
    attempts++;
  }
  return null;
}

async function testPipeline() {
  console.log("🚀 STARTING FULL GTM PIPELINE TEST\n");

  try {
    // STEP 1: Get Companies
    console.log("1️⃣ Finding Target Companies (POST /api/v1/companies/search)...");
    const companiesRes = await fetch(`${BASE_URL}/api/v1/companies/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: "B2B SaaS using Clay",
        limit: 2, // Limiting to 2 for the test to save credits
        includeSignals: true
      })
    });
    let companiesData = await companiesRes.json();
    if (companiesData.operationId || companiesData.id) {
      companiesData = await poll(companiesData.operationId || companiesData.id) || companiesData;
    }
    
    let companies = [];
    if (companiesData.result && companiesData.result.data) companies = companiesData.result.data;
    else if (companiesData.data) companies = companiesData.data;
    else if (Array.isArray(companiesData)) companies = companiesData;
    
    if (companies.length === 0) {
      console.log("No companies found or endpoint returned an async operation ID:", companiesData);
      return;
    }
    
    const targetCompany = companies[0];
    const companyDomain = targetCompany.domain || targetCompany.website || 'clay.com';
    console.log(`✅ Found Company: ${targetCompany.name || targetCompany.company_name} (${companyDomain})\n`);

    // STEP 2: Find the Person ICP
    console.log(`2️⃣ Finding Decision Maker at ${companyDomain} (POST /api/v1/people/search)...`);
    const peopleRes = await fetch(`${BASE_URL}/api/v1/people/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `Founder or VP Sales at ${companyDomain}`,
        limit: 1,
        includeContacts: true
      })
    });
    let peopleData = await peopleRes.json();
    if (peopleData.operationId || peopleData.id) {
      peopleData = await poll(peopleData.operationId || peopleData.id) || peopleData;
    }
    
    let people = [];
    if (peopleData.result && peopleData.result.data) people = peopleData.result.data;
    else if (peopleData.data) people = peopleData.data;
    else if (Array.isArray(peopleData)) people = peopleData;
    
    let targetPersonUrl = "https://www.linkedin.com/in/example";
    if (people.length > 0) {
      const person = people[0];
      console.log(`✅ Found Target: ${person.name || person.first_name + ' ' + person.last_name} - ${person.title || person.headline}`);
      targetPersonUrl = person.linkedin_url || person.linkedin || targetPersonUrl;
    } else {
      console.log(`⚠️ No specific people returned. Using fallback LinkedIn URL for enrichment test.`);
    }
    console.log(`🔗 Target LinkedIn: ${targetPersonUrl}\n`);

    // STEP 3: Enrich the Person
    console.log(`3️⃣ Enriching Target Details (POST /api/enrichments)...`);
    const enrichRes = await fetch(`${BASE_URL}/api/enrichments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        identifier: { linkedin_url: targetPersonUrl },
        fields: ["contact.email", "contact.phone", "person.headline"]
      })
    });
    const enrichData = await enrichRes.json();
    
    if (enrichRes.status === 200 || enrichRes.status === 202) {
      console.log(`✅ Enrichment Successful (Status ${enrichRes.status}):`);
      console.log(JSON.stringify(enrichData, null, 2));
    } else {
      console.log(`❌ Enrichment Failed (Status ${enrichRes.status}):`);
      console.log(JSON.stringify(enrichData, null, 2));
    }

    console.log("\n🎉 Pipeline Test Complete!");

  } catch (error) {
    console.error("\n❌ Error running pipeline:", error.message);
  }
}

testPipeline();
