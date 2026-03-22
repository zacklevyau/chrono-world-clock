import { useState, useCallback, useRef } from 'react'
import type { FavouriteLocation, AppSettings } from '../types'

export interface UserData {
  favourites: FavouriteLocation[]
  settings: AppSettings
  updatedAt?: number
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline'

export function useSync(pinHash: string | null) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchData = useCallback(async (): Promise<UserData | null> => {
    if (!pinHash) return null
    try {
      const res = await fetch(`/api/sync?token=${pinHash}`)
      if (res.status === 404) return null
      if (!res.ok) { setStatus('offline'); return null }
      const body = await res.json()
      setStatus('synced')
      return body.data as UserData
    } catch {
      setStatus('offline')
      return null
    }
  }, [pinHash])

  const pushData = useCallback((data: UserData) => {
    if (!pinHash) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setStatus('syncing')
      try {
        const res = await fetch('/api/sync', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: pinHash, ...data }),
        })
        setStatus(res.ok ? 'synced' : 'offline')
      } catch {
        setStatus('offline')
      }
    }, 1500)
  }, [pinHash])

  /** Re-key data when PIN changes: copy to new token, delete old */
  const rekeyData = useCallback(async (oldHash: string, newHash: string, data: UserData) => {
    try {
      // Save under new key
      await fetch('/api/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: newHash, ...data }),
      })
      // Delete old key
      await fetch(`/api/sync?token=${oldHash}`, { method: 'DELETE' })
    } catch {
      // best-effort
    }
  }, [])

  return { status, fetchData, pushData, rekeyData }
}
