import type { SessionTemplate } from '@/types/gym'

export const FRIDAY_SPEED: SessionTemplate = {
  id: 'friday_speed',
  name: 'Speed & Acceleration',
  startsAt: '09:00',
  sections: [
    {
      id: 'prime', name: 'PRIME', purpose: 'Wake the feet, then the body',
      tone: 'prime', minutes: 15,
      groups: [
        {
          label: 'Groundwork', note: 'Dynamic hip openers \u00B7 every session, barefoot',
          exercises: [
            { type: 'hold', id: 'p1', name: 'Hip opener stretch', sets: 2, secs: 50, side: true, rest: 30, cue: 'Hips square.' },
            { type: 'hold', id: 'p2', name: 'Kneeling hip rocker', sets: 3, secs: 60, rest: 20, cue: 'Head stays up.' },
            { type: 'hold', id: 'p3', name: 'Kneeling toe rocker', sets: 3, secs: 60, rest: 20, cue: 'Heels open.' },
            { type: 'drill', id: 'p4', name: 'Elevated toe curls', sets: 3, work: '20 curls', rest: 30, cue: 'Slow. Feel the arch.' },
          ],
        },
        {
          label: 'Warm-up',
          exercises: [
            { type: 'check', id: 'p5', name: 'Easy jog', minutes: 2 },
            { type: 'check', id: 'p6', name: 'Leg swings, both planes', minutes: 1 },
            { type: 'check', id: 'p7', name: 'A-skips + B-skips', minutes: 1 },
            { type: 'check', id: 'p8', name: 'Build-ups \u2014 60, 70, 80%', minutes: 1 },
          ],
        },
      ],
    },
    {
      id: 'speed', name: 'SPEED', purpose: 'The point of the day',
      tone: 'work', minutes: 36, tag: 'MAX INTENT', rest: 300,
      note: 'Full recovery between every rep. When the times fall off, the section is over.',
      groups: [
        {
          label: 'Acceleration',
          exercises: [
            { type: 'sprint', id: 's1', name: 'Standing start', reps: 3, dist: 10, rest: 120, cue: 'Shin angle. Punch the ground.' },
            { type: 'sprint', id: 's2', name: '3-point start', reps: 3, dist: 15, rest: 150, cue: 'Front-side mechanics. Don\u2019t pop up.' },
            { type: 'sprint', id: 's3', name: 'Reaction sprint', reps: 3, dist: 10, rest: 120, cue: 'React to a call, not a count.' },
          ],
        },
        {
          label: 'Max velocity', note: 'Fastest thing you\u2019ll do all week',
          exercises: [
            { type: 'sprint', id: 's4', name: 'Flying 20s', reps: 3, dist: 20, rest: 180, cue: '10m build, 20m max. Tall, relaxed.' },
          ],
        },
      ],
    },
    {
      id: 'agility', name: 'AGILITY', purpose: 'Cut, and hold the tank',
      tone: 'work', minutes: 20, rest: 180,
      groups: [
        {
          label: 'Change of direction',
          exercises: [
            { type: 'sprint', id: 'a1', name: '5-10-5 shuttle', reps: 3, dist: 20, rest: 120, cue: 'Plant the outside foot. Decelerate first.' },
            { type: 'sprint', id: 'a2', name: 'T-drill', reps: 3, dist: 40, rest: 120, cue: 'Shuffle, don\u2019t cross.' },
            { type: 'sprint', id: 'a3', name: 'Ball retrieval sprint', reps: 3, dist: 15, rest: 90, cue: 'Game speed. Head up at the end.' },
          ],
        },
        {
          label: 'Tempo',
          exercises: [
            { type: 'sprint', id: 'a4', name: 'Tempo run', reps: 3, dist: 100, rest: 60, cue: '70%. Aerobic, not a sprint.' },
          ],
        },
      ],
    },
    {
      id: 'strength', name: 'STRENGTH', purpose: 'Tell the tissue the sprints were real',
      tone: 'gold', minutes: 20, tag: 'MANDATORY', rest: 90,
      note: 'Called optional on the sheet. It is not optional here.',
      groups: [
        {
          label: 'Ramp',
          exercises: [
            { type: 'check', id: 'g1', name: 'Bike or row, easy', minutes: 3 },
            { type: 'drill', id: 'g2', name: 'Goblet squat ramp', sets: 2, work: '8 reps', rest: 45, cue: 'Empty, then 8kg.' },
            { type: 'drill', id: 'g3', name: 'Band pull-aparts', sets: 2, work: '15 reps', rest: 30, cue: 'Slow return.' },
          ],
        },
        {
          label: 'Priming',
          exercises: [
            { type: 'lift', id: 'g4', name: 'Goblet squat', sets: 2, reps: 10, load: '16 kg KB', rest: 60, cue: 'Elbows inside the knees.' },
            { type: 'lift', id: 'g5', name: 'Push-ups', sets: 2, reps: 12, load: 'BW', rest: 60, cue: 'Ribs down.' },
            { type: 'lift', id: 'g6', name: 'TRX / band rows', sets: 2, reps: 12, load: 'BW', rest: 60, cue: 'Squeeze, don\u2019t yank.' },
            { type: 'hold', id: 'g7', name: 'Hip flexor stretch', sets: 2, secs: 30, side: true, rest: 30, cue: 'Glute on. Ribs down.' },
          ],
        },
      ],
    },
    {
      id: 'restore', name: 'RESTORE', purpose: 'The part you\u2019ll skip',
      tone: 'cool', minutes: 17,
      groups: [
        {
          label: 'Fascia', note: 'Coach Chong Xie \u00B7 Mon / Wed / Fri', locked: true,
          exercises: [
            { type: 'hold', id: 'r1', name: 'HFT marble swing', sets: 3, secs: 30, side: true, rest: 15, cue: 'Each foot.' },
            { type: 'drill', id: 'r2', name: 'Gait cycle drills', sets: 1, work: '5 min', rest: 30, cue: 'Movement quality, posterior chain loading.' },
          ],
        },
        {
          label: 'Cool-down',
          exercises: [
            { type: 'check', id: 'r3', name: 'Walk, nasal breathing', minutes: 3 },
            { type: 'check', id: 'r4', name: 'Couch stretch, each side', minutes: 2 },
            { type: 'check', id: 'r5', name: 'Adductor + hamstring hold', minutes: 2 },
            { type: 'check', id: 'r6', name: 'Box breathing 4-4-4-4', minutes: 1 },
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
