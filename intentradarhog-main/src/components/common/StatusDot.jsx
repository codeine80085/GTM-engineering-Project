import React from 'react';

export default function StatusDot({ status }) {
  let color = 'var(--text-tertiary)';
  let isActive = false;
  
  switch(status) {
    case 'monitoring': color = 'var(--text-tertiary)'; break;
    case 'enriching':
    case 'validating': color = 'var(--accent-amber)'; isActive = true; break;
    case 'triggered': color = 'var(--accent-emerald)'; isActive = true; break;
    case 'enrolled': color = 'var(--accent-cyan)'; isActive = true; break;
    case 'disqualified': color = 'var(--accent-rose)'; break;
    default: break;
  }
  
  return (
    <span 
      className={`status-dot ${isActive ? 'active' : ''}`} 
      style={{ backgroundColor: color }} 
      title={status}
    />
  );
}
