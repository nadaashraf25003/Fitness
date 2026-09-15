import React, { useState } from 'react';
import { HeroSection } from '../../Components/public/HeroSection';
import { AboutSection } from '../../Components/public/AboutSection';
import { ServicesSection } from '../../Components/public/ServicesSection';
import { MembershipPerksSection } from '../../Components/public/MembershipPerksSection';
import { PricingSection } from '../../Components/public/PricingSection';
import { Footer } from '../../Components/public/Footer';
import { SubscriptionRequestModal } from '../../Components/public/SubscriptionRequestModal';
import { CheckStatusModal } from '../../Components/public/CheckStatusModal';
import { Logo } from '../../Components/ui/Logo';
import { ThemeToggle } from '../../Components/ui/ThemeToggle';
import { Plan, SubscriptionRequest } from '../../types/subscription.types';
import { subscriptionService } from '../../services/subscriptionService';
import { Link } from 'react-router-dom';
import { PATHS } from '../../Routing/routePaths';
import { Search } from 'lucide-react';

const VERIFIED_STORAGE_KEY = 'gym_verified_public_member';

export const LandingPage: React.FC = () => {
  const [plans] = useState<Plan[]>(subscriptionService.getPlans());
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusSearchEmail, setStatusSearchEmail] = useState<string>('');
  const [verifiedMember, setVerifiedMember] = useState<SubscriptionRequest | null>(() => {
    try {
      const stored = localStorage.getItem(VERIFIED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleOpenCheckStatusFromTrial = (email?: string) => {
    setIsModalOpen(false);
    if (email) {
      setStatusSearchEmail(email);
    }
    setIsStatusModalOpen(true);
  };

  const handleMemberVerified = (member: SubscriptionRequest) => {
    setVerifiedMember(member);
    try {
      localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(member));
    } catch (e) {
      console.warn('Failed to cache verified member:', e);
    }
    setIsStatusModalOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col selection:bg-brand-primary/30 selection:text-brand-primary">
      {/* Public Top Navigation */}
      <header className="border-b border-border-subtle bg-surface/85 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm text-text-muted">
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-brand-primary transition-colors cursor-pointer font-medium"
            >
              Who We Are
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-brand-primary transition-colors cursor-pointer font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('membership-covers')}
              className="hover:text-brand-primary transition-colors cursor-pointer font-medium"
            >
              What's Covered
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-brand-primary transition-colors cursor-pointer font-medium"
            >
              Plans & Pricing
            </button>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Dynamic Profile Button (Directs directly to /profile page) */}
            {verifiedMember ? (
              <Link
                to={PATHS.PROFILE}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/40 hover:bg-brand-primary/20 text-xs font-bold text-text-main transition-all cursor-pointer shadow-sm group animate-in fade-in"
                title="Go to /profile & View Keycard"
              >
                <div className="w-5 h-5 rounded-full bg-brand-primary text-black flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                  {verifiedMember.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="group-hover:text-brand-primary transition-colors truncate max-w-[110px] sm:max-w-[140px]">
                  {verifiedMember.fullName}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold uppercase whitespace-nowrap">
                  {verifiedMember.status === 'approved' ? 'Active Pass' : 'In Review'}
                </span>
              </Link>
            ) : (
              /* Standard Check Status Button */
              <button
                onClick={() => {
                  setStatusSearchEmail('');
                  setIsStatusModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary text-xs font-medium text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Check Status</span>
              </button>
            )}

            <ThemeToggle size="sm" />

            <Link
              to={PATHS.LOGIN}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary text-xs sm:text-sm font-semibold text-text-main hover:text-brand-primary transition-all shadow-sm"
            >
              Portal Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Sections */}
      <main className="flex-1">
        <HeroSection onExplorePlans={() => scrollToSection('pricing')} />
        <AboutSection />
        <ServicesSection />
        <MembershipPerksSection />
        <PricingSection plans={plans} onSelectPlan={handleSelectPlan} />
      </main>

      {/* Subscription Request Modal */}
      <SubscriptionRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
        onOpenCheckStatus={handleOpenCheckStatusFromTrial}
      />

      {/* Check Status Tracking Modal */}
      <CheckStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusSearchEmail('');
        }}
        onSelectMember={handleMemberVerified}
        initialQuery={statusSearchEmail}
      />

      {/* Rich Footer with Copyright */}
      <Footer onNavigateSection={scrollToSection} />
    </div>
  );
};
