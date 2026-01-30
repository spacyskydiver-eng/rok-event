// lib/tech-tree/economy.ts
import type { TechNode } from '@/components/tech-tree/TechTree'

export const economyTree: TechNode[] = [
  // ───────────────────────────
  // COLUMN 1
  // ───────────────────────────
  {
    id: 'quarrying',
    name: 'Quarrying',
    level: 0,
    maxLevel: 1,
    icon: '/tech/quarrying.png',
    x: 80,
    y: 260,
    parents: [],
  },

  // ───────────────────────────
  // COLUMN 2
  // ───────────────────────────
  {
    id: 'irrigation',
    name: 'Irrigation',
    level: 0,
    maxLevel: 5,
    icon: '/tech/irrigation.png',
    x: 340,
    y: 150,
    parents: ['quarrying'],
  },
  {
    id: 'handsaw',
    name: 'Handsaw',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handsaw.png',
    x: 340,
    y: 310,
    parents: ['quarrying'],
  },

  // ───────────────────────────
  // COLUMN 3
  // ───────────────────────────
  {
    id: 'sickle',
    name: 'Sickle',
    level: 0,
    maxLevel: 5,
    icon: '/tech/sickle.png',
    x: 600,
    y: 90,
    parents: ['irrigation'],
  },
  {
    id: 'masonry',
    name: 'Masonry',
    level: 0,
    maxLevel: 5,
    icon: '/tech/masonry.png',
    x: 600,
    y: 210,
    parents: ['irrigation', 'handsaw'], // ✅ DOUBLE BRANCH
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handaxe.png',
    x: 600,
    y: 370,
    parents: ['handsaw'],
  },

  // ───────────────────────────
  // COLUMN 4
  // ───────────────────────────
  {
    id: 'metallurgy',
    name: 'Metallurgy',
    level: 0,
    maxLevel: 1,
    icon: '/tech/metallurgy.png',
    x: 860,
    y: 210,
    parents: ['masonry'],
  },

  // ───────────────────────────
  // COLUMN 5
  // ───────────────────────────
  {
    id: 'chisel',
    name: 'Chisel',
    level: 0,
    maxLevel: 5,
    icon: '/tech/chisel.png',
    x: 1120,
    y: 90,
    parents: ['metallurgy'],
  },
  {
    id: 'writing',
    name: 'Writing',
    level: 0,
    maxLevel: 5,
    icon: '/tech/writing.png',
    x: 1120,
    y: 210,
    parents: ['metallurgy'],
  },
  {
    id: 'metalworking',
    name: 'Metalworking',
    level: 0,
    maxLevel: 5,
    icon: '/tech/metalworking.png',
    x: 1120,
    y: 330,
    parents: ['metallurgy'],
  },

  // ───────────────────────────
  // COLUMN 6
  // ───────────────────────────
  {
    id: 'handcart',
    name: 'Handcart',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handcart.png',
    x: 1380,
    y: 90,
    parents: ['chisel'],
  },
  {
    id: 'multilayer',
    name: 'Multilayer Structure',
    level: 0,
    maxLevel: 5,
    icon: '/tech/multilayer.png',
    x: 1380,
    y: 210,
    parents: ['writing'],
  },
  {
    id: 'placer',
    name: 'Placer Mining',
    level: 0,
    maxLevel: 5,
    icon: '/tech/placer.png',
    x: 1380,
    y: 330,
    parents: ['metalworking'],
  },

  // ───────────────────────────
  // COLUMN 7
  // ───────────────────────────
  {
    id: 'wheel',
    name: 'Wheel',
    level: 0,
    maxLevel: 5,
    icon: '/tech/wheel.png',
    x: 1640,
    y: 90,
    parents: ['handcart'], // ✅ ONLY HANDCART
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    level: 0,
    maxLevel: 1,
    icon: '/tech/jewelry.png',
    x: 1640,
    y: 210,
    parents: ['multilayer'],
  },

  // ───────────────────────────
  // COLUMN 8
  // ───────────────────────────
  {
    id: 'plow',
    name: 'Plow',
    level: 0,
    maxLevel: 10,
    icon: '/tech/plow.png',
    x: 1900,
    y: 160,
    parents: ['jewelry'],
  },
  {
    id: 'sawmill',
    name: 'Sawmill',
    level: 0,
    maxLevel: 10,
    icon: '/tech/sawmill.png',
    x: 1900,
    y: 260,
    parents: ['jewelry'],
  },

  // ───────────────────────────
  // COLUMN 9
  // ───────────────────────────
  {
    id: 'scythe',
    name: 'Scythe',
    level: 0,
    maxLevel: 10,
    icon: '/tech/scythe.png',
    x: 2160,
    y: 90,
    parents: ['plow'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    level: 0,
    maxLevel: 10,
    icon: '/tech/engineering.png',
    x: 2160,
    y: 210,
    parents: ['sawmill'], // ✅ CONNECTED
  },
  {
    id: 'whipsaw',
    name: 'Whipsaw',
    level: 0,
    maxLevel: 10,
    icon: '/tech/whipsaw.png',
    x: 2160,
    y: 330,
    parents: ['sawmill'],
  },

  // ───────────────────────────
  // COLUMN 10
  // ───────────────────────────
  {
    id: 'mathematics',
    name: 'Mathematics',
    level: 0,
    maxLevel: 10,
    icon: '/tech/mathematics.png',
    x: 2420,
    y: 210,
    parents: ['engineering'],
  },

  // ───────────────────────────
  // COLUMN 11
  // ───────────────────────────
  {
    id: 'openpit',
    name: 'Open-pit Quarry',
    level: 0,
    maxLevel: 10,
    icon: '/tech/openpit.png',
    x: 2680,
    y: 90,
    parents: ['mathematics'],
  },
  {
    id: 'coinage',
    name: 'Coinage',
    level: 0,
    maxLevel: 10,
    icon: '/tech/coinage.png',
    x: 2680,
    y: 330,
    parents: ['mathematics'],
  },

  // ───────────────────────────
  // COLUMN 12
  // ───────────────────────────
  {
    id: 'stonesaw',
    name: 'Stone Saw',
    level: 0,
    maxLevel: 10,
    icon: '/tech/stonesaw.png',
    x: 2940,
    y: 90,
    parents: ['openpit'],
  },
  {
    id: 'machinery',
    name: 'Machinery',
    level: 0,
    maxLevel: 10,
    icon: '/tech/machinery.png',
    x: 2940,
    y: 210,
    parents: ['mathematics'],
  },
  {
    id: 'shaft',
    name: 'Shaft Mining',
    level: 0,
    maxLevel: 10,
    icon: '/tech/shaft.png',
    x: 2940,
    y: 330,
    parents: ['coinage'],
  },

  // ───────────────────────────
  // COLUMN 13
  // ───────────────────────────
  {
    id: 'carriage',
    name: 'Carriage',
    level: 0,
    maxLevel: 10,
    icon: '/tech/carriage.png',
    x: 3200,
    y: 210,
    parents: ['machinery'],
  },
  {
    id: 'cutting',
    name: 'Cutting & Polishing',
    level: 0,
    maxLevel: 10,
    icon: '/tech/cutting.png',
    x: 3200,
    y: 330,
    parents: ['machinery'],
  },
]
