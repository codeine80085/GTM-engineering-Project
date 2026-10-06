import React from 'react';

export default function ScoreMeter({ score }) {
  let color = 'var(--text-secondary)';
  if (score >= 70) color = 'var(--accent-emerald)';
  else if (score >= 40) color = 'var(--accent-amber)';
  else if (score > 0) color = 'var(--accent-rose)';

  return (
    <div className="flex items-center gap-2">
      <div className="score-meter flex-1">
        <div 
          className="score-fill" 
          style={{ 
            width: `${Math.min(100, Math.max(0, score))}%`, 
            backgroundColor: color 
          }} 
        />
      </div>
      <span style={{ color, fontSize: '0.75rem', fontWeight: 600 }}>
        {score}
      </span>
    </div>
  );
}
