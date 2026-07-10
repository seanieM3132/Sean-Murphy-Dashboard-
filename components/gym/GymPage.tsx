'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Exercise, Phase, Block } from '@/types/gym'
import { TEMPLATES, totalOf } from '@/lib/gym/templates'
import './gym.css'

/* ── Constants ───────────────────────────────────────────────── */

const TABS = [
  { n: '01', t: 'GYM', href: '/train/gym', on: true },
  { n: '02', t: 'SEWARD', href: '/train/seward', on: false },
  { n: '03', t: '112MVMNT', href: '/train/mvmnt', on: false },
  { n: '04', t: 'SOCCER', href: '/train/soccer', on: false },
  { n: '05', t: 'RECOVERY', href: '/train/recovery', on: false },
]

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const RPES = [4, 5, 6, 7, 8, 9, 10]

const WEEKS = [
  { team: 160, gym: 120, run: 40, mobility: 30 },
  { team: 180, gym: 150, run: 58, mobility: 42 },
  { team: 200, gym: 120, run: 76, mobility: 54 },
  { team: 160, gym: 150, run: 94, mobility: 30 },
  { team: 180, gym: 120, run: 40, mobility: 42 },
  { team: 200, gym: 150, run: 58, mobility: 54 },
  { team: 160, gym: 120, run: 76, mobility: 30 },
  { team: 180, gym: 150, run: 94, mobility: 42 },
]
const DISC: Record<string, string> = {
  team: '#4ADE80', gym: '#D8B24A', run: '#7DD3C0', mobility: '#2E7F5B',
}

/* ── Helpers ─────────────────────────────────────────────────── */

function clock(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function getTemplateForToday() {
  const day = (new Date().getDay() + 6) % 7 // 0=Mon
  for (const t of Object.values(TEMPLATES)) {
    if (t.day === day) return t
  }
  return null
}

function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7
}

/* ── Khabib mark ─────────────────────────────────────────────── */

function KhabibMark({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <rect x="6" y="6" width="52" height="52" rx="16" className="k-in" />
      <rect x="6" y="6" width="52" height="52" rx="16" className="k-frame" />
      <path d="M6 20 V16 A10 10 0 0 1 16 6 H20" className="k-tick" />
      <path d="M58 44 V48 A10 10 0 0 1 48 58 H44" className="k-tick" />
      <path d="M24 20 V44 M40 20 L26 32 L41 44" className="k-glyph" />
    </svg>
  )
}

/* ── Rep dots ────────────────────────────────────────────────── */

function Dots({ n, done, onTick }: { n: number; done: number; onTick: (n: number) => void }) {
  return (
    <span className="x-dots">
      {Array.from({ length: n }, (_, i) => (
        <button
          key={i}
          className={`x-dot${i < done ? ' is-done' : ''}`}
          onClick={() => onTick(i + 1 === done ? i : i + 1)}
          aria-label={`Rep ${i + 1} of ${n}`}
          aria-pressed={i < done}
        />
      ))}
    </span>
  )
}

/* ── Exercise row ────────────────────────────────────────────── */

function Row({
  ex, done, best, onTick, onBest, onRest,
}: {
  ex: Exercise
  done: number
  best: string | undefined
  onTick: (n: number) => void
  onBest: (v: string) => void
  onRest: (s: number) => void
}) {
  const total = totalOf(ex)

  const meta =
    ex.type === 'sprint' ? `${ex.reps} \u00D7 ${ex.dist}m` :
    ex.type === 'lift'   ? `${ex.sets} \u00D7 ${ex.reps} \u00B7 ${ex.load}` :
    ex.type === 'hold'   ? `${ex.sets} \u00D7 ${ex.secs}s${ex.side ? ' each side' : ''}` :
    ex.type === 'drill'  ? `${ex.sets} \u00D7 ${ex.work}` :
    `${ex.minutes} min`

  const rest = ex.type !== 'check' ? (ex as { rest?: number }).rest : undefined

  const tick = (n: number) => {
    onTick(n)
    if (n > done && rest) onRest(rest)
  }

  if (ex.type === 'check') {
    return (
      <li className="x-row is-check">
        <button
          className={`x-check${done ? ' is-done' : ''}`}
          onClick={() => onTick(done ? 0 : 1)}
          aria-pressed={!!done}
        >
          <span className="x-box">{done ? '\u2713' : ''}</span>
          <span className="x-n">{ex.name}</span>
          <span className="x-meta">{meta}</span>
        </button>
      </li>
    )
  }

  return (
    <li className={`x-row is-${ex.type}${done >= total ? ' is-done' : ''}`}>
      <div className="x-main">
        <span className="x-n">{ex.name}</span>
        {'cue' in ex && ex.cue && (
          <span className="x-cue">{ex.cue}</span>
        )}
      </div>
      <span className="x-meta">{meta}</span>
      {ex.type === 'sprint' && (
        <label className="x-time">
          <input
            value={best ?? ''}
            onChange={(e) => onBest(e.target.value)}
            placeholder="\u2014"
            inputMode="decimal"
            aria-label={`Best time for ${ex.name}`}
          />
          <em>s</em>
        </label>
      )}
      {rest != null && (
        <span className="x-rest">{rest >= 60 ? `${Math.floor(rest / 60)}\u2032` : `${rest}s`}</span>
      )}
      <Dots n={total} done={done} onTick={tick} />
    </li>
  )
}

