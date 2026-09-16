import React from 'react';
import { Construction } from 'lucide-react';
import { EmptyState } from '../../Components/ui/EmptyState';

export const PlaceholderPage: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <section className="space-y-6">
    <div>
      <h1 className="text-3xl font-extrabold font-heading text-text-main">{title}</h1>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
    <EmptyState icon={<Construction className="h-7 w-7" />} title="This page is being prepared" description="The route is available and ready for its management tools to be added." />
  </section>
);
