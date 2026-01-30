// lib/tech-tree/economy.ts

import type { TechNode } from '@/components/tech-tree/TechTree'

export type TechTreeNode = {
  id: string
  name: string
  level: number
  maxLevel: number
  icon: string
  parentId?: string
}

export const economyTree: TechTreeNode[] = [
  {
    id: 'quarrying',
    name: 'Quarrying',
    level: 0,
    maxLevel: 1,
    icon: '/tech/quarrying.png',
  },

  {
    id: 'irrigation',
    name: 'Irrigation',
    level: 0,
    maxLevel: 5,
    icon: '/tech/irrigation.png',
    parentId: 'quarrying',
  },
  {
    id: 'handsaw',
    name: 'Handsaw',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handsaw.png',
    parentId: 'quarrying',
  },

  {
    id: 'sickle',
    name: 'Sickle',
    level: 0,
    maxLevel: 5,
    icon: '/tech/sickle.png',
    parentId: 'irrigation',
  },
  {
    id: 'masonry',
    name: 'Masonry',
    level: 0,
    maxLevel: 5,
    icon: '/tech/masonry.png',
    parentId: 'irrigation',
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handaxe.png',
    parentId: 'handsaw',
  },

  {
    id: 'metallurgy',
    name: 'Metallurgy',
    level: 0,
    maxLevel: 1,
    icon: '/tech/metallurgy.png',
    parentId: 'masonry',
  },

  {
    id: 'writing',
    name: 'Writing',
    level: 0,
    maxLevel: 5,
    icon: '/tech/writing.png',
    parentId: 'metallurgy',
  },
  {
    id: 'engineering',
    name: 'Engineering',
    level: 0,
    maxLevel: 5,
    icon: '/tech/engineering.png',
    parentId: 'metallurgy',
  },

  {
    id: 'mathematics',
    name: 'Mathematics',
    level: 0,
    maxLevel: 5,
    icon: '/tech/mathematics.png',
    parentId: 'engineering',
  },
  {
    id: 'coinage',
    name: 'Coinage',
    level: 0,
    maxLevel: 5,
    icon: '/tech/coinage.png',
    parentId: 'engineering',
  },
]
