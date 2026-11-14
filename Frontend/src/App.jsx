import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import PlayersExplorer from './pages/PlayersExplorer';
import MarketPredictor from './pages/MarketPredictor';
import PlayerComparison from './pages/PlayerComparison';
import ModelPerformance from './pages/ModelPerformance';
import './styles/dashboard.css';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="dashboard">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <div className="dashboard-main">
        <Header currentPath={location.pathname} />

        <main className="dashboard-content">
          <Routes>
            <Route path="/"        element={<Overview />} />
            <Route path="/players" element={<PlayersExplorer />} />
            <Route path="/predict" element={<MarketPredictor />} />
            <Route path="/compare" element={<PlayerComparison />} />
            <Route path="/model"   element={<ModelPerformance />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
