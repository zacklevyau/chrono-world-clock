import { useState, useEffect, useCallback } from 'react'
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
import { PinLock } from './components/PinLock'
import { useLiveTime } from './hooks/useLiveTime'
import { useFavourites } from './hooks/useFavourites'
import { useSettings } from './hooks/useSettings'
import { usePinLock } from './hooks/usePinLock'
import { useSync } from './hooks/useSync'
import { formatInTimeZone } from 'date-fns-tz'
import { Plus } from 'lucide-react'

export default function App() {
  const now = useLiveTime()
  const { favourites, addFavourite, removeFavourite, reorderFavourites, updateFavouriteColor, replaceAll } = useFavourites()
  const { settings, updateSettings, replaceSettings } = useSettings()
  const { isLocked, pinHash, error: pinError, ready: pinReady, unlock, changePin, clearError } = usePinLock()
  const { status: syncStatus, fetchData, pushData, rekeyData } = useSync(pinHash)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isWarpMode, setIsWarpMode] = useState(false)
  const [warpAnchorId, setWarpAnchorId] = useState<string | null>(null)
  const [warpTime, setWarpTime] = useState<Date | null>(null)
  const [syncBootstrapped, setSyncBootstrapped] = useState(false)

  const displayTime = isWarpMode && warpTime ? warpTime : now

  const anchorLocation = warpAnchorId
    ? favourites.find(f => f.id === warpAnchorId) ?? null
    : null

  // After unlock: fetch cloud data once and hydrate local state
  useEffect(() => {
    if (isLocked || !pinHash || syncBootstrapped) return
    setSyncBootstrapped(true)
    fetchData().then(data => {
      if (!data) {
        // No cloud data yet — push local state up
        pushData({ favourites, settings })
      } else {
        replaceAll(data.favourites)
        replaceSettings(data.settings)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, pinHash, syncBootstrapped])

  // Push to cloud whenever favourites or settings change (after initial load)
  const syncIfReady = useCallback(() => {
    if (!isLocked && pinHash && syncBootstrapped) {
      pushData({ favourites, settings })
    }
  }, [isLocked, pinHash, syncBootstrapped, favourites, settings, pushData])

  useEffect(() => { syncIfReady() }, [favourites, settings]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (isWarpMode) { setIsWarpMode(false); setWarpAnchorId(null); setWarpTime(null) }
    else setIsWarpMode(true)
  }

  async function handleChangePin(currentPin: string, newPin: string): Promise<{ ok: boolean }> {
    const result = await changePin(currentPin, newPin)
    if (result.ok && result.oldHash && result.newHash) {
      await rekeyData(result.oldHash, result.newHash, { favourites, settings })
    }
    return { ok: result.ok }
  }

  // Show PIN lock screen while locked
  if (isLocked) {
    return <PinLock onUnlock={unlock} error={pinError} onClearError={clearError} ready={pinReady} />
  }

  return (
    <div className="app-shell">
      <Header
        onAddClick={() => setIsAddOpen(true)}
        isWarpMode={isWarpMode}
        onToggleWarp={handleToggleWarp}
        onSettingsClick={() => setIsSettingsOpen(true)}
        syncStatus={syncStatus}
      />

      <TimeWarpPanel
        isWarpMode={isWarpMode}
        anchorLocation={anchorLocation}
        displayTime={displayTime}
        onWarp={setWarpTime}
        onExit={() => { setIsWarpMode(false); setWarpAnchorId(null); setWarpTime(null) }}
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
        onChangePin={handleChangePin}
      />
    </div>
  )
}
