import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { Header } from './components/Header'
import { SortableClockTile } from './components/SortableClockTile'
import { AddLocationModal } from './components/AddLocationModal'
import { TimeWarpPanel } from './components/TimeWarpPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { useLiveTime } from './hooks/useLiveTime'
import { useFavourites } from './hooks/useFavourites'
import { useSettings } from './hooks/useSettings'
import { formatInTimeZone } from 'date-fns-tz'
import { Plus } from 'lucide-react'

export default function App() {
  const now = useLiveTime()
  const { favourites, addFavourite, removeFavourite, reorderFavourites, updateFavouriteColor } = useFavourites()
  const { settings, updateSettings } = useSettings()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isWarpMode, setIsWarpMode] = useState(false)
  const [warpAnchorId, setWarpAnchorId] = useState<string | null>(null)
  const [warpTime, setWarpTime] = useState<Date | null>(null)

  const displayTime = isWarpMode && warpTime ? warpTime : now

  const anchorLocation = warpAnchorId
    ? favourites.find(f => f.id === warpAnchorId) ?? null
    : null

  // DnD sensors — require 8px movement before activating drag (prevents accidental drags on click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderFavourites(String(active.id), String(over.id))
    }
  }

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

  return (
    <div className="app-shell">
      <Header
        onAddClick={() => setIsAddOpen(true)}
        isWarpMode={isWarpMode}
        onToggleWarp={handleToggleWarp}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <TimeWarpPanel
        isWarpMode={isWarpMode}
        anchorLocation={anchorLocation}
        displayTime={displayTime}
        onWarp={setWarpTime}
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
            <button className="empty-add-btn" onClick={() => setIsAddOpen(true)}>
              <Plus size={16} />
              Add Location
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={favourites.map(f => f.id)} strategy={rectSortingStrategy}>
              <div className="clock-grid">
                {favourites.map(location => (
                  <SortableClockTile
                    key={location.id}
                    location={location}
                    displayTime={displayTime}
                    onRemove={removeFavourite}
                    isWarpMode={isWarpMode}
                    onSelectForWarp={setWarpAnchorId}
                    isAnchor={location.id === warpAnchorId}
                    showSeconds={settings.showSeconds}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {isAddOpen && (
        <AddLocationModal
          onAdd={(entry) => { addFavourite(entry); setIsAddOpen(false) }}
          onClose={() => setIsAddOpen(false)}
          existingTimezones={new Set(favourites.map(f => f.timezone))}
        />
      )}

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        favourites={favourites}
        onUpdateColor={updateFavouriteColor}
      />
    </div>
  )
}
