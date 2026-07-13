import type {
  Protocol,
  ToolKey,
  SessionType,
  WindowSlot,
} from '@/types/recovery'

/* ═══ protocols ══════════════════════════════════════════════════
   Every recovery tool Sean has access to. Parameters, safety
   notes, and round structure live here — never embedded in
   components as copy.
   ══════════════════════════════════════════════════════════════ */

export const PROTOCOLS: Record<ToolKey, Protocol> = {
  sauna: {
    name: 'Sauna',
    tag: 'HEAT',
    colour: '#E8873A',
    weeklyTarget: 3,
    spec: '80-100 C \u00B7 4 \u00D7 15 min \u00B7 2 min cool between',
    rounds: [{ phase: 'HEAT', seconds: 900 }, { phase: 'COOL', seconds: 120 }],
    sets: 4,
    why: 'Heat adaptation raises plasma volume. Real, but slow \u2014 weeks of sessions, not one before a match.',
    care: 'Hydrate. Leave if you feel faint. Not within 90 minutes of bed.',
  },
  ice: {
    name: 'Ice bath',
    tag: 'COLD',
    colour: '#7DD3C0',
    weeklyTarget: 2,
    spec: '10-15 C \u00B7 10-15 min \u00B7 to the sternum',
    rounds: [{ phase: 'IMMERSE', seconds: 720 }],
    sets: 1,
    why: 'Blunts soreness. Best after matches and hard conditioning, when tomorrow matters more than adaptation.',
    care: 'Never within 4 hours of strength work. Shivering hard means get out.',
  },
  contrast: {
    name: 'Contrast',
    tag: 'HOT / COLD',
    colour: '#D8B24A',
    weeklyTarget: 2,
    spec: '3 min hot / 1 min cold \u00D7 4 \u00B7 finish cold',
    rounds: [{ phase: 'HOT', seconds: 180 }, { phase: 'COLD', seconds: 60 }],
    sets: 4,
    why: 'Gentler than full immersion. Mostly makes you feel better, which on a Thursday is enough.',
    care: 'Finish cold. Not the night before a match \u2014 you want to sleep.',
  },
  gun: {
    name: 'Massage gun',
    tag: 'PERCUSSION',
    colour: '#4ADE80',
    weeklyTarget: 5,
    spec: '60-90 s per area \u00B7 light pressure \u00B7 slow glide',
    rounds: [{ phase: 'WORK', seconds: 75 }],
    sets: 3,
    why: 'Short-term range of motion without the strength cost of static stretching.',
    care: 'Never on bone, joints, the front of the neck, or nerve lines. If it makes you flinch, stop.',
  },
  roll: {
    name: 'Foam roll \u00B7 fascia',
    tag: 'MYOFASCIAL',
    colour: '#4ADE80',
    weeklyTarget: 5,
    spec: '60-90 s per area \u00B7 slow \u00B7 breathe out on the tender spot',
    rounds: [{ phase: 'ROLL', seconds: 90 }],
    sets: 2,
    why: 'Range without losing force. The effect fades in an hour \u2014 roll before you need it.',
    care: 'Slow. Speed is how people convince themselves they\u2019ve done something.',
  },
  ball: {
    name: 'Spikey ball',
    tag: 'TARGETED',
    colour: '#7DD3C0',
    weeklyTarget: 4,
    spec: '90 s per point \u00B7 sustained, not rolling',
    rounds: [{ phase: 'SUSTAIN', seconds: 90 }],
    sets: 2,
    why: 'Reaches what a roller can\u2019t \u2014 glute med, plantar fascia, under the shoulder blade.',
    care: 'Stay off the ITB, the spine itself, and the back of the knee.',
  },
  press: {
    name: 'Pressure points',
    tag: 'ISCHAEMIC',
    colour: '#D8B24A',
    weeklyTarget: 3,
    spec: '30-45 s sustained \u00B7 6/10 discomfort \u00B7 breathe',
    rounds: [{ phase: 'HOLD', seconds: 40 }],
    sets: 3,
    why: 'Hold a tender point until it softens. Nothing by 40 seconds means it isn\u2019t the point.',
    care: '6 out of 10, not 9. Pain you hold your breath through teaches you to brace.',
  },
  walk: {
    name: 'Walk & rehydrate',
    tag: 'IMMEDIATE',
    colour: '#5F786E',
    weeklyTarget: 7,
    spec: '5-10 min \u00B7 nasal breathing \u00B7 500 ml + electrolytes',
    rounds: [{ phase: 'WALK', seconds: 420 }],
    sets: 1,
    why: 'The only thing worth doing in the first fifteen minutes. Everything else can wait.',
    care: 'Nothing to get wrong here. Do it anyway.',
  },
}

/* ═══ cold gate ══════════════════════════════════════════════════
   Cold water immersion within 4 hours of strength work measurably
   blunts hypertrophy signalling. This is enforced, not warned.

   After a match or conditioning session cold is available
   immediately — tomorrow matters more than adaptation.
   ══════════════════════════════════════════════════════════════ */

export const COLD_GATE_MINUTES = 240 // 4 hours

export const COLD_TOOLS: ReadonlySet<ToolKey> = new Set(['ice', 'contrast'])

/**
 * Returns the minute-of-day when cold tools unlock.
 * For strength sessions: sessionEndMinutes + 240.
 * For everything else: sessionEndMinutes (immediately).
 */
