import { useState, useEffect } from 'react';
import { Users, Star, Calendar, Globe } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { Loading, Error } from '../components/LoadingState';
import {
  getPlayersSummary,
  getPlayerDistributions,
  getPlayers,
} from '../services/api';

/* ── Custom dark tooltip ──────────────────────── */
const darkTooltip = {
  contentStyle: {
    background: '#1E1E1C',
    border: 'none',
    borderRadius: '8px',
    color: '#F5F0EB',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
  },
  itemStyle: { color: '#F5F0EB' },
};

const TICK = { fill: '#5C564E', fontSize: 11 };

export default function Overview() {
  const [summary, setSummary]             = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [topPlayers, setTopPlayers]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, distRes, topRes] = await Promise.all([
        getPlayersSummary(),
        getPlayerDistributions(),
        getPlayers({ sort_by: 'overall', order: 'desc', limit: 10 }),
      ]);
      setSummary(sumRes.data);
      setDistributions(distRes.data);
      setTopPlayers(topRes.data.players);
    } catch (err) {
      setError(err.message || 'Failed to load overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loading message="Loading overview data…" />;
  if (error)   return <Error message={error} onRetry={fetchData} />;

  return (
    <div>
      {/* ── KPI Cards ─────────────────────────── */}
      <div className="stat-cards-grid">
        <StatCard
          icon={Users}
          label="Total Players"
          value={summary.total_players?.toLocaleString()}
        />
        <StatCard
          icon={Star}
          label="Average Overall"
          value={summary.average_overall?.toFixed(1)}
        />
        <StatCard
          icon={Calendar}
          label="Average Age"
          value={summary.average_age?.toFixed(1)}
        />
        <StatCard
          icon={Globe}
          label="Total Nationalities"
          value={summary.total_nationalities?.toLocaleString()}
        />
      </div>

      {/* ── Charts ────────────────────────────── */}
      <div className="charts-grid">
        {/* Overall Rating Distribution */}
        <ChartCard title="Overall Rating Distribution">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={distributions.overall_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis dataKey="rating" tick={TICK} />
              <YAxis tick={TICK} />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="count" fill="#2F6BFF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age Distribution */}
        <ChartCard title="Age Distribution">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={distributions.age_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis dataKey="age" tick={TICK} />
              <YAxis tick={TICK} />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="count" fill="#2F6BFF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Position Distribution */}
        <ChartCard title="Player Position Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={distributions.position_distribution.slice(0, 15)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis type="number" tick={TICK} />
              <YAxis
                type="category"
                dataKey="position"
                width={36}
                tick={TICK}
              />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="count" fill="#2F6BFF" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Market Value Distribution */}
        <ChartCard title="Market Value Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributions.value_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis
                dataKey="range"
                tick={{ ...TICK, fontSize: 10 }}
                angle={-25}
                textAnchor="end"
                height={55}
              />
              <YAxis tick={TICK} />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="count" fill="#2F6BFF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top 10 Rated Players */}
        <ChartCard title="Top 10 Rated Players" fullWidth>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={[...topPlayers].reverse()}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis type="number" domain={[60, 100]} tick={TICK} />
              <YAxis
                type="category"
                dataKey="short_name"
                width={115}
                tick={{ ...TICK, fontSize: 12 }}
              />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="overall" fill="#2F6BFF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
