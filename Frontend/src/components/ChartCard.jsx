export default function ChartCard({ title, children, fullWidth = false }) {
  return (
    <div className={`chart-card${fullWidth ? ' chart-card-full' : ''}`}>
      {title && <h3 className="chart-card-title">{title}</h3>}
      {children}
    </div>
  );
}
