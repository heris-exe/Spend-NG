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
