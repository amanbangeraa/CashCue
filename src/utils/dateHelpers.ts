import { format } from 'date-fns';

/**
 * Format date to display format (DD MMM YYYY)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'dd MMM yyyy');
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
  return formatDateISO(new Date());
}

/**
 * Parse date from input
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get month name from ISO date
 */
export function getMonthName(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'MMM yyyy');
}

/**
 * Get month-year key for grouping
 */
export function getMonthYearKey(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM');
}
