'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Exercise, Section } from '@/types/gym'
import { totalReps, exRest } from '@/types/gym'
import { FRIDAY_SPEED } from '@/lib/gym/templates'
import './gym.css'

const RPES = [4, 5, 6, 7, 8, 9, 10]

function clock(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function rs(s: number): string {
  return s >= 60 ? `${Math.floor(s / 60)}\u2032${s % 60 || ''}` : `${s}s`
}

function pres(e: Exercise): string {
  switch (e.type) {
    case 'sprint': return `${e.reps} \u00D7 ${e.dist}m`
    case 'lift':   return `${e.sets} \u00D7 ${e.reps} \u00B7 ${e.load}`
    case 'hold':   return `${e.sets} \u00D7 ${e.secs}s${e.side ? ' ea' : ''}`
    case 'drill':  return `${e.sets} \u00D7 ${e.work}`
    case 'check':  return `${e.minutes} min`
  }
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  )
}

export default function GymPage() {
  const template = FRIDAY_SPEED
  const { sections } = template
  const TOTAL = sections.reduce((a, s) => a + s.minutes, 0)

  const queue = useMemo(() =>
    sections.flatMap(s =>
      s.groups.flatMap(g =>
        g.exercises.map(e => ({ ex: e, secId: s.id }))
      )
    ), [sections])

  const [log, setLog] = useState<Record<string, number>>({})
  const [times, setTimes] = useState<Record<string, string>>({})
  const [rpe, setRpe] = useState<number | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [startTime] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [finishWritten, setFinishWritten] = useState(false)

  const [restState, setRestState] = useState<{
    endsAt: number; total: number; from: string; secId: string
  } | null>(null)
  const [restLeft, setRestLeft] = useState(0)

  useEffect(() => {
    if (finished) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500)
    return () => clearInterval(id)
  }, [finished, startTime])

  useEffect(() => {
    if (!restState) { setRestLeft(0); return }
    const tick = () => {
      const left = Math.max(0, Math.ceil((restState.endsAt - Date.now()) / 1000))
      setRestLeft(left)
      if (left <= 0) setRestState(null)
    }
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [restState])

  const doneOf = useCallback((e: Exercise) => log[e.id] ?? 0, [log])

  const next = queue.find(q => doneOf(q.ex) < totalReps(q.ex))
  const activeId = open ?? next?.secId ?? sections[sections.length - 1].id
  const S = sections.find(s => s.id === activeId)!

  const sDone = useCallback((s: Section) =>
    s.groups.flatMap(g => g.exercises).reduce((a, e) => a + doneOf(e), 0), [doneOf])
  const sTotal = (s: Section) =>
    s.groups.flatMap(g => g.exercises).reduce((a, e) => a + totalReps(e), 0)

  const tick = (ex: Exercise, n: number) => {
    setLog(prev => ({ ...prev, [ex.id]: n }))
    setOpen(null)
    const r = exRest(ex)
    if (n > doneOf(ex) && r) {
      setRestState({ endsAt: Date.now() + r * 1000, total: r, from: ex.name, secId: activeId })
    }
  }

  const played = sections.reduce((a, s) => {
    const t = sTotal(s)
    return a + s.minutes * (t ? sDone(s) / t : 0)
  }, 0)

  const rDone = queue.reduce((a, q) => a + doneOf(q.ex), 0)
  const rTotal = queue.reduce((a, q) => a + totalReps(q.ex), 0)
  const sprints = queue.filter((q): q is { ex: Extract<Exercise, { type: 'sprint' }>; secId: string } => q.ex.type === 'sprint')
  const metres = sprints.reduce((a, q) => a + doneOf(q.ex) * q.ex.dist, 0)
  const mins = Math.max(1, Math.round(elapsed / 60))
  const load = rpe ? rpe * mins : null

  const vMax = useMemo(() => {
    const vels = sprints
      .map(q => ({ dist: q.ex.dist, t: parseFloat(times[q.ex.id] ?? '') }))
      .filter(x => x.t > 0)
      .map(x => x.dist / x.t)
    return vels.length ? Math.max(...vels) : null
  }, [times, sprints])

  const handleFinish = () => {
    if (finishWritten) return
    setFinished(true)
    setFinishWritten(true)
  }

  return (
    <div className={`s-root is-${S.tone}`}>
      <header className="s-top">
        <a href="/" className="s-home" aria-label="Home">
          <HomeIcon />
        </a>
        <div className="s-title">
          <h1>Gym</h1>
          <p className="s-mono">{template.name.toUpperCase()} &middot; FRIDAY {template.startsAt} &middot; {TOTAL} MIN</p>
        </div>
        <div className="s-clock">
          <span className={finished ? 's-dot' : 's-dot is-live'} />
          <div>
            <b>{clock(elapsed)}</b>
            <span>{finished ? 'Logged' : `of ~${TOTAL} min`}</span>
          </div>
        </div>
      </header>

      {/* TIMELINE — five sections, sized by real minutes */}
      <nav className="s-line" aria-label="Session timeline">
        <div className="s-track">
          {sections.map(s => {
            const t = sTotal(s)
            const p = t ? sDone(s) / t : 0
            return (
              <button
                key={s.id}
                className={`s-seg is-${s.tone} ${s.id === activeId ? 'is-on' : ''} ${p === 1 ? 'is-done' : ''}`}
                style={{ flex: s.minutes }}
                onClick={() => setOpen(s.id)}
                aria-pressed={s.id === activeId}
              >
                <span className="s-fill" style={{ width: `${p * 100}%` }} />
                <span className="s-seg-t">
                  <b>{s.name}</b>
                  <em>{s.minutes}&prime; &middot; {sDone(s)}/{t}</em>
                </span>
              </button>
            )
          })}
          <span className="s-head" style={{ left: `${(played / TOTAL) * 100}%` }} aria-hidden="true">
            <i>{Math.round(played)}&prime;</i>
          </span>
        </div>
      </nav>

      {/* REST replaces the section body */}
      {restState ? (
        <section className="s-rest">
          <div className="s-rbar"><span style={{ width: `${restState.total ? (restLeft / restState.total) * 100 : 0}%` }} /></div>
          <div className="s-rb">
            <b>{restLeft}<em>s</em></b>
            <div>
              <p className="s-mono is-teal">
                {restState.secId === 'speed' || restState.secId === 'agility' ? 'RECOVER FULLY' : 'RESTING'}
              </p>
              <p className="s-after">after {restState.from} &middot; then <em>{next?.ex.name ?? 'session end'}</em></p>
            </div>
            <div className="s-btns">
              <button onClick={() => setRestState(prev => prev ? { ...prev, endsAt: prev.endsAt + 30000, total: prev.total + 30 } : null)}>+30s</button>
              <button onClick={() => setRestState(null)}>Skip</button>
            </div>
          </div>
        </section>
      ) : (
        /* SECTION BODY */
        <section className="s-body">
          <header className="s-h">
            <div>
              <p className="s-mono s-eye">
                {S.purpose.toUpperCase()}
                {S.tag && <i className={S.tag === 'MANDATORY' ? 'req' : ''}>{S.tag}</i>}
              </p>
              <h2>{S.name}</h2>
            </div>
            <div className="s-hm">
              <span>{S.minutes}&prime;</span>
              {S.rest != null && <span>{rs(S.rest)} between sets</span>}
              <span>{sDone(S)}/{sTotal(S)} reps</span>
            </div>
          </header>

          {S.note && <p className="s-note">{S.note}</p>}

          {S.groups.map(g => (
            <div key={g.label} className={`s-grp ${g.locked ? 'is-locked' : ''}`}>
              <p className="s-gl">
                <span>{g.label}</span>
                {g.note && <em>{g.note}</em>}
                {g.locked && <i>LOCKED</i>}
              </p>

              <ul className="s-ex">
                {g.exercises.map(e => {
                  const d = doneOf(e)
                  const t = totalReps(e)
                  const isNext = e.id === next?.ex.id
                  const r = exRest(e)

                  if (e.type === 'check') {
                    return (
                      <li key={e.id} className={`s-row is-check ${d ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}>
                        {isNext && <span className="s-caret" aria-hidden="true" />}
                        <button className={`s-chk ${d ? 'is-done' : ''}`} onClick={() => tick(e, d ? 0 : 1)} aria-pressed={!!d}>
                          <span className="s-box">{d ? '\u2713' : ''}</span>
                          <span className="s-n">{e.name}</span>
                          <span className="s-p">{pres(e)}</span>
                        </button>
                      </li>
                    )
                  }

                  return (
                    <li key={e.id} className={`s-row ${isNext ? 'is-next' : ''} ${d >= t ? 'is-done' : ''}`}>
                      {isNext && <span className="s-caret" aria-hidden="true" />}
                      <span className="s-n">{e.name}{e.cue && <em>{e.cue}</em>}</span>
                      <span className="s-p">{pres(e)}</span>
                      <span className="s-r">{r != null ? rs(r) : '\u2014'}</span>
                      {e.type === 'sprint' ? (
                        <input
                          className="s-t"
                          value={times[e.id] ?? ''}
                          placeholder="\u2014"
                          inputMode="decimal"
                          onChange={ev => setTimes(prev => ({ ...prev, [e.id]: ev.target.value }))}
                          aria-label={`Time, ${e.name}`}
                        />
                      ) : (
                        <span className="s-t is-empty" />
                      )}
                      <span className="s-dots">
                        {Array.from({ length: t }, (_, i) => (
                          <button
                            key={i}
                            className={`s-dot ${i < d ? 'is-done' : ''}`}
                            onClick={() => tick(e, i + 1 === d ? i : i + 1)}
                            aria-label={`Rep ${i + 1} of ${t}`}
                            aria-pressed={i < d}
                          />
                        ))}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* READOUT */}
      <section className="s-read">
        <div><b>{rDone}<em>/{rTotal}</em></b><span>REPS</span></div>
        <div><b className="is-teal">{metres}<em>m</em></b><span>&Sigma; d &middot; reps</span></div>
        <div><b className="is-green">{vMax ? vMax.toFixed(2) : '\u2014'}</b><span>v = d / t &middot; PEAK</span></div>
        <div className="s-load">
          <b className={load ? 'is-green' : ''}>{load ?? '\u2014'}</b>
          <span>RPE &times; {mins} MIN</span>
          <div className="s-scale">
            {RPES.map(r => (
              <button
                key={r}
                className={rpe === r ? 'is-sel' : (rpe !== null && rpe > r) ? 'is-on' : ''}
                onClick={() => setRpe(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {finished ? (
          <div className="s-logged">
            <b>Logged.</b>
            <span>{metres}m &middot; load {load}</span>
          </div>
        ) : (
          <button className="s-finish" disabled={!rpe || !rDone} onClick={handleFinish}>
            {rpe ? 'Finish' : 'Rate first'}
          </button>
        )}
      </section>
    </div>
  )
}
