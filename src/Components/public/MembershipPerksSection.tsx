import React from 'react';
import { CheckCircle2, Lock, Shield, Coffee, Wifi, Activity, Sparkles, UserPlus } from 'lucide-react';

export const MembershipPerksSection: React.FC = () => {
  const perks = [
    {
      icon: Activity,
      title: 'Full Facility & Equipment Access',
      description: 'Unrestricted use of all strength zones, cardio decks, functional turf, and Olympic platforms.',
    },
    {
      icon: Lock,
      title: 'Locker Rooms & Rain Showers',
      description: 'Private lockers, clean showers, grooming essentials, and blow dryers in modern locker rooms.',
    },
    {
      icon: Sparkles,
      title: 'Sauna & Recovery Spa Lounges',
      description: 'Access to infrared saunas, eucalyptus steam rooms, and post-workout recovery spaces.',
    },
    {
      icon: Activity,
      title: 'Digital Metric & Progress Tracking',
      description: 'Access to GEM member portal to log body measurements, weight progression, and workout logs.',
    },
    {
      icon: UserPlus,
      title: 'Complimentary Fitness Assessment',
      description: 'Initial 1-on-1 movement screening and goal setting consultation with a certified head coach.',
    },
    {
      icon: Wifi,
      title: 'Ultra-Fast Wi-Fi & Lounge Workspaces',
      description: 'High-speed internet throughout the facility and comfortable member lounge spaces.',
    },
  ];

  return (
    <section id="membership-covers" className="py-20 bg-surface/30 border-t border-border-subtle relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Membership Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main mt-2 mb-4">
            WHAT EVERY GEM MEMBERSHIP COVERS
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            All tiers include essential access perks designed to make your training seamless, hygienic, and enjoyable.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((p, idx) => (
            <div
              key={idx}
              className="bg-surface p-6 rounded-2xl border border-border-subtle hover:border-brand-primary/40 transition-all flex items-start gap-4 shadow-md group"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 border border-brand-primary/20 group-hover:scale-110 transition-transform">
                <p.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main font-heading mb-1.5 flex items-center gap-1.5">
                  {p.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
