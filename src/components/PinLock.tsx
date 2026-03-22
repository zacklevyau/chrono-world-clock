import { useState, useEffect } from 'react'
import { Delete } from 'lucide-react'

interface PinLockProps {
  onUnlock: (pin: string) => Promise<boolean>
  error: string | null
  onClearError: () => void
  ready: boolean
}

const DIGITS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

export function PinLock({ onUnlock, error, onClearError, ready }: PinLockProps) {
  const [pin, setPin] = useState('')
  const [shaking, setShaking] = useState(false)

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      onUnlock(pin).then(ok => {
        if (!ok) {
          setShaking(true)
          setTimeout(() => { setShaking(false); setPin('') }, 600)
        }
      })
    }
  }, [pin, onUnlock])

  // Also handle physical keyboard
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key >= '0' && e.key <= '9') {
        setPin(prev => prev.length < 4 ? prev + e.key : prev)
        onClearError()
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1))
        onClearError()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClearError])

  function handleDigit(d: string) {
    if (d === 'del') {
      setPin(prev => prev.slice(0, -1))
      onClearError()
    } else if (pin.length < 4) {
      setPin(prev => prev + d)
      onClearError()
    }
  }

  return (
    <div className="pin-lock">
      <div className="pin-lock-inner">
        <div className="pin-logo">CHRONO</div>
        <div className="pin-subtitle">World Clock</div>

        <div className={`pin-dots${shaking ? ' pin-dots--shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <span key={i} className={`pin-dot${i < pin.length ? ' pin-dot--filled' : ''}`} />
          ))}
        </div>

        <div className="pin-message">
          {error
            ? <span className="pin-error">{error}</span>
            : <span className="pin-hint">{ready ? 'Enter Passcode' : '…'}</span>
          }
        </div>

        <div className="pin-pad">
          {DIGITS.map((row, ri) => (
            <div key={ri} className="pin-row">
              {row.map((d, di) => (
                d === '' ? (
                  <span key={di} className="pin-key pin-key--empty" />
                ) : d === 'del' ? (
                  <button key={di} className="pin-key pin-key--del" onClick={() => handleDigit('del')} aria-label="Delete">
                    <Delete size={20} />
                  </button>
                ) : (
                  <button key={di} className="pin-key" onClick={() => handleDigit(d)}>
                    {d}
                  </button>
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
