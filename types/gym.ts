export type Exercise =
  | { type: 'sprint'; id: string; name: string; reps: number; dist: number; rest: number; cue?: string }
  | { type: 'lift';   id: string; name: string; sets: number; reps: number; load: string; rest?: number; cue?: string }
  | { type: 'hold';   id: string; name: string; sets: number; secs: number; side?: boolean; rest?: number; cue?: string }
  | { type: 'drill';  id: string; name: string; sets: number; work: string; rest?: number; cue?: string }
  | { type: 'check';  id: string; name: string; minutes: number }

export type Block = {
  code: string
  name: string
  minutes: number
  tone: 'warm' | 'work' | 'cool' | 'prime'
  tag?: string
  note?: string
  exercises: Exercise[]
}

export type Phase = {
  id: string
  number: string
  name: string
  where: string
  coach: { headline: string; line: string }
  blocks: Block[]
}

export type SessionTemplate = {
  id: string
  name: string
  startsAt: string
  phases: Phase[]
}

export const totalReps = (e: Exercise): number =>
  e.type === 'sprint' ? e.reps : e.type === 'check' ? 1 : e.sets
