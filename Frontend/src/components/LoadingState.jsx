import { AlertCircle, SearchX } from 'lucide-react';

export function Loading({ message = 'Loading data…' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}

export function Error({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-container">
      <AlertCircle size={40} />
      <h3>Error</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function Empty({ message = 'No data found.' }) {
  return (
    <div className="empty-state">
      <SearchX size={40} />
      <h3>No Results</h3>
      <p>{message}</p>
    </div>
  );
}
