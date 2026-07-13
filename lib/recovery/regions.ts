import type { Region, RegionKey } from '@/types/recovery'

export const REGIONS: Record<RegionKey, Region> = {
  traps: {
    view: 'back',
    name: 'Traps & T-spine',
    circles: [{ cx: 60, cy: 56, r: 11 }],
    tools: ['ball', 'roll', 'gun'],
  },
  lowback: {
    view: 'back',
    name: 'Lower back',
    circles: [{ cx: 60, cy: 98, r: 10 }],
    tools: ['ball', 'sauna', 'gun'],
  },
  glutes: {
    view: 'back',
    name: 'Glutes',
    circles: [{ cx: 60, cy: 119, r: 12 }],
    tools: ['ball', 'gun', 'press'],
  },
  hams: {
    view: 'back',
    name: 'Hamstrings',
    circles: [{ cx: 51, cy: 160, r: 9 }, { cx: 69, cy: 160, r: 9 }],
    tools: ['roll', 'gun', 'press'],
  },
  calves: {
    view: 'back',
    name: 'Calves',
    circles: [{ cx: 51, cy: 215, r: 8 }, { cx: 69, cy: 215, r: 8 }],
    tools: ['roll', 'gun', 'ball'],
  },
  feet: {
    view: 'back',
    name: 'Feet & plantar',
    circles: [{ cx: 50, cy: 259, r: 6 }, { cx: 70, cy: 259, r: 6 }],
    tools: ['ball', 'press'],
  },
  hipflex: {
    view: 'front',
    name: 'Hip flexors',
    circles: [{ cx: 60, cy: 120, r: 10 }],
    tools: ['roll', 'gun', 'press'],
  },
  adduct: {
    view: 'front',
    name: 'Adductors',
    circles: [{ cx: 60, cy: 152, r: 9 }],
    tools: ['ball', 'gun', 'press'],
    watch: true,
  },
  quads: {
    view: 'front',
    name: 'Quads',
    circles: [{ cx: 51, cy: 158, r: 9 }, { cx: 69, cy: 158, r: 9 }],
    tools: ['roll', 'gun'],
  },
  tib: {
    view: 'front',
    name: 'Shins & tib ant',
    circles: [{ cx: 51, cy: 214, r: 7 }, { cx: 69, cy: 214, r: 7 }],
    tools: ['gun', 'ball'],
  },
}
