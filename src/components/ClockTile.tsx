import { X, GripVertical } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import type { FavouriteLocation } from '../types'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { getFlag } from '../data/countryCodes'

interface ClockTileProps {
  location: FavouriteLocation
  displayTime: Date
  onRemove: (id: string) => void
  isWarpMode: boolean
  onSelectForWarp: (id: string) => void
  isAnchor: boolean
  showSeconds: boolean
  dragListeners?: SyntheticListenerMap
}

function formatOffset(tz: string, date: Date): string {
  try {
    const raw = formatInTimeZone(date, tz, 'xxx')
    if (raw === '+00:00' || raw === '-00:00') return 'UTC'
    const sign = raw[0]
    const [h, m] = raw.slice(1).split(':').map(Number)
    return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`
  } catch {
    return ''
  }
}

const ACCENT = '#00E5CC'

export function ClockTile({
  location,
  displayTime,
  onRemove,
  isWarpMode,
  onSelectForWarp,
  isAnchor,
  showSeconds,
  dragListeners,
}: ClockTileProps) {
  const timeFormat = showSeconds ? 'HH:mm:ss' : 'HH:mm'
  const timeStr = formatInTimeZone(displayTime, location.timezone, timeFormat)
  const dateStr = formatInTimeZone(displayTime, location.timezone, 'EEE, d MMM yyyy')
  const offset = formatOffset(location.timezone, displayTime)
  const timeColor = location.color || ACCENT
  const flag = getFlag(location.country)

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

        {/* Top-right: flag (always visible) + actions (visible on hover, overlay flag) */}
        <div className="tile-corner">
          {flag && <span className="tile-flag" aria-label={location.country}>{flag}</span>}
          <div className="tile-actions">
            <span
              className="tile-drag-handle"
              {...dragListeners}
              title="Drag to reorder"
              aria-label="Drag to reorder"
              onClick={e => e.stopPropagation()}
            >
              <GripVertical size={14} />
            </span>
            <button
              className="tile-remove-btn"
              onClick={(e) => { e.stopPropagation(); onRemove(location.id) }}
              aria-label={`Remove ${location.city}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="tile-time-block">
        <div className="time-display" style={{ color: timeColor }}>{timeStr}</div>
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
