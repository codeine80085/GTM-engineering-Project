import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard.jsx';
import CopyEvolution from './components/CopyEvolution.jsx';
import { SEED_LEADS, SIGNAL_EVENTS, DISCARDED_SIGNALS } from './data/leads.js';
import { calculateScore, assignBand, preFilterSignal, validateICP } from './engine/scoring.js';
import { processReply } from './engine/replyLoop.js';
import { sandbox } from './api/sandboxClient.js';
import { addApiLogListener, hogApi } from './api/hogClient.js';
import { generateCopy } from './engine/copyEngine.js';

const ENGINE_LEAD_LIMIT = 5;

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [signalFeed, setSignalFeed] = useState([]);
  const [discardFeed, setDiscardFeed] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [isLive, setIsLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [apiLog, setApiLog] = useState([]);
  const [showEvolution, setShowEvolution] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const eventsFired = useRef(0);
  const discardFired = useRef(0);
  const previewAiStarted = useRef(new Set());
  const engineLeadIds = useRef(new Set());
  const engineHogStarted = useRef(new Set());

  const normalizeCompanyExports = (...exports) => {
    const seen = new Set();
    const companies = [];

    exports.forEach((payload) => {
      const rows = Array.isArray(payload)
        ? payload.flatMap(item => item?.data?.data || item?.data || item || [])
        : (payload?.data || []);

      rows.forEach((company) => {
        if (!company || !company.name) return;
        const key = company.domain || company.linkedinUrl || company.name;
        if (seen.has(key)) return;
        seen.add(key);
        companies.push(company);
      });
    });

    return companies;
  };

  const cleanCompanyDomain = (company, index) => {
    const rawDomain = company.domain || company.website || '';
    const rawLinkedIn = company.linkedinUrl || company.linkedin_url || '';
    const isLinkedInDomain = rawDomain.toLowerCase().includes('linkedin.com');

    if (rawDomain && !isLinkedInDomain) {
      return rawDomain
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0];
    }

    return `unknown-domain-${index + 1}.local`;
  };

  const cleanLinkedInUrl = (company) => {
    if (company.linkedinUrl || company.linkedin_url) return company.linkedinUrl || company.linkedin_url;
    const rawDomain = company.domain || '';
    if (rawDomain.toLowerCase().includes('linkedin.com')) {
      return rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;
    }
    return null;
  };
  
  useEffect(() => {
    addApiLogListener((logs) => {
      setApiLog(logs);
    });
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Main Simulation Loop
  useEffect(() => {
    let timer;
    if (isLive) {
      timer = setInterval(() => {
        setElapsed(e => e + 1);
        
        // Fire live signals — route through Stage 1 gate
        if (Math.random() > 0.6 && accounts.length > 0) {
          const engineAccounts = accounts.filter(a => engineLeadIds.current.has(a.id));
          const randomAcc = engineAccounts[Math.floor(Math.random() * engineAccounts.length)];
          if (!randomAcc) return;
          
          // Occasionally trigger a real web scrape for signals
          if (Math.random() > 0.8) {
            hogApi.webScrape(`https://${randomAcc.domain}`).then(scrapeRes => {
              const content = scrapeRes.data?.content || scrapeRes.content || 'Detected website changes';
              const rawSignal = {
                accountId: randomAcc.id,
                type: 'web_scrape_signal',
                source: 'website',
                points: 25,
                recencyDays: 0,
                rawContent: content.substring(0, 100),
                authorRole: null
              };
              
              routeSignalThroughGate(rawSignal);
            }).catch(() => {});
          } else if (eventsFired.current < SIGNAL_EVENTS.length) {
            const rawSignal = { ...SIGNAL_EVENTS[eventsFired.current], accountId: randomAcc.id };
            eventsFired.current++;
            routeSignalThroughGate(rawSignal);
          }
        }
        
        // Also fire explicit discard demos
        if (Math.random() > 0.75 && discardFired.current < DISCARDED_SIGNALS.length) {
          const dSignal = { 
            ...DISCARDED_SIGNALS[discardFired.current],
            discardReason: DISCARDED_SIGNALS[discardFired.current].discardReason || 'no_keyword_match',
            discardDetail: DISCARDED_SIGNALS[discardFired.current].discardDetail || 'No high-intent keywords detected'
          };
          discardFired.current++;
          setDiscardFeed(prev => [dSignal, ...prev].slice(0, 15));
        }
        
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isLive, accounts]);

  useEffect(() => {
    if (!isLive || accounts.length === 0) return;

    const guardedLeads = accounts.slice(0, ENGINE_LEAD_LIMIT);
    guardedLeads.forEach(lead => engineLeadIds.current.add(lead.id));

    guardedLeads.forEach(lead => {
      if (engineHogStarted.current.has(lead.id)) return;
      engineHogStarted.current.add(lead.id);

      setAccounts(curr => curr.map(a => a.id === lead.id ? {
        ...a,
        apiSource: 'Hog live workflow',
        engineGuardrail: `Live engine limited to first ${ENGINE_LEAD_LIMIT} leads`
      } : a));

      runRealDeepResearch(lead.id, lead.name, lead.domain);
      if (!lead.domainUnavailable) {
        runRealPeopleEnrich(lead.id, lead.name, lead.domain);
      }

      if (lead.route === 'heyreach') {
        sandbox.simulateHeyReach(lead, lead.currentCopy);
      } else {
        sandbox.simulatePartnerDM(lead, lead.currentCopy);
      }
    });
  }, [isLive, accounts]);
  
  const routeSignalThroughGate = (rawSignal) => {
    const filterResult = preFilterSignal(rawSignal);
    
    if (!filterResult.pass) {
      const discarded = {
        ...rawSignal,
        discardReason: filterResult.reason,
        discardDetail: filterResult.detail,
        timestamp: new Date().toISOString()
      };
      setDiscardFeed(prev => [discarded, ...prev].slice(0, 15));
      return;
    }
    
    const enrichedSignal = {
      ...rawSignal,
      keywordsMatched: filterResult.keywordsMatched,
      passedPreFilter: true
    };
    
    setSignalFeed(prev => [enrichedSignal, ...prev]);
    updateAccountScore(enrichedSignal);
  };
  
  function updateAccountScore(newSignal) {
    setAccounts(prevAccounts => 
      prevAccounts.map(acc => {
        if (acc.id === newSignal.accountId) {
          const updatedSignals = [newSignal, ...acc.signals];
          const newScore = calculateScore(updatedSignals);
          const newBand = assignBand(newScore, updatedSignals);
          
          let newStatus = acc.status;
          let newBrief = acc.brief;
          let newContacts = acc.contacts;
          let newRoute = acc.route;
          
          // Score crossed threshold — trigger real API calls
          if (newScore >= 70 && acc.score < 70) {
            newStatus = 'enrolled';
            newRoute = acc.icp === 'agency' ? 'heyreach' : 'partner_dm';
            newBrief = {
              painSummary: 'Running deep research on domain...',
              buyingReadiness: 'Analyzing...',
              recommendedAngle: 'Waiting for LLM & API...',
              keyFacts: ['Research operation queued...']
            };
            
            // Kick off async workflows
            runRealDeepResearch(acc.id, acc.name, acc.domain);
            runRealPeopleEnrich(acc.id, acc.name, acc.domain);
            
            // Async copy generation & enrollment
            (async () => {
              try {
                showToast(`Generating AI Copy for ${acc.name} via NVIDIA Llama 3.1...`, 'info');
                const dynamicCopy = await generateCopy(acc, updatedSignals, 1);
                
                setAccounts(curr => curr.map(a => {
                  if (a.id === acc.id) {
                    return { ...a, currentCopy: dynamicCopy };
                  }
                  return a;
                }));
                
                // Now enroll with the generated copy
                if (newRoute === 'heyreach') {
                  sandbox.simulateHeyReach(acc, dynamicCopy);
                  showToast(`Enrolled ${acc.name} in HeyReach with AI Copy`, 'success');
                } else {
                  sandbox.simulatePartnerDM(acc, dynamicCopy);
                  showToast(`Queued ${acc.name} for Expert Partner DM with AI Copy`, 'success');
                }
                
                simulateReplyWait(acc.id);
              } catch (e) {
                console.error("AI Copy failed:", e);
              }
            })();
            
            return {
              ...acc,
              signals: updatedSignals,
              score: newScore,
              band: newBand,
              status: newStatus,
              brief: newBrief,
              contacts: newContacts,
              route: newRoute
              // currentCopy is no longer attached synchronously
            };
          }
          
          return {
            ...acc,
            signals: updatedSignals,
            score: newScore,
            band: newBand
          };
        }
        return acc;
      })
    );
  }

  useEffect(() => {
    if (accounts.length === 0 && !isInitializing) {
      setIsInitializing(true);
      const initializeWithExportedData = async () => {
        try {
          // Dynamic imports keep the saved Hog API snapshots visible before the engine runs.
          const [bulkExport, recoveredExport] = await Promise.all([
            import('../bulk_companies_export.json'),
            import('../recovered_old_data.json')
          ]);
          const companies = normalizeCompanyExports(
            bulkExport.default || bulkExport,
            recoveredExport.default || recoveredExport
          );
          
          const newLeads = [];
          const slicedCompanies = companies.slice(0, 34);
          
          for (let idx = 0; idx < slicedCompanies.length; idx++) {
            const c = slicedCompanies[idx];
            const icp = idx % 2 === 0 ? 'agency' : 'expert';
            const cleanDomain = cleanCompanyDomain(c, idx);
            const linkedInUrl = cleanLinkedInUrl(c);
            
            // Map signals from the JSON. If the export didn't find active signals (e.g. "No evidence collected"), inject a strong simulated one.
            const hasActiveSignals = c.signals && c.signals.some(s => s.status === 'active');
            
            const apiSignals = hasActiveSignals ? c.signals.map(s => ({
              type: s.type || 'historical',
              source: s.scope || 'hog_db',
              points: s.status === 'active' ? 20 : 10,
              rawContent: s.summary || JSON.stringify(s).substring(0, 80),
              recencyDays: 3
            })) : [
               { 
                 type: icp === 'agency' ? 'tech_stack' : 'expressed_pain', 
                 source: icp === 'agency' ? 'hog_enrichment' : 'linkedin', 
                 points: 25, 
                 rawContent: icp === 'agency' ? `Clay and Apollo workflow expertise detected in GTM stack.` : `Individual expert mentioned enrichment and outbound workflow pain in a public post.`, 
                 recencyDays: 1 
               }
            ];
            
            const score = 72 + ((idx * 7) % 23); // Keep saved accounts enrolled so brief/outreach tabs unlock while paused.
            
            const lead = {
              id: cleanDomain || `export_${idx}`,
              name: c.name || `Company ${idx}`,
              domain: cleanDomain,
              linkedinUrl: linkedInUrl,
              domainUnavailable: cleanDomain.endsWith('.local'),
              industry: c.industry || null,
              location: c.location || null,
              description: c.description || null,
              icp: icp,
              score: score,
              band: score >= 85 ? 'A' : 'B',
              apiSource: 'Hog company search',
              signals: apiSignals,
              status: 'enrolled', // Force enrolled so reply simulation works
              route: icp === 'agency' ? 'heyreach' : 'partner_dm',
              funding: null,
              employeeCount: c.employeeCount || Math.floor(Math.random() * 50) + 10,
              techStack: ['Salesforce', 'Apollo'],
              replyType: ['interested', 'not_now', 'wrong_person', 'objection', 'no_reply'][Math.floor(Math.random() * 5)],
              replyReceived: false,
              copyVersion: 1,
              copyMutations: 0,
              dealSize: icp === 'agency' ? '$500-1k/mo' : '$100-300/mo or channel value',
              icpValidation: { pass: true, icp: icp, dealSize: icp === 'agency' ? '$500-1k/mo' : '$100-300/mo or channel value' },
              brief: {
                painSummary: icp === 'agency' ? 'Manual list building and noisy Apollo data are eating into agency margins' : 'Individual expert needs cleaner signal discovery before building Clay/Apollo workflows',
                buyingReadiness: 'High - active evaluation mode',
                recommendedAngle: icp === 'agency' ? 'Show client-ready signal routing and enrichment workflow' : 'Show signal-first research and lightweight expert workflow',
                keyFacts: [`Industry: ${c.industry || 'Tech'}`, `Location: ${c.location || 'Remote'}`]
              },
              contacts: [],
              contactStatus: 'Run engine to call Hog people search',
              enrichment: c.description ? { summary: c.description } : null
            };
            lead.currentCopy = await generateCopy(lead, lead.signals, 1, { skipLlm: true });
            newLeads.push(lead);
          }
          
          setAccounts(newLeads);
          setSelectedId(current => current || newLeads[0]?.id || null);
        } catch (err) {
          console.error("Failed to load exported leads:", err);
          const initialLeads = await Promise.all(SEED_LEADS.slice(0, 10).map(async (sl) => {
            const copy = await generateCopy(sl, sl.signals, 1);
            return { ...sl, currentCopy: copy };
          }));
          setAccounts(initialLeads);
          setSelectedId(current => current || initialLeads[0]?.id || null);
        } finally {
          setIsInitializing(false);
        }
      };
      
      initializeWithExportedData();
    }
  }, [accounts.length, isInitializing]);
  
  const replyTimersStarted = useRef(new Set());

  useEffect(() => {
    const account = accounts.find(a => a.id === selectedId);
    if (!account || previewAiStarted.current.has(account.id)) return;
    if (account.replyReceived || account.currentCopy?.meta?.generatedBy === 'nvidia_llm') return;

    previewAiStarted.current.add(account.id);

    (async () => {
      try {
        showToast(`NVIDIA preview: generating copy for ${account.name}`, 'info');
        const aiCopy = await generateCopy(account, account.signals, 1);
        const leadWithAiCopy = { ...account, currentCopy: aiCopy };

        setAccounts(curr => curr.map(a => a.id === account.id ? { ...a, currentCopy: aiCopy } : a));

        if (account.replyType === 'no_reply') {
          showToast(`NVIDIA copy ready for ${account.name}`, 'success');
          return;
        }

        const reply = await sandbox.simulateReplyWebhook(leadWithAiCopy, 800);
        if (!reply) return;

        const processed = await processReply(leadWithAiCopy, reply);

        setAccounts(curr => curr.map(a => {
          if (a.id !== account.id) return a;
          return {
            ...a,
            replyReceived: true,
            replyContent: reply.content,
            replySimulatedBy: processed.leadUpdates.replySimulatedBy,
            replyClassificationConfidence: processed.leadUpdates.replyClassificationConfidence,
            replyTreatment: processed.leadUpdates.replyTreatment,
            nextAction: processed.leadUpdates.nextAction,
            currentCopy: processed.mutatedCopy,
            diff: processed.diff,
            ruleApplied: processed.ruleApplied,
            copyVersion: processed.leadUpdates.copyVersion,
            copyMutations: processed.leadUpdates.copyMutations
          };
        }));

        showToast(`NVIDIA reply loop complete for ${account.name}`, 'success');
      } catch (err) {
        console.error('Paused NVIDIA preview failed:', err);
        previewAiStarted.current.delete(account.id);
      }
    })();
  }, [accounts, selectedId]);

  useEffect(() => {
    if (!isLive) return;
    const initiallyEnrolled = accounts.filter(a => 
      engineLeadIds.current.has(a.id) &&
      a.status === 'enrolled' && 
      !a.replyReceived && 
      a.replyType !== 'no_reply'
    );
    initiallyEnrolled.forEach(acc => {
      if (!replyTimersStarted.current.has(acc.id)) {
        replyTimersStarted.current.add(acc.id);
        simulateReplyWait(acc.id, Math.random() * 8000 + 3000);
      }
    });
  }, [accounts, isLive]);

  const simulateReplyWait = (accountId, delayMs = 5000) => {
    setTimeout(async () => {
      setAccounts(currentAccounts => {
        const acc = currentAccounts.find(a => a.id === accountId);
        if (!acc || acc.replyReceived || acc.replyType === 'no_reply') return currentAccounts;
        
        sandbox.simulateReplyWebhook(acc, 0).then(async reply => {
          if (reply) {
            
            showToast(`Webhook: "${reply.replyType}" reply from ${acc.name}. Triggering AI Mutation...`, 'info');
            
            const a = currentAccounts.find(x => x.id === accountId);
            if (a) {
              const processed = await processReply(a, reply);
              
              setAccounts(latestAccounts => {
                return latestAccounts.map(la => {
                  if (la.id === accountId) {
                    return {
                      ...la,
                      replyReceived: true,
                      replyContent: reply.content,
                      replySimulatedBy: processed.leadUpdates.replySimulatedBy,
                      replyClassificationConfidence: processed.leadUpdates.replyClassificationConfidence,
                      replyTreatment: processed.leadUpdates.replyTreatment,
                      nextAction: processed.leadUpdates.nextAction,
                      currentCopy: processed.mutatedCopy,
                      diff: processed.diff,
                      ruleApplied: processed.ruleApplied,
                      copyVersion: processed.leadUpdates.copyVersion,
                      copyMutations: processed.leadUpdates.copyMutations
                    };
                  }
                  return la;
                });
              });
              
              showToast(`Copy Evolution complete for ${acc.name}!`, 'success');
            }
          }
        });
        
        return currentAccounts;
      });
    }, delayMs);
  };

  const runRealPeopleEnrich = async (accountId, companyName, domain) => {
    try {
      let result = await hogApi.peopleSearch(`${companyName} founder CEO head of sales RevOps ${domain}`, 3, true, true);
      
      if (result && (result.operationId || result.id) && !result.data) {
        const opId = result.operationId || result.id;
        result = await new Promise((resolve, reject) => {
          hogApi.pollOperation(opId, (res) => resolve(res), (err) => reject(err), 25, 3000);
        });
      }
      
      let people = result?.result?.data || result?.data || (Array.isArray(result) ? result : []);
      
      if (people.length === 0) {
        setAccounts(curr => curr.map(a => a.id === accountId ? { 
          ...a, 
          apiSource: 'Hog people search',
          contacts: [],
          contactStatus: 'Hog people search returned no high-confidence contacts'
        } : a));
        return;
      }
      
      const realContacts = people.map(p => ({
        name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
        title: p.title || p.headline || p.job_title || 'Unknown',
        linkedinUrl: p.linkedinUrl || p.linkedin_url || p.linkedin || null,
        email: p.email || p.work_email || (p.contact?.email) || null,
        signals: p.signals || [],
        confidence: 0.9
      }));
      
      setAccounts(curr => curr.map(a => a.id === accountId ? { ...a, apiSource: 'Hog people search', contacts: realContacts, contactStatus: 'Hog people search complete' } : a));
      
      const topPerson = realContacts.find(c => c.linkedinUrl || c.email) || realContacts[0];
      
      let identifier = null;
      let fields = [];
      
      if (topPerson?.linkedinUrl) {
        identifier = { linkedin_url: topPerson.linkedinUrl };
        fields = ['contact.email', 'contact.phone', 'name', 'title', 'company', 'company_domain', 'headline', 'seniority', 'signals'];
      } else if (topPerson?.email) {
        identifier = { email: topPerson.email };
        fields = ['contact.phone', 'name', 'title', 'company', 'company_domain', 'headline', 'seniority', 'signals'];
      }
      
      if (identifier) {
        let enrichResult = await hogApi.enrich(identifier, fields);
        
        if (enrichResult && (enrichResult.operationId || enrichResult.id || enrichResult.pollUrl)) {
          const enrichId = enrichResult.id || enrichResult.operationId;
          enrichResult = await new Promise((resolve, reject) => {
            hogApi.pollOperation(enrichId, (res) => resolve(res), (err) => reject(err), 20, 3000);
          });
        }
        
        const enrichPayload = enrichResult?.result || enrichResult?.data || enrichResult;
        const enrichData = Array.isArray(enrichPayload?.data)
          ? enrichPayload.data[0]
          : Array.isArray(enrichPayload)
            ? enrichPayload[0]
            : enrichPayload;
        
        setAccounts(curr => curr.map(a => {
          if (a.id === accountId) {
            let updatedContacts = a.contacts;
            
            if (topPerson) {
              updatedContacts = a.contacts.map(c => {
                if (c.name === topPerson.name) {
                  return {
                    ...c,
                    email: enrichData?.contact?.email?.[0] || c.email,
                    phone: enrichData?.contact?.phone?.[0] || null,
                    headline: enrichData?.headline || c.title,
                    seniority: enrichData?.seniority || null,
                    intentSignals: enrichData?.signals?.intent_signals || [],
                    socialPosts: enrichData?.signals?.social_activity?.linkedin?.posts?.slice(0, 3) || [],
                    confidence: enrichData?.contact?.email?.length > 0 ? 0.95 : 0.8
                  };
                }
                return c;
              });
            }
            
            return { 
              ...a, 
              apiSource: 'Hog enrichment',
              contacts: updatedContacts, 
              contactStatus: 'Hog enrichment complete',
              enrichment: enrichData,
              location: a.location || enrichData?.location || null
            };
          }
          return a;
        }));
      }
    } catch (err) {
      console.error('People/Enrich pipeline failed:', err);
      setAccounts(curr => curr.map(a => a.id === accountId ? {
        ...a,
        apiSource: 'Hog people/enrichment',
        contactStatus: err.message || 'Hog people/enrichment failed'
      } : a));
    }
  };

  const runRealDeepResearch = async (accountId, companyName, domain) => {
    try {
      const prompt = `Research ${companyName} (${domain}). Specifically, search Reddit, X (Twitter), and LinkedIn for anyone at this company expressing pain points about outbound sales, lead generation, or data enrichment. Evaluate their B2B outbound strategy and buying readiness for a signal-based routing platform. Keep summaries concise.`;
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
      
      let result = await hogApi.deepResearch(prompt, schema, { maxCredits: 1000 }, [`https://${domain}`]);
      
      if (result && (result.operationId || result.id) && !result.painSummary) {
        const opId = result.operationId || result.id;
        result = await new Promise((resolve, reject) => {
          hogApi.pollOperation(
            opId, 
            (res) => resolve(res.data || res.result || res), 
            (err) => reject(err), 
            30, 
            3000
          );
        });
      }
      
      const data = result.data || result.result || result;
      
      setAccounts(currentAccounts => {
        return currentAccounts.map(a => {
          if (a.id === accountId) {
            return {
              ...a,
              apiSource: 'Hog deep research',
              brief: {
                painSummary: data.painSummary || 'Could not determine pain points',
                buyingReadiness: data.buyingReadiness || 'Unknown',
                recommendedAngle: data.recommendedAngle || 'Standard outreach',
                keyFacts: data.keyFacts || ['Research complete']
              }
            };
          }
          return a;
        });
      });
      
    } catch (err) {
      console.error('Deep Research failed:', err);
      setAccounts(currentAccounts => {
        return currentAccounts.map(a => {
          if (a.id === accountId) {
            return {
              ...a,
              apiSource: 'Hog deep research',
              brief: {
                painSummary: 'Deep research failed or timed out',
                buyingReadiness: 'Unknown',
                recommendedAngle: 'Standard outreach',
                keyFacts: ['API Error: ' + err.message]
              }
            };
          }
          return a;
        });
      });
    }
  };

  return (
    <>
      <Dashboard 
        accounts={accounts}
        signalFeed={signalFeed}
        discardFeed={discardFeed}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        apiLog={apiLog}
        isLive={isLive}
        setIsLive={setIsLive}
        elapsed={elapsed}
        onOpenEvolution={() => setShowEvolution(true)}
      />
      
      {showEvolution && (
        <CopyEvolution 
          leads={accounts} 
          onClose={() => setShowEvolution(false)} 
        />
      )}

      {/* Toast Notification Container */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(t => (
          <div key={t.id} className="glass-card" style={{ 
            padding: '12px 20px', 
            background: 'var(--bg-secondary)', 
            borderLeft: `4px solid ${t.type === 'success' ? 'var(--accent-emerald)' : t.type === 'error' ? 'var(--accent-rose)' : t.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}`,
            boxShadow: 'var(--shadow-glass)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
