import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Athletic Gym Barbell & Diamond Icon Mark */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-cyan-400 via-brand-primary to-brand-secondary p-[1.5px] shadow-lg shadow-brand-primary/20 flex-shrink-0`}
      >
        <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center relative overflow-hidden group">
          {/* Internal gradient lighting */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-transparent to-brand-secondary/20" />

          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5/6 h-5/6 relative z-10 drop-shadow-sm transition-transform group-hover:scale-110 duration-200"
          >
            {/* Left Outer Barbell Weight Plate */}
            <rect x="2" y="7" width="2" height="10" rx="1" fill="url(#gymLogoGrad)" />
            {/* Left Inner Weight Plate */}
            <rect x="5" y="5" width="2.5" height="14" rx="1.2" fill="url(#gymLogoGrad)" />
            
            {/* Center Barbell Rod */}
            <path
              d="M7.5 12h9"
              stroke="url(#gymLogoGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            
            {/* Right Inner Weight Plate */}
            <rect x="16.5" y="5" width="2.5" height="14" rx="1.2" fill="url(#gymLogoGrad)" />
            {/* Right Outer Weight Plate */}
            <rect x="20" y="7" width="2" height="10" rx="1" fill="url(#gymLogoGrad)" />

            {/* Center Power GEM Emblem on the Bar */}
            <polygon
              points="12,7.5 14.5,12 12,16.5 9.5,12"
              fill="#070913"
              stroke="url(#gymLogoGrad)"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="1.2" fill="#00F0FF" />

            <defs>
              <linearGradient id="gymLogoGrad" x1="2" y1="5" x2="22" y2="19" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading font-extrabold ${textSizes[size]} tracking-wider text-text-main leading-none`}>
            GEM<span className="text-brand-primary">.</span>FIT
          </span>
          {size !== 'sm' && (
            <span className="text-[9px] font-mono tracking-widest uppercase text-text-subtle mt-0.5">
              Gym & Fitness OS
            </span>
          )}
        </div>
      )}
    </div>
  );
};
