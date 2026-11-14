export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
    </div>
  );
}