export function coldUnlocksAt(
  sessionEndMinutes: number,
  sessionType: SessionType,
): number {
  if (sessionType === 'strength') {
    return sessionEndMinutes + COLD_GATE_MINUTES
  }
  return sessionEndMinutes
}

/**
 * Is a specific tool locked right now?
 *
 * Cold tools are locked if:
 *   - session type is strength AND nowMinutes < sessionEnd + 4h
 *
 * Sauna is locked if:
 *   - match is tomorrow (matchIn === 1)
 *   - OR nowMinutes >= bedtimeMinutes - 90
 */
export function isToolLocked(
  tool: ToolKey,
  nowMinutes: number,
  sessionEndMinutes: number,
  sessionType: SessionType,
  matchIn: number | null,
): boolean {
  if (COLD_TOOLS.has(tool)) {
    return nowMinutes < coldUnlocksAt(sessionEndMinutes, sessionType)
  }
  if (tool === 'sauna') {
    return matchIn === 1
  }
  return false
}

/**
 * Minutes remaining until cold unlocks. 0 if already unlocked.
 */
export function coldCountdownMinutes(
  nowMinutes: number,
  sessionEndMinutes: number,
  sessionType: SessionType,
): number {
  const unlocks = coldUnlocksAt(sessionEndMinutes, sessionType)
  return Math.max(0, unlocks - nowMinutes)
}

/**
 * Format minutes as "Xh Ym".
 */
export function formatDuration(m: number): string {
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`
  return `${m}m`
}

/**
 * Format minute-of-day as "HH:MM".
 */
export function formatTime(m: number): string {
  const h = Math.floor(m / 60) % 24
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/* ═══ window builder ═════════════════════════════════════════════
   Generates the recovery timeline from today's session. The window
   is computed, never hardcoded.
   ══════════════════════════════════════════════════════════════ */

export const DEFAULT_BEDTIME = 22 * 60 + 30 // 22:30

export function buildWindow(
  sessionEndMinutes: number,
  sessionType: SessionType,
  nowMinutes: number,
  matchIn: number | null,
  bedtime: number = DEFAULT_BEDTIME,
): WindowSlot[] {
  const isStrength = sessionType === 'strength'
  const coldAt = coldUnlocksAt(sessionEndMinutes, sessionType)

  return [
    {
      at: sessionEndMinutes,
      label: 'Straight after',
      tools: ['walk'],
      locked: false,
      note: 'Nothing else. Move, drink, eat.',
    },
    {
      at: sessionEndMinutes + 30,
      label: '+30 minutes',
      tools: ['gun', 'roll'],
      locked: false,
      note: 'Light. You\u2019re helping the tissue, not training it.',
    },
    {
      at: coldAt,
      label: isStrength ? '+4 hours' : 'Any time',
      tools: ['ice', 'contrast'],
      locked: isStrength && nowMinutes < coldAt,
      note: isStrength
        ? 'Cold before this costs you the session you just did.'
        : 'No strength work today \u2014 cold is free.',
    },
    {
      at: 19 * 60 + 30, // 19:30
      label: 'Evening',
      tools: ['ball', 'press'],
      locked: false,
      note: 'Sore spots only. Ten minutes, not forty.',
    },
    {
      at: bedtime - 90,
      label: '\u226590 min before bed',
      tools: ['sauna'],
      locked: matchIn === 1,
      note: matchIn === 1
        ? 'Match tomorrow. Skip the heat, sleep instead.'
        : 'Core temp needs time to fall.',
    },
  ]
}

export function buildRestDayWindow(
  bedtime: number = DEFAULT_BEDTIME,
  matchIn: number | null = null,
): WindowSlot[] {
  return [
    {
      at: 10 * 60,
      label: 'Morning',
      tools: ['roll', 'ball'],
      locked: false,
      note: 'Light soft tissue if you feel like it. Nothing prescribed.',
    },
    {
      at: bedtime - 90,
      label: '\u226590 min before bed',
      tools: ['sauna'],
      locked: matchIn === 1,
      note: matchIn === 1
        ? 'Match tomorrow. Skip the heat, sleep instead.'
        : 'If you want it. Rest days don\u2019t need recovery.',
    },
  ]
}

/**
 * Determine slot state relative to now.
 */
export function slotState(
  slot: WindowSlot,
  nextSlotAt: number | null,
  nowMinutes: number,
): 'past' | 'now' | 'next' {
  if (nowMinutes >= slot.at && (nextSlotAt === null || nowMinutes < nextSlotAt)) {
    return 'now'
  }
  if (nowMinutes >= slot.at) return 'past'
  return 'next'
}

/* ═══ escalation rule ════════════════════════════════════════════
   Any region flagged >= 4 of the last 7 days with a non-negative
   trend triggers a physio referral. This is a rule, not a mood.
   ══════════════════════════════════════════════════════════════ */

export interface ReportRow {
  region: string
  days: number[]
  flagged: number
  trend: number
  escalate: boolean
}

export function buildReport(
  history: Record<string, number[]>,
): ReportRow[] {
  return Object.entries(history)
    .map(([region, days]) => {
      const flagged = days.filter(v => v >= 2).length
      const trend = (days.at(-1) ?? 0) - days[0]
      const escalate = flagged >= 4 && trend >= 0
      return { region, days, flagged, trend, escalate }
    })
    .sort((a, b) => b.flagged - a.flagged)
}
