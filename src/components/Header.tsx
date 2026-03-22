import { Plus, Zap, Settings, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import type { SyncStatus } from '../hooks/useSync'

interface HeaderProps {
  onAddClick: () => void
  isWarpMode: boolean
  onToggleWarp: () => void
  onSettingsClick: () => void
  syncStatus: SyncStatus
}

function SyncIndicator({ status }: { status: SyncStatus }) {
  if (status === 'idle') return null
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    syncing:  { icon: <RefreshCw size={12} />, label: 'Syncing…', cls: 'sync-syncing' },
    synced:   { icon: <Cloud size={12} />,     label: 'Synced',   cls: 'sync-ok' },
    offline:  { icon: <CloudOff size={12} />,  label: 'Offline',  cls: 'sync-off' },
  }
  const item = map[status]
  if (!item) return null
  return (
    <span className={`sync-badge ${item.cls}`} title={item.label}>
      {item.icon}
      <span className="sync-label">{item.label}</span>
    </span>
  )
}

export function Header({ onAddClick, isWarpMode, onToggleWarp, onSettingsClick, syncStatus }: HeaderProps) {
  return (
    <header className="chrono-header">
      <div className="header-left">
        <span className="chrono-logo">CHRONO</span>
        <SyncIndicator status={syncStatus} />
      </div>
      <div className="header-actions">
        <button className="header-btn" onClick={onAddClick} aria-label="Add location" title="Add location">
          <Plus size={18} />
        </button>
        <button
          className={`header-btn${isWarpMode ? ' header-btn--active' : ''}`}
          onClick={onToggleWarp}
          aria-label={isWarpMode ? 'Exit Time Warp' : 'Activate Time Warp'}
          title={isWarpMode ? 'Exit Time Warp' : 'Time Warp'}
        >
          <Zap size={18} />
        </button>
        <button className="header-btn" onClick={onSettingsClick} aria-label="Settings" title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
