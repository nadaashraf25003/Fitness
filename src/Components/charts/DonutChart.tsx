import React from 'react';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  title?: string;
  totalLabel?: string;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  totalLabel = 'Total',
  className = '',
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className={`bg-surface p-6 rounded-xl border border-border-subtle shadow-md ${className}`}>
      {title && <h4 className="text-sm font-semibold text-text-main font-heading mb-4">{title}</h4>}

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative w-36 h-36">
          <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
            {data.map((slice, index) => {
              const startPercent = cumulativePercent;
              const slicePercent = slice.value / total;
              cumulativePercent += slicePercent;

              const [startX, startY] = getCoordinatesForPercent(startPercent);
              const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
              const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(' ');

              return <path key={index} d={pathData} fill={slice.color} />;
            })}
            {/* Donut hole */}
            <circle cx="0" cy="0" r="0.65" fill="#0E1326" />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-text-main font-heading">{total}</span>
            <span className="text-[10px] text-text-subtle uppercase">{totalLabel}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-text-muted">{item.label}:</span>
              <span className="font-bold text-text-main">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
