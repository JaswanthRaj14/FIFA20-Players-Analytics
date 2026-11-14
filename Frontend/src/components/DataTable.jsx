export default function DataTable({ columns, data, title, total, pagination, onPageChange }) {
  return (
    <div className="table-container">
      {title && (
        <div className="table-header">
          <h3>{title}</h3>
          {total != null && (
            <span className="table-count">
              {total.toLocaleString()} player{total !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.sofifa_id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="pagination">
          <span className="pagination-info">
            Showing{' '}
            {pagination.offset + 1}–
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{' '}
            of {pagination.total.toLocaleString()}
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={pagination.offset === 0}
              onClick={() =>
                onPageChange(Math.max(0, pagination.offset - pagination.limit))
              }
            >
              Previous
            </button>
            <button
              className="pagination-btn"
              disabled={
                pagination.offset + pagination.limit >= pagination.total
              }
              onClick={() =>
                onPageChange(pagination.offset + pagination.limit)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
