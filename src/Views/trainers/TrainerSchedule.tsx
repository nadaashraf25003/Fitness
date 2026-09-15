import React, { useState } from 'react';
import { Trainer, ClassSchedule } from '../../types/trainer.types';
import { Button } from '../../Components/ui/Button';
import { FormInput } from '../../Components/ui/FormInput';
import { Select } from '../../Components/ui/Select';
import { Modal } from '../../Components/ui/Modal';
import { Avatar } from '../../Components/ui/Avatar';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Filter,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';

interface TrainerScheduleProps {
  trainers: Trainer[];
  schedules: ClassSchedule[];
  onAddSchedule?: (schedule: Omit<ClassSchedule, 'id'>) => void;
  selectedTrainerId?: string | null;
}

const DAYS = ['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TrainerSchedule: React.FC<TrainerScheduleProps> = ({
  trainers,
  schedules,
  onAddSchedule,
  selectedTrainerId: initialTrainerId,
}) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(initialTrainerId || 'all');
  const [selectedDay, setSelectedDay] = useState<string>('All Days');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newSession, setNewSession] = useState({
    name: '',
    trainerId: trainers[0]?.id || '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    capacity: 15,
  });

  const filteredSchedules = schedules.filter((s) => {
    const matchesTrainer =
      selectedTrainerId === 'all' || s.trainerId === selectedTrainerId;
    const matchesDay = selectedDay === 'All Days' || s.dayOfWeek === selectedDay;
    return matchesTrainer && matchesDay;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.name.trim() || !newSession.trainerId) return;

    const coach = trainers.find((t) => t.id === newSession.trainerId);
    if (onAddSchedule) {
      onAddSchedule({
        name: newSession.name.trim(),
        trainerId: newSession.trainerId,
        trainerName: coach?.fullName || 'Coach',
        dayOfWeek: newSession.dayOfWeek,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        capacity: Number(newSession.capacity),
        enrolled: 0,
      });
    }

    setNewSession({
      name: '',
      trainerId: trainers[0]?.id || '',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      capacity: 15,
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border-subtle">
        <div className="flex flex-wrap items-center gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-brand-primary text-black font-bold shadow-md shadow-brand-primary/20'
                  : 'bg-surface-card text-text-muted hover:text-text-main hover:bg-surface-elevated border border-border-subtle'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              options={[
                { value: 'all', label: 'All Trainers' },
                ...trainers.map((t) => ({ value: t.id, label: t.fullName })),
              ]}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Session
          </Button>
        </div>
      </div>

      {/* Schedule Sessions Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface border border-dashed border-border-subtle">
          <CalendarDays className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h4 className="text-base font-bold text-text-main font-heading">
            No Scheduled Classes Found
          </h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            There are no classes scheduled for the selected filters. Add a new session or choose another day.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSelectedTrainerId('all');
              setSelectedDay('All Days');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((session) => {
            const coach = trainers.find((t) => t.id === session.trainerId);
            const fillPercentage = Math.min(
              100,
              Math.round((session.enrolled / (session.capacity || 1)) * 100)
            );

            return (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-brand-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {session.dayOfWeek}
                    </span>
                    <span className="text-xs font-mono font-semibold text-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-primary" />
                      {session.startTime} - {session.endTime}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-text-main font-heading leading-snug">
                    {session.name}
                  </h4>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-border-subtle">
                  <Avatar
                    src={coach?.photoUrl}
                    name={session.trainerName || coach?.fullName || 'Coach'}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-text-main truncate">
                      {session.trainerName || coach?.fullName}
                    </div>
                    <div className="text-[11px] text-text-muted truncate">
                      {coach?.specialty || 'Lead Instructor'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border-subtle text-xs">
                  <div className="flex justify-between text-text-muted font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-primary" />
                      Class Roster
                    </span>
                    <span className="font-bold text-text-main">
                      {session.enrolled} / {session.capacity} Enrolled
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary rounded-full transition-all duration-500"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Session Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule New Training Session"
        subtitle="Add a group fitness class or coach session to the facility weekly calendar."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <FormInput
            label="Class / Session Title"
            placeholder="e.g. Functional Cross-Training"
            value={newSession.name}
            onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
            required
          />

          <Select
            label="Assigned Coach"
            value={newSession.trainerId}
            onChange={(e) => setNewSession({ ...newSession, trainerId: e.target.value })}
            options={trainers.map((t) => ({
              value: t.id,
              label: `${t.fullName} (${t.specialty})`,
            }))}
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Day"
              value={newSession.dayOfWeek}
              onChange={(e) => setNewSession({ ...newSession, dayOfWeek: e.target.value })}
              options={DAYS.filter((d) => d !== 'All Days').map((d) => ({
                value: d,
                label: d,
              }))}
            />

            <FormInput
              label="Start Time"
              type="time"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
              required
            />

            <FormInput
              label="End Time"
              type="time"
              value={newSession.endTime}
              onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Maximum Class Capacity"
            type="number"
            min="1"
            max="100"
            value={String(newSession.capacity)}
            onChange={(e) =>
              setNewSession({ ...newSession, capacity: parseInt(e.target.value) || 15 })
            }
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainerSchedule;
