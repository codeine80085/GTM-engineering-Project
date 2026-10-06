import React from 'react';

export default function CopyPanel({ account }) {
  if (!account) return null;
  
  if (!account.currentCopy) {
    return (
      <div className="flex-col gap-4 p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div className="status-dot status-dot-pulse" style={{ width: '12px', height: '12px', background: 'var(--accent-cyan)', borderRadius: '50%' }}></div>
        <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>
          Generating AI Copy via NVIDIA Llama 3.1…
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          The LLM is writing a personalized hook based on detected signals.
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Copy Engine</h3>
        <span className="badge" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)' }}>
          Version {account.copyVersion || 1}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          {account.currentCopy.meta?.generatedBy === 'nvidia_llm' ? 'NVIDIA LLM copy' : account.currentCopy.meta?.generatedBy === 'saved_snapshot' ? 'Saved Hog snapshot copy' : 'Fallback copy'}
        </span>
        {account.currentCopy.meta?.lastMutationBy === 'nvidia_llm' && (
          <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)' }}>
            NVIDIA mutation
          </span>
        )}
      </div>
      
      {account.copyVersion === 1 ? (
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Original copy — no mutations yet. Awaiting reply signal to optimize.
        </div>
      ) : (
        <div style={{ fontSize: '0.875rem', color: 'var(--accent-emerald)' }}>
          Optimized {account.copyMutations} times based on reply signals.
        </div>
      )}
      
      <div className="glass-card" style={{ padding: '1rem' }}>
        {account.currentCopy.meta?.topSignal && (
          <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Signal driving hook</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              {account.currentCopy.meta.topSignal.type?.replace(/_/g, ' ')} from {account.currentCopy.meta.topSignal.source} (+{account.currentCopy.meta.topSignal.points || 0})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
              "{account.currentCopy.meta.topSignal.rawContent}"
            </div>
          </div>
        )}
        <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Subject: {account.currentCopy.email?.subject || 'Generating…'}
        </h4>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {account.currentCopy.email?.body || 'Waiting for LLM response…'}
        </div>
      </div>

      {account.currentCopy.linkedin?.body && (
        <div className="glass-card" style={{ padding: '1rem', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            LinkedIn Message
          </h4>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {account.currentCopy.linkedin.body}
          </div>
        </div>
      )}
      
      {account.diff && account.diff.length > 0 && (
        <div className="glass-card flex-col gap-2 p-4" style={{ marginTop: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Latest Mutation Diff</h4>
          <div className="copy-diff">
            {account.diff.map((d, i) => (
              <div key={i} className={`diff-${d.type}`} style={{ padding: '4px 8px', marginBottom: '2px', borderRadius: '4px' }}>
                {d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  '}
                {d.text}
              </div>
            ))}
          </div>
          {account.ruleApplied && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px', fontStyle: 'italic' }}>
              Rule Applied: {account.ruleApplied.action} — {account.ruleApplied.changes?.[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
