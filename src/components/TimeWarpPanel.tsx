import { useState, useEffect } from 'react'
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'
import { X } from 'lucide-react'
import type { FavouriteLocation } from '../types'

interface TimeWarpPanelProps {
  isWarpMode: boolean
  anchorLocation: FavouriteLocation | null
  displayTime: Date
  onWarp: (utcDate: Date) => void
  onExit: () => void
}

export function TimeWarpPanel({
  isWarpMode,
  anchorLocation,
  displayTime,
  onWarp,
  onExit,
}: TimeWarpPanelProps) {
  const [inputValue, setInputValue] = useState('')

  // Sync input when anchor location or time changes (only on first anchor selection)
  useEffect(() => {
    if (anchorLocation) {
      const localStr = formatInTimeZone(displayTime, anchorLocation.timezone, "yyyy-MM-dd'T'HH:mm")
      setInputValue(localStr)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorLocation?.id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    if (val && anchorLocation) {
      try {
        // Pass raw string to fromZonedTime — treats it as wall-clock time in anchor's zone
        const utcDate = fromZonedTime(val, anchorLocation.timezone)
        if (!isNaN(utcDate.getTime())) {
          onWarp(utcDate)
        }
      } catch {
        // ignore invalid date
      }
    }
  }

  if (!isWarpMode) return null

  return (
    <div className="warp-panel">
      <div className="warp-panel-inner">
        {!anchorLocation ? (
          <div className="warp-prompt">
            <span className="warp-icon">⚡</span>
            <span>Select a location from your tiles to anchor the time warp.</span>
          </div>
        ) : (
          <div className="warp-controls">
            <div className="warp-anchor-label">
              <span className="warp-icon">⚡</span>
              <span><strong>{anchorLocation.city}</strong> anchored to:</span>
            </div>
            <input
              type="datetime-local"
              className="warp-datetime-input"
              value={inputValue}
              onChange={handleChange}
            />
          </div>
        )}
        <button className="warp-exit-btn" onClick={onExit} aria-label="Exit Time Warp">
          <X size={14} />
          Exit Time Warp
        </button>
      </div>
    </div>
  )
}
