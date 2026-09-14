import React, { useState } from 'react';
import { useMembers } from '../../Hooks/useMembers';
import { usePlans } from '../../Hooks/usePlans';
import { Member } from '../../types/member.types';
import { Plan } from '../../types/subscription.types';
import { Table, Column } from '../../Components/ui/Table';
import { Badge } from '../../Components/ui/Badge';
import { Button } from '../../Components/ui/Button';
import { Avatar } from '../../Components/ui/Avatar';
import { FormInput } from '../../Components/ui/FormInput';
import { Select } from '../../Components/ui/Select';
import { Modal } from '../../Components/ui/Modal';
import { ConfirmDialog } from '../../Components/ui/ConfirmDialog';
import { StatCard } from '../../Components/ui/StatCard';
import { PricingCard } from '../../Components/ui/PricingCard';
import { AddMemberForm } from './AddMemberForm';
import { MemberDetail } from './MemberDetail';
import { formatDate } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';
import { PATHS } from '../../Routing/routePaths';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  Inbox,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  CreditCard,
} from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const {
    members,
    loading: membersLoading,
    error: membersError,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    selectedMember,
    setSelectedMember,
    deleteMember,
    refresh: refreshMembers,
  } = useMembers();

  const {
    plans,
    loading: plansLoading,
    error: plansError,
    addPlan,
    deletePlan,
    refresh: refreshPlans,
  } = usePlans();

  const [activeTab, setActiveTab] = useState<'members' | 'plans'>('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // New Plan form state
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: 49.99,
    durationMonths: 1,
    featuresText: 'Gym Floor Access\nLocker Room\nFree WiFi',
    isPopular: false,
    isActive: true,
  });

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const expiringMembersCount = members.filter((m) => m.status === 'expiring').length;

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name.trim()) return;

    const features = newPlan.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    await addPlan({
      name: newPlan.name.trim(),
      price: Number(newPlan.price),
      durationMonths: Number(newPlan.durationMonths),
      features,
      isPopular: newPlan.isPopular,
      isActive: true,
    });

    setNewPlan({
      name: '',
      price: 49.99,
      durationMonths: 1,
      featuresText: 'Gym Floor Access\nLocker Room\nFree WiFi',
      isPopular: false,
      isActive: true,
    });
    setShowAddPlanModal(false);
  };

  const columns: Column<Member>[] = [
    {
      key: 'fullName',
      header: 'Member Profile',
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar src={m.photoUrl || undefined} name={m.fullName} size="md" />
          <div>
            <div className="font-semibold text-text-main flex items-center gap-2">
              <span>{m.fullName}</span>
              {m.memberCode && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-text-muted border border-border-subtle">
                  #{m.memberCode}
                </span>
              )}
            </div>
            <div className="text-xs text-text-muted">{m.email} • {m.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Membership Tier',
      render: (m) => (
        <span className="font-bold text-brand-primary flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          {m.planName}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <Badge variant={m.status}>{m.status}</Badge>,
    },
    {
      key: 'joinDate',
      header: 'Joined',
      render: (m) => <span className="text-xs text-text-muted">{formatDate(m.joinDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMember(m)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMemberToDelete(m)}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main flex items-center gap-3">
            <Users className="w-7 h-7 text-brand-primary" />
            Members & Subscription Plans
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Manage gym subscribers, pricing packages, active memberships, and enrollment requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              refreshMembers();
              refreshPlans();
            }}
            isLoading={membersLoading || plansLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Sync
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddMemberModal(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Member
          </Button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Subscribers"
          value={String(members.length)}
          subtitle="Registered gym members"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Active Memberships"
          value={String(activeMembersCount)}
          subtitle="Full facility access pass"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Expiring Soon"
          value={String(expiringMembersCount)}
          subtitle="Due for renewal this week"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Tier Packages"
          value={String(plans.length)}
          subtitle="Active membership plans"
          icon={<Layers className="w-5 h-5" />}
        />
      </div>

      {/* Quick Access Banner to Public Inquiries */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-primary/15 via-surface-card to-surface-card border border-brand-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-brand-primary/5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-primary text-black flex items-center justify-center font-bold flex-shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">
              Incoming Online Subscription Inquiries
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              Review and 1-click approve pending membership applications submitted from the storefront.
            </p>
          </div>
        </div>
        <Link to={PATHS.SUBSCRIPTION_REQUESTS}>
          <Button variant="outline" size="sm">
            Open Requests Inbox →
          </Button>
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
              : 'text-text-muted hover:text-text-main hover:bg-surface-elevated'
          }`}
        >
          <Users className="w-4 h-4" />
          Members Directory ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'plans'
              ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
              : 'text-text-muted hover:text-text-main hover:bg-surface-elevated'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Membership Plans ({plans.length})
        </button>
      </div>

      {/* TAB 1: MEMBERS DIRECTORY */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Search & Status Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <FormInput
                placeholder="Search members by full name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Member Statuses' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'expiring', label: 'Expiring Soon' },
                  { value: 'expired', label: 'Expired' },
                ]}
              />
            </div>
          </div>

          {membersError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {membersError}
            </div>
          )}

          {/* Members Table */}
          <Table
            columns={columns}
            data={members}
            keyExtractor={(m) => m.id}
            isLoading={membersLoading}
            emptyMessage="No member records match the criteria. Try clearing search filters or add a new member."
          />
        </div>
      )}

      {/* TAB 2: MEMBERSHIP PLANS & TIERS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-main font-heading">
                Gym Membership Packages & Pricing Tiers
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Configure rates, access perks, duration terms, and popular highlight badges.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddPlanModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Membership Plan
            </Button>
          </div>

          {plansError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {plansError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {plans.map((plan) => (
              <div key={plan.id} className="relative group">
                <PricingCard plan={plan} onSelect={() => setShowAddMemberModal(true)} />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                  <button
                    onClick={() => setPlanToDelete(plan)}
                    className="p-1.5 rounded-lg bg-surface/80 hover:bg-rose-500/20 text-rose-400 transition-colors border border-border-subtle hover:border-rose-500/40"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Register New Member */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Register New Gym Member"
        subtitle="Create an active subscriber record and assign their membership tier."
      >
        <AddMemberForm
          onSuccess={() => {
            setShowAddMemberModal(false);
            refreshMembers();
          }}
          onCancel={() => setShowAddMemberModal(false)}
        />
      </Modal>

      {/* Modal 2: View Member Details */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="Member Profile & Subscription"
        subtitle={`Subscriber ID: ${selectedMember?.id}`}
      >
        <MemberDetail
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      </Modal>

      {/* Modal 3: Create Plan */}
      <Modal
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        title="Add New Membership Plan"
        subtitle="Define a subscription duration, pricing rate, and included benefits."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <FormInput
            label="Plan Title"
            placeholder="e.g. Platinum 6-Month Pass"
            value={newPlan.name}
            onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Price ($ USD)"
              type="number"
              step="0.01"
              value={String(newPlan.price)}
              onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
              required
            />

            <FormInput
              label="Duration (Months)"
              type="number"
              min="1"
              max="36"
              value={String(newPlan.durationMonths)}
              onChange={(e) =>
                setNewPlan({ ...newPlan, durationMonths: parseInt(e.target.value) || 1 })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Included Features & Amenities (One per line)
            </label>
            <textarea
              rows={4}
              value={newPlan.featuresText}
              onChange={(e) => setNewPlan({ ...newPlan, featuresText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-main text-xs focus:outline-none focus:border-brand-primary font-sans"
              required
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={newPlan.isPopular}
              onChange={(e) => setNewPlan({ ...newPlan, isPopular: e.target.checked })}
              className="w-4 h-4 rounded border-border-subtle bg-surface-card text-brand-primary accent-brand-primary"
            />
            <span>Highlight as "Most Popular" Plan</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={() => setShowAddPlanModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Member Dialog */}
      <ConfirmDialog
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={async () => {
          if (memberToDelete) {
            await deleteMember(memberToDelete.id);
            setMemberToDelete(null);
          }
        }}
        title="Delete Member Account"
        message={`Are you sure you want to delete ${memberToDelete?.fullName}? This will terminate their active pass and remove all access credentials.`}
        confirmText="Yes, Delete Member"
        isDangerous={true}
      />

      {/* Confirm Delete Plan Dialog */}
      <ConfirmDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={async () => {
          if (planToDelete) {
            await deletePlan(planToDelete.id);
            setPlanToDelete(null);
          }
        }}
        title="Delete Membership Plan"
        message={`Are you sure you want to deactivate and remove ${planToDelete?.name}? Existing subscribers will remain active until renewal.`}
        confirmText="Deactivate Plan"
        isDangerous={true}
      />
    </div>
  );
};

export default SubscriptionsPage;
