import React, { useState } from 'react';
import CopyPanel from './CopyPanel.jsx';
import ReplyPanel from './ReplyPanel.jsx';
import ScoreMeter from './common/ScoreMeter.jsx';
import BandBadge from './common/BandBadge.jsx';

export default function DetailPanel({ account, isLive }) {
  const [activeTab, setActiveTab] = useState('brief');
  
  if (!account) return null;
  
  const tabs = [
    { id: 'brief', label: 'Brief' },
    { id: 'signals', label: 'Signals' },
    { id: 'confidence', label: 'Confidence' },
    { id: 'outreach', label: 'Outreach' },
    { id: 'copy', label: 'Copy' },
    { id: 'replies', label: 'Replies' }
  ];

  return (
    <div className="glass-card h-full flex-col" style={{ width: '350px', borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0, minHeight: 0, overflow: 'hidden' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="flex justify-between items-center mb-2">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{account.name}</h2>
          <BandBadge band={account.band} />
        </div>
        <a href={`https://${account.domain}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', fontSize: '0.875rem', textDecoration: 'none', display: account.domainUnavailable ? 'none' : 'inline' }}>
          {account.domain} ↗
        </a>
        {account.domainUnavailable && (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            Website domain unavailable
            {account.linkedinUrl && (
              <a href={account.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', marginLeft: '8px', textDecoration: 'none' }}>
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
      
      <div className="tab-bar detail-tabs px-4 pt-2">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', flex: '0 0 auto', minWidth: '82px', textAlign: 'center' }}
          >
            {tab.label}
          </div>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {activeTab === 'brief' && (
          <div className="flex-col gap-4 p-4">
             {account.brief ? (
               <>
                 <div className="glass-card p-4">
                   <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>Buying Readiness</h4>
                   <div style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{account.brief.buyingReadiness}</div>
                 </div>
                 <div className="glass-card p-4">
                   <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>Hog API Provenance</h4>
                   <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{account.apiSource || 'Hog API snapshot'}</div>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>
                     Company, domain, industry, location, and available signals came from saved Hog API output or live Hog endpoints.
                   </div>
                 </div>
                 <div>
                   <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Pain Summary</h4>
                   <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{account.brief.painSummary}</p>
                 </div>
                 <div>
                   <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Recommended Angle</h4>
                   <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{account.brief.recommendedAngle}</p>
                 </div>
               </>
             ) : (
               <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
                 Account needs score {'≥'} 70 for deep research brief.
               </div>
             )}
          </div>
        )}

        {activeTab === 'confidence' && (
          <div className="flex-col gap-4 p-4">
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Intent Score</h4>
              <ScoreMeter score={account.score} />
            </div>
            <div className="glass-card p-4">
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stage 1 pre-filter</span>
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>Passed</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ICP validation</span>
                <span style={{ color: account.icpValidation?.pass ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontSize: '0.8rem' }}>
                  {account.icpValidation?.pass ? 'Passed' : 'Review'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Deal size</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>{account.dealSize}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Route</span>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{account.route || 'monitor'}</span>
              </div>
            </div>
            <div className="glass-card p-4">
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>Signal Mix</h4>
              {account.signals.map((sig, idx) => (
                <div key={idx} className="flex justify-between" style={{ fontSize: '0.78rem', marginBottom: '0.45rem' }}>
                  <span>{sig.type.replace(/_/g, ' ')}</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>+{sig.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'signals' && (
          <div className="flex-col gap-2 p-4">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Confidence Score</h4>
            <div className="mb-4">
               <ScoreMeter score={account.score} />
            </div>
            
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '8px' }}>Detected Signals</h4>
            {account.signals.map((sig, idx) => (
              <div key={idx} className="glass-card p-3 mb-2">
                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                  <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{sig.source}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>+{sig.points} pts</span>
                </div>
                <div style={{ fontSize: '0.875rem' }}>{sig.type.replace('_', ' ')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
                  "{sig.rawContent}"
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'outreach' && (
          <div className="flex-col gap-4 p-4">
            {account.status === 'enrolled' ? (
              <>
                <div className="glass-card p-4 flex items-center justify-between">
                  <span style={{ fontSize: '0.875rem' }}>Status</span>
                  <span className="badge" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)' }}>Active</span>
                </div>
                <div className="glass-card p-4 flex items-center justify-between">
                  <span style={{ fontSize: '0.875rem' }}>Route</span>
                  <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{account.route}</span>
                </div>
                <div className="glass-card p-4">
                  <div className="mini-label">Hog source</div>
                  <div className="mini-value">{account.apiSource || 'Hog API'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {account.contactStatus || 'People search has not run yet'}
                  </div>
                  {account.engineGuardrail && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: '0.5rem' }}>
                      {account.engineGuardrail}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Contacts ({account.contacts.length})</h4>
                  {account.contacts.length === 0 && (
                    <div className="glass-card p-3 mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      No placeholder contact. Start the engine to run Hog people search and enrichment for this account.
                    </div>
                  )}
                  {account.contacts.map((c, idx) => (
                    <div key={idx} className="glass-card p-3 mb-2">
                      <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>{(c.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.title}</div>
                      {c.email && <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>✉ {c.email}</div>}
                      {c.phone && <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>📞 {c.phone}</div>}
                      {c.seniority && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Seniority: {c.seniority}</div>}
                      {c.linkedinUrl && (
                        <a href={c.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', textDecoration: 'none', display: 'block', marginTop: '4px' }}>
                          🔗 LinkedIn Profile ↗
                        </a>
                      )}
                      {c.intentSignals && c.intentSignals.length > 0 && (
                        <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {c.intentSignals.map((sig, i) => (
                            <span key={i} className="badge" style={{ background: 'rgba(255,170,0,0.15)', color: 'var(--accent-amber)', fontSize: '0.65rem' }}>
                              🔥 {sig.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      {c.socialPosts && c.socialPosts.length > 0 && (
                        <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-primary)', paddingTop: '6px' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Recent LinkedIn Activity</div>
                          {c.socialPosts.map((post, pi) => (
                            <div key={pi} style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '4px', paddingLeft: '8px', borderLeft: '2px solid var(--border-secondary)' }}>
                              <div style={{ marginBottom: '2px' }}>{post.text?.substring(0, 120)}...</div>
                              <div style={{ color: 'var(--accent-amber)' }}>❤ {post.likes || 0} reactions</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
               <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
                 Account needs score {'≥'} 70 to enroll in outreach.
               </div>
            )}
          </div>
        )}
        
        {activeTab === 'copy' && <CopyPanel account={account} />}
        {activeTab === 'replies' && <ReplyPanel account={account} isLive={isLive} />}
      </div>
    </div>
  );
}
