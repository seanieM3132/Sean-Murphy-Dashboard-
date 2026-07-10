export type Exercise =
  | { type: 'sprint'; id: string; name: string; reps: number; dist: number; rest: number; cue?: string }
  | { type: 'lift';   id: string; name: string; sets: number; reps: number; load: string; rest?: number; cue?: string }
  | { type: 'hold';   id: string; name: string; sets: number; secs: number; side?: boolean; rest?: number; cue?: string }
  | { type: 'drill';  id: string; name: string; sets: number; work: string; rest?: number; cue?: string }
  | { type: 'check';  id: string; name: string; minutes: number }

export type Group = {
  label: string
  note?: string
  locked?: boolean
  exercises: Exercise[]
}

export type Section = {
  id: string
  name: string
  purpose: string
  tone: 'prime' | 'work' | 'gold' | 'cool'
  minutes: number
  tag?: string
  rest?: number
  note?: string
  groups: Group[]
}

export type SessionTemplate = {
  id: string
  name: string
  startsAt: string
  sections: Section[]
}

export const totalReps = (e: Exercise): number =>
  e.type === 'sprint' ? e.reps : e.type === 'check' ? 1 : e.sets

export const exRest = (e: Exercise): number | undefined =>
  e.type === 'check' ? undefined : (e as { rest?: number }).rest
