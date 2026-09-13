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
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateTimeString: string | Date | undefined): string {
  if (!dateTimeString) return 'N/A';
  return `${formatDate(dateTimeString)} at ${formatTime(dateTimeString)}`;
}

export function getDaysRemaining(endDateString: string): number {
  const target = new Date(endDateString).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
