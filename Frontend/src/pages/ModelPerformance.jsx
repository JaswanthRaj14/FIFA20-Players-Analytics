import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Award, CheckCircle } from 'lucide-react';
import ChartCard from '../components/ChartCard';
import { Loading, Error } from '../components/LoadingState';
import { getModelInfo } from '../services/api';

/* ── Previously recorded evaluation results ──── */
const MODELS = [
  { name: 'Linear Regression',    short: 'Lin. Reg.',    mae: 1_322_556.20, rmse: 2_524_592.49, r2: 0.7830 },
  { name: 'Random Forest',        short: 'Rand. Forest', mae:   124_913.24, rmse:   719_051.13, r2: 0.9824 },
  { name: 'Tuned Random Forest',  short: 'Tuned RF',     mae:   129_941.65, rmse:   735_030.91, r2: 0.9816 },
  { name: 'Gradient Boosting',    short: 'Grad. Boost.', mae:   194_564.71, rmse:   615_623.89, r2: 0.9871 },
];

const fmtCur = (v) => {
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

export default function ModelPerformance() {
  const [info, setInfo]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getModelInfo();
      setInfo(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load model info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, []);

  if (loading) return <Loading message="Loading model information…" />;
  if (error)   return <Error message={error} onRetry={fetchInfo} />;

  return (
    <div>
      {/* ── Selected Model Card ──────────── */}
      <div className="selected-model-card">
        <div className="model-badge">
          <Award size={12} /> Selected Model
        </div>
        <h3 className="model-info-title">{info.model_name}</h3>
        {[
          ['Algorithm',         info.algorithm],
          ['Target Variable',   info.target],
          ['Training Records',  info.training_dataset_records?.toLocaleString()],
          ['Features Used',     info.features],
          ['MAE',               fmtCur(info.evaluation.mae_eur)],
          ['RMSE',              fmtCur(info.evaluation.rmse_eur)],
          ['R² Score',          info.evaluation.r2_score],
        ].map(([lbl, val]) => (
          <div className="metric-row" key={lbl}>
            <span className="metric-label">{lbl}</span>
            <span className="metric-value">{val}</span>
          </div>
        ))}
      </div>

      {/* ── Model Comparison Table ───────── */}
      <div className="model-table-card">
        <h3 className="model-table-title">All Models Comparison</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>MAE (€)</th>
                <th>RMSE (€)</th>
                <th>R²</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => {
                const selected = m.name === 'Gradient Boosting';
                return (
                  <tr
                    key={m.name}
                    className={selected ? 'model-row-selected' : ''}
                  >
                    <td style={{ fontWeight: selected ? 600 : 400 }}>
                      {m.name}
                    </td>
                    <td>{fmtCur(m.mae)}</td>
                    <td>{fmtCur(m.rmse)}</td>
                    <td>{m.r2.toFixed(4)}</td>
                    <td>
                      {selected && (
                        <span className="selected-label">
                          <CheckCircle size={14} /> Selected
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Charts ───────────────────────── */}
      <div className="charts-grid">
        <ChartCard title="MAE Comparison (Lower is Better)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MODELS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis dataKey="short" tick={TICK} />
              <YAxis tick={TICK} tickFormatter={fmtCur} />
              <Tooltip {...darkTooltip} formatter={(v) => fmtCur(v)} />
              <Bar dataKey="mae" name="MAE (€)" fill="#2F6BFF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="RMSE Comparison (Lower is Better)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MODELS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis dataKey="short" tick={TICK} />
              <YAxis tick={TICK} tickFormatter={fmtCur} />
              <Tooltip {...darkTooltip} formatter={(v) => fmtCur(v)} />
              <Bar dataKey="rmse" name="RMSE (€)" fill="#2F6BFF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="R² Score Comparison (Higher is Better)" fullWidth>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MODELS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
              <XAxis dataKey="short" tick={TICK} />
              <YAxis domain={[0, 1]} tick={TICK} />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="r2" name="R² Score" fill="#2F6BFF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Metric Explanations ──────────── */}
      <div className="metric-explanation">
        <h3>Understanding the Metrics</h3>
        <p>
          <strong>MAE (Mean Absolute Error):</strong> The average absolute
          difference between predicted and actual market values. Lower values
          indicate more accurate predictions. The Gradient Boosting model has
          an MAE of €194,565, meaning predictions are off by roughly €195K on
          average.
        </p>
        <p>
          <strong>RMSE (Root Mean Squared Error):</strong> Similar to MAE but
          penalises larger errors more heavily. The Gradient Boosting model
          achieves the lowest RMSE (€615,624) among all models tested,
          indicating strong performance even for high-value player predictions.
        </p>
        <p>
          <strong>R² (Coefficient of Determination):</strong> Measures how well
          the model explains the variance in market values. Ranges from 0 to 1
          where 1 is a perfect fit. The Gradient Boosting model's R² of 0.9871
          means it explains 98.71% of the variance in player market values.
        </p>
      </div>

      <p className="results-disclaimer">
        These are previously recorded evaluation results from the FIFA 20 model
        training process. They were not freshly calculated.
      </p>
    </div>
  );
}
