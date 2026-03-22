import { X } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import type { FavouriteLocation } from '../types'

interface ClockTileProps {
  location: FavouriteLocation
  displayTime: Date
  onRemove: (id: string) => void
  isWarpMode: boolean
  onSelectForWarp: (id: string) => void
  isAnchor: boolean
}

function formatOffset(tz: string, date: Date): string {
  try {
    const raw = formatInTimeZone(date, tz, 'xxx') // "+05:30", "-08:00", "+00:00"
    if (raw === '+00:00' || raw === '-00:00') return 'UTC'
    const sign = raw[0]
    const [h, m] = raw.slice(1).split(':').map(Number)
    return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`
  } catch {
    return ''
  }
}

export function ClockTile({
  location,
  displayTime,
  onRemove,
  isWarpMode,
  onSelectForWarp,
  isAnchor,
}: ClockTileProps) {
  const timeStr = formatInTimeZone(displayTime, location.timezone, 'HH:mm:ss')
  const dateStr = formatInTimeZone(displayTime, location.timezone, 'EEE, d MMM yyyy')
  const offset = formatOffset(location.timezone, displayTime)

  function handleClick() {
    if (isWarpMode) onSelectForWarp(location.id)
  }

  return (
    <div
      className={`clock-tile${isAnchor ? ' warp-anchor' : ''}${isWarpMode && !isAnchor ? ' warp-selectable' : ''}`}
      onClick={handleClick}
      role={isWarpMode ? 'button' : undefined}
      tabIndex={isWarpMode ? 0 : undefined}
      onKeyDown={isWarpMode ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() } : undefined}
      aria-label={isWarpMode ? `Select ${location.city} as warp anchor` : undefined}
    >
      <div className="tile-top-row">
        <span className="tile-city">{location.city}</span>
        <button
          className="tile-remove-btn"
          onClick={(e) => { e.stopPropagation(); onRemove(location.id) }}
          aria-label={`Remove ${location.city}`}
          tabIndex={0}
        >
          <X size={14} />
        </button>
      </div>

      <div className="tile-time-block">
        <div className="time-display">{timeStr}</div>
        <div className="tile-date">{dateStr}</div>
      </div>

      <div className="tile-bottom-row">
        <span className="tile-country">{location.country}</span>
        <span className="tile-offset">{offset}</span>
      </div>

      {isWarpMode && !isAnchor && (
        <div className="tile-select-badge">SELECT</div>
      )}
    </div>
  )
}
