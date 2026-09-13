import React from 'react';
import { Dumbbell, UserCheck, Flame, HeartPulse, Shield, Clock, Sparkles } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: Dumbbell,
      title: 'Olympic & Strength Training',
      description: 'Fully equipped free weight platforms, calibrated Eleiko bumper plates, custom squat racks, and specialized strength machines.',
      tag: 'Strength Zone',
    },
    {
      icon: UserCheck,
      title: '1-on-1 Personal Coaching',
      description: 'Custom tailored progression programs, form correction, nutritional guidance, and dedicated accountability from certified master trainers.',
      tag: 'Coaching',
    },
    {
      icon: Flame,
      title: 'High-Intensity Group HIIT & Boxing',
      description: 'Dynamic conditioning circuits, boxing bags, kettlebell flows, and heart-rate monitored group workouts designed for peak endurance.',
      tag: 'Classes',
    },
    {
      icon: HeartPulse,
      title: 'Body Composition & Metabolic Analytics',
      description: 'Regular bio-impedance body scans tracking visceral fat, skeletal muscle mass, BMI classifications, and waist-to-hip ratios.',
      tag: 'Metrics',
    },
    {
      icon: Sparkles,
      title: 'Sauna & Recovery Hydro-Spa',
      description: 'Infrared cedarwood dry sauna, contrast cryo-recovery tubs, and massage therapy lounges to accelerate muscle regeneration.',
      tag: 'Recovery',
    },
    {
      icon: Clock,
      title: '24/7 Smart Keycard Facility Access',
      description: 'Full secure digital keycard access allowing you to train on your own schedule with zero time restrictions.',
      tag: 'All-Access',
    },
  ];

  return (
    <section id="services" className="py-20 bg-surface/10 border-t border-border-subtle relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main mt-2 mb-4">
            COMPREHENSIVE TRAINING & WELLNESS SOLUTIONS
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            From heavyweight powerlifting to metabolic conditioning and recovery, GEM gives you everything needed to surpass your goals under one roof.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="bg-surface p-7 rounded-2xl border border-border-subtle hover:border-brand-primary/40 transition-all duration-300 shadow-md flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-card flex items-center justify-center text-brand-primary border border-border-subtle group-hover:border-brand-primary/30 transition-colors">
                    <svc.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-surface-elevated text-brand-secondary border border-border-subtle font-semibold">
                    {svc.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-text-main font-heading mb-2.5">
                  {svc.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {svc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
