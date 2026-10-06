import React from 'react';

export default function ReplyPanel({ account, isLive }) {
  if (!account) return null;

  if (!account.replyReceived) {
    const isNoReplyLead = account.replyType === 'no_reply';
    const title = !isLive
      ? 'NVIDIA preview running'
      : isNoReplyLead
        ? 'No reply assigned'
        : 'Waiting for sandbox webhook';
    const detail = !isLive
      ? 'Even while paused, the selected account gets NVIDIA copy and a sandboxed NVIDIA reply preview. Give it a moment after selecting a lead.'
      : isNoReplyLead
        ? 'This account is part of the no-reply cohort, so the copy engine will not mutate until another signal appears.'
        : 'The sandboxed webhook is queued. When it fires, NVIDIA can simulate the reply and the copy loop will classify it.';

    return (
      <div className="flex-col items-center justify-center p-8 gap-4" style={{ height: '300px' }}>
        <div className="status-dot active" style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent-cyan)' }} />
        <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.4 }}>{detail}</span>
      </div>
    );
  }

  let badgeColor = 'var(--text-secondary)';
  let badgeBg = 'var(--bg-tertiary)';

  if (account.replyType === 'interested') { badgeColor = 'var(--accent-emerald)'; badgeBg = 'rgba(16,185,129,0.15)'; }
  else if (account.replyType === 'not_now') { badgeColor = 'var(--accent-amber)'; badgeBg = 'rgba(245,158,11,0.15)'; }
  else if (account.replyType === 'wrong_person') { badgeColor = 'var(--accent-rose)'; badgeBg = 'rgba(244,63,94,0.15)'; }
  else if (account.replyType === 'objection') { badgeColor = '#F97316'; badgeBg = 'rgba(249,115,22,0.15)'; }

  return (
    <div className="flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Simulated Reply</h3>
        <span className="badge" style={{ color: badgeColor, background: badgeBg }}>
          {account.replyType.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          {account.replySimulatedBy === 'nvidia_llm' ? 'NVIDIA simulated reply' : 'Template simulated reply'}
        </span>
        {account.replyClassificationConfidence && (
          <span className="badge" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)' }}>
            {(account.replyClassificationConfidence * 100).toFixed(0)}% classified
          </span>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1rem', borderLeft: `3px solid ${badgeColor}` }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
          From: {account.contacts?.[0]?.name || 'Prospect'} - Received just now
        </div>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
          "{account.replyContent || 'No reply content'}"
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '8px' }}>Copy Engine Response</h4>
        <div className="glass-card p-4">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            The Copy Engine classified this reply as <strong>{account.replyType}</strong> and applied the matching treatment path.
          </p>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            TREATMENT: {account.replyTreatment?.label || 'Classified'}<br/>
            ACTION_TAKEN: {account.ruleApplied ? account.ruleApplied.action : 'keep'}<br/>
            VERSION: {account.copyVersion}
          </div>
          {account.nextAction && (
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '12px' }}>
              Next: {account.nextAction}
            </p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '12px' }}>
            See the Copy tab for the line-by-line diff and the AI mutation source.
          </p>
        </div>
      </div>
    </div>
  );
}
