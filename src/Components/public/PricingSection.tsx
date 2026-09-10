import React from 'react';
import { Plan } from '../../types/subscription.types';
import { PricingCard } from '../ui/PricingCard';

interface PricingSectionProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ plans, onSelectPlan }) => {
  return (
    <section id="pricing" className="py-20 bg-surface/20 border-t border-border-subtle relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Membership Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main mt-2 mb-4">
            CHOOSE YOUR LEVEL OF EXCELLENCE
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            Transparent, flexible tiers with zero hidden registration fees. Pick the plan that matches your training frequency and lifestyle goals.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} onSelect={onSelectPlan} />
          ))}
        </div>
      </div>
    </section>
  );
};
