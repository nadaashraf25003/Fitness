import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface p-6 rounded-2xl border border-border-subtle shadow-lg hover:border-brand-primary/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${className}`}
    >
      {/* Top subtle highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-surface-card flex items-center justify-center text-brand-primary border border-border-subtle group-hover:border-brand-primary/30 transition-colors">
          {icon}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-3xl font-extrabold text-text-main font-heading tracking-tight">{value}</h3>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            {trend && (
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-text-subtle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
