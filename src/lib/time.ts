export function timeToMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

export function timesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

export function slotDurationHours(startTime: string, endTime: string): number {
  return Math.max(1, (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60);
}

export function combineDateAndTime(date: string, hhmm: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = hhmm.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function minutesUntil(date: string, hhmm: string, now = new Date()): number {
  const target = combineDateAndTime(date, hhmm);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

export function isSlotInPast(date: string, startTime: string, now = new Date()): boolean {
  return minutesUntil(date, startTime, now) < 0;
}

export function isSlotFinished(date: string, endTime: string, now = new Date()): boolean {
  return minutesUntil(date, endTime, now) < 0;
}

export function formatDateLabel(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}
