import { useState, useEffect } from 'react'

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast'
const GEO_TIMEOUT_MS = 8000

/** WMO codes treated as overcast / precipitation for muted backgrounds */
const OVERCAST_CODES = new Set([
  3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 95, 96, 99,
])

export const WEATHER_THEMES = {
  LOADING: 'loading',
  SUNRISE: 'sunrise',
  DAY: 'day',
  EVENING: 'evening',
  NIGHT: 'night',
  OVERCAST: 'overcast',
}

function themeFromHour(hour) {
  if (hour >= 5 && hour < 9) return WEATHER_THEMES.SUNRISE
  if (hour >= 9 && hour < 17) return WEATHER_THEMES.DAY
  if (hour >= 17 && hour < 21) return WEATHER_THEMES.EVENING
  return WEATHER_THEMES.NIGHT
}

function isDarkHour(hour) {
  return hour >= 20 || hour < 6
}

function resolveTheme({ isDay, weatherCode, now, sunrise, sunset }) {
  const overcast = OVERCAST_CODES.has(weatherCode)
  const hour = now.getHours()

  if (!sunrise || !sunset) {
    if (isDay === 0) return overcast ? WEATHER_THEMES.OVERCAST : WEATHER_THEMES.NIGHT
    const base = themeFromHour(hour)
    if (overcast && (base === WEATHER_THEMES.DAY || base === WEATHER_THEMES.SUNRISE)) {
      return WEATHER_THEMES.OVERCAST
    }
    return base
  }

  const nowMs = now.getTime()
  const sunriseMs = sunrise.getTime()
  const sunsetMs = sunset.getTime()
  const minsAfterSunrise = (nowMs - sunriseMs) / 60000
  const minsBeforeSunset = (sunsetMs - nowMs) / 60000

  if (isDay === 0 || nowMs >= sunsetMs) {
    return overcast ? WEATHER_THEMES.OVERCAST : WEATHER_THEMES.NIGHT
  }
  if (minsAfterSunrise >= 0 && minsAfterSunrise <= 120) {
    return overcast ? WEATHER_THEMES.OVERCAST : WEATHER_THEMES.SUNRISE
  }
  if (minsBeforeSunset >= 0 && minsBeforeSunset <= 90) {
    return overcast ? WEATHER_THEMES.OVERCAST : WEATHER_THEMES.EVENING
  }
  if (overcast) return WEATHER_THEMES.OVERCAST
  return WEATHER_THEMES.DAY
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: GEO_TIMEOUT_MS,
      maximumAge: 300000,
    })
  })
}

async function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'weather_code,is_day',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  })
  const res = await fetch(`${OPEN_METEO}?${params}`)
  if (!res.ok) throw new Error('Open-Meteo request failed')
  return res.json()
}

/**
 * Resolves a time/weather theme for Chrome Home backgrounds.
 * Uses Open-Meteo (no API key) when geolocation is granted; otherwise local hour from device timezone.
 */
export function useWeatherTheme() {
  const [theme, setTheme] = useState(WEATHER_THEMES.LOADING)
  const [source, setSource] = useState('loading')

  useEffect(() => {
    let cancelled = false

    const apply = (nextTheme, nextSource) => {
      if (!cancelled) {
        setTheme(nextTheme)
        setSource(nextSource)
      }
    }

    const fallbackTimezone = () => {
      const hour = new Date().getHours()
      apply(themeFromHour(hour), 'timezone')
    }

    const loadFromCoords = async (lat, lon) => {
      try {
        const data = await fetchOpenMeteo(lat, lon)
        const weatherCode = data.current?.weather_code ?? 0
        const isDay = data.current?.is_day ?? 1
        const sunriseRaw = data.daily?.sunrise?.[0]
        const sunsetRaw = data.daily?.sunset?.[0]
        const resolved = resolveTheme({
          isDay,
          weatherCode,
          now: new Date(),
          sunrise: sunriseRaw ? new Date(sunriseRaw) : null,
          sunset: sunsetRaw ? new Date(sunsetRaw) : null,
        })
        apply(resolved, 'api')
      } catch {
        fallbackTimezone()
      }
    }

    const run = async () => {
      let geoTimer
      try {
        const geoPromise = getPosition()
        const timeoutPromise = new Promise((_, reject) => {
          geoTimer = setTimeout(() => reject(new Error('geo timeout')), GEO_TIMEOUT_MS)
        })
        const position = await Promise.race([geoPromise, timeoutPromise])
        clearTimeout(geoTimer)
        await loadFromCoords(position.coords.latitude, position.coords.longitude)
      } catch {
        clearTimeout(geoTimer)
        fallbackTimezone()
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const hour = new Date().getHours()
  const showStars =
    theme === WEATHER_THEMES.NIGHT ||
    theme === WEATHER_THEMES.EVENING ||
    (theme === WEATHER_THEMES.OVERCAST && isDarkHour(hour))
  const isDark =
    showStars ||
    theme === WEATHER_THEMES.EVENING ||
    theme === WEATHER_THEMES.NIGHT

  return { theme, source, showStars, isDark }
}
