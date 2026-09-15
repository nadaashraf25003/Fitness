import React from 'react';
import { AboutSection } from '../../Components/public/AboutSection';
import { Footer } from '../../Components/public/Footer';
import { HeroSection } from '../../Components/public/HeroSection';
import { MembershipPerksSection } from '../../Components/public/MembershipPerksSection';
import { ServicesSection } from '../../Components/public/ServicesSection';

export const LandingPage: React.FC = () => {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-surface text-text-main">
      <HeroSection onExplorePlans={scrollToPricing} />
      <AboutSection />
      <ServicesSection />
      <MembershipPerksSection />
      <Footer />
    </main>
  );
};
