/**
 * Shared helpers for expense formatting and dates.
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return DAYS[d.getDay()];
}

export function formatAmount(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Current week range using Sunday as start (to match existing dashboard behavior). */
export function getCurrentWeekRangeYmd(now = new Date()) {
  const daysFromSunday = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromSunday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const toYmd = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { weekStartStr: toYmd(weekStart), weekEndStr: toYmd(weekEnd) };
}

/** Format an ISO datetime string (e.g. Supabase created_at) as HH:MM in the user's local time. */
export function formatTimeFromISO(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
