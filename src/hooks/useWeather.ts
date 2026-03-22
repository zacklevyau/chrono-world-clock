import { useEffect, useState } from 'react'
import type { FavouriteLocation } from '../types'
import { CITY_COORDS } from '../data/cityCoords'

export interface WeatherInfo {
  temp: number        // °C, rounded
  weatherCode: number // WMO weather code
}

// WMO weather codes → friendly emoji
export function weatherCodeToIcon(code: number): string {
  if (code === 0)                      return '☀️'
  if (code <= 2)                       return '🌤️'
  if (code === 3)                      return '☁️'
  if (code <= 48)                      return '🌫️'
  if (code <= 57)                      return '🌦️'
  if (code <= 67)                      return '🌧️'
  if (code <= 77)                      return '❄️'
  if (code <= 82)                      return '🌦️'
  if (code <= 86)                      return '🌨️'
  return '⛈️'
}

export function weatherCodeToLabel(code: number): string {
  if (code === 0)        return 'Clear'
  if (code <= 2)         return 'Mostly clear'
  if (code === 3)        return 'Overcast'
  if (code <= 48)        return 'Foggy'
  if (code <= 57)        return 'Drizzle'
  if (code <= 67)        return 'Rainy'
  if (code <= 77)        return 'Snowy'
  if (code <= 82)        return 'Showers'
  if (code <= 86)        return 'Snow showers'
  return 'Thunderstorm'
}

// Module-level cache so data persists across re-renders
const cache = new Map<string, { data: WeatherInfo; fetchedAt: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

async function fetchWeatherForTimezone(timezone: string): Promise<WeatherInfo | null> {
  const coords = CITY_COORDS[timezone]
  if (!coords) return null

  const [lng, lat] = coords
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code` +
    `&timezone=${encodeURIComponent(timezone)}`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    return {
      temp: Math.round(json.current.temperature_2m),
      weatherCode: json.current.weather_code,
    }
  } catch {
    return null
  }
}

export function useWeather(locations: FavouriteLocation[]): Map<string, WeatherInfo> {
  const [weatherMap, setWeatherMap] = useState<Map<string, WeatherInfo>>(() => {
    // Seed from cache on first render
    const initial = new Map<string, WeatherInfo>()
    const now = Date.now()
    for (const loc of locations) {
      const cached = cache.get(loc.timezone)
      if (cached && now - cached.fetchedAt < CACHE_TTL) {
        initial.set(loc.timezone, cached.data)
      }
    }
    return initial
  })

  // Key: sorted unique timezones so effect only re-runs when the set changes
  const tzKey = [...new Set(locations.map(l => l.timezone))].sort().join('|')

  useEffect(() => {
    if (!tzKey) return
    const uniqueTimezones = tzKey.split('|')
    let cancelled = false

    async function loadAll() {
      const now = Date.now()
      const results = new Map(weatherMap)

      for (const tz of uniqueTimezones) {
        if (cancelled) break
        const cached = cache.get(tz)
        if (cached && now - cached.fetchedAt < CACHE_TTL) {
          results.set(tz, cached.data)
          continue
        }
        const data = await fetchWeatherForTimezone(tz)
        if (data && !cancelled) {
          cache.set(tz, { data, fetchedAt: Date.now() })
          results.set(tz, data)
          setWeatherMap(new Map(results))
        }
      }
      if (!cancelled) setWeatherMap(new Map(results))
    }

    loadAll()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tzKey])

  return weatherMap
}
