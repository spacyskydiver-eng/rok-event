export type TechTreeNode = {
  id: string
  name: string
  level: number
  maxLevel: number
  x: number
  y: number
  parents?: string[]
}

export const economyTree: TechTreeNode[] = [
  {
    id: 'quarrying',
    name: 'Quarrying',
    level: 1,
    maxLevel: 1,
    x: 0,
    y: 100,
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    level: 0,
    maxLevel: 5,
    x: 260,
    y: 0,
    parents: ['quarrying'],
  },
  {
    id: 'handsaw',
    name: 'Handsaw',
    level: 0,
    maxLevel: 5,
    x: 260,
    y: 200,
    parents: ['quarrying'],
  },
]


