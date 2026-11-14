import { useState } from 'react';
import { TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { predictMarketValue } from '../services/api';

/* ── Categorical options (exact FIFA 20 dataset values) ── */
const POSITIONS      = ['CAM','CB','CDM','CF','CM','GK','LB','LM','LW','LWB','RB','RM','RW','RWB','ST'];
const PREFERRED_FEET = ['Right', 'Left'];
const BODY_TYPES     = ['Lean','Normal','Stocky','Akinfenwa','C. Ronaldo','Courtois','Messi','Neymar','PLAYER_BODY_TYPE_25','Shaqiri'];
const WORK_RATES     = ['High/High','High/Medium','High/Low','Medium/High','Medium/Medium','Medium/Low','Low/High','Low/Medium','Low/Low'];
const REAL_FACE      = ['No', 'Yes'];

const fmtEuro = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v);

export default function MarketPredictor() {
  const [form, setForm] = useState({
    age: 25,
    overall: 75,
    potential: 80,
    wage_eur: 10000,
    international_reputation: 1,
    weak_foot: 3,
    skill_moves: 3,
    preferred_foot: 'Right',
    body_type: 'Normal',
    work_rate: 'Medium/Medium',
    real_face: 'No',
    primary_position: 'ST',
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const set = (key, raw) => {
    const value =
      typeof form[key] === 'number' ? Number(raw) : raw;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError(null);
      setPrediction(null);
      const res = await predictMarketValue(form);
      setPrediction(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || 'Prediction failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── slider helper ──────────────────── */
  const Slider = ({ label, field, min, max, step = 1 }) => (
    <div className="form-group">
      <label>
        {label} <span className="slider-value">{form[field]}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={form[field]}
        onChange={(e) => set(field, e.target.value)}
      />
    </div>
  );

  /* ── select helper ──────────────────── */
  const Select = ({ label, field, options }) => (
    <div className="form-group">
      <label>{label}</label>
      <select
        value={form[field]}
        onChange={(e) => set(field, e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div className="prediction-form">
        {/* ── Numerical Attributes ────────── */}
        <div className="form-card">
          <h3>Player Attributes</h3>
          <Slider label="Age"                      field="age"                      min={16} max={45} />
          <Slider label="Overall Rating"           field="overall"                  min={40} max={99} />
          <Slider label="Potential"                 field="potential"                min={40} max={99} />
          <div className="form-group">
            <label>Weekly Wage (€)</label>
            <input
              type="number"
              min="0"
              max="1000000"
              step="1000"
              value={form.wage_eur}
              onChange={(e) => set('wage_eur', e.target.value)}
            />
          </div>
          <Slider label="International Reputation" field="international_reputation" min={1} max={5} />
          <Slider label="Weak Foot"                field="weak_foot"                min={1} max={5} />
          <Slider label="Skill Moves"              field="skill_moves"              min={1} max={5} />
        </div>

        {/* ── Categorical Profile ────────── */}
        <div className="form-card">
          <h3>Player Profile</h3>
          <Select label="Primary Position" field="primary_position" options={POSITIONS} />
          <Select label="Preferred Foot"   field="preferred_foot"   options={PREFERRED_FEET} />
          <Select label="Body Type"        field="body_type"        options={BODY_TYPES} />
          <Select label="Work Rate"        field="work_rate"        options={WORK_RATES} />
          <Select label="Real Face"        field="real_face"        options={REAL_FACE} />
        </div>

        {/* ── Predict Button ─────────────── */}
        <button
          className="predict-btn"
          onClick={handlePredict}
          disabled={loading}
        >
          {loading
            ? <><Loader2 size={20} className="spinning" /> Predicting…</>
            : <><TrendingUp size={20} /> Predict Market Value</>}
        </button>

        {/* ── Error ──────────────────────── */}
        {error && (
          <div className="prediction-error">
            <h3 style={{ color: '#EF4444', fontSize: '15px', fontWeight: 600 }}>
              Prediction Failed
            </h3>
            <p style={{ color: '#5C564E', marginTop: '8px', fontSize: '13px' }}>
              {error}
            </p>
          </div>
        )}

        {/* ── Result ─────────────────────── */}
        {prediction && (
          <div className="prediction-result">
            <h3>Estimated Market Value</h3>
            <div className="prediction-value">
              {fmtEuro(prediction.predicted_market_value_eur)}
            </div>
            <p className="prediction-model">
              Predicted by {prediction.model}
            </p>
            <div className="prediction-disclaimer">
              <AlertTriangle
                size={14}
                style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}
              />
              This is a machine learning model estimate based on FIFA 20 data.
              It is not an official player valuation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
