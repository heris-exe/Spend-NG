/**
 * Sun-based time-of-day slot calculation using SunCalc.
 * Used by the day-cycle theme to align dawn/dusk with real sunrise/sunset.
 */

import SunCalc from 'suncalc'

/** Slot ids we use in the day-cycle theme (must match data-time values in CSS). */
export const DAY_CYCLE_SLOT_IDS = ['night', 'dawn', 'morning', 'day', 'evening', 'dusk']

/**
 * Get sun times for a given date and location.
 * @param {Date} date
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {{ dawn: Date, sunrise: Date, sunriseEnd: Date, goldenHourEnd: Date, goldenHour: Date, sunsetStart: Date, sunset: Date, dusk: Date }}
 */
export function getSunTimes(date, lat, lng) {
  const times = SunCalc.getTimes(date, lat, lng)
  return {
    dawn: times.dawn,
    sunrise: times.sunrise,
    sunriseEnd: times.sunriseEnd,
    goldenHourEnd: times.goldenHourEnd,
    goldenHour: times.goldenHour,
    sunsetStart: times.sunsetStart,
    sunset: times.sunset,
    dusk: times.dusk,
  }
}

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime())
}

/**
 * Get the current day-cycle slot id based on real sun times.
 * Boundaries: night (before dawn / after dusk), dawn, morning, day, evening, dusk.
 * Returns null if any sun time is missing (e.g. polar regions); caller should fall back to fixed hours.
 *
 * @param {Date} now - Current time (local)
 * @param {{ dawn: Date, sunrise: Date, sunriseEnd: Date, goldenHourEnd: Date, goldenHour: Date, sunsetStart: Date, sunset: Date, dusk: Date }} sunTimes
 * @returns {'night'|'dawn'|'morning'|'day'|'evening'|'dusk'|null}
 */
export function getSlotFromSunTimes(now, sunTimes) {
  const { dawn, sunrise, goldenHourEnd, goldenHour, sunset, dusk } = sunTimes
  if (
    !isValidDate(dawn) ||
    !isValidDate(sunrise) ||
    !isValidDate(goldenHourEnd) ||
    !isValidDate(goldenHour) ||
    !isValidDate(sunset) ||
    !isValidDate(dusk)
  ) {
    return null
  }
  const t = now.getTime()
  const dawnT = dawn.getTime()
  const sunriseT = sunrise.getTime()
  const goldenHourEndT = goldenHourEnd.getTime()
  const goldenHourT = goldenHour.getTime()
  const sunsetT = sunset.getTime()
  const duskT = dusk.getTime()

  if (t < dawnT || t >= duskT) return 'night'
  if (t < sunriseT) return 'dawn'
  if (t < goldenHourEndT) return 'morning'
  if (t < goldenHourT) return 'day'
  if (t < sunsetT) return 'evening'
  return 'dusk'
}
