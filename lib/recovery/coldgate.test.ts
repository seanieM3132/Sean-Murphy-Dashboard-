/**
 * Cold-gate and window tests.
 * Run with: npx tsx lib/recovery/coldgate.test.ts
 */

import {
  COLD_GATE_MINUTES,
  coldUnlocksAt,
  isToolLocked,
  coldCountdownMinutes,
  buildWindow,
  buildRestDayWindow,
  slotState,
  buildReport,
  formatDuration,
  formatTime,
} from './protocols'

let passed = 0
let failed = 0

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++
    console.log(`  PASS  ${name}`)
  } else {
    failed++
    console.error(`  FAIL  ${name}`)
  }
}

console.log('\n=== Cold Gate ===\n')

// COLD_GATE_MINUTES is 240
assert(COLD_GATE_MINUTES === 240, 'gate is 4 hours (240 min)')

// Strength session at 08:05 → cold unlocks at 12:05
const strengthEnd = 8 * 60 + 5 // 08:05 = 485
assert(coldUnlocksAt(strengthEnd, 'strength') === 485 + 240, 'strength: cold unlocks at sessionEnd + 240')
assert(coldUnlocksAt(strengthEnd, 'strength') === 725, 'strength at 08:05 → cold at 12:05 (725 min)')

// Match session → cold available immediately
assert(coldUnlocksAt(strengthEnd, 'match') === strengthEnd, 'match: cold unlocks immediately')
assert(coldUnlocksAt(strengthEnd, 'conditioning') === strengthEnd, 'conditioning: cold unlocks immediately')

console.log('\n=== Tool Locking ===\n')

// Ice locked during strength gate
assert(
  isToolLocked('ice', 600, strengthEnd, 'strength', null) === true,
  'ice locked at 10:00 after strength at 08:05',
)
assert(
  isToolLocked('contrast', 600, strengthEnd, 'strength', null) === true,
  'contrast locked at 10:00 after strength at 08:05',
)

// Ice unlocked after gate passes
assert(
  isToolLocked('ice', 726, strengthEnd, 'strength', null) === false,
  'ice unlocked at 12:06 after strength at 08:05',
)
assert(
  isToolLocked('contrast', 726, strengthEnd, 'strength', null) === false,
  'contrast unlocked at 12:06 after strength at 08:05',
)

// Ice unlocked at exact boundary (12:05 = 725)
assert(
  isToolLocked('ice', 725, strengthEnd, 'strength', null) === false,
  'ice unlocked at exactly 12:05 (boundary)',
)

// After match → cold immediately available
assert(
  isToolLocked('ice', strengthEnd, strengthEnd, 'match', null) === false,
  'ice available immediately after match',
)
assert(
  isToolLocked('contrast', strengthEnd, strengthEnd, 'match', null) === false,
  'contrast available immediately after match',
)

// Sauna blocked when matchIn === 1
assert(
  isToolLocked('sauna', 1200, strengthEnd, 'strength', 1) === true,
  'sauna blocked when match tomorrow',
)
assert(
  isToolLocked('sauna', 1200, strengthEnd, 'strength', 2) === false,
  'sauna allowed when match in 2 days',
)
assert(
  isToolLocked('sauna', 1200, strengthEnd, 'strength', null) === false,
  'sauna allowed when no upcoming match',
)

// Non-cold, non-sauna tools are never locked
assert(
  isToolLocked('gun', 400, strengthEnd, 'strength', 1) === false,
  'gun never locked',
)
assert(
  isToolLocked('roll', 400, strengthEnd, 'strength', 1) === false,
  'roll never locked',
)
assert(
  isToolLocked('ball', 400, strengthEnd, 'strength', 1) === false,
  'ball never locked',
)
assert(
  isToolLocked('walk', 400, strengthEnd, 'strength', 1) === false,
  'walk never locked',
)

console.log('\n=== Countdown ===\n')

assert(
  coldCountdownMinutes(600, strengthEnd, 'strength') === 125,
  'at 10:00 after 08:05 strength: 125 min remaining',
)
assert(
  coldCountdownMinutes(725, strengthEnd, 'strength') === 0,
  'at 12:05 after 08:05 strength: 0 remaining',
)
assert(
  coldCountdownMinutes(800, strengthEnd, 'strength') === 0,
  'past the gate: 0 remaining',
)
assert(
  coldCountdownMinutes(strengthEnd, strengthEnd, 'match') === 0,
  'match session: 0 countdown immediately',
)

console.log('\n=== Window Builder ===\n')

// Strength session window
const now = 14 * 60 + 12 // 14:12
const win = buildWindow(strengthEnd, 'strength', now, 1)

