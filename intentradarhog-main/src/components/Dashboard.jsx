import React from 'react';
import SignalFeed from './SignalFeed.jsx';
import AccountCard from './AccountCard.jsx';
import DetailPanel from './DetailPanel.jsx';
import ApiLog from './ApiLog.jsx';

export default function Dashboard({ 
  accounts, 
  signalFeed, 
  discardFeed, 
  selectedId, 
  setSelectedId, 
  apiLog,
  isLive,
  setIsLive,
  elapsed,
  onOpenEvolution
}) {
  
  const tier1 = accounts.filter(a => a.score >= 70).sort((a, b) => b.score - a.score);
  const tier2 = accounts.filter(a => a.score >= 40 && a.score < 70).sort((a, b) => b.score - a.score);
  const monitoring = accounts.filter(a => a.score < 40).sort((a, b) => b.score - a.score);

  const selectedAccount = accounts.find(a => a.id === selectedId);
  const repliesCount = accounts.filter(a => a.replyReceived).length;
  const realApiCount = apiLog.filter(log => log.type === 'real').length;
  const sandboxCount = apiLog.filter(log => log.type === 'sandbox').length;
  const mutationsCount = accounts.reduce((sum, account) => sum + (account.copyMutations || 0), 0);

  const timelineSteps = [
    { label: 'Discover', value: `${accounts.length} Hog accounts`, done: accounts.length > 0 },
    { label: 'Gate', value: `${signalFeed.length} passed / ${discardFeed.length} rejected`, done: signalFeed.length + discardFeed.length > 0 },
    { label: 'Enrich', value: `${realApiCount} Hog API calls`, done: realApiCount > 0 },
    { label: 'AI Copy', value: selectedAccount?.currentCopy?.meta?.generatedBy === 'nvidia_llm' ? 'NVIDIA live' : 'ready', done: accounts.some(a => a.currentCopy) },
    { label: 'Sandbox', value: `${sandboxCount} events`, done: sandboxCount > 0 },
    { label: 'Learn', value: `${mutationsCount} mutations`, done: mutationsCount > 0 }
  ];

  return (
    <div className="flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      
      <header className="header justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <circle cx="12" cy="11" r="3"></circle>
            </svg>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Intent Radar</h1>
          </div>
          
          <div className={`badge ${isLive ? 'badge-band-a' : 'badge-band-c'}`} style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isLive && <span className="status-dot active" style={{ backgroundColor: 'var(--accent-emerald)' }}></span>}
            {isLive ? 'LIVE' : 'PAUSED'}
          </div>
          
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            T+ {elapsed}s
          </div>
        </div>
        
        <div className="flex items-center gap-6" style={{ fontSize: '0.875rem' }}>
          <div className="flex-col items-center">
            <span style={{ color: 'var(--text-secondary)' }}>Signals</span>
            <span style={{ fontWeight: 600 }}>{signalFeed.length}</span>
          </div>
          <div className="flex-col items-center">
            <span style={{ color: 'var(--text-secondary)' }}>Tier 1</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{tier1.length}</span>
          </div>
          <div className="flex-col items-center">
            <span style={{ color: 'var(--text-secondary)' }}>Replies</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>{repliesCount}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn" onClick={onOpenEvolution}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            Copy Intelligence
          </button>
          <button 
            className={`btn ${isLive ? '' : 'btn-primary'}`}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause' : 'Start Engine'}
          </button>
        </div>
      </header>
      
      <div className="dashboard-grid">
        <SignalFeed liveSignals={signalFeed} discardedSignals={discardFeed} />
        
        <div className="flex-col" style={{ overflow: 'hidden' }}>
          <div className="flex-1 p-4" style={{ overflowY: 'auto' }}>
            <div className="demo-timeline">
              {timelineSteps.map((step, index) => (
                <div key={step.label} className={`timeline-step ${step.done ? 'done' : isLive && index <= 2 ? 'active' : ''}`}>
                  <div className="mini-label">{step.label}</div>
                  <div className="mini-value">{step.value}</div>
                </div>
              ))}
            </div>
             
             <div className="mb-6">
               <div className="flex items-center justify-between mb-2">
                 <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Tier 1: Enrolled ({tier1.length})</h2>
                 <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Score &gt;= 70</span>
               </div>
               {tier1.map(account => (
                 <AccountCard key={account.id} account={account} isSelected={selectedId === account.id} onClick={(acc) => setSelectedId(acc.id)} />
               ))}
             </div>
             
             <div className="mb-6">
               <div className="flex items-center justify-between mb-2">
                 <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tier 2: Validating ({tier2.length})</h2>
                 <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>Score 40 - 69</span>
               </div>
               {tier2.map(account => (
                 <AccountCard key={account.id} account={account} isSelected={selectedId === account.id} onClick={(acc) => setSelectedId(acc.id)} />
               ))}
             </div>
             
             <div>
               <div className="flex items-center justify-between mb-2">
                 <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Monitoring ({monitoring.length})</h2>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Score &lt; 40</span>
               </div>
               {monitoring.slice(0, 5).map(account => (
                 <AccountCard key={account.id} account={account} isSelected={selectedId === account.id} onClick={(acc) => setSelectedId(acc.id)} />
               ))}
             </div>
             
          </div>
          
          <ApiLog logs={apiLog} />
        </div>
        
        {selectedAccount ? (
          <DetailPanel account={selectedAccount} isLive={isLive} />
        ) : (
          <div className="flex items-center justify-center h-full border-l" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-tertiary)' }}>
            Select an account to view details
          </div>
        )}
      </div>
      
    </div>
  );
}
