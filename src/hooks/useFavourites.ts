import { useState, useCallback, useEffect } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
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

  const reorderFavourites = useCallback((activeId: string, overId: string) => {
    setFavourites(prev => {
      const oldIndex = prev.findIndex(f => f.id === activeId)
      const newIndex = prev.findIndex(f => f.id === overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const updateFavouriteColor = useCallback((id: string, color: string) => {
    setFavourites(prev => prev.map(f => f.id === id ? { ...f, color } : f))
  }, [])

  /** Replace all favourites (used for cloud sync import) */
  const replaceAll = useCallback((newFavourites: FavouriteLocation[]) => {
    setFavourites(newFavourites)
  }, [])

  return { favourites, addFavourite, removeFavourite, reorderFavourites, updateFavouriteColor, replaceAll }
}