assert(win.length === 5, 'strength window has 5 slots')
assert(win[0].at === strengthEnd, 'slot 0 at session end')
assert(win[0].tools.includes('walk'), 'slot 0 has walk')
assert(win[1].at === strengthEnd + 30, 'slot 1 at +30m')
assert(win[2].at === strengthEnd + 240, 'slot 2 (cold) at +4h')
assert(win[2].locked === false, 'cold slot unlocked at 14:12 (past 12:05)')

// Cold slot locked when now is before the gate
const earlyWin = buildWindow(strengthEnd, 'strength', 600, 1)
assert(earlyWin[2].locked === true, 'cold slot locked at 10:00')

// Match session → cold not locked
const matchWin = buildWindow(strengthEnd, 'match', strengthEnd, 1)
assert(matchWin[2].locked === false, 'cold slot not locked after match')
assert(matchWin[2].label === 'Any time', 'cold label says "Any time" after match')

// Sauna locked when matchIn === 1
assert(win[4].locked === true, 'sauna locked when match tomorrow')
const noMatchWin = buildWindow(strengthEnd, 'strength', now, 2)
assert(noMatchWin[4].locked === false, 'sauna unlocked when match in 2 days')

// Rest day window
const restWin = buildRestDayWindow()
assert(restWin.length === 2, 'rest day has 2 slots')
assert(restWin[0].tools.includes('roll'), 'rest day morning has roll')

console.log('\n=== Slot State ===\n')

// slot at 485, next at 515, now at 500 → "now"
assert(slotState({ at: 485 } as any, 515, 500) === 'now', 'between two slots = now')
assert(slotState({ at: 485 } as any, 515, 520) === 'past', 'past next slot = past')
assert(slotState({ at: 485 } as any, 515, 480) === 'next', 'before slot = next')
assert(slotState({ at: 485 } as any, null, 500) === 'now', 'last slot, after it = now')

console.log('\n=== Escalation Report ===\n')

const history = {
  adduct:  [1, 2, 2, 3, 2, 2, 2],
  lowback: [0, 1, 2, 1, 2, 1, 2],
  calves:  [0, 0, 1, 1, 0, 1, 1],
}

const report = buildReport(history)

assert(report[0].region === 'adduct', 'adductors sorted first (most flagged)')
assert(report[0].flagged === 6, 'adductors flagged 6 of 7')
assert(report[0].trend === 1, 'adductors trend = +1 (worsening)')
assert(report[0].escalate === true, 'adductors trigger escalation (>=4 flagged, non-negative trend)')

assert(report[1].region === 'lowback', 'lowback sorted second')
assert(report[1].flagged === 3, 'lowback flagged 3 of 7')
assert(report[1].escalate === false, 'lowback does NOT escalate (only 3 flagged)')

assert(report[2].region === 'calves', 'calves sorted last')
assert(report[2].escalate === false, 'calves do not escalate')

// Edge case: exactly 4 flagged, flat trend
const edgeHistory = { test: [2, 2, 0, 2, 0, 0, 2] }
const edgeReport = buildReport(edgeHistory)
assert(edgeReport[0].flagged === 4, 'edge: exactly 4 flagged')
assert(edgeReport[0].trend === 0, 'edge: flat trend')
assert(edgeReport[0].escalate === true, 'edge: escalates (4 flagged, trend >= 0)')

// Edge case: 4 flagged but improving → no escalation
const improvingHistory = { test: [3, 2, 2, 2, 0, 0, 1] }
const improvingReport = buildReport(improvingHistory)
assert(improvingReport[0].flagged === 4, 'improving: 4 flagged')
assert(improvingReport[0].trend === -2, 'improving: negative trend')
assert(improvingReport[0].escalate === false, 'improving: does NOT escalate (negative trend)')

console.log('\n=== Formatting ===\n')

assert(formatDuration(125) === '2h 5m', 'formatDuration 125 → 2h 5m')
assert(formatDuration(45) === '45m', 'formatDuration 45 → 45m')
assert(formatDuration(60) === '1h 0m', 'formatDuration 60 → 1h 0m')
assert(formatTime(725) === '12:05', 'formatTime 725 → 12:05')
assert(formatTime(0) === '00:00', 'formatTime 0 → 00:00')
assert(formatTime(1439) === '23:59', 'formatTime 1439 → 23:59')

console.log(`\n${'='.repeat(40)}`)
console.log(`  ${passed} passed, ${failed} failed`)
console.log('='.repeat(40))

if (failed > 0) process.exit(1)
