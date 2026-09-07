import React from 'react';

interface BarDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  title?: string;
  height?: number;
  barColor?: string;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 180,
  barColor = 'bg-brand-primary',
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 bg-surface rounded-xl border border-border-subtle text-center text-text-muted text-xs ${className}`}>
        No chart data available
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`bg-surface p-6 rounded-xl border border-border-subtle shadow-md ${className}`}>
      {title && <h4 className="text-sm font-semibold text-text-main font-heading mb-6">{title}</h4>}

      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((d, index) => {
          const heightPercent = Math.max(Math.round((d.value / max) * 100), 4);
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] text-text-subtle group-hover:text-text-main transition-colors font-mono">
                {d.value}
              </span>
              <div
                className={`w-full max-w-[36px] rounded-t-md ${barColor} opacity-80 group-hover:opacity-100 transition-all`}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-[10px] text-text-muted font-medium truncate w-full text-center mt-1">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
