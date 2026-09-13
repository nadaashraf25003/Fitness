import React from 'react';
import { Target, Users, Award, ShieldCheck, HeartPulse, Zap } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const stats = [
    { label: 'Founded in', value: '2018' },
    { label: 'Square Footage', value: '25,000 sq ft' },
    { label: 'Certified Coaches', value: '15+' },
    { label: 'Active Members', value: '2,400+' },
  ];

  const pillars = [
    {
      icon: Target,
      title: 'Precision Performance',
      description: 'Science-backed strength conditioning, biomechanics analysis, and tailored training cycles for every fitness level.',
    },
    {
      icon: Award,
      title: 'Master Coaches',
      description: 'Elite trainers with international accreditations (CSCS, NASM, Olympic Lifting) dedicated to your progression.',
    },
    {
      icon: HeartPulse,
      title: 'Holistic Recovery',
      description: 'Integrated wellness with infrared saunas, cryo recovery, and body composition analytics.',
    },
    {
      icon: Users,
      title: 'Inspiring Community',
      description: 'An inclusive, high-energy environment built on mutual accountability and relentless dedication.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-surface/30 border-t border-border-subtle relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Who We Are
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main mt-2 mb-4">
            REDEFINING MODERN ATHLETIC FITNESS
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            At <strong>GEM</strong>, we believe fitness is not merely a workout routine — it is a discipline of strength, longevity, and self-mastery. We provide world-class equipment, elite coaching, and digital tracking to elevate every member to their peak.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-surface p-6 rounded-2xl border border-border-subtle hover:border-brand-primary/40 transition-all duration-300 shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-card flex items-center justify-center text-brand-primary mb-4 border border-border-subtle group-hover:border-brand-primary/30 group-hover:scale-110 transition-all">
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main font-heading mb-2">{p.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-2xl bg-surface border border-border-subtle shadow-lg">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-brand-primary">
                {s.value}
              </div>
              <div className="text-xs text-text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
