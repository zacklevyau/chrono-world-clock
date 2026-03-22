import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { AppSettings, FavouriteLocation } from '../types'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings
  onUpdateSettings: (patch: Partial<AppSettings>) => void
  favourites: FavouriteLocation[]
  onUpdateColor: (id: string, color: string) => void
  onChangePin: (current: string, newPin: string) => Promise<{ ok: boolean }>
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

function PinChangeForm({ onChangePin }: { onChangePin: (c: string, n: string) => Promise<{ ok: boolean }> }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next.length !== 4 || !/^\d{4}$/.test(next)) { setMsg({ text: 'New passcode must be exactly 4 digits.', ok: false }); return }
    if (next !== confirm) { setMsg({ text: 'New passcodes do not match.', ok: false }); return }
    setLoading(true)
    const { ok } = await onChangePin(current, next)
    setLoading(false)
    if (ok) {
      setMsg({ text: 'Passcode updated successfully.', ok: true })
      setCurrent(''); setNext(''); setConfirm('')
    } else {
      setMsg({ text: 'Current passcode is incorrect.', ok: false })
    }
  }

  return (
    <form className="pin-change-form" onSubmit={handleSubmit}>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        pattern="\d{4}"
        placeholder="Current passcode"
        value={current}
        onChange={e => { setCurrent(e.target.value); setMsg(null) }}
        className="pin-input"
        autoComplete="current-password"
      />
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        pattern="\d{4}"
        placeholder="New passcode (4 digits)"
        value={next}
        onChange={e => { setNext(e.target.value); setMsg(null) }}
        className="pin-input"
        autoComplete="new-password"
      />
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        pattern="\d{4}"
        placeholder="Confirm new passcode"
        value={confirm}
        onChange={e => { setConfirm(e.target.value); setMsg(null) }}
        className="pin-input"
        autoComplete="new-password"
      />
      {msg && (
        <p className={`pin-change-msg${msg.ok ? ' pin-change-msg--ok' : ' pin-change-msg--err'}`}>{msg.text}</p>
      )}
      <button type="submit" className="pin-change-btn" disabled={loading || !current || !next || !confirm}>
        {loading ? 'Updating…' : 'Update Passcode'}
      </button>
    </form>
  )
}

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  favourites,
  onUpdateColor,
  onChangePin,
}: SettingsPanelProps) {
  return (
    <>
      <div
        className={`settings-backdrop${isOpen ? ' settings-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`settings-panel${isOpen ? ' settings-panel--open' : ''}`} aria-label="Settings">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close-btn" onClick={onClose} aria-label="Close settings">
            <X size={16} />
          </button>
        </div>

        <div className="settings-body">
          {/* Display */}
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

          {/* Tile colours */}
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

          {/* Passcode */}
          <section className="settings-section">
            <h3 className="settings-section-label">Passcode</h3>
            <p className="settings-section-hint">Change your 4-digit app passcode.</p>
            <PinChangeForm onChangePin={onChangePin} />
          </section>

          {/* Sync note */}
          <section className="settings-section">
            <h3 className="settings-section-label">Cross-Device Sync</h3>
            <p className="settings-section-hint">
              Your data syncs to the cloud keyed to your passcode. Use the same passcode on any device to access the same clocks and settings.
            </p>
          </section>
        </div>
      </aside>
    </>
  )
}
