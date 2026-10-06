import React from 'react';

export default function SignalFeed({ liveSignals, discardedSignals }) {
  const instagramSignals = liveSignals.filter(sig => sig.source === 'instagram' || sig.type === 'instagram_comment');

  return (
    <div className="flex-col h-full" style={{ padding: '1rem', borderRight: '1px solid var(--border-primary)', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span className="status-dot" style={{ background: 'var(--accent-emerald)' }}></span>
          Signal Feed
        </span>
      </h2>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
        Colour cards passed the gate. Grey cards were rejected before enrichment spend.
      </p>

      <div className="glass-card p-3 mb-4" style={{ borderColor: 'rgba(228,64,95,0.25)', background: 'rgba(228,64,95,0.07)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
          <span className="mini-label" style={{ color: '#F472B6' }}>Instagram Comment Intent</span>
          <span className="badge" style={{ background: 'rgba(228,64,95,0.16)', color: '#F9A8D4' }}>
            {instagramSignals.length} passed
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Comments qualify only after intent keyword, role, company, and ICP checks.
        </div>
      </div>
      
      <div className="flex-col gap-2">
        {/* ── LIVE SIGNALS (passed Stage 1) ── */}
        {liveSignals.map((sig, idx) => (
          <div key={`live_${idx}`} className="glass-card signal-row" style={{ animation: idx === 0 ? 'fadeIn 0.5s ease' : 'none' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span className="badge" style={{ background: getSourceColor(sig.source), color: '#fff', fontSize: '0.65rem' }}>
                  {sig.source}
                </span>
                <span className="badge" style={{ background: getTypeColor(sig.type), color: '#fff', fontSize: '0.65rem' }}>
                  {sig.type.replace(/_/g, ' ')}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>+{sig.points || 15} pts</span>
            </div>
            
            {sig.authorRole && (
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginBottom: '2px' }}>
                ✓ {sig.authorRole}
              </div>
            )}
            
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
              Passed Stage 1 and entered scoring
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              "{sig.rawContent || sig.content}"
            </div>
            
            {sig.keywordsMatched && sig.keywordsMatched.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {sig.keywordsMatched.slice(0, 3).map((kw, i) => (
                  <span key={i} style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(0, 212, 255, 0.15)', color: 'var(--accent-cyan)' }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* ── DISCARDED SIGNALS (failed Stage 1 — grey cards) ── */}
        {discardedSignals.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-primary)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rejected noise - no enrichment spent
            </div>
            {discardedSignals.map((sig, idx) => (
              <div key={`discard_${idx}`} className="glass-card signal-row discard-row" style={{ opacity: 0.5, marginBottom: '6px', animation: idx === 0 ? 'fadeIn 0.5s ease' : 'none' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                  <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>
                    {sig.source}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontWeight: 600 }}>✗ Discarded</span>
                </div>
                
                {sig.authorRole && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', marginBottom: '2px' }}>
                    ✗ {sig.authorRole}
                  </div>
                )}
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{sig.rawContent || sig.content}"
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-rose)' }}>
                  ✗ {sig.discardDetail || sig.discardReason || sig.reason || 'Failed pre-filter'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getSourceColor(source) {
  const colors = {
    reddit: '#FF4500',
    linkedin: '#0A66C2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    greenhouse: '#3AB549',
    crunchbase: '#0089FF',
    hog_enrichment: '#8B5CF6',
    web_scrape: '#F59E0B',
    deep_research: '#10B981',
    website: '#F59E0B'
  };
  return colors[source] || 'var(--bg-tertiary)';
}

function getTypeColor(type) {
  const colors = {
    expressed_pain: 'rgba(244, 63, 94, 0.8)',
    hiring: 'rgba(59, 130, 246, 0.8)',
    funding: 'rgba(245, 158, 11, 0.8)',
    tech_stack: 'rgba(139, 92, 246, 0.8)',
    competitor_follow: 'rgba(139, 92, 246, 0.6)',
    founder_active: 'rgba(16, 185, 129, 0.8)',
    deep_research: 'rgba(0, 212, 255, 0.8)',
    instagram_comment: 'rgba(228, 64, 95, 0.8)',
    web_scrape_signal: 'rgba(245, 158, 11, 0.6)'
  };
  return colors[type] || 'var(--bg-tertiary)';
}
