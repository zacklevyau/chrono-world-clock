import { useState, useCallback, useEffect } from 'react'
import type { FavouriteLocation, TimezoneEntry } from '../types'

const STORAGE_KEY = 'chrono-favourites'

const DEFAULTS: FavouriteLocation[] = [
  { id: '1', city: 'New York', country: 'United States', timezone: 'America/New_York', region: 'Americas' },
  { id: '2', city: 'London', country: 'United Kingdom', timezone: 'Europe/London', region: 'Europe' },
  { id: '3', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', region: 'Asia Pacific' },
]

export function useFavourites() {
  const [favourites, setFavourites] = useState<FavouriteLocation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites))
  }, [favourites])

  const addFavourite = useCallback((entry: TimezoneEntry) => {
    setFavourites(prev => {
      if (prev.some(f => f.timezone === entry.timezone)) return prev
      return [...prev, { ...entry, id: crypto.randomUUID() }]
    })
  }, [])

  const removeFavourite = useCallback((id: string) => {
    setFavourites(prev => prev.filter(f => f.id !== id))
  }, [])

  return { favourites, addFavourite, removeFavourite }
}
