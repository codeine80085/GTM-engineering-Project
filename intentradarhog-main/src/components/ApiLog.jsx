import React, { useState } from 'react';

export default function ApiLog({ logs }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="glass-card" style={{ marginTop: '1rem', borderBottom: 'none', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: expanded ? '300px' : '40px', transition: 'max-height 0.3s ease', display: 'flex', flexDirection: 'column' }}>
      <div 
        className="flex justify-between items-center p-4" 
        style={{ cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border-primary)' : 'none', padding: '8px 16px' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>API Log</span>
          <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{logs.length}</span>
        </div>
        <span style={{ color: 'var(--text-secondary)' }}>{expanded ? '▼' : '▲'}</span>
      </div>
      
      {expanded && (
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {logs.map((log) => (
            <div key={log.id} className="api-log-row flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className={log.method === 'POST' ? 'api-method-post' : log.method === 'SANDBOX' ? 'api-sandbox' : 'api-method-get'} style={{ width: '60px', fontWeight: 600 }}>
                  {log.method}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{log.path}</span>
                {log.account && <span style={{ color: 'var(--text-secondary)' }}>({log.account})</span>}
              </div>
              <div className="flex gap-4">
                <span style={{ color: log.status === 'ERR' ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>{log.status}</span>
                <span style={{ color: 'var(--text-tertiary)', width: '40px', textAlign: 'right' }}>{log.timeMs}ms</span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Waiting for API calls...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