/* ── Main component ──────────────────────────────────────────── */

export default function GymPage() {
  const template = getTemplateForToday()
  const todayIdx = getTodayIndex()

  // ── State
  const [phase, setPhase] = useState(0)
  const [openBlock, setOpenBlock] = useState<string | null>(template?.phases[0]?.blocks[0]?.code ?? null)
  const [startTime] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [finishWritten, setFinishWritten] = useState(false)
  const [log, setLog] = useState<Record<string, number>>({})
  const [times, setTimes] = useState<Record<string, string>>({})
  const [rpe, setRpe] = useState<number | null>(null)

  // Rest timer — timestamp-derived, survives backgrounding
  const [restEnd, setRestEnd] = useState<number | null>(null)
  const [restTotal, setRestTotal] = useState(0)
  const [restLeft, setRestLeft] = useState<number | null>(null)

  // Session clock — timestamp-derived
  useEffect(() => {
    if (finished) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 500)
    return () => clearInterval(id)
  }, [finished, startTime])

  // Rest countdown — timestamp-derived
  useEffect(() => {
    if (restEnd === null) { setRestLeft(null); return }
    const tick = () => {
      const left = Math.max(0, Math.ceil((restEnd - Date.now()) / 1000))
      setRestLeft(left)
      if (left <= 0) { setRestEnd(null); setRestLeft(null) }
    }
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [restEnd])

  const startRest = useCallback((secs: number) => {
    setRestTotal(secs)
    setRestEnd(Date.now() + secs * 1000)
  }, [])

  const addRest = useCallback((secs: number) => {
    setRestEnd(prev => prev !== null ? prev + secs * 1000 : null)
  }, [])

  const skipRest = useCallback(() => {
    setRestEnd(null)
    setRestLeft(null)
  }, [])

  // ── No template for today
  if (!template) {
    return (
      <div className="g-root">
        <header className="g-top">
          <div>
            <h1 className="g-title">Gym, <em>Sean</em></h1>
            <p className="g-sub">NO SESSION TODAY</p>
          </div>
        </header>
        <nav className="g-tabs" role="tablist">
          {TABS.map(t => (
            <a key={t.n} href={t.href} className={t.on ? 'is-on' : ''} role="tab" aria-selected={t.on}>
              <em>{t.n}</em>{t.t}
            </a>
          ))}
        </nav>
        <div className="g-weekbar">
          {WEEKDAYS.map((d, i) => (
            <span key={d} className={i === todayIdx ? 'is-on' : i < todayIdx ? 'is-past' : ''}>{d}</span>
          ))}
        </div>
        <div className="g-empty">
          <h2>No session template for today.</h2>
          <p>Other day templates are coming soon. Check the week bar for active days.</p>
        </div>
        <footer className="g-foot">
          <span>THREE PHASES &middot; ONE SESSION RPE</span>
          <span>FASCIA BLOCK BELONGS TO COACH CHONG XIE</span>
        </footer>
      </div>
    )
  }

  // ── Derived values
  const P = template.phases[phase]
  const doneOf = (ex: Exercise) => log[ex.id] ?? 0

  const exOf = (p: Phase) => p.blocks.flatMap(b => b.exercises)
  const pDone = (p: Phase) => exOf(p).reduce((a, e) => a + doneOf(e), 0)
  const pTotal = (p: Phase) => exOf(p).reduce((a, e) => a + totalOf(e), 0)
  const pMins = (p: Phase) => p.blocks.reduce((a, b) => a + b.mins, 0)

  const all = template.phases.flatMap(exOf)
  const repsDone = all.reduce((a, e) => a + doneOf(e), 0)
  const repsTotal = all.reduce((a, e) => a + totalOf(e), 0)
  const metres = all
    .filter((e): e is Extract<Exercise, { type: 'sprint' }> => e.type === 'sprint')
    .reduce((a, e) => a + doneOf(e) * e.dist, 0)
  const sprintReps = all
    .filter(e => e.type === 'sprint')
    .reduce((a, e) => a + doneOf(e), 0)

  const mins = Math.max(1, Math.round(elapsed / 60))
  const load = rpe ? Math.round(rpe * mins) : null
  const planned = template.phases.reduce((a, p) => a + pMins(p), 0)

  const phaseComplete = pDone(P) === pTotal(P)
  const nextPhase = phase < template.phases.length - 1

  // Load chart
  const totals = WEEKS.map(w => Object.values(w).reduce((a, b) => a + b, 0))
  const max = Math.max(...totals)
  const thisWeek = totals[totals.length - 1]
  const prevWeek = totals[totals.length - 2]
  const delta = prevWeek ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : 0

  const gotoPhase = (i: number) => {
    setPhase(i)
    setOpenBlock(template.phases[i].blocks[0].code)
  }

  const handleFinish = () => {
    if (finishWritten) return // idempotent
    setFinished(true)
    setFinishWritten(true)
    // TODO: write to Supabase daily_load and gym_sessions
  }

  // ── Field phase = RECOVER FULLY, others = RESTING
  const restLabel = phase === 0 ? 'RECOVER FULLY' : 'RESTING'

  return (
    <div className="g-root">
      {/* Header */}
      <header className="g-top">
        <div>
          <h1 className="g-title">Gym, <em>Sean</em></h1>
          <p className="g-sub">{template.name.toUpperCase()} &middot; {template.time} &middot; {template.dayLabel}</p>
        </div>
        <div className="g-clock">
          <span className={finished ? 'g-dot' : 'g-dot is-live'} />
          <div>
            <b>{clock(elapsed)}</b>
            <span>{finished ? 'Logged' : `of ~${planned} min`}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="g-tabs" role="tablist">
        {TABS.map(t => (
          <a key={t.n} href={t.href} className={t.on ? 'is-on' : ''} role="tab" aria-selected={t.on}>
            <em>{t.n}</em>{t.t}
          </a>
        ))}
      </nav>

      {/* Week bar */}
      <div className="g-weekbar">
        {WEEKDAYS.map((d, i) => (
          <span key={d} className={i === todayIdx ? 'is-on' : i < todayIdx ? 'is-past' : ''}>{d}</span>
        ))}
      </div>

      {/* Phase cards */}
      <nav className="g-phases" role="tablist" aria-label="Session phases">
        {template.phases.map((p, i) => {
          const d = pDone(p)
          const t = pTotal(p)
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={i === phase}
              className={`g-ph${i === phase ? ' is-on' : ''}${d === t ? ' is-complete' : ''}`}
              onClick={() => gotoPhase(i)}
            >
              <span className="g-ph-h">
                <em>{p.number}</em>{p.name}{d === t && <i>{'\u2713'}</i>}
              </span>
              <span className="g-ph-w">{p.where}</span>
              <span className="g-ph-bar"><span style={{ width: `${t ? (d / t) * 100 : 0}%` }} /></span>
              <span className="g-ph-m">{d}/{t} &middot; {pMins(p)}&prime;</span>
            </button>
          )
        })}
      </nav>

      {/* Coach */}
      <section className="g-coach">
        <KhabibMark size={44} />
        <div>
          <div className="g-cname">KHABIB <em>&middot; Stigler method</em></div>
          <h2 className="g-chead">{P.coach.headline}</h2>
          <p className="g-clead">{P.coach.line}</p>
        </div>
      </section>

      {/* Rest timer — sticky */}
      {restLeft !== null && !finished && (
        <div className="g-rest" role="status" aria-live="polite">
          <svg viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r="24" className="g-rt" />
            <circle
              cx="30" cy="30" r="24" className="g-rp"
              strokeDasharray={`${2 * Math.PI * 24 * (restTotal ? restLeft / restTotal : 0)} ${2 * Math.PI * 24}`}
            />
          </svg>
          <b>{restLeft}<em>s</em></b>
          <span>{restLabel}</span>
          <div className="g-rb">
            <button onClick={() => addRest(30)}>+30s</button>
            <button onClick={skipRest}>Skip</button>
          </div>
        </div>
      )}

      {/* Main grid */}
      <main className="g-main">
        <div className="g-left">
          {P.blocks.map((b: Block) => {
            const on = openBlock === b.code
            const d = b.exercises.reduce((a, e) => a + doneOf(e), 0)
            const t = b.exercises.reduce((a, e) => a + totalOf(e), 0)
            return (
              <section
                key={b.code}
                className={`g-block is-${b.tone}${on ? ' is-open' : ''}${d === t ? ' is-complete' : ''}`}
              >
                <button
                  className="g-bh"
                  onClick={() => setOpenBlock(on ? null : b.code)}
                  aria-expanded={on}
                >
                  <span className="g-code">{b.code}</span>
                  <span className="g-bn">
                    {b.name}
                    {b.tag && (
                      <i className={b.tag === 'MANDATORY' ? 'is-req' : ''}>{b.tag}</i>
                    )}
                  </span>
                  <span className="g-mins">{b.mins}&prime;</span>
                  <span className="g-bar"><span style={{ width: `${t ? (d / t) * 100 : 0}%` }} /></span>
                  <span className="g-cnt">{d}/{t}</span>
                  <span className="g-chev">{on ? '\u2212' : '+'}</span>
                </button>
                {on && (
                  <div className="g-bb">
                    {b.note && <p className="g-note-b">{b.note}</p>}
                    <ul className="x-list">
                      {b.exercises.map(ex => (
                        <Row
                          key={ex.id}
                          ex={ex}
                          done={doneOf(ex)}
                          best={times[ex.id]}
                          onTick={(n) => setLog(prev => ({ ...prev, [ex.id]: n }))}
                          onBest={(v) => setTimes(prev => ({ ...prev, [ex.id]: v }))}
                          onRest={(s) => startRest(s)}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )
          })}

          {/* Next phase button */}
          {phaseComplete && nextPhase && (
            <button className="g-next" onClick={() => gotoPhase(phase + 1)}>
              {P.name} done &rarr; {template.phases[phase + 1].name}
              <em>{template.phases[phase + 1].where}</em>
            </button>
          )}
        </div>

        {/* Right panel */}
        <aside className="g-right">
          {/* Session panel */}
          <section className="g-panel">
            <div className="g-idx">01</div>
            <div className="g-grid2">
              <div>
                <b>{repsDone}<em>/{repsTotal}</em></b>
                <span>Reps logged</span>
              </div>
              <div>
                <b className="is-teal">{metres}<em>m</em></b>
                <span>Distance sprinted</span>
              </div>
              <div>
                <b>{sprintReps}</b>
                <span>Sprint reps</span>
              </div>
              <div>
                <b className="is-good">{load ?? '\u2014'}</b>
                <span>Session load</span>
              </div>
            </div>

            <div className="g-prog">
              <div style={{ width: `${repsTotal ? (repsDone / repsTotal) * 100 : 0}%` }} />
            </div>

            <p className="g-lab">SESSION RPE &middot; ASKED ONCE</p>
            <div className="g-rpe">
              {RPES.map(r => (
                <button
                  key={r}
                  className={rpe === r ? 'is-sel' : rpe !== null && rpe > r ? 'is-on' : ''}
                  onClick={() => setRpe(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            {finished ? (
              <div className="g-logged">
                <h3>Logged.</h3>
                <p className="g-note">{metres}m sprinted &middot; load {load}. The Peak page reads this.</p>
              </div>
            ) : (
              <>
                <button
                  className="g-finish"
                  disabled={!rpe || !repsDone}
                  onClick={handleFinish}
                >
                  {rpe ? 'Finish session' : 'Rate the session first'}
                </button>
                <p className="g-note">
                  Load = session RPE &times; minutes. No tonnage on a speed day &mdash; there isn&apos;t any.
                </p>
              </>
            )}
            <h2 className="g-pt">SESSION</h2>
          </section>

          {/* Load panel */}
          <section className="g-panel">
            <div className="g-idx">02</div>
            <div className="g-grid2">
              <div>
                <b className="is-good">
                  {Math.floor(thisWeek / 60)}<em>h</em> {thisWeek % 60}<em>m</em>
                </b>
                <span>This week</span>
              </div>
              <div>
                <b className={delta > 30 ? 'is-hot' : ''}>
                  {delta > 0 ? '+' : ''}{delta}<em>%</em>
                </b>
                <span>Vs last week</span>
              </div>
            </div>
            <div className="g-stack">
              {WEEKS.map((w, i) => (
                <div key={i} className="g-col" style={{ height: `${max ? (totals[i] / max) * 100 : 0}%` }}>
                  {Object.entries(DISC).map(([k, c]) => (
                    <div key={k} style={{ flex: (w as Record<string, number>)[k], background: c }} />
                  ))}
                </div>
              ))}
            </div>
            <div className="g-axis"><span>8 WEEKS AGO</span><span>NOW</span></div>
            <ul className="g-keys">
              {Object.entries(DISC).map(([k, c]) => (
                <li key={k}>
                  <i style={{ background: c }} />
                  {k.toUpperCase()}
                  <b>{(WEEKS[WEEKS.length - 1] as Record<string, number>)[k]}&prime;</b>
                </li>
              ))}
            </ul>
            <h2 className="g-pt">LOAD</h2>
          </section>
        </aside>
      </main>

      {/* Footer */}
      <footer className="g-foot">
        <span>THREE PHASES &middot; ONE SESSION RPE</span>
        <span>FASCIA BLOCK BELONGS TO COACH CHONG XIE</span>
      </footer>
    </div>
  )
}
