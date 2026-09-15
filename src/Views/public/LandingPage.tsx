import React, { useState } from 'react';
import { AboutSection } from '../../Components/public/AboutSection';
import { Footer } from '../../Components/public/Footer';
import { HeroSection } from '../../Components/public/HeroSection';
import { MembershipPerksSection } from '../../Components/public/MembershipPerksSection';
import { PricingSection } from '../../Components/public/PricingSection';
import { ServicesSection } from '../../Components/public/ServicesSection';
import { SubscriptionRequestModal } from '../../Components/public/SubscriptionRequestModal';
import { Plan } from '../../types/subscription.types';

const membershipPlans: Plan[] = [
  {
    id: 'plan-basic',
    name: 'Basic Monthly',
    price: 29.99,
    durationMonths: 1,
    features: ['Gym floor access', 'Locker room access', 'Free Wi-Fi'],
    isActive: true,
  },
  {
    id: 'plan-pro',
    name: 'Pro 3-Month',
    price: 79.99,
    durationMonths: 3,
    features: ['Gym floor & cardio', 'All group classes', 'One trainer session', 'Sauna & steam'],
    isPopular: true,
    isActive: true,
  },
  {
    id: 'plan-vip',
    name: 'VIP Annual',
    price: 249.99,
    durationMonths: 12,
    features: ['24/7 access', 'Unlimited classes', 'Personal trainer', 'Nutrition consultation'],
    isActive: true,
  },
];

export const LandingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsRequestOpen(true);
  };

  return (
    <main className="min-h-screen bg-surface text-text-main">
      <HeroSection onExplorePlans={scrollToPricing} />
      <AboutSection />
      <ServicesSection />
      <MembershipPerksSection />
      <PricingSection plans={membershipPlans} onSelectPlan={handleSelectPlan} />
      <Footer />
      <SubscriptionRequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        selectedPlan={selectedPlan}
      />
    </main>
  );
};
