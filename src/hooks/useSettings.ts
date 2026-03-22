import { useState, useCallback, useEffect } from 'react'
import type { AppSettings } from '../types'

const STORAGE_KEY = 'chrono-settings'

const DEFAULTS: AppSettings = {
  showSeconds: true,
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  /** Replace all settings (used for cloud sync import) */
  const replaceSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings)
  }, [])

  return { settings, updateSettings, replaceSettings }
}
