import { TechNode } from '@/components/tech-tree/TechTree'

/**
 * GRID SYSTEM
 * Do NOT reduce these numbers
 */
const COL = 420
const ROW = 170

export const economyTree: TechNode[] = [
  // ======================
  // TIER 0 – START
  // ======================
  {
    id: 'quarrying',
    name: 'Quarrying',
    level: 0,
    maxLevel: 1,
    icon: '/icons/quarrying.png',
    x: COL * 0,
    y: ROW * 2,
    parents: [],
  },

  // ======================
  // TIER 1
  // ======================
  {
    id: 'irrigation',
    name: 'Irrigation',
    level: 0,
    maxLevel: 5,
    icon: '/icons/irrigation.png',
    x: COL * 1,
    y: ROW * 1,
    parents: ['quarrying'],
  },
  {
    id: 'handsaw',
    name: 'Handsaw',
    level: 0,
    maxLevel: 5,
    icon: '/icons/handsaw.png',
    x: COL * 1,
    y: ROW * 2,
    parents: ['quarrying'],
  },
  {
    id: 'wheel',
    name: 'Wheel',
    level: 0,
    maxLevel: 5,
    icon: '/icons/wheel.png',
    x: COL * 1,
    y: ROW * 3,
    parents: ['quarrying'],
  },

  // ======================
  // TIER 2
  // ======================
  {
    id: 'sickle',
    name: 'Sickle',
    level: 0,
    maxLevel: 5,
    icon: '/icons/sickle.png',
    x: COL * 2,
    y: ROW * 0,
    parents: ['irrigation'],
  },
  {
    id: 'masonry',
    name: 'Masonry',
    level: 0,
    maxLevel: 5,
    icon: '/icons/masonry.png',
    x: COL * 2,
    y: ROW * 1,
    parents: ['irrigation', 'handsaw'],
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    level: 0,
    maxLevel: 5,
    icon: '/icons/handaxe.png',
    x: COL * 2,
    y: ROW * 3,
    parents: ['handsaw'],
  },

  // ======================
  // TIER 3 – METAL
  // ======================
  {
    id: 'metallurgy',
    name: 'Metallurgy',
    level: 0,
    maxLevel: 1,
    icon: '/icons/metallurgy.png',
    x: COL * 3,
    y: ROW * 1,
    parents: ['masonry'],
  },

  // ======================
  // TIER 4 – KNOWLEDGE SPLIT
  // ======================
  {
    id: 'chisel',
    name: 'Chisel',
    level: 0,
    maxLevel: 5,
    icon: '/icons/chisel.png',
    x: COL * 4,
    y: ROW * 0,
    parents: ['metallurgy'],
  },
  {
    id: 'writing',
    name: 'Writing',
    level: 0,
    maxLevel: 5,
    icon: '/icons/writing.png',
    x: COL * 4,
    y: ROW * 1,
    parents: ['metallurgy'],
  },
  {
    id: 'metalworking',
    name: 'Metalworking',
    level: 0,
    maxLevel: 5,
    icon: '/icons/metalworking.png',
    x: COL * 4,
    y: ROW * 2,
    parents: ['metallurgy'],
  },

  // ======================
  // TIER 5
  // ======================
  {
    id: 'handcart',
    name: 'Handcart',
    level: 0,
    maxLevel: 5,
    icon: '/icons/handcart.png',
    x: COL * 5,
    y: ROW * 0,
    parents: ['chisel'],
  },
  {
    id: 'multilayer_structure',
    name: 'Multilayer Structure',
    level: 0,
    maxLevel: 5,
    icon: '/icons/multilayer.png',
    x: COL * 5,
    y: ROW * 1,
    parents: ['writing'],
  },
  {
    id: 'placer_mining',
    name: 'Placer Mining',
    level: 0,
    maxLevel: 5,
    icon: '/icons/placer_mining.png',
    x: COL * 5,
    y: ROW * 2,
    parents: ['metalworking'],
  },

  // ======================
  // TIER 6 – CENTER SPINE
  // ======================
  {
    id: 'jewelry',
    name: 'Jewelry',
    level: 0,
    maxLevel: 1,
    icon: '/icons/jewelry.png',
    x: COL * 6,
    y: ROW * 1,
    parents: ['multilayer_structure'],
  },

  // ======================
  // TIER 7 – AGRICULTURE / WOOD
  // ======================
  {
    id: 'plow',
    name: 'Plow',
    level: 0,
    maxLevel: 10,
    icon: '/icons/plow.png',
    x: COL * 7,
    y: ROW * 0,
    parents: ['jewelry'],
  },
  {
    id: 'sawmill',
    name: 'Sawmill',
    level: 0,
    maxLevel: 10,
    icon: '/icons/sawmill.png',
    x: COL * 7,
    y: ROW * 2,
    parents: ['jewelry'],
  },

  // ======================
  // TIER 8 – ENGINEERING
  // ======================
  {
    id: 'scythe',
    name: 'Scythe',
    level: 0,
    maxLevel: 10,
    icon: '/icons/scythe.png',
    x: COL * 8,
    y: ROW * 0,
    parents: ['plow'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    level: 0,
    maxLevel: 10,
    icon: '/icons/engineering.png',
    x: COL * 8,
    y: ROW * 1,
    parents: ['sawmill'],
  },
  {
    id: 'whipsaw',
    name: 'Whipsaw',
    level: 0,
    maxLevel: 10,
    icon: '/icons/whipsaw.png',
    x: COL * 8,
    y: ROW * 2,
    parents: ['sawmill'],
  },

  // ======================
  // TIER 9 – MATH
  // ======================
  {
    id: 'mathematics',
    name: 'Mathematics',
    level: 0,
    maxLevel: 10,
    icon: '/icons/mathematics.png',
    x: COL * 9,
    y: ROW * 1,
    parents: ['engineering'],
  },

  // ======================
  // TIER 10 – ADVANCED
  // ======================
  {
    id: 'open_pit_quarry',
    name: 'Open-pit Quarry',
    level: 0,
    maxLevel: 10,
    icon: '/icons/open_pit.png',
    x: COL * 10,
    y: ROW * 0,
    parents: ['mathematics'],
  },
  {
    id: 'coinage',
    name: 'Coinage',
    level: 0,
    maxLevel: 10,
    icon: '/icons/coinage.png',
    x: COL * 10,
    y: ROW * 2,
    parents: ['mathematics'],
  },

  // ======================
  // TIER 11 – FINAL
  // ======================
  {
    id: 'stone_saw',
    name: 'Stone Saw',
    level: 0,
    maxLevel: 10,
    icon: '/icons/stone_saw.png',
    x: COL * 11,
    y: ROW * 0,
    parents: ['open_pit_quarry'],
  },
  {
    id: 'machinery',
    name: 'Machinery',
    level: 0,
    maxLevel: 10,
    icon: '/icons/machinery.png',
    x: COL * 11,
    y: ROW * 1,
    parents: ['coinage'],
  },
  {
    id: 'shaft_mining',
    name: 'Shaft Mining',
    level: 0,
    maxLevel: 10,
    icon: '/icons/shaft_mining.png',
    x: COL * 11,
    y: ROW * 2,
    parents: ['coinage'],
  },

  {
    id: 'carriage',
    name: 'Carriage',
    level: 0,
    maxLevel: 10,
    icon: '/icons/carriage.png',
    x: COL * 12,
    y: ROW * 1,
    parents: ['machinery'],
  },

  {
    id: 'cutting_polishing',
    name: 'Cutting & Polishing',
    level: 0,
    maxLevel: 10,
    icon: '/icons/cutting_polishing.png',
    x: COL * 13,
    y: ROW * 1,
    parents: ['carriage'],
  },
]
