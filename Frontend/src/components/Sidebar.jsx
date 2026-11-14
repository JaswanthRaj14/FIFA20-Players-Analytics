import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  GitCompareArrows,
  BarChart3,
  X,
  Menu,
} from 'lucide-react';

const navItems = [
  { path: '/',        label: 'Overview',               icon: LayoutDashboard },
  { path: '/players', label: 'Players Explorer',       icon: Users },
  { path: '/predict', label: 'Market Value Predictor',  icon: TrendingUp },
  { path: '/compare', label: 'Player Comparison',       icon: GitCompareArrows },
  { path: '/model',   label: 'Model Performance',       icon: BarChart3 },
];

export default function Sidebar({ isOpen, onToggle }) {
  return (
    <>
      <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>
            <span className="brand-icon">⚽</span>
            FIFA 20
          </h1>
          <p>Player Intelligence</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => {
                if (window.innerWidth < 1024) onToggle();
              }}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
