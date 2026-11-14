import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getPlayers } from '../services/api';

/* ── helpers ──────────────────────────────────── */
const fmtEuro = (v) => {
  if (v == null) return '—';
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v.toLocaleString()}`;
};

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

/* ── Player Search Panel ──────────────────────── */
function PlayerSearchPanel({ label, selectedPlayer, onSelect }) {
  const [search, setSearch]   = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy]       = useState(false);

  useEffect(() => {
    if (search.trim().length < 2) { setResults([]); return; }

    const timer = setTimeout(async () => {
      try {
        setBusy(true);
        const res = await getPlayers({
          search: search.trim(),
          limit: 8,
          sort_by: 'overall',
          order: 'desc',
        });
        setResults(res.data.players);
      } catch {
        setResults([]);
      } finally {
        setBusy(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="player-select-card">
      <h3>{label}</h3>

      <input
        className="search-input"
        type="text"
        placeholder="Search player name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search.trim().length > 0 && search.trim().length < 2 && (
        <p className="search-hint">Type at least 2 characters…</p>
      )}

      {busy && (
        <p className="search-hint">Searching…</p>
      )}

      <div className="search-results">
        {results.map((p) => (
          <div
            key={p.sofifa_id}
            className={`search-result-item ${
              selectedPlayer?.sofifa_id === p.sofifa_id ? 'selected' : ''
            }`}
            onClick={() => onSelect(p)}
          >
            <span>{p.short_name}</span>
            <span className="search-result-rating">OVR {p.overall}</span>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <div className="selected-player-info">
          <h4>{selectedPlayer.short_name}</h4>
          {[
            ['Position',     selectedPlayer.primary_position],
            ['Overall',      selectedPlayer.overall],
            ['Potential',    selectedPlayer.potential],
            ['Age',          selectedPlayer.age],
            ['Club',         selectedPlayer.club || '—'],
            ['Nationality',  selectedPlayer.nationality],
            ['Market Value', fmtEuro(selectedPlayer.value_eur)],
            ['Wage',         fmtEuro(selectedPlayer.wage_eur)],
          ].map(([lbl, val]) => (
            <div className="player-detail-row" key={lbl}>
              <span className="player-detail-label">{lbl}</span>
              <span className="player-detail-value">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ───────────────────────────── */
export default function PlayerComparison() {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  const bothSelected = player1 && player2;

  const attrData = bothSelected
    ? [
        { attribute: 'Overall',   player1: player1.overall,   player2: player2.overall },
        { attribute: 'Potential',  player1: player1.potential,  player2: player2.potential },
        { attribute: 'Age',        player1: player1.age,        player2: player2.age },
      ]
    : [];

  const finData = bothSelected
    ? [
        { attribute: 'Market Value', player1: player1.value_eur || 0, player2: player2.value_eur || 0 },
        { attribute: 'Wage',          player1: player1.wage_eur || 0,  player2: player2.wage_eur || 0 },
      ]
    : [];

  return (
    <div>
      <div className="comparison-container">
        <PlayerSearchPanel label="Player 1" selectedPlayer={player1} onSelect={setPlayer1} />
        <PlayerSearchPanel label="Player 2" selectedPlayer={player2} onSelect={setPlayer2} />

        {bothSelected ? (
          <>
            {/* Attribute Comparison */}
            <div className="comparison-chart">
              <h3>Attribute Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
                  <XAxis dataKey="attribute" tick={{ ...TICK, fontSize: 12 }} />
                  <YAxis tick={TICK} />
                  <Tooltip {...darkTooltip} />
                  <Legend />
                  <Bar
                    dataKey="player1"
                    name={player1.short_name}
                    fill="#2F6BFF"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="player2"
                    name={player2.short_name}
                    fill="#A39E96"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Financial Comparison */}
            <div className="comparison-chart">
              <h3>Financial Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={finData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
                  <XAxis dataKey="attribute" tick={{ ...TICK, fontSize: 12 }} />
                  <YAxis
                    tick={TICK}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(0)}M`
                        : v >= 1_000
                          ? `${(v / 1_000).toFixed(0)}K`
                          : v
                    }
                  />
                  <Tooltip
                    {...darkTooltip}
                    formatter={(v) => fmtEuro(v)}
                  />
                  <Legend />
                  <Bar
                    dataKey="player1"
                    name={player1.short_name}
                    fill="#2F6BFF"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="player2"
                    name={player2.short_name}
                    fill="#A39E96"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="comparison-chart">
            <div className="empty-state">
              <Users size={44} />
              <h3>Select Two Players</h3>
              <p>
                Search and select two players above to compare their
                attributes side by side.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
