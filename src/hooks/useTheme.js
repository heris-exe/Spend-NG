import { useState, useEffect, useCallback, useRef } from 'react'
import { getSunTimes, getSlotFromSunTimes } from '@/utils/sunTimes'

const STORAGE_KEY = 'expense-tracker-theme'
const LOCATION_CACHE_KEY = 'expense-tracker-daycycle-location'

/** Clear cached location so next time Day cycle runs it will ask for location again. Call from UI when user wants to "Use my location". */
export function clearDayCycleLocationCache() {
  try {
    window.localStorage.removeItem(LOCATION_CACHE_KEY)
  } catch {}
}

/** Time-of-day slots for "day cycle" theme when location is unavailable (fixed hours). */
export const DAY_CYCLE_SLOTS = [
  { id: 'night', start: 22, end: 5 },
  { id: 'dawn', start: 5, end: 7 },
  { id: 'morning', start: 7, end: 10 },
  { id: 'day', start: 10, end: 17 },
  { id: 'evening', start: 17, end: 20 },
  { id: 'dusk', start: 20, end: 22 },
]

/** Get current slot id from local hour (fallback when no geolocation). */
export function getDayCycleSlot(hour) {
  for (const slot of DAY_CYCLE_SLOTS) {
    if (slot.start > slot.end) {
      if (hour >= slot.start || hour < slot.end) return slot.id
    } else {
      if (hour >= slot.start && hour < slot.end) return slot.id
    }
  }
  return 'day'
}

function getCachedLocation() {
  try {
    const raw = window.localStorage.getItem(LOCATION_CACHE_KEY)
    if (!raw) return null
    const { lat, lng } = JSON.parse(raw)
    if (typeof lat !== 'number' || typeof lng !== 'number') return null
    return { lat, lng }
  } catch {
    return null
  }
}

function setCachedLocation(lat, lng) {
  try {
    window.localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ lat, lng }))
  } catch {}
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'daycycle'
    return window.localStorage.getItem(STORAGE_KEY) || 'daycycle'
  })
  const [sunTimes, setSunTimes] = useState(null)
  const [dayCycleSlot, setDayCycleSlot] = useState(null)
  const locationRequested = useRef(false)

  const applyDayCycle = useCallback((slot) => {
    const root = document.documentElement
    root.setAttribute('data-time', slot)
    root.classList.remove('dark')
    setDayCycleSlot(slot)
  }, [])

  const applyLightDark = useCallback((isDark) => {
    const root = document.documentElement
    root.removeAttribute('data-time')
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [])

  // When daycycle is active: resolve location (once), compute sun times for today, then derive slot from current time
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'daycycle') return

    const updateSlot = () => {
      const n = new Date()
      const slot =
        (sunTimes && getSlotFromSunTimes(n, sunTimes)) ?? getDayCycleSlot(n.getHours())
      applyDayCycle(slot)
    }

    if (!locationRequested.current) {
      locationRequested.current = true
      const cached = getCachedLocation()
      const tryWithCoords = (lat, lng) => {
        const today = new Date()
        setSunTimes(getSunTimes(today, lat, lng))
      }
      if (cached) {
        tryWithCoords(cached.lat, cached.lng)
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords
            setCachedLocation(lat, lng)
            tryWithCoords(lat, lng)
          },
          () => {},
          { timeout: 10000, maximumAge: 0, enableHighAccuracy: false }
        )
      }
    }

    updateSlot()
    const interval = setInterval(updateSlot, 60_000)
    return () => clearInterval(interval)
  }, [theme, sunTimes, applyDayCycle])

  // Refresh sun times when the calendar date changes (e.g. after midnight)
  useEffect(() => {
    if (theme !== 'daycycle' || !sunTimes) return
    const checkDate = () => {
      const cached = getCachedLocation()
      if (!cached) return
      const today = new Date()
      setSunTimes((prev) => {
        if (!prev) return getSunTimes(today, cached.lat, cached.lng)
        const prevDate = new Date(prev.dawn)
        if (prevDate.toDateString() !== today.toDateString()) {
          return getSunTimes(today, cached.lat, cached.lng)
        }
        return prev
      })
    }
    const interval = setInterval(checkDate, 60_000)
    return () => clearInterval(interval)
  }, [theme, sunTimes])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const resolve = (value) => {
      if (value === 'dark') return true
      if (value === 'light') return false
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    if (theme !== 'daycycle') {
      locationRequested.current = false
      setDayCycleSlot(null)
      applyLightDark(resolve(theme))
    }
    if (theme !== 'system' && theme !== 'daycycle') window.localStorage.setItem(STORAGE_KEY, theme)
    else if (theme === 'system') window.localStorage.removeItem(STORAGE_KEY)
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyLightDark(mq.matches)
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    }
  }, [theme, applyLightDark])

  const setTheme = (value) => {
    if (typeof window === 'undefined') return
    setThemeState(value)
    if (value === 'daycycle') {
      const n = new Date()
      const slot =
        (sunTimes && getSlotFromSunTimes(n, sunTimes)) ?? getDayCycleSlot(n.getHours())
      applyDayCycle(slot)
    } else {
      const isDark =
        value === 'dark' ||
        (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      applyLightDark(isDark)
    }
    if (value !== 'system') window.localStorage.setItem(STORAGE_KEY, value)
    else window.localStorage.removeItem(STORAGE_KEY)
  }

  const requestLocationAgain = useCallback(() => {
    clearDayCycleLocationCache()
    locationRequested.current = false
    setSunTimes(null)
  }, [])

  return [
    theme,
    setTheme,
    {
      requestDayCycleLocation: requestLocationAgain,
      dayCycleSlot: theme === 'daycycle' ? dayCycleSlot : null,
    },
  ]
}
