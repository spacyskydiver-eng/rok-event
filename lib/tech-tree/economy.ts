import type { TechNode } from '@/components/tech-tree/TechTree'

export const economyTree: TechNode[] = [
  {
    id: 'quarrying',
    name: 'Quarrying',
    level: 1,
    maxLevel: 1,
    icon: '/icons/quarrying.png',
    x: 80,
    y: 220,
    parents: [],
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    level: 0,
    maxLevel: 5,
    icon: '/icons/irrigation.png',
    x: 380,
    y: 150,
    parents: ['quarrying'],
  },
  {
    id: 'handsaw',
    name: 'Handsaw',
    level: 0,
    maxLevel: 5,
    icon: '/icons/handsaw.png',
    x: 380,
    y: 290,
    parents: ['quarrying'],
  },
  {
    id: 'sickle',
    name: 'Sickle',
    level: 0,
    maxLevel: 5,
    icon: '/icons/sickle.png',
    x: 700,
    y: 90,
    parents: ['irrigation'],
  },
  {
    id: 'masonry',
    name: 'Masonry',
    level: 0,
    maxLevel: 5,
    icon: '/icons/masonry.png',
    x: 700,
    y: 200,
    parents: ['irrigation'],
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    level: 0,
    maxLevel: 5,
    icon: '/icons/handaxe.png',
    x: 700,
    y: 320,
    parents: ['handsaw'],
  },
]



