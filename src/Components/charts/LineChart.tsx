import React from 'react';

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  primaryLabel = 'Metric',
  secondaryLabel,
  height = 200,
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 bg-surface rounded-xl border border-border-subtle text-center text-text-muted text-xs ${className}`}>
        No chart data available
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = data
    .map((d, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = 100 - ((d.value - min) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={`bg-surface p-6 rounded-xl border border-border-subtle shadow-md ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-text-main font-heading">{title}</h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-brand-primary">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
              {primaryLabel}
            </span>
          </div>
        </div>
      )}

      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Subtle grid lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#2A2A3E" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#2A2A3E" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#2A2A3E" strokeWidth="0.5" strokeDasharray="2,2" />

          {/* Line Path */}
          <polyline
            fill="none"
            stroke="#00F0FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>

        {/* Labels below */}
        <div className="flex justify-between text-[10px] text-text-subtle mt-2">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
