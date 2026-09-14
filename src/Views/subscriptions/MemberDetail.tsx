import React from 'react';
import { Member } from '../../types/member.types';
import { Badge } from '../../Components/ui/Badge';
import { Avatar } from '../../Components/ui/Avatar';
import { Button } from '../../Components/ui/Button';
import { formatDate } from '../../utils/dateUtils';
import {
  IdCard,
  Barcode,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';

interface MemberDetailProps {
  member?: Member | null;
  onClose: () => void;
  onEdit?: (member: Member) => void;
}

export const MemberDetail: React.FC<MemberDetailProps> = ({ member, onClose, onEdit }) => {
  if (!member) return null;

  return (
    <div className="space-y-6">
      {/* Member Banner & Avatar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <Avatar src={member.photoUrl || undefined} name={member.fullName} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-text-main font-heading">{member.fullName}</h3>
              <Badge variant={member.status}>{member.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1.5">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-brand-primary" />
                {member.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-primary" />
                {member.phone}
              </span>
            </div>
          </div>
        </div>

        {member.memberCode && (
          <div className="px-4 py-2 rounded-xl bg-surface-card border border-border-subtle flex flex-col items-center sm:items-end">
            <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
              <IdCard className="w-3.5 h-3.5 text-brand-primary" />
              Member ID Code
            </span>
            <span className="font-mono text-base font-bold text-brand-primary mt-0.5">
              #{member.memberCode}
            </span>
          </div>
        )}
      </div>

      {/* Metrics & Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <CreditCard className="w-3.5 h-3.5 text-brand-primary" />
            <span>Plan Tier</span>
          </div>
          <p className="text-sm font-bold text-brand-primary">{member.planName}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span>Join Date</span>
          </div>
          <p className="text-sm font-semibold text-text-main">{formatDate(member.joinDate)}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <User className="w-3.5 h-3.5 text-brand-primary" />
            <span>Gender</span>
          </div>
          <p className="text-sm font-semibold text-text-main capitalize">{member.gender}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <Barcode className="w-3.5 h-3.5 text-brand-primary" />
            <span>Barcode</span>
          </div>
          <p className="text-sm font-mono font-semibold text-text-main">
            {member.barcode || 'N/A'}
          </p>
        </div>
      </div>

      {/* Staff Notes if any */}
      {member.note && (
        <div className="p-4 rounded-xl bg-surface-elevated/40 border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-brand-primary" />
            <span>Member Notes</span>
          </div>
          <p className="text-xs text-text-main leading-relaxed">{member.note}</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        {onEdit && (
          <Button variant="outline" onClick={() => onEdit(member)}>
            Edit Member
          </Button>
        )}
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default MemberDetail;
