import { useRef } from 'react'
import { X } from 'lucide-react'
import type { AppSettings, FavouriteLocation } from '../types'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings
  onUpdateSettings: (patch: Partial<AppSettings>) => void
  favourites: FavouriteLocation[]
  onUpdateColor: (id: string, color: string) => void
}

const ACCENT = '#00E5CC'

function ColorSwatch({ id, color, onChange }: { id: string; color: string; onChange: (id: string, color: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const currentColor = color || ACCENT

  return (
    <div className="color-swatch-wrap">
      <button
        className="color-swatch-btn"
        style={{ background: currentColor }}
        onClick={() => inputRef.current?.click()}
        title="Pick colour"
        aria-label="Pick colour"
      />
      <input
        ref={inputRef}
        type="color"
        value={currentColor}
        onChange={e => onChange(id, e.target.value)}
        className="color-input-hidden"
      />
    </div>
  )
}

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  favourites,
  onUpdateColor,
}: SettingsPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`settings-backdrop${isOpen ? ' settings-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`settings-panel${isOpen ? ' settings-panel--open' : ''}`} aria-label="Settings">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close-btn" onClick={onClose} aria-label="Close settings">
            <X size={16} />
          </button>
        </div>

        <div className="settings-body">
          {/* Display section */}
          <section className="settings-section">
            <h3 className="settings-section-label">Display</h3>

            <div className="settings-row">
              <span className="settings-row-label">Show seconds</span>
              <button
                className={`toggle-btn${settings.showSeconds ? ' toggle-btn--on' : ''}`}
                onClick={() => onUpdateSettings({ showSeconds: !settings.showSeconds })}
                role="switch"
                aria-checked={settings.showSeconds}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </section>

          {/* Tile colours section */}
          {favourites.length > 0 && (
            <section className="settings-section">
              <h3 className="settings-section-label">Tile Colours</h3>
              <p className="settings-section-hint">Click a swatch to pick any colour for that tile's time display.</p>

              <div className="settings-tile-list">
                {favourites.map(f => (
                  <div key={f.id} className="settings-tile-row">
                    <span className="settings-tile-name">{f.city}</span>
                    <span className="settings-tile-country">{f.country}</span>
                    <ColorSwatch id={f.id} color={f.color || ACCENT} onChange={onUpdateColor} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  )
}
