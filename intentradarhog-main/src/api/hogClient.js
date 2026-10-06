export const apiLog = [];
let apiLogListener = null;
let totalApiCalls = 0;
const MAX_API_CALLS = 100;

export function addApiLogListener(callback) {
  apiLogListener = callback;
}

function emitLog(entry) {
  apiLog.unshift({ ...entry, id: Date.now().toString() + Math.random().toString(36).substring(7) });
  if (apiLog.length > 50) apiLog.pop(); // keep last 50
  if (apiLogListener) apiLogListener([...apiLog]);
}

export function emitApiLog(entry) {
  emitLog(entry);
}

async function hogFetch(path, options = {}) {
  if (totalApiCalls >= MAX_API_CALLS) {
    emitLog({
      method: 'GUARDRAIL',
      path: path,
      status: 'BLOCKED',
      timeMs: 0,
      type: 'error',
      error: 'Hard limit of 100 API calls reached to protect credits.'
    });
    throw new Error('Guardrail active: Maximum of 100 API calls reached.');
  }
  
  totalApiCalls++;
  const base = import.meta.env.VITE_HOG_BASE_URL || 'https://developer.thehog.ai';
  const accessKey = import.meta.env.VITE_HOG_ACCESS_KEY || '';
  const secretKey = import.meta.env.VITE_HOG_SECRET_KEY || '';
  
  const startTime = Date.now();
  
  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'X-Access-Key': accessKey,
        'X-Secret-Key': secretKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    emitLog({
      method: options.method || 'GET',
      path,
      status: res.status,
      timeMs: Date.now() - startTime,
      type: 'real'
    });
    
    if (!res.ok) {
      let details = '';
      try {
        const data = await res.clone().json();
        const validation = Array.isArray(data.errors)
          ? ` ${data.errors.map(err => err.message).join('; ')}`
          : '';
        details = data.message ? `: ${data.message}${validation}` : validation;
      } catch {
        details = '';
      }
      throw new Error(`API Error: ${res.status} ${res.statusText}${details}`);
    }
    
    return await res.json();
  } catch (error) {
    emitLog({
      method: options.method || 'GET',
      path,
      status: 'ERR',
      error: error.message,
      timeMs: Date.now() - startTime,
      type: 'real'
    });
    throw error;
  }
}

export const hogApi = {
  async companiesSearch(query, limit = 25, filters = {}, includeSignals = true) {
    return hogFetch('/api/v1/companies/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit, includeSignals, filters })
    });
  },
  
  async peopleSearch(query, limit = 25, includeContacts = true, includeSignals = true) {
    return hogFetch('/api/v1/people/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit, includeContacts, includeSignals })
    });
  },
  
  async enrich(identifier, fields = []) {
    const identifiers = Array.isArray(identifier) ? identifier : [identifier];
    return hogFetch('/api/enrichments', {
      method: 'POST',
      body: JSON.stringify({ identifiers, fields })
    });
  },
  
  async getEnrichment(id) {
    return hogFetch(`/api/enrichments/${id}`);
  },
  
  async pollOperation(operationId, onComplete, onTimeout, maxAttempts = 30, interval = 2000) {
    let attempts = 0;
    const poll = async () => {
      try {
        const result = await hogFetch(`/api/operations/${operationId}`);
        if (['succeeded', 'completed', 'done', 'partial_success'].includes(result.status)) {
          onComplete(result);
        } else if (['failed', 'cancelled'].includes(result.status)) {
          onTimeout(new Error(result.error?.message || result.error || 'Operation failed'));
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            onTimeout(new Error('Polling timed out'));
          } else {
            setTimeout(poll, interval);
          }
        }
      } catch (err) {
        onTimeout(err);
      }
    };
    setTimeout(poll, interval);
  },
  
  async deepResearch(prompt, schema = {}, budget = { maxCredits: 1000 }, urls = []) {
    return hogFetch('/api/deep-research', {
      method: 'POST',
      body: JSON.stringify({ prompt, schema, budget, urls })
    });
  },
  
  async webScrape(url, renderJs = true) {
    return hogFetch('/api/v1/platform/scrapers/web/scrape', {
      method: 'POST',
      body: JSON.stringify({ url, renderJs })
    });
  },
  
  async instagramProfile(username) {
    return hogFetch('/api/v1/platform/scrapers/instagram/profile', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
  },
  
  async instagramPosts(username, maxPosts = 20) {
    return hogFetch('/api/v1/platform/scrapers/instagram/posts', {
      method: 'POST',
      body: JSON.stringify({ username, maxPosts })
    });
  },
  
  async instagramPostDetails(postUrl) {
    return hogFetch('/api/v1/platform/scrapers/instagram/post-details', {
      method: 'POST',
      body: JSON.stringify({ postUrl })
    });
  },
  
  async instagramPostComments(postUrl, maxComments = 20, includeNested = false) {
    return hogFetch('/api/v1/platform/scrapers/instagram/post-comments', {
      method: 'POST',
      body: JSON.stringify({ postUrl, maxComments, includeNested })
    });
  },
  
  async instagramFollowers(username, maxFollowers = 100) {
    return hogFetch('/api/v1/platform/scrapers/instagram/followers', {
      method: 'POST',
      body: JSON.stringify({ username, maxFollowers })
    });
  },
  
  async instagramFollowing(username, maxFollowing = 100) {
    return hogFetch('/api/v1/platform/scrapers/instagram/following', {
      method: 'POST',
      body: JSON.stringify({ username, maxFollowing })
    });
  },
  
  async tiktokProfile(username, maxVideos = 20) {
    return hogFetch('/api/v1/platform/scrapers/tiktok/profile', {
      method: 'POST',
      body: JSON.stringify({ username, maxVideos })
    });
  }
};
