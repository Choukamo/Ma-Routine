import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react'

export function Card({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card-head">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function CheckRow({ checked, onToggle, title, subtitle, color, children, className = '' }: {
  checked: boolean
  onToggle: () => void
  title: ReactNode
  subtitle?: ReactNode
  color?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`check-row ${checked ? 'is-done' : ''} ${className}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        className="check-box"
        style={color ? ({ '--c': color } as CSSProperties) : undefined}
        onClick={onToggle}
      >
        {checked && <Check size={16} strokeWidth={3} />}
      </button>
      <div className="check-text" onClick={onToggle}>
        <div className="check-title">{title}</div>
        {subtitle && <div className="check-sub">{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

export function Counter({ value, target, onChange, label }: { value: number; target: number; onChange: (v: number) => void; label: string }) {
  const reached = value >= target
  return (
    <div className={`counter-row ${reached ? 'is-done' : ''}`}>
      <div className="counter-text">
        <div className="check-title">{label}</div>
        <div className="pips" aria-hidden>
          {Array.from({ length: target }, (_, i) => (
            <span key={i} className={i < value ? 'pip on' : 'pip'} />
          ))}
        </div>
      </div>
      <div className="counter-ctrl">
        <button type="button" className="round" aria-label={`Moins : ${label}`} onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}>
          <Minus size={16} />
        </button>
        <span className="counter-val">
          {value}/{target}
        </span>
        <button type="button" className="round primary" aria-label={`Plus : ${label}`} onClick={() => onChange(value + 1)}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Stepper({ label, onPrev, onNext, onToday, showToday }: { label: string; onPrev: () => void; onNext: () => void; onToday: () => void; showToday: boolean }) {
  return (
    <div className="stepper">
      <button type="button" className="round" aria-label="Précédent" onClick={onPrev}>
        <ChevronLeft size={18} />
      </button>
      <div className="stepper-label">
        <span>{label}</span>
        {showToday && (
          <button type="button" className="link" onClick={onToday}>
            Revenir à aujourd’hui
          </button>
        )}
      </div>
      <button type="button" className="round" aria-label="Suivant" onClick={onNext}>
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="round" aria-label="Fermer" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}
