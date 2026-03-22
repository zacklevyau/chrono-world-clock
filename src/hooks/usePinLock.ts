import { useState, useCallback, useEffect } from 'react'

const HASH_KEY = 'chrono-pin-hash'
const SESSION_KEY = 'chrono-unlocked'

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(`chrono:${text}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Returns true if the app should start locked (i.e. not already unlocked this session) */
function shouldStartLocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== 'true'
  } catch {
    return true
  }
}

export function usePinLock() {
  const [isLocked, setIsLocked] = useState<boolean>(shouldStartLocked)
  const [pinHash, setPinHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Initialise: ensure default PIN hash (1234) exists in localStorage
  useEffect(() => {
    async function init() {
      let stored = localStorage.getItem(HASH_KEY)
      if (!stored) {
        stored = await sha256('1234')
        localStorage.setItem(HASH_KEY, stored)
      }
      setPinHash(stored)
      setReady(true)
    }
    init()
  }, [])

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const hash = await sha256(pin)
    const stored = localStorage.getItem(HASH_KEY)
    if (hash === stored) {
      setPinHash(hash)
      setIsLocked(false)
      setError(null)
      try { sessionStorage.setItem(SESSION_KEY, 'true') } catch {}
      return true
    }
    setError('Incorrect passcode')
    return false
  }, [])

  /**
   * Change the PIN. Returns true on success, false if currentPin doesn't match.
   * Also returns the new hash so App can re-key cloud data.
   */
  const changePin = useCallback(async (currentPin: string, newPin: string): Promise<{ ok: boolean; newHash?: string; oldHash?: string }> => {
    const currentHash = await sha256(currentPin)
    const stored = localStorage.getItem(HASH_KEY)
    if (currentHash !== stored) return { ok: false }
    const newHash = await sha256(newPin)
    localStorage.setItem(HASH_KEY, newHash)
    setPinHash(newHash)
    return { ok: true, newHash, oldHash: currentHash }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { isLocked, pinHash, error, ready, unlock, changePin, clearError }
}
