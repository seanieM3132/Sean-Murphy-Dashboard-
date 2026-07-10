// ─── Exercise types ─────────────────────────────────────────────
// Every exercise has a type. A 10m standing start is not sets x reps x kg.

export type SprintExercise = {
  type: 'sprint'
  id: string
  name: string
  reps: number
  dist: number      // metres
  rest: number      // seconds — full recovery
  cue?: string
}

export type LiftExercise = {
  type: 'lift'
  id: string
  name: string
  sets: number
  reps: number
  load: string      // e.g. '16 kg KB', 'BW', '50kg'
  rest?: number
  cue?: string
}

export type HoldExercise = {
  type: 'hold'
  id: string
  name: string
  sets: number
  secs: number
  side?: boolean    // true = "each side"
  rest?: number
  cue?: string
}

export type DrillExercise = {
  type: 'drill'
  id: string
  name: string
  sets: number
  work: string      // e.g. '20 curls', '5 min'
  rest?: number
  cue?: string
}

export type CheckExercise = {
  type: 'check'
  id: string
  name: string
  minutes: number
}

export type Exercise =
  | SprintExercise
  | LiftExercise
  | HoldExercise
  | DrillExercise
  | CheckExercise

// ─── Session structure ──────────────────────────────────────────

export type BlockTone = 'warm' | 'work' | 'prime' | 'cool'

export type Block = {
  code: string              // 'A', 'B', 'C', ...
  name: string
  mins: number
  tone: BlockTone
  tag?: string              // 'MAX INTENT', 'MANDATORY', 'COACH CHONG XIE ...'
  note?: string
  exercises: Exercise[]
}

export type PhaseCoach = {
  headline: string
  line: string
}

export type Phase = {
  id: string
  number: string            // '01', '02', '03'
  name: string
  where: string             // location hint
  coach: PhaseCoach
  blocks: Block[]
}

export type SessionTemplate = {
  id: string                // 'friday_speed', 'monday_heavy', ...
  name: string
  time: string              // '09:00'
  day: number               // 0=Mon ... 6=Sun
  dayLabel: string
  phases: Phase[]
}

// ─── Row rendering ──────────────────────────────────────────────
// Each type renders as itself:
//   sprint  →  5 x 10m · rest · timed-rep input · rep dots   (green)
//   lift    →  2 x 10 · 16 kg KB · rep dots                  (gold)
//   hold    →  2 x 30s each side · rep dots                   (violet)
//   drill   →  3 x 20 curls · rep dots                        (violet)
//   check   →  tick + duration                                 (dim)
//
// A sprint NEVER renders a load stepper.
// A lift NEVER renders a timed-rep field.

// ─── Logging ────────────────────────────────────────────────────

export type ExerciseLog = {
  exerciseId: string
  repsDone: number
  bestSeconds: number | null  // sprints only — null, never 0
}

export type SessionLog = {
  templateId: string
  date: string               // ISO date
  minutes: number
  sessionRpe: number | null  // 1-10, asked once at the end
  exerciseLogs: ExerciseLog[]
}
