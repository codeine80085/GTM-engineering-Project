import React from 'react';
import StatusDot from './common/StatusDot.jsx';
import ICPBadge from './common/ICPBadge.jsx';
import BandBadge from './common/BandBadge.jsx';
import ScoreMeter from './common/ScoreMeter.jsx';

export default function AccountCard({ account, isSelected, onClick }) {
  
  const renderReplyIndicator = () => {
    if (!account.replyReceived) return null;
    let color = 'var(--text-secondary)';
    if (account.replyType === 'interested') color = 'var(--accent-emerald)';
    else if (account.replyType === 'not_now') color = 'var(--accent-amber)';
    else if (account.replyType === 'wrong_person') color = 'var(--accent-rose)';
    else if (account.replyType === 'objection') color = 'var(--accent-orange, #F97316)';
    
    return (
      <div style={{ color, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        {account.replyType.replace('_', ' ')}
      </div>
    );
  };

  return (
    <div 
      className={`glass-card account-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(account)}
    >
      <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
        <div className="flex items-center gap-2">
          <StatusDot status={account.status} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{account.name}</h3>
        </div>
        {renderReplyIndicator()}
      </div>
      
      <div className="flex gap-2 items-center" style={{ marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <ICPBadge icp={account.icp} />
        <BandBadge band={account.band} />
        {account.funding && (
          <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>
            {account.funding.amount} {account.funding.stage}
          </span>
        )}
        {account.copyVersion > 1 && (
          <span className="badge" style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)' }}>
            v{account.copyVersion}
          </span>
        )}
        {account.apiSource && (
          <span className="badge" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)', borderColor: 'rgba(0,212,255,0.25)' }}>
            {account.apiSource}
          </span>
        )}
      </div>
      
      <ScoreMeter score={account.score} />
      
      <div className="flex justify-between items-center" style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div>
          {account.industry && <span style={{ marginRight: '6px' }}>{account.industry} •</span>}
          {account.location && <span style={{ marginRight: '6px' }}>{account.location} •</span>}
          {account.employeeCount && <span style={{ marginRight: '6px' }}>{account.employeeCount} employees •</span>}
          {account.dealSize}
        </div>
        <div className="flex gap-2">
          {account.techStack.slice(0, 3).map(tech => (
            <span key={tech} style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
