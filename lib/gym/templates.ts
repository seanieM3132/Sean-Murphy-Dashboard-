import type { SessionTemplate } from '@/types/gym'

export const FRIDAY_SPEED: SessionTemplate = {
  id: 'friday_speed',
  name: 'Speed & Acceleration',
  startsAt: '09:00',
  phases: [
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
          code: 'A', name: 'WARM-UP', minutes: 5, tone: 'warm',
          exercises: [
            { type: 'check', id: 'a1', name: 'Easy jog', minutes: 2 },
            { type: 'check', id: 'a2', name: 'Leg swings, both planes', minutes: 1 },
            { type: 'check', id: 'a3', name: 'A-skips + B-skips', minutes: 1 },
            { type: 'check', id: 'a4', name: 'Build-ups \u2014 60, 70, 80%', minutes: 1 },
          ],
        },
        {
          code: 'B', name: 'ACCELERATION', minutes: 22, tone: 'work',
          tag: 'MAX INTENT',
          note: 'Full recovery between every rep. Times, not feelings.',
          exercises: [
            { type: 'sprint', id: 'b1', name: 'Standing start', reps: 3, dist: 10, rest: 120, cue: 'Shin angle. Punch the ground.' },
            { type: 'sprint', id: 'b2', name: '3-point start', reps: 3, dist: 15, rest: 150, cue: 'Front-side mechanics. Don\u2019t pop up.' },
            { type: 'sprint', id: 'b3', name: 'Reaction sprint', reps: 3, dist: 10, rest: 120, cue: 'React to a call, not a count.' },
          ],
        },
        {
          code: 'C', name: 'MAX VELOCITY', minutes: 14, tone: 'work',
          note: 'Fastest thing you\u2019ll do all week. Two good ones beat six bad ones.',
          exercises: [
            { type: 'sprint', id: 'c1', name: 'Flying 20s', reps: 3, dist: 20, rest: 180, cue: '10m build, 20m max. Tall, relaxed.' },
          ],
        },
        {
          code: 'D', name: 'AGILITY', minutes: 12, tone: 'work',
          exercises: [
            { type: 'sprint', id: 'd1', name: '5-10-5 shuttle', reps: 3, dist: 20, rest: 120, cue: 'Plant the outside foot. Decelerate first.' },
            { type: 'sprint', id: 'd2', name: 'T-drill', reps: 3, dist: 40, rest: 120, cue: 'Shuffle, don\u2019t cross.' },
            { type: 'sprint', id: 'd3', name: 'Ball retrieval sprint', reps: 3, dist: 15, rest: 90, cue: 'Game speed. Head up at the end.' },
          ],
        },
        {
          code: 'E', name: 'TEMPO', minutes: 8, tone: 'work',
          exercises: [
            { type: 'sprint', id: 'e1', name: 'Tempo run', reps: 3, dist: 100, rest: 60, cue: '70%. This is not a sprint. Aerobic.' },
          ],
        },
      ],
    },
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
          code: 'F', name: 'GYM WARM-UP', minutes: 6, tone: 'warm',
          exercises: [
            { type: 'check', id: 'f1', name: 'Bike or row, easy', minutes: 3 },
            { type: 'drill', id: 'f2', name: 'Goblet squat ramp', sets: 2, work: '8 reps', cue: 'Empty, then 8kg.' },
            { type: 'drill', id: 'f3', name: 'Band pull-aparts', sets: 2, work: '15 reps', cue: 'Slow return.' },
          ],
        },
        {
          code: 'G', name: 'PRIMING GYM', minutes: 14, tone: 'work',
          tag: 'MANDATORY',
          note: 'Called optional on the sheet. It is not optional here \u2014 it\u2019s why the sprints hold up in week six.',
          exercises: [
            { type: 'lift', id: 'g1', name: 'Goblet squat', sets: 2, reps: 10, load: '16 kg KB', rest: 60, cue: 'Elbows inside the knees.' },
            { type: 'lift', id: 'g2', name: 'Push-ups', sets: 2, reps: 12, load: 'BW', rest: 60, cue: 'Ribs down.' },
            { type: 'lift', id: 'g3', name: 'TRX / band rows', sets: 2, reps: 12, load: 'BW', rest: 60, cue: 'Squeeze, don\u2019t yank.' },
            { type: 'hold', id: 'g4', name: 'Hip flexor stretch', sets: 2, secs: 30, side: true, cue: 'Glute on. Ribs down.' },
          ],
        },
      ],
    },
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
          code: 'H', name: 'FASCIA', minutes: 9, tone: 'prime',
          tag: 'COACH CHONG XIE \u00B7 MON / WED / FRI',
          note: 'Prescribed by Chong Xie. Khabib doesn\u2019t touch this block.',
          exercises: [
            { type: 'hold', id: 'h1', name: 'HFT marble swing', sets: 3, secs: 30, side: true, rest: 15, cue: 'Each foot.' },
            { type: 'drill', id: 'h2', name: 'Gait cycle drills', sets: 1, work: '5 min', cue: 'GOATA cues \u2014 heel-away, IABH, back chain.' },
          ],
        },
        {
          code: 'I', name: 'GOATA GROUNDWORK', minutes: 10, tone: 'prime',
          tag: 'EVERY SESSION',
          note: 'Your sheet says before every session. You\u2019ve put it here. Do it here, every time \u2014 but if a sprint day ever feels flat from rep one, move it back to the front.',
          exercises: [
            { type: 'hold', id: 'i1', name: 'Ground hip stretch', sets: 2, secs: 50, side: true, cue: 'Keep IABH.' },
            { type: 'hold', id: 'i2', name: 'Child rocker', sets: 3, secs: 60, cue: 'Head stays up.' },
            { type: 'hold', id: 'i3', name: 'Toe tuck rocker', sets: 3, secs: 60, cue: 'Heels open.' },
            { type: 'drill', id: 'i4', name: 'Elevated toe curls', sets: 3, work: '20 curls', rest: 30, cue: 'Slow. Feel the arch.' },
          ],
        },
        {
          code: 'J', name: 'COOL-DOWN', minutes: 8, tone: 'cool',
          exercises: [
            { type: 'check', id: 'j1', name: 'Walk, nasal breathing', minutes: 3 },
            { type: 'check', id: 'j2', name: 'Couch stretch, each side', minutes: 2 },
            { type: 'check', id: 'j3', name: 'Adductor + hamstring hold', minutes: 2 },
            { type: 'check', id: 'j4', name: 'Box breathing 4-4-4-4', minutes: 1 },
          ],
        },
      ],
    },
  ],
}

export const TEMPLATES: Record<string, SessionTemplate> = {
  friday_speed: FRIDAY_SPEED,
}

export const WEEKS = [
  { team: 160, gym: 120, run: 40, mobility: 30 },
  { team: 180, gym: 150, run: 58, mobility: 42 },
  { team: 200, gym: 120, run: 76, mobility: 54 },
  { team: 160, gym: 150, run: 94, mobility: 30 },
  { team: 180, gym: 120, run: 40, mobility: 42 },
  { team: 200, gym: 150, run: 58, mobility: 54 },
  { team: 160, gym: 120, run: 76, mobility: 30 },
  { team: 180, gym: 150, run: 94, mobility: 42 },
] as const

export const DISC: Record<string, string> = {
  team: '#4ADE80',
  gym: '#D8B24A',
  run: '#7DD3C0',
  mobility: '#2E7F5B',
}
