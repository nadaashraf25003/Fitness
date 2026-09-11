import React from 'react';
import { Plan } from '../../types/subscription.types';
import { Check, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface PricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect }) => {
  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
        plan.isPopular
          ? 'bg-surface-card border-2 border-brand-primary shadow-2xl shadow-brand-primary/20 scale-105 z-10'
          : 'bg-surface/90 border border-border-subtle hover:border-brand-primary/40 hover:bg-surface'
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-primary/30">
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          Most Popular
        </div>
      )}

      <div>
        <div className="flex justify-between items-baseline mb-4">
          <h3 className="text-xl font-bold text-text-main font-heading">{plan.name}</h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-elevated text-text-muted border border-border-subtle">
            {plan.durationMonths === 1 ? 'Monthly' : plan.durationMonths === 12 ? 'Annual' : `${plan.durationMonths} Mo`}
          </span>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-extrabold text-text-main font-heading">${plan.price}</span>
          <span className="text-text-muted text-sm ml-1.5">
            / {plan.durationMonths === 1 ? 'mo' : `${plan.durationMonths} months`}
          </span>
        </div>

        <ul className="space-y-3.5 mb-8 border-t border-border-subtle pt-6">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-sm text-text-muted">
              <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant={plan.isPopular ? 'primary' : 'outline'}
        size="lg"
        className="w-full"
        onClick={() => onSelect(plan)}
      >
        {plan.isPopular ? 'Start Free Trial' : 'Get Access'}
      </Button>
    </div>
  );
};
