import type { SessionTemplate } from '@/types/gym'

// ─── Friday: Speed & Acceleration ───────────────────────────────
// Three phases, three locations, each with its own warm-up.
// Data sourced from brain/gym-program.md — rep counts and rest
// periods match the sheet exactly.
//
// Block ownership:
//   - Fascia block belongs to Coach Chong Xie. Khabib cannot modify it.
//   - Priming gym is MANDATORY. The sheet says optional. The sheet is wrong.
//   - GOATA sits in RESTORE. The sheet says before every session.
//     Keep the ordering, keep the note explaining the tension.

export const FRIDAY_SPEED: SessionTemplate = {
  id: 'friday_speed',
  name: 'Speed & Acceleration',
  time: '09:00',
  day: 4,
  dayLabel: 'FRIDAY',
  phases: [
    // ── 01 FIELD ──────────────────────────────────────────────
    {
      id: 'field',
      number: '01',
      name: 'FIELD',
      where: 'Grass \u00B7 spikes',
      coach: {
        headline: 'QUALITY, NOT VOLUME',
        line: 'Full recovery between every rep. The moment your times fall off, the session is finished \u2014 everything after that is teaching your nervous system to be slow.',
      },
      blocks: [
        {
          code: 'A', name: 'WARM-UP', mins: 5, tone: 'warm',
          exercises: [
            { type: 'check', id: 'a1', name: 'A-skips 2\u00D720m', minutes: 1 },
            { type: 'check', id: 'a2', name: 'B-skips 2\u00D720m', minutes: 1 },
            { type: 'check', id: 'a3', name: 'High knees 2\u00D720m', minutes: 1 },
            { type: 'check', id: 'a4', name: 'Wall drives 2\u00D78 each leg', minutes: 1 },
            { type: 'check', id: 'a5', name: 'Falling starts 3\u00D715m', minutes: 1 },
          ],
        },
        {
          code: 'B', name: 'ACCELERATION', mins: 22, tone: 'work',
          tag: 'MAX INTENT',
          note: 'First 10m \u2014 the most important distance in soccer. Full recovery between every rep. Times, not feelings.',
          exercises: [
            { type: 'sprint', id: 'b1', name: 'Standing start', reps: 5, dist: 10, rest: 60,
              cue: 'Low start, 45\u00B0 body angle, short choppy steps, drive into ground BEHIND you. First 3 steps are everything.' },
            { type: 'sprint', id: 'b2', name: '3-point start', reps: 4, dist: 15, rest: 60,
              cue: 'Hand on ground, explode out. Gradually rise to upright by 10m.' },
            { type: 'sprint', id: 'b3', name: 'Reaction sprint', reps: 4, dist: 10, rest: 60,
              cue: 'Wait for signal, EXPLODE. Train reaction speed + first step.' },
          ],
        },
        {
          code: 'C', name: 'MAX VELOCITY', mins: 14, tone: 'work',
          note: 'Fastest thing you\u2019ll do all week. Two good ones beat six bad ones.',
          exercises: [
            { type: 'sprint', id: 'c1', name: 'Flying 20s', reps: 4, dist: 20, rest: 90,
              cue: '10m build to 80%, hit MAX for the next 20m. Upright posture, knees high, relax face and hands.' },
          ],
        },
        {
          code: 'D', name: 'AGILITY', mins: 12, tone: 'work',
          exercises: [
            { type: 'sprint', id: 'd1', name: '5-10-5 shuttle', reps: 4, dist: 20, rest: 90,
              cue: 'Sprint 5m, touch, 10m opposite, touch, 5m back. LOW on the turns.' },
            { type: 'sprint', id: 'd2', name: 'T-drill', reps: 3, dist: 40, rest: 90,
              cue: 'Forward 10m, shuffle R 5m, shuffle L 10m, shuffle R 5m, backpedal 10m.' },
            { type: 'sprint', id: 'd3', name: 'Ball retrieval sprint', reps: 4, dist: 15, rest: 60,
              cue: 'Ball placed 15m away. Sprint, control with first touch, dribble back.' },
          ],
        },
        {
          code: 'E', name: 'TEMPO', mins: 8, tone: 'work',
          exercises: [
            { type: 'sprint', id: 'e1', name: 'Tempo run', reps: 3, dist: 100, rest: 60,
              cue: '70-75% effort. Build aerobic base for speed endurance. Smooth and relaxed.' },
          ],
        },
      ],
    },

    // ── 02 GYM ────────────────────────────────────────────────
    {
      id: 'gym',
      number: '02',
      name: 'GYM',
      where: 'Indoor \u00B7 20 min after the field',
      coach: {
        headline: 'PRIME, DON\u2019T GRIND',
        line: 'Two sets of everything. You are not chasing a lift today \u2014 you are telling the tissue the sprints were real.',
      },
      blocks: [
        {
          code: 'F', name: 'GYM WARM-UP', mins: 6, tone: 'warm',
          exercises: [
            { type: 'check', id: 'f1', name: 'Bike or row, easy', minutes: 3 },
            { type: 'drill', id: 'f2', name: 'Goblet squat ramp', sets: 2, work: '8 reps',
              cue: 'Empty, then 16kg. Groove the pattern.' },
            { type: 'drill', id: 'f3', name: 'Band pull-aparts', sets: 2, work: '15 reps',
              cue: 'Slow return.' },
          ],
        },
        {
          code: 'G', name: 'PRIMING GYM', mins: 14, tone: 'work',
          tag: 'MANDATORY',
          note: 'Called optional on the sheet. It is not optional \u2014 it\u2019s why the sprints hold up in week six.',
          exercises: [
            { type: 'lift', id: 'g1', name: 'Goblet squat', sets: 2, reps: 10, load: '16 kg KB', rest: 60,
              cue: 'Elbows inside the knees. Light, smooth, full depth. Mobility not strength.' },
            { type: 'lift', id: 'g2', name: 'Push-ups', sets: 2, reps: 12, load: 'BW', rest: 30,
              cue: 'Easy tempo, blood flow.' },
            { type: 'lift', id: 'g3', name: 'TRX / band rows', sets: 2, reps: 12, load: 'BW', rest: 30,
              cue: 'Light pull, squeeze back.' },
            { type: 'hold', id: 'g4', name: 'Hip flexor stretch', sets: 2, secs: 30, side: true,
              cue: 'Glute on. Ribs down. Open up for tomorrow.' },
          ],
        },
      ],
    },

    // ── 03 RESTORE ────────────────────────────────────────────
    {
      id: 'restore',
      number: '03',
      name: 'RESTORE',
      where: 'Floor \u00B7 barefoot',
      coach: {
        headline: 'THE PART YOU\u2019LL SKIP',
        line: 'The fascia block belongs to Chong Xie and the groundwork belongs to your feet. Neither of them care that you\u2019re tired.',
      },
      blocks: [
        {
          code: 'H', name: 'FASCIA', mins: 12, tone: 'prime',
          tag: 'COACH CHONG XIE \u00B7 MON / WED / FRI',
          note: 'Prescribed by Chong Xie. Khabib doesn\u2019t touch this block.',
          exercises: [
            { type: 'hold', id: 'h1', name: 'HFT marble swing', sets: 3, secs: 30, side: true, rest: 15,
              cue: 'Each foot.' },
            { type: 'drill', id: 'h2', name: 'Gait cycle drills', sets: 1, work: '5 min',
              cue: 'GOATA cues \u2014 heel-away, IABH, back chain.' },
            { type: 'hold', id: 'h3', name: 'Lateral pelvic tilts', sets: 3, secs: 30, side: true,
              cue: '3 positions, both sides.' },
          ],
        },
        {
          code: 'I', name: 'GOATA GROUNDWORK', mins: 10, tone: 'prime',
          tag: 'EVERY SESSION',
          note: 'Your sheet says before every session. You\u2019ve put it here. Do it here, every time \u2014 but if a sprint day ever feels flat from rep one, move it back to the front.',
          exercises: [
            { type: 'hold', id: 'i1', name: 'Ground hip stretch', sets: 1, secs: 50, side: true,
              cue: 'Keep IABH. 45-60s each side.' },
            { type: 'hold', id: 'i2', name: 'Child rocker', sets: 3, secs: 60,
              cue: 'Head stays up.' },
            { type: 'hold', id: 'i3', name: 'Toe tuck rocker', sets: 3, secs: 60,
              cue: 'Heels open.' },
            { type: 'drill', id: 'i4', name: 'Elevated toe curls', sets: 3, work: '20s holds', rest: 10,
              cue: 'Slow. Feel the arch.' },
          ],
        },
        {
          code: 'J', name: 'COOL-DOWN', mins: 8, tone: 'cool',
          exercises: [
            { type: 'check', id: 'j1', name: 'Light jog or walk', minutes: 3 },
            { type: 'check', id: 'j2', name: 'Quad stretch each side', minutes: 1 },
            { type: 'check', id: 'j3', name: 'Hamstring stretch each side', minutes: 1 },
            { type: 'check', id: 'j4', name: 'Hip flexor stretch each side', minutes: 1 },
            { type: 'check', id: 'j5', name: 'Chest/shoulder stretch + lat hang', minutes: 1 },
            { type: 'check', id: 'j6', name: 'Box breathing 4-4-4-4', minutes: 1 },
          ],
        },
      ],
    },
  ],
}

// ─── Template registry ──────────────────────────────────────────
// Other days will be added here as separate exports:
//   MONDAY_HEAVY, TUESDAY_ACTIVATION, WEDNESDAY_POWER,
//   THURSDAY_ACTIVATION

export const TEMPLATES: Record<string, SessionTemplate> = {
  friday_speed: FRIDAY_SPEED,
}

/** Look up the template for a given date. Returns null on off days or days
 *  without a template yet. */
export function getTemplateForDate(date: Date): SessionTemplate | null {
  const day = (date.getDay() + 6) % 7 // 0=Mon ... 6=Sun
  if (day === 4) return FRIDAY_SPEED
  // TODO: add monday_heavy (0), tuesday_activation (1),
  //       wednesday_power (2), thursday_activation (3)
  return null
}

// ─── Helpers ────────────────────────────────────────────────────

/** Total reps/ticks for one exercise. */
export function totalOf(ex: { type: string; reps?: number; sets?: number }): number {
  if (ex.type === 'sprint') return (ex as { reps: number }).reps
  if (ex.type === 'check') return 1
  return (ex as { sets: number }).sets ?? 1
}
