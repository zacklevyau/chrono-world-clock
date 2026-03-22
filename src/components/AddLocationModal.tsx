import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { TIMEZONES } from '../data/timezones'
import type { TimezoneEntry } from '../types'

interface AddLocationModalProps {
  onAdd: (entry: TimezoneEntry) => void
  onClose: () => void
  existingTimezones: Set<string>
}

function formatOffset(tz: string): string {
  try {
    const now = new Date()
    const raw = formatInTimeZone(now, tz, 'xxx')
    if (raw === '+00:00' || raw === '-00:00') return 'UTC'
    const sign = raw[0]
    const [h, m] = raw.slice(1).split(':').map(Number)
    return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`
  } catch {
    return ''
  }
}

export function AddLocationModal({ onAdd, onClose, existingTimezones }: AddLocationModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const q = query.toLowerCase()
  const filtered = useMemo(() => {
    return TIMEZONES.filter(tz =>
      !existingTimezones.has(tz.timezone) &&
      (tz.city.toLowerCase().includes(q) ||
        tz.country.toLowerCase().includes(q) ||
        tz.region.toLowerCase().includes(q))
    )
  }, [q, existingTimezones])

  // Group by region
  const grouped = useMemo(() => {
    const map = new Map<string, TimezoneEntry[]>()
    for (const tz of filtered) {
      const group = map.get(tz.region) ?? []
      group.push(tz)
      map.set(tz.region, group)
    }
    return map
  }, [filtered])

  const regionOrder = ['Americas', 'Europe', 'Asia Pacific', 'Middle East', 'Africa']

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Add location"
    >
      <div className="modal-panel">
        <div className="modal-header">
          <span className="modal-title">Add Location</span>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-search-wrap">
          <Search size={16} className="modal-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="modal-search-input"
            placeholder="Search cities, countries, regions…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="modal-results">
          {filtered.length === 0 && (
            <div className="modal-empty">No locations found</div>
          )}
          {regionOrder.map(region => {
            const entries = grouped.get(region)
            if (!entries || entries.length === 0) return null
            return (
              <div key={region} className="modal-group">
                <div className="modal-group-label">{region}</div>
                {entries.map(tz => (
                  <button
                    key={`${tz.timezone}-${tz.city}`}
                    className="modal-result-row"
                    onClick={() => onAdd(tz)}
                  >
                    <span className="modal-result-city">{tz.city}</span>
                    <span className="modal-result-country">{tz.country}</span>
                    <span className="modal-result-offset">{formatOffset(tz.timezone)}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
