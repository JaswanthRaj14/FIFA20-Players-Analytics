import { useState, useEffect, useCallback } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { getPlayers, getPlayerFilters } from '../services/api';
import DataTable from '../components/DataTable';
import { Loading, Error, Empty } from '../components/LoadingState';

/* ── helpers ──────────────────────────────────── */
const fmtEuro = (v) => {
  if (v == null) return '—';
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v.toLocaleString()}`;
};

const columns = [
  { key: 'short_name',      label: 'Player' },
  { key: 'age',             label: 'Age' },
  { key: 'nationality',     label: 'Nationality' },
  { key: 'club',            label: 'Club' },
  { key: 'primary_position',label: 'Pos' },
  {
    key: 'overall', label: 'OVR',
    render: (v) => (
      <span style={{ fontWeight: 600, color: v >= 80 ? '#2F6BFF' : 'inherit' }}>
        {v}
      </span>
    ),
  },
  {
    key: 'potential', label: 'POT',
    render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
  },
  { key: 'value_eur', label: 'Value', render: (v) => fmtEuro(v) },
  { key: 'wage_eur',  label: 'Wage',  render: (v) => fmtEuro(v) },
];

const LIMIT = 20;

export default function PlayersExplorer() {
  /* filters & sort state */
  const [search, setSearch]         = useState('');
  const [position, setPosition]     = useState('All');
  const [nationality, setNationality] = useState('All');
  const [club, setClub]             = useState('All');
  const [minOverall, setMinOverall] = useState(40);
  const [sortBy, setSortBy]         = useState('overall');
  const [order, setOrder]           = useState('desc');
  const [offset, setOffset]         = useState(0);

  /* data state */
  const [players, setPlayers]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [filters, setFilters]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  /* load filter options once */
  useEffect(() => {
    getPlayerFilters()
      .then((r) => setFilters(r.data))
      .catch(() => {});
  }, []);

  /* fetch players */
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPlayers({
        search,
        position,
        nationality,
        club,
        min_overall: minOverall,
        sort_by: sortBy,
        order,
        limit: LIMIT,
        offset,
      });
      setPlayers(res.data.players);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.message || 'Failed to load players.');
    } finally {
      setLoading(false);
    }
  }, [search, position, nationality, club, minOverall, sortBy, order, offset]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  /* reset page when filters change */
  useEffect(() => {
    setOffset(0);
  }, [search, position, nationality, club, minOverall, sortBy, order]);

  const toggleOrder = () =>
    setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));

  return (
    <div>
      {/* ── Filters ────────────────────────── */}
      <div className="filters-bar">
        <div className="filter-group" style={{ flex: 2 }}>
          <label className="filter-label">Search</label>
          <input
            className="filter-input"
            type="text"
            placeholder="Search player name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Position</label>
          <select
            className="filter-select"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="All">All Positions</option>
            {filters?.positions?.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Nationality</label>
          <select
            className="filter-select"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            <option value="All">All Nationalities</option>
            {filters?.nationalities?.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Club</label>
          <select
            className="filter-select"
            value={club}
            onChange={(e) => setClub(e.target.value)}
          >
            <option value="All">All Clubs</option>
            {filters?.clubs?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group" style={{ minWidth: 130 }}>
          <label className="filter-label">Min Overall: {minOverall}</label>
          <input
            type="range"
            min="40"
            max="99"
            value={minOverall}
            onChange={(e) => setMinOverall(Number(e.target.value))}
            style={{ accentColor: '#2F6BFF' }}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <div className="sort-controls">
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="overall">Overall</option>
              <option value="potential">Potential</option>
              <option value="age">Age</option>
              <option value="value_eur">Market Value</option>
              <option value="wage_eur">Wage</option>
            </select>
            <button className="sort-btn" onClick={toggleOrder}>
              {order === 'desc' ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
              {order === 'desc' ? 'DESC' : 'ASC'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Table / States ─────────────────── */}
      {loading ? (
        <Loading message="Loading players…" />
      ) : error ? (
        <Error message={error} onRetry={fetchPlayers} />
      ) : players.length === 0 ? (
        <Empty message="No players match your current filters." />
      ) : (
        <DataTable
          columns={columns}
          data={players}
          title="Player Database"
          total={total}
          pagination={{ total, limit: LIMIT, offset }}
          onPageChange={setOffset}
        />
      )}
    </div>
  );
}
