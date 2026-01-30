// lib/tech-tree/economy.ts
import type { TechNode } from '@/components/tech-tree/TechTree'

export const economyTree: TechNode[] = [
  // =====================
  // COLUMN 0 — ROOT
  // =====================
  {
    id: 'quarrying',
    name: 'Quarrying',
    level: 0,
    maxLevel: 1,
    icon: '/tech/quarrying.png',
    x: 0,
    y: 0,
    parents: [],
  },

  // =====================
  // COLUMN 1
  // =====================
  {
    id: 'irrigation',
    name: 'Irrigation',
    level: 0,
    maxLevel: 5,
    icon: '/tech/irrigation.png',
    x: 1,
    y: -1,
    parents: ['quarrying'],
  },
  {
    id: 'handsaw',
    name: 'Handsaw',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handsaw.png',
    x: 1,
    y: 1,
    parents: ['quarrying'],
  },

  // =====================
  // COLUMN 2
  // =====================
  {
    id: 'sickle',
    name: 'Sickle',
    level: 0,
    maxLevel: 5,
    icon: '/tech/sickle.png',
    x: 2,
    y: -2,
    parents: ['irrigation'],
  },
  {
    id: 'masonry',
    name: 'Masonry',
    level: 0,
    maxLevel: 5,
    icon: '/tech/masonry.png',
    x: 2,
    y: 0,
    parents: ['irrigation', 'handsaw'], // ✅ DOUBLE BRANCH (IMPORTANT)
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handaxe.png',
    x: 2,
    y: 2,
    parents: ['handsaw'],
  },

  // =====================
  // COLUMN 3 — CENTER SPINE
  // =====================
  {
    id: 'metallurgy',
    name: 'Metallurgy',
    level: 0,
    maxLevel: 1,
    icon: '/tech/metallurgy.png',
    x: 3,
    y: 0,
    parents: ['masonry'],
  },

  // =====================
  // COLUMN 4
  // =====================
  {
    id: 'chisel',
    name: 'Chisel',
    level: 0,
    maxLevel: 5,
    icon: '/tech/chisel.png',
    x: 4,
    y: -2,
    parents: ['metallurgy'],
  },
  {
    id: 'writing',
    name: 'Writing',
    level: 0,
    maxLevel: 5,
    icon: '/tech/writing.png',
    x: 4,
    y: 0,
    parents: ['metallurgy'],
  },
  {
    id: 'metalworking',
    name: 'Metalworking',
    level: 0,
    maxLevel: 5,
    icon: '/tech/metalworking.png',
    x: 4,
    y: 2,
    parents: ['metallurgy'],
  },

  // =====================
  // COLUMN 5
  // =====================
  {
    id: 'handcart',
    name: 'Handcart',
    level: 0,
    maxLevel: 5,
    icon: '/tech/handcart.png',
    x: 5,
    y: -2,
    parents: ['chisel'],
  },
  {
    id: 'multilayer_structure',
    name: 'Multilayer Structure',
    level: 0,
    maxLevel: 5,
    icon: '/tech/multilayer.png',
    x: 5,
    y: 0,
    parents: ['writing'],
  },
  {
    id: 'placer_mining',
    name: 'Placer Mining',
    level: 0,
    maxLevel: 5,
    icon: '/tech/placer.png',
    x: 5,
    y: 2,
    parents: ['metalworking'],
  },

  // =====================
  // COLUMN 6
  // =====================
  {
    id: 'wheel',
    name: 'Wheel',
    level: 0,
    maxLevel: 5,
    icon: '/tech/wheel.png',
    x: 6,
    y: 0,
    parents: ['multilayer_structure'],
  },

  // =====================
  // COLUMN 7
  // =====================
  {
    id: 'jewelry',
    name: 'Jewelry',
    level: 0,
    maxLevel: 1,
    icon: '/tech/jewelry.png',
    x: 7,
    y: 0,
    parents: ['wheel'],
  },

  // =====================
  // COLUMN 8
  // =====================
  {
    id: 'plow',
    name: 'Plow',
    level: 0,
    maxLevel: 10,
    icon: '/tech/plow.png',
    x: 8,
    y: -1,
    parents: ['jewelry'],
  },
  {
    id: 'sawmill',
    name: 'Sawmill',
    level: 0,
    maxLevel: 10,
    icon: '/tech/sawmill.png',
    x: 8,
    y: 1,
    parents: ['jewelry'],
  },

  // =====================
  // COLUMN 9
  // =====================
  {
    id: 'scythe',
    name: 'Scythe',
    level: 0,
    maxLevel: 10,
    icon: '/tech/scythe.png',
    x: 9,
    y: -2,
    parents: ['plow'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    level: 0,
    maxLevel: 10,
    icon: '/tech/engineering.png',
    x: 9,
    y: 0,
    parents: ['sawmill'],
  },
  {
    id: 'whipsaw',
    name: 'Whipsaw',
    level: 0,
    maxLevel: 10,
    icon: '/tech/whipsaw.png',
    x: 9,
    y: 2,
    parents: ['sawmill'],
  },

  // =====================
  // COLUMN 10
  // =====================
  {
    id: 'mathematics',
    name: 'Mathematics',
    level: 0,
    maxLevel: 10,
    icon: '/tech/mathematics.png',
    x: 10,
    y: 0,
    parents: ['engineering'],
  },

  // =====================
  // COLUMN 11
  // =====================
  {
    id: 'open_pit_quarry',
    name: 'Open-pit Quarry',
    level: 0,
    maxLevel: 10,
    icon: '/tech/openpit.png',
    x: 11,
    y: -1,
    parents: ['mathematics'],
  },
  {
    id: 'coinage',
    name: 'Coinage',
    level: 0,
    maxLevel: 10,
    icon: '/tech/coinage.png',
    x: 11,
    y: 1,
    parents: ['mathematics'],
  },

  // =====================
  // COLUMN 12
  // =====================
  {
    id: 'stone_saw',
    name: 'Stone Saw',
    level: 0,
    maxLevel: 10,
    icon: '/tech/stonesaw.png',
    x: 12,
    y: -2,
    parents: ['open_pit_quarry'],
  },
  {
    id: 'machinery',
    name: 'Machinery',
    level: 0,
    maxLevel: 10,
    icon: '/tech/machinery.png',
    x: 12,
    y: 0,
    parents: ['coinage'],
  },
  {
    id: 'shaft_mining',
    name: 'Shaft Mining',
    level: 0,
    maxLevel: 10,
    icon: '/tech/shaft.png',
    x: 12,
    y: 2,
    parents: ['coinage'],
  },

  // =====================
  // COLUMN 13
  // =====================
  {
    id: 'carriage',
    name: 'Carriage',
    level: 0,
    maxLevel: 10,
    icon: '/tech/carriage.png',
    x: 13,
    y: 0,
    parents: ['machinery'],
  },

  // =====================
  // COLUMN 14
  // =====================
  {
    id: 'cutting_polishing',
    name: 'Cutting & Polishing',
    level: 0,
    maxLevel: 10,
    icon: '/tech/cutting.png',
    x: 14,
    y: 0,
    parents: ['carriage'],
  },
]