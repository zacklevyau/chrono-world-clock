import { X, GripVertical } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import type { FavouriteLocation } from '../types'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { getFlag } from '../data/countryCodes'
import { weatherCodeToIcon, weatherCodeToLabel } from '../hooks/useWeather'
import type { WeatherInfo } from '../hooks/useWeather'

interface ClockTileProps {
  location: FavouriteLocation
  displayTime: Date
  onRemove: (id: string) => void
  isWarpMode: boolean
  onSelectForWarp: (id: string) => void
  isAnchor: boolean
  showSeconds: boolean
  dragListeners?: SyntheticListenerMap
  weather?: WeatherInfo
}

function formatOffset(tz: string, date: Date): string {
  try {
    const raw = formatInTimeZone(date, tz, 'xxx')
    if (raw === '+00:00' || raw === '-00:00') return 'UTC'
    const sign = raw[0]
    const [h, m] = raw.slice(1).split(':').map(Number)
    return m === 0
      ? `UTC${sign}${h}`
      : `UTC${sign}${h}:${String(m).padStart(2, '0')}`
  } catch {
    return ''
  }
}

function isDaytime(tz: string, date: Date): boolean {
  try {
    const hour = parseInt(formatInTimeZone(date, tz, 'H'), 10)
    return hour >= 6 && hour < 20
  } catch {
    return true
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
  weather,
}: ClockTileProps) {
  const timeFormat = showSeconds ? 'HH:mm:ss' : 'HH:mm'
  const timeStr  = formatInTimeZone(displayTime, location.timezone, timeFormat)
  const dateStr  = formatInTimeZone(displayTime, location.timezone, 'EEE, d MMM yyyy')
  const offset   = formatOffset(location.timezone, displayTime)
  const timeColor = location.color || ACCENT
  const flag     = getFlag(location.country)
  const daytime  = isDaytime(location.timezone, displayTime)

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
      {/* ── Hover-only actions (top-right) ── */}
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

      {/* ── Main horizontal row ── */}
      <div className="tile-main-row">
        {/* Left: flag + city + meta */}
        <div className="tile-left">
          <div className="tile-city-row">
            {flag && <span className="tile-flag-inline" aria-label={location.country}>{flag}</span>}
            <span className="tile-city">{location.city}</span>
          </div>
          <div className="tile-meta">{location.country}&nbsp;·&nbsp;{offset}</div>
        </div>

        {/* Right: time + date */}
        <div className="tile-right">
          <div className="time-display" style={{ color: timeColor }}>{timeStr}</div>
          <div className="tile-date">{dateStr}</div>
        </div>
      </div>

      {/* ── Weather bar ── */}
      <div className="tile-weather-bar">
        <span
          className="tile-daynight-icon"
          title={daytime ? 'Daytime' : 'Nighttime'}
        >
          {daytime ? '☀️' : '🌙'}
        </span>

        {weather ? (
          <>
            <span
              className="tile-weather-icon"
              title={weatherCodeToLabel(weather.weatherCode)}
            >
              {weatherCodeToIcon(weather.weatherCode)}
            </span>
            <span className="tile-temp">{weather.temp}°C</span>
          </>
        ) : (
          <span className="tile-weather-loading">—</span>
        )}

        {isWarpMode && !isAnchor && (
          <span className="tile-select-badge">SELECT</span>
        )}
      </div>
    </div>
  )
}
