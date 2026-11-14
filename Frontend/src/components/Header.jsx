import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';

const pageInfo = {
  '/':        { title: 'Overview',               desc: 'FIFA 20 dataset analytics and insights' },
  '/players': { title: 'Players Explorer',       desc: 'Search, filter, and explore player data' },
  '/predict': { title: 'Market Value Predictor',  desc: 'Predict player market value using machine learning' },
  '/compare': { title: 'Player Comparison',       desc: 'Compare two players side by side' },
  '/model':   { title: 'Model Performance',       desc: 'Model evaluation metrics and analysis' },
};

export default function Header({ currentPath }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await checkHealth();
        if (mounted) setConnected(true);
      } catch {
        if (mounted) setConnected(false);
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const info = pageInfo[currentPath] || pageInfo['/'];

  return (
    <header className="header">
      <div className="header-left">
        <h2>{info.title}</h2>
        <p>{info.desc}</p>
      </div>
      <div className="header-right">
        <div className={`connection-status ${connected ? '' : 'disconnected'}`}>
          <span className="status-dot" />
          <span>{connected ? 'API Connected' : 'API Disconnected'}</span>
        </div>
      </div>
    </header>
  );
}
