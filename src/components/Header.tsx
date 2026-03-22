import { Zap, Settings, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import type { SyncStatus } from '../hooks/useSync'

interface HeaderProps {
  isWarpMode: boolean
  onToggleWarp: () => void
  onSettingsClick: () => void
  syncStatus: SyncStatus
}

function SyncIndicator({ status }: { status: SyncStatus }) {
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    syncing: { icon: <RefreshCw size={11} />, label: 'Syncing…', cls: 'sync-syncing' },
    synced:  { icon: <Cloud size={11} />,    label: 'Synced',   cls: 'sync-ok' },
    offline: { icon: <CloudOff size={11} />, label: 'Offline',  cls: 'sync-off' },
    idle:    { icon: <CloudOff size={11} />, label: 'Offline',  cls: 'sync-off' },
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

export function Header({ isWarpMode, onToggleWarp, onSettingsClick, syncStatus }: HeaderProps) {
  return (
    <header className="chrono-header">
      <div className="header-left">
        <div className="header-brand">
          <span className="chrono-logo">CHRONO</span>
          <SyncIndicator status={syncStatus} />
        </div>
      </div>
      <div className="header-actions">
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
