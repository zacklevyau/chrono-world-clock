import { useState } from 'react'
import { Header } from './components/Header'
import { ClockTile } from './components/ClockTile'
import { AddLocationModal } from './components/AddLocationModal'
import { TimeWarpPanel } from './components/TimeWarpPanel'
import { useLiveTime } from './hooks/useLiveTime'
import { useFavourites } from './hooks/useFavourites'
import { formatInTimeZone } from 'date-fns-tz'
import { Plus } from 'lucide-react'

export default function App() {
  const now = useLiveTime()
  const { favourites, addFavourite, removeFavourite } = useFavourites()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isWarpMode, setIsWarpMode] = useState(false)
  const [warpAnchorId, setWarpAnchorId] = useState<string | null>(null)
  const [warpTime, setWarpTime] = useState<Date | null>(null)

  const displayTime = isWarpMode && warpTime ? warpTime : now

  const anchorLocation = warpAnchorId
    ? favourites.find(f => f.id === warpAnchorId) ?? null
    : null

  function handleToggleWarp() {
    if (isWarpMode) {
      handleExitWarp()
    } else {
      setIsWarpMode(true)
    }
  }

  function handleExitWarp() {
    setIsWarpMode(false)
    setWarpAnchorId(null)
    setWarpTime(null)
  }

  function handleSelectForWarp(id: string) {
    setWarpAnchorId(id)
  }

  function handleWarp(utcDate: Date) {
    setWarpTime(utcDate)
  }

  return (
    <div className="app-shell">
      <Header
        onAddClick={() => setIsAddOpen(true)}
        isWarpMode={isWarpMode}
        onToggleWarp={handleToggleWarp}
      />

      <TimeWarpPanel
        isWarpMode={isWarpMode}
        anchorLocation={anchorLocation}
        displayTime={displayTime}
        onWarp={handleWarp}
        onExit={handleExitWarp}
      />

      {isWarpMode && warpTime && anchorLocation && (
        <div className="warp-banner">
          ⚡ TIME WARP ACTIVE &mdash; {anchorLocation.city} anchored to{' '}
          {formatInTimeZone(warpTime, anchorLocation.timezone, 'EEE d MMM yyyy, HH:mm')}
        </div>
      )}

      <main className="app-main">
        {favourites.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🕐</span>
            <p className="empty-text">Add your first location to get started</p>
            <button
              className="empty-add-btn"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={16} />
              Add Location
            </button>
          </div>
        ) : (
          <div className="clock-grid">
            {favourites.map(location => (
              <ClockTile
                key={location.id}
                location={location}
                displayTime={displayTime}
                onRemove={removeFavourite}
                isWarpMode={isWarpMode}
                onSelectForWarp={handleSelectForWarp}
                isAnchor={location.id === warpAnchorId}
              />
            ))}
          </div>
        )}
      </main>

      {isAddOpen && (
        <AddLocationModal
          onAdd={(entry) => {
            addFavourite(entry)
            setIsAddOpen(false)
          }}
          onClose={() => setIsAddOpen(false)}
          existingTimezones={new Set(favourites.map(f => f.timezone))}
        />
      )}
    </div>
  )
}
