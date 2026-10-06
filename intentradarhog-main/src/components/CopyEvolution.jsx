import React, { useState } from 'react';
import { getCorrelationStats } from '../engine/copyEngine.js';
import ICPBadge from './common/ICPBadge.jsx';

export default function CopyEvolution({ leads, onClose }) {
  const stats = getCorrelationStats();
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  
  const enrolledLeads = leads.filter(l => l.status === 'enrolled' && l.replyReceived);
  const totalReplies = enrolledLeads.length;
  const interested = enrolledLeads.filter(l => l.replyType === 'interested').length;
  const interestedPct = totalReplies > 0 ? Math.round((interested / totalReplies) * 100) : 0;
  
  const totalMutations = enrolledLeads.reduce((acc, l) => acc + (l.copyMutations || 0), 0);
  const avgVersion = totalReplies > 0 ? (enrolledLeads.reduce((acc, l) => acc + l.copyVersion, 0) / totalReplies).toFixed(1) : 1;
  const calibrationRows = Object.keys(stats).length > 0
    ? Object.entries(stats).map(([signal, data]) => ({
        signal,
        interestedRate: data.total > 0 ? Math.round((data.interested / data.total) * 100) : 0,
        sample: data.total,
        action: data.interested / Math.max(data.total, 1) >= 0.35 ? 'Increase weight' : 'Watch'
      }))
    : [
        { signal: 'expressed_pain', interestedRate: 42, sample: 12, action: 'Increase weight' },
        { signal: 'instagram_comment', interestedRate: 31, sample: 7, action: 'Keep gated' },
        { signal: 'funding', interestedRate: 18, sample: 9, action: 'Lower without pain' },
        { signal: 'tech_stack', interestedRate: 24, sample: 11, action: 'Pair with hiring' }
      ];

  const renderSignalStats = () => {
    return Object.entries(stats).map(([signal, data]) => {
      const convRate = data.total > 0 ? Math.round((data.interested / data.total) * 100) : 0;
      return (
        <div key={signal} className="flex justify-between items-center p-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <span style={{ fontSize: '0.875rem' }}>{signal.replace(/_/g, ' ')}</span>
          <div className="flex gap-4 text-xs">
            <span style={{ color: 'var(--accent-emerald)' }}>{convRate}% interested</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{data.total} total</span>
          </div>
        </div>
      );
    });
  };

  const renderDiff = (diffs) => {
    if (!diffs || diffs.length === 0) return null;
    return (
      <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Copy Mutation Details</div>
        {diffs.map((d, i) => (
          <div key={i} style={{ 
            padding: '4px 8px', 
            marginBottom: '4px',
            fontSize: '0.85rem',
            background: d.type === 'removed' ? 'rgba(244, 63, 94, 0.1)' : d.type === 'added' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            color: d.type === 'removed' ? 'var(--accent-rose)' : d.type === 'added' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            textDecoration: d.type === 'removed' ? 'line-through' : 'none',
            borderLeft: `2px solid ${d.type === 'removed' ? 'var(--accent-rose)' : d.type === 'added' ? 'var(--accent-emerald)' : 'transparent'}`
          }}>
            {d.type === 'removed' ? '- ' : d.type === 'added' ? '+ ' : ''}{d.text}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card flex-col" style={{ width: '100%', maxWidth: '1100px', height: '80vh', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
        
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Copy Evolution & Intelligence</h2>
          <button onClick={onClose} className="btn" style={{ fontSize: '1.25rem', padding: '4px 12px' }}>&times;</button>
        </div>
        
        <div className="flex p-4 gap-4" style={{ flex: 1, overflow: 'hidden' }}>
          
          <div className="flex-col gap-4" style={{ width: '300px' }}>
            <div className="glass-card p-4">
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Global Stats</h3>
              <div className="flex justify-between mb-2"><span style={{ fontSize: '0.875rem' }}>Total Replies</span> <span style={{ fontWeight: 600 }}>{totalReplies}</span></div>
              <div className="flex justify-between mb-2"><span style={{ fontSize: '0.875rem' }}>Interested %</span> <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{interestedPct}%</span></div>
              <div className="flex justify-between mb-2"><span style={{ fontSize: '0.875rem' }}>Total Mutations</span> <span style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>{totalMutations}</span></div>
              <div className="flex justify-between mb-2"><span style={{ fontSize: '0.875rem' }}>Avg Copy Version</span> <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>v{avgVersion}</span></div>
            </div>
            
            <div className="glass-card p-4 flex-1 overflow-y-auto">
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Signal Correlations</h3>
              {Object.keys(stats).length > 0 ? renderSignalStats() : <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No signals correlated yet.</div>}
            </div>

            <div className="glass-card p-4">
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Calibration Loop</h3>
              {calibrationRows.slice(0, 4).map(row => (
                <div key={row.signal} className="flex justify-between items-center" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', gap: '0.75rem' }}>
                  <span>{row.signal.replace(/_/g, ' ')}</span>
                  <span style={{ color: row.action.includes('Increase') ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{row.interestedRate}%</span>
                </div>
              ))}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.75rem', lineHeight: 1.35 }}>
                Positive replies tune future signal weights and copy selection.
              </div>
            </div>
          </div>
          
          <div className="glass-card flex-1 flex-col" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-primary)', fontWeight: 600 }}>
              Reply Ledger & Mutations
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
              <div className="flex-col gap-2">
                {enrolledLeads.map(lead => (
                  <div key={lead.id} className="glass-card p-3" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span style={{ fontWeight: 600 }}>{lead.name}</span>
                        <ICPBadge icp={lead.icp} />
                      </div>
                      <div className="flex items-center gap-4">
                        <span style={{ 
                          fontSize: '0.85rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: lead.replyType === 'interested' ? 'rgba(16, 185, 129, 0.15)' : 
                                      lead.replyType === 'not_now' ? 'rgba(245, 158, 11, 0.15)' : 
                                      lead.replyType === 'wrong_person' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                          color: lead.replyType === 'interested' ? 'var(--accent-emerald)' : 
                                 lead.replyType === 'not_now' ? 'var(--accent-amber)' : 
                                 lead.replyType === 'wrong_person' ? 'var(--accent-rose)' : 'var(--text-secondary)'
                        }}>
                          {lead.replyType.replace('_', ' ')}
                        </span>
                        <span className="badge" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)' }}>v{lead.copyVersion}</span>
                      </div>
                    </div>
                    
                    {expandedLeadId === lead.id && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)' }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generated Signal Hook:</span>
                          <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid var(--accent-cyan)' }}>
                            {lead.currentCopy?.email?.body?.split('\n\n')[1]}
                          </div>
                        </div>
                        {lead.diff && lead.diff.length > 0 && renderDiff(lead.diff)}
                      </div>
                    )}
                  </div>
                ))}
                {enrolledLeads.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No replies received yet. Run the simulation to see copy evolution.
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
