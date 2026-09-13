export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(timeString: string | Date | undefined): string {
  if (!timeString) return 'N/A';
  if (/^\d{1,2}:\d{2}$/.test(String(timeString))) {
    const [hours, minutes] = String(timeString).split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  }
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateTimeString: string | Date | undefined): string {
  if (!dateTimeString) return 'N/A';
  if (/^\d{1,2}:\d{2}$/.test(String(dateTimeString))) {
    return formatTime(dateTimeString);
  }
  return `${formatDate(dateTimeString)} at ${formatTime(dateTimeString)}`;
}

export function formatAttendanceTime(timeStr?: string | null, dateStr?: string | null): string {
  if (!timeStr) return '--:--';
  const formattedTime = formatTime(timeStr);
  if (dateStr) {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) {
      return `Today, ${formattedTime}`;
    }
    return `${formatDate(dateStr)}, ${formattedTime}`;
  }
  return formattedTime;
}

export function getDaysRemaining(endDateString: string): number {
  const target = new Date(endDateString).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
