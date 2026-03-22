import { Plus, Zap } from 'lucide-react'

interface HeaderProps {
  onAddClick: () => void
  isWarpMode: boolean
  onToggleWarp: () => void
}

export function Header({ onAddClick, isWarpMode, onToggleWarp }: HeaderProps) {
  return (
    <header className="chrono-header">
      <span className="chrono-logo">CHRONO</span>
      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onAddClick}
          aria-label="Add location"
          title="Add location"
        >
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
      </div>
    </header>
  )
}
