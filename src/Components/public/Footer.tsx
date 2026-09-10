import React from 'react';
import { Logo } from '../ui/Logo';
import { Link } from 'react-router-dom';
import { PATHS } from '../../Routing/routePaths';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

interface FooterProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection }) => {
  const scrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-border-subtle bg-surface/90 pt-16 pb-10 text-text-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border-subtle">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" />
            <p className="text-xs leading-relaxed text-text-muted">
              Next-generation athletic performance center and gym management operating system. Empowering athletes and fitness enthusiasts worldwide.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#instagram" className="w-8 h-8 rounded-lg bg-surface-card hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors border border-border-subtle text-text-muted">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#facebook" className="w-8 h-8 rounded-lg bg-surface-card hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors border border-border-subtle text-text-muted">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#twitter" className="w-8 h-8 rounded-lg bg-surface-card hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors border border-border-subtle text-text-muted">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#youtube" className="w-8 h-8 rounded-lg bg-surface-card hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors border border-border-subtle text-text-muted">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Public Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main font-heading mb-4">
              Explore GEM
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => scrollTo('about')}
                  className="hover:text-brand-primary transition-colors text-left cursor-pointer"
                >
                  Who We Are
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('services')}
                  className="hover:text-brand-primary transition-colors text-left cursor-pointer"
                >
                  Our Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('membership-covers')}
                  className="hover:text-brand-primary transition-colors text-left cursor-pointer"
                >
                  What Membership Covers
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('pricing')}
                  className="hover:text-brand-primary transition-colors text-left cursor-pointer"
                >
                  Membership Tiers & Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Operations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main font-heading mb-4">
              Staff Portal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to={PATHS.LOGIN} className="hover:text-brand-primary transition-colors">
                  Staff & Admin Sign In
                </Link>
              </li>
              <li>
                <Link to={PATHS.DASHBOARD} className="hover:text-brand-primary transition-colors">
                  Operations Dashboard
                </Link>
              </li>
              <li>
                <Link to={PATHS.ATTENDANCE} className="hover:text-brand-primary transition-colors">
                  Attendance Desk Log
                </Link>
              </li>
              <li>
                <Link to={PATHS.TRAINERS} className="hover:text-brand-primary transition-colors">
                  Trainer Rosters
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Facility Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main font-heading mb-4">
              Facility Location
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <span>100 Athletic Way, Performance Plaza, Suite 400</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>+1 (555) 800-4363</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>hello@gemfit.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-subtle gap-4">
          <p>© 2026 GEM Gym Management System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-text-main cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-text-main cursor-pointer transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-text-main cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
