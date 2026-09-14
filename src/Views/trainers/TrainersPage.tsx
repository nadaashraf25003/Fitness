import React, { useState } from 'react';
import { useTrainers } from '../../Hooks/useTrainers';
import { Trainer } from '../../types/trainer.types';
import { Button } from '../../Components/ui/Button';
import { Avatar } from '../../Components/ui/Avatar';
import { Badge } from '../../Components/ui/Badge';
import { FormInput } from '../../Components/ui/FormInput';
import { Modal } from '../../Components/ui/Modal';
import { ConfirmDialog } from '../../Components/ui/ConfirmDialog';
import { StatCard } from '../../Components/ui/StatCard';
import { TrainerSchedule } from './TrainerSchedule';
import { isValidEmail, isValidPhone } from '../../utils/validationUtils';
import {
  UserCheck,
  Plus,
  Calendar,
  Award,
  DollarSign,
  Users,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const TrainersPage: React.FC = () => {
  const {
    trainers,
    schedules,
    loading,
    error,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    addSchedule,
    refresh,
  } = useTrainers();

  const [activeTab, setActiveTab] = useState<'cards' | 'schedule'>('cards');
  const [search, setSearch] = useState<string>('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);
  const [scheduleFocusTrainerId, setScheduleFocusTrainerId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Trainer Form State
  const [newTrainer, setNewTrainer] = useState({
    fullName: '',
    specialty: '',
    bio: '',
    hourlyRate: 45.0,
    phone: '',
    email: '',
    photoUrl: '',
    isAvailable: true,
    assignedMembersCount: 0,
  });

  // Unique specialties for filter dropdown
  const specialties = Array.from(new Set(trainers.map((t) => t.specialty).filter(Boolean)));

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.specialty.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || t.specialty === filterSpecialty;
    const matchesAvail = !onlyAvailable || t.isAvailable;
    return matchesSearch && matchesSpecialty && matchesAvail;
  });

  // Calculate statistics
  const totalTrainers = trainers.length;
  const availableTrainers = trainers.filter((t) => t.isAvailable).length;
  const totalAssignedClients = trainers.reduce((acc, t) => acc + (t.assignedMembersCount || 0), 0);
  const avgHourlyRate =
    totalTrainers > 0
      ? (trainers.reduce((acc, t) => acc + (t.hourlyRate || 0), 0) / totalTrainers).toFixed(0)
      : '0';

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTrainer.fullName.trim()) {
      setFormError('Trainer name is required');
      return;
    }
    if (!isValidEmail(newTrainer.email.trim())) {
      setFormError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTrainer({
        fullName: newTrainer.fullName.trim(),
        specialty: newTrainer.specialty.trim() || 'General Fitness',
        bio: newTrainer.bio.trim() || 'Dedicated certified fitness coach.',
        hourlyRate: Number(newTrainer.hourlyRate) || 40,
        phone: newTrainer.phone.trim() || '+1 555-0100',
        email: newTrainer.email.trim(),
        photoUrl:
          newTrainer.photoUrl.trim() ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        isAvailable: newTrainer.isAvailable,
        assignedMembersCount: Number(newTrainer.assignedMembersCount) || 0,
      });

      setNewTrainer({
        fullName: '',
        specialty: '',
        bio: '',
        hourlyRate: 45.0,
        phone: '',
        email: '',
        photoUrl: '',
        isAvailable: true,
        assignedMembersCount: 0,
      });
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainer) return;
    setFormError(null);

    setIsSubmitting(true);
    try {
      await updateTrainer(editingTrainer.id, {
        fullName: editingTrainer.fullName.trim(),
        specialty: editingTrainer.specialty.trim(),
        bio: editingTrainer.bio.trim(),
        hourlyRate: Number(editingTrainer.hourlyRate) || 0,
        phone: editingTrainer.phone.trim(),
        email: editingTrainer.email.trim(),
        photoUrl: editingTrainer.photoUrl?.trim() || undefined,
        isAvailable: editingTrainer.isAvailable,
        assignedMembersCount: Number(editingTrainer.assignedMembersCount) || 0,
      });
      setEditingTrainer(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-brand-primary" />
            Trainers & Coach Rosters
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Coach credentials, specialties, client rosters, and facility schedule management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refresh()}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Coach
          </Button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Instructors"
          value={String(totalTrainers)}
          subtitle="Certified gym personnel"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Available Now"
          value={String(availableTrainers)}
          subtitle="Accepting private clients"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <StatCard
          title="Assigned Clients"
          value={String(totalAssignedClients)}
          subtitle="Active member roster load"
          icon={<Sparkles className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Hourly Rate"
          value={`$${avgHourlyRate}`}
          subtitle="Hourly coaching benchmark"
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'cards'
              ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
              : 'text-text-muted hover:text-text-main hover:bg-surface-elevated'
          }`}
        >
          <Award className="w-4 h-4" />
          Coach Roster ({trainers.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
              : 'text-text-muted hover:text-text-main hover:bg-surface-elevated'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Weekly Class Schedule ({schedules.length})
        </button>
      </div>

      {/* TAB 1: COACH CARDS GRID */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <FormInput
                placeholder="Search coaches by name, specialty, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-main text-xs font-medium focus:outline-none focus:border-brand-primary"
              >
                <option value="all">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs font-semibold text-text-muted cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-border-subtle bg-surface-card text-brand-primary accent-brand-primary"
                />
                <span>Available Only</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Trainers Cards Grid */}
          {filteredTrainers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface border border-dashed border-border-subtle">
              <UserCheck className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h4 className="text-base font-bold text-text-main font-heading">
                No Coaches Match Search
              </h4>
              <p className="text-xs text-text-muted mt-1">
                Try modifying your search criteria or add a new trainer to the system.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="bg-surface rounded-2xl border border-border-subtle p-6 hover:border-brand-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-sm relative group"
                >
                  <div>
                    {/* Top Row: Avatar & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <Avatar src={trainer.photoUrl} name={trainer.fullName} size="lg" />
                        <div>
                          <h3 className="text-base font-bold text-text-main font-heading">
                            {trainer.fullName}
                          </h3>
                          <div className="text-xs text-brand-primary font-semibold flex items-center gap-1 mt-0.5">
                            <Award className="w-3.5 h-3.5" />
                            {trainer.specialty}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                          trainer.isAvailable
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {trainer.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mt-4">
                      {trainer.bio}
                    </p>

                    {/* Contact Details */}
                    <div className="pt-3.5 space-y-1.5 text-xs text-text-muted">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-brand-primary" />
                        <span className="truncate">{trainer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{trainer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Pill Grid */}
                  <div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border-subtle text-xs mb-3">
                      <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                        <span className="text-text-subtle block text-[10px] uppercase font-bold">
                          Hourly Rate
                        </span>
                        <span className="font-bold text-text-main font-heading text-sm">
                          ${trainer.hourlyRate}/hr
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                        <span className="text-text-subtle block text-[10px] uppercase font-bold">
                          Active Roster
                        </span>
                        <span className="font-bold text-brand-primary font-heading text-sm">
                          {trainer.assignedMembersCount} Clients
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setScheduleFocusTrainerId(trainer.id);
                          setActiveTab('schedule');
                        }}
                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      >
                        Schedule
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTrainer(trainer)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTrainerToDelete(trainer)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCHEDULE */}
      {activeTab === 'schedule' && (
        <TrainerSchedule
          trainers={trainers}
          schedules={schedules}
          onAddSchedule={addSchedule}
          selectedTrainerId={scheduleFocusTrainerId}
        />
      )}

      {/* MODAL 1: ADD NEW TRAINER */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Gym Coach"
        subtitle="Create a trainer profile, assign specialty, and set client hourly rates."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <FormInput
            label="Full Name"
            placeholder="e.g. Marcus Thorne"
            value={newTrainer.fullName}
            onChange={(e) => setNewTrainer({ ...newTrainer, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Specialty / Discipline"
              placeholder="e.g. Strength & Conditioning"
              value={newTrainer.specialty}
              onChange={(e) => setNewTrainer({ ...newTrainer, specialty: e.target.value })}
              required
            />

            <FormInput
              label="Hourly Rate ($/hr)"
              type="number"
              step="1"
              value={String(newTrainer.hourlyRate)}
              onChange={(e) =>
                setNewTrainer({ ...newTrainer, hourlyRate: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="marcus.t@gym.com"
              value={newTrainer.email}
              onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
              required
            />

            <FormInput
              label="Phone Number"
              type="tel"
              placeholder="+1 555-0199"
              value={newTrainer.phone}
              onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Photo URL"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={newTrainer.photoUrl}
            onChange={(e) => setNewTrainer({ ...newTrainer, photoUrl: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Coach Bio & Qualifications
            </label>
            <textarea
              rows={3}
              value={newTrainer.bio}
              onChange={(e) => setNewTrainer({ ...newTrainer, bio: e.target.value })}
              placeholder="Certifications, athletic background, and coaching philosophy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-main text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={newTrainer.isAvailable}
              onChange={(e) => setNewTrainer({ ...newTrainer, isAvailable: e.target.checked })}
              className="w-4 h-4 rounded border-border-subtle bg-surface-card text-brand-primary accent-brand-primary"
            />
            <span>Currently Available for Client Bookings</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Trainer Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT TRAINER */}
      <Modal
        isOpen={!!editingTrainer}
        onClose={() => setEditingTrainer(null)}
        title="Edit Coach Profile"
        subtitle={`Editing profile for ${editingTrainer?.fullName}`}
      >
        {editingTrainer && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <FormInput
              label="Full Name"
              value={editingTrainer.fullName}
              onChange={(e) =>
                setEditingTrainer({ ...editingTrainer, fullName: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Specialty"
                value={editingTrainer.specialty}
                onChange={(e) =>
                  setEditingTrainer({ ...editingTrainer, specialty: e.target.value })
                }
                required
              />

              <FormInput
                label="Hourly Rate ($/hr)"
                type="number"
                value={String(editingTrainer.hourlyRate)}
                onChange={(e) =>
                  setEditingTrainer({
                    ...editingTrainer,
                    hourlyRate: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Email Address"
                type="email"
                value={editingTrainer.email}
                onChange={(e) =>
                  setEditingTrainer({ ...editingTrainer, email: e.target.value })
                }
                required
              />

              <FormInput
                label="Phone Number"
                type="tel"
                value={editingTrainer.phone}
                onChange={(e) =>
                  setEditingTrainer({ ...editingTrainer, phone: e.target.value })
                }
                required
              />
            </div>

            <FormInput
              label="Photo URL"
              type="url"
              value={editingTrainer.photoUrl || ''}
              onChange={(e) =>
                setEditingTrainer({ ...editingTrainer, photoUrl: e.target.value })
              }
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Coach Bio
              </label>
              <textarea
                rows={3}
                value={editingTrainer.bio}
                onChange={(e) =>
                  setEditingTrainer({ ...editingTrainer, bio: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-main text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={editingTrainer.isAvailable}
                onChange={(e) =>
                  setEditingTrainer({ ...editingTrainer, isAvailable: e.target.checked })
                }
                className="w-4 h-4 rounded border-border-subtle bg-surface-card text-brand-primary accent-brand-primary"
              />
              <span>Currently Available for Bookings</span>
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button type="button" variant="ghost" onClick={() => setEditingTrainer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm Delete Trainer Dialog */}
      <ConfirmDialog
        isOpen={!!trainerToDelete}
        onClose={() => setTrainerToDelete(null)}
        onConfirm={async () => {
          if (trainerToDelete) {
            await deleteTrainer(trainerToDelete.id);
            setTrainerToDelete(null);
          }
        }}
        title="Remove Coach Profile"
        message={`Are you sure you want to remove ${trainerToDelete?.fullName} from the gym roster? Active client assignments and scheduled sessions will need to be reallocated.`}
        confirmText="Remove Coach"
        isDangerous={true}
      />
    </div>
  );
};

export default TrainersPage;
