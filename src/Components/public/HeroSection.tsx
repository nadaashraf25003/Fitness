import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, Flame, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../Routing/routePaths';

interface HeroSectionProps {
  onExplorePlans: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplorePlans }) => {
  return (
    <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-primary/15 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-brand-secondary/15 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-card border border-brand-primary/30 text-xs font-semibold text-brand-primary mb-8 shadow-lg shadow-brand-primary/10">
          <Flame className="w-4 h-4 text-brand-primary fill-brand-primary" />
          <span>Next-Gen Athletic Performance & Operations</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading text-text-main tracking-tight leading-[1.1] mb-6">
          UNLEASH YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-cyan-200 to-brand-secondary">
            TRUE POTENTIAL
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Welcome to <strong className="text-text-main font-semibold">GEM</strong>. Elite training facility, certified master coaches, real-time metrics analytics, and seamless digital access.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={onExplorePlans} rightIcon={<ArrowRight className="w-5 h-5" />}>
            View Membership Plans
          </Button>

          <Link to={PATHS.LOGIN}>
            <Button variant="outline" size="lg">
              Staff / Admin Portal
            </Button>
          </Link>
        </div>

        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 max-w-4xl mx-auto border-t border-border-subtle pt-10">
          <div className="p-4 rounded-xl bg-surface/40 border border-border-subtle/50">
            <div className="text-2xl sm:text-3xl font-bold text-brand-primary font-heading">2,400+</div>
            <div className="text-xs text-text-muted mt-1">Active Members</div>
          </div>
          <div className="p-4 rounded-xl bg-surface/40 border border-border-subtle/50">
            <div className="text-2xl sm:text-3xl font-bold text-text-main font-heading">24/7</div>
            <div className="text-xs text-text-muted mt-1">Facility Access</div>
          </div>
          <div className="p-4 rounded-xl bg-surface/40 border border-border-subtle/50">
            <div className="text-2xl sm:text-3xl font-bold text-brand-secondary font-heading">15+</div>
            <div className="text-xs text-text-muted mt-1">Certified Coaches</div>
          </div>
          <div className="p-4 rounded-xl bg-surface/40 border border-border-subtle/50">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-heading">99.8%</div>
            <div className="text-xs text-text-muted mt-1">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};
