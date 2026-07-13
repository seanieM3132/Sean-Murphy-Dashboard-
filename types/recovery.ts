export type ToolKey =
  | 'sauna' | 'ice' | 'contrast'
  | 'gun' | 'roll' | 'ball' | 'press' | 'walk'

export type SessionType = 'strength' | 'match' | 'conditioning' | 'rest'

export type RoundPhase = string

export interface Round {
  phase: RoundPhase
  seconds: number
}

export interface Protocol {
  name: string
  tag: string
  colour: string
  weeklyTarget: number
  spec: string
  rounds: Round[]
  sets: number
  why: string
  care: string
}

export type SorenessLevel = 0 | 1 | 2 | 3
export const SORENESS_LABELS = ['None', 'Niggle', 'Sore', 'Angry'] as const
export const SORENESS_COLOURS = ['#3B4E47', '#D8B24A', '#E8873A', '#F05A3A'] as const

export type BodyView = 'front' | 'back'

export interface RegionCircle {
  cx: number
  cy: number
  r: number
}

export interface Region {
  view: BodyView
  name: string
  circles: RegionCircle[]
  tools: ToolKey[]
  watch?: boolean
}

export type RegionKey =
  | 'traps' | 'lowback' | 'glutes' | 'hams' | 'calves' | 'feet'
  | 'hipflex' | 'adduct' | 'quads' | 'tib'

export type SlotState = 'past' | 'now' | 'next'

export interface WindowSlot {
  at: number           // minutes since midnight
  label: string
  tools: ToolKey[]
  locked: boolean
  note: string
}

export interface SorenessEntry {
  user_id: string
  date: string
  region: RegionKey
  level: SorenessLevel
}

export interface RecoveryLogEntry {
  id: string
  user_id: string
  date: string
  tool: ToolKey
  minutes: number
  completed: boolean
}
