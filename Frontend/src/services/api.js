import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Health ─────────────────────────────────────── */
export const checkHealth = () => api.get('/health');

/* ── Model ──────────────────────────────────────── */
export const getModelStatus = () => api.get('/model/status');
export const getModelInfo   = () => api.get('/model/info');

/* ── Players ────────────────────────────────────── */
export const getPlayersSummary      = () => api.get('/players/summary');
export const getPlayers             = (params) => api.get('/players', { params });
export const getPlayerDistributions = () => api.get('/players/distributions');
export const getPlayerFilters       = () => api.get('/players/filters');

/* ── Prediction ─────────────────────────────────── */
export const predictMarketValue = (data) => api.post('/predict', data);

export default api;
