import type { TechNode } from '@/components/tech-tree/TechTree'

export const economyTree: TechNode[] = [
  // ROOT
  {
    id: 'quarrying',
    name: 'Quarrying',
    level: 0,
    maxLevel: 1,
    icon: '/tech/quarrying.png',
    x: 100,
    y: 350,
    parents: [],
  },

  // TIER 1
  { id: 'irrigation', name: 'Irrigation', level: 0, maxLevel: 5, icon: '/tech/irrigation.png', x: 400, y: 200, parents: ['quarrying'] },
  { id: 'handsaw', name: 'Handsaw', level: 0, maxLevel: 5, icon: '/tech/handsaw.png', x: 400, y: 350, parents: ['quarrying'] },
  { id: 'wheel', name: 'Wheel', level: 0, maxLevel: 5, icon: '/tech/wheel.png', x: 400, y: 500, parents: ['quarrying'] },

  // TIER 2
  { id: 'sickle', name: 'Sickle', level: 0, maxLevel: 5, icon: '/tech/sickle.png', x: 700, y: 120, parents: ['irrigation'] },
  { id: 'masonry', name: 'Masonry', level: 0, maxLevel: 5, icon: '/tech/masonry.png', x: 700, y: 260, parents: ['irrigation', 'handsaw'] },
  { id: 'handaxe', name: 'Handaxe', level: 0, maxLevel: 5, icon: '/tech/handaxe.png', x: 700, y: 420, parents: ['handsaw'] },

  // TIER 3
  { id: 'metallurgy', name: 'Metallurgy', level: 0, maxLevel: 1, icon: '/tech/metallurgy.png', x: 1000, y: 260, parents: ['masonry'] },

  // TIER 4
  { id: 'chisel', name: 'Chisel', level: 0, maxLevel: 5, icon: '/tech/chisel.png', x: 1300, y: 120, parents: ['metallurgy'] },
  { id: 'writing', name: 'Writing', level: 0, maxLevel: 5, icon: '/tech/writing.png', x: 1300, y: 260, parents: ['metallurgy'] },
  { id: 'metalworking', name: 'Metalworking', level: 0, maxLevel: 5, icon: '/tech/metalworking.png', x: 1300, y: 420, parents: ['metallurgy'] },

  // TIER 5
  { id: 'handcart', name: 'Handcart', level: 0, maxLevel: 5, icon: '/tech/handcart.png', x: 1600, y: 80, parents: ['chisel'] },
  { id: 'multilayer', name: 'Multilayer Structure', level: 0, maxLevel: 5, icon: '/tech/multilayer.png', x: 1600, y: 220, parents: ['writing'] },
  { id: 'placer', name: 'Placer Mining', level: 0, maxLevel: 5, icon: '/tech/placer.png', x: 1600, y: 360, parents: ['metalworking'] },

  // TIER 6
  { id: 'jewelry', name: 'Jewelry', level: 0, maxLevel: 1, icon: '/tech/jewelry.png', x: 1900, y: 260, parents: ['multilayer'] },

  // TIER 7
  { id: 'plow', name: 'Plow', level: 0, maxLevel: 10, icon: '/tech/plow.png', x: 2200, y: 160, parents: ['jewelry'] },
  { id: 'sawmill', name: 'Sawmill', level: 0, maxLevel: 10, icon: '/tech/sawmill.png', x: 2200, y: 360, parents: ['jewelry'] },

  // TIER 8
  { id: 'scythe', name: 'Scythe', level: 0, maxLevel: 10, icon: '/tech/scythe.png', x: 2500, y: 80, parents: ['plow'] },
  { id: 'engineering', name: 'Engineering', level: 0, maxLevel: 10, icon: '/tech/engineering.png', x: 2500, y: 260, parents: ['sawmill'] },
  { id: 'whipsaw', name: 'Whipsaw', level: 0, maxLevel: 10, icon: '/tech/whipsaw.png', x: 2500, y: 440, parents: ['sawmill'] },

  // TIER 9
  { id: 'mathematics', name: 'Mathematics', level: 0, maxLevel: 10, icon: '/tech/mathematics.png', x: 2800, y: 260, parents: ['engineering'] },

  // TIER 10
  { id: 'openpit', name: 'Open-pit Quarry', level: 0, maxLevel: 10, icon: '/tech/openpit.png', x: 3100, y: 160, parents: ['mathematics'] },
  { id: 'coinage', name: 'Coinage', level: 0, maxLevel: 10, icon: '/tech/coinage.png', x: 3100, y: 360, parents: ['mathematics'] },

  // TIER 11
  { id: 'stonesaw', name: 'Stone Saw', level: 0, maxLevel: 10, icon: '/tech/stonesaw.png', x: 3400, y: 80, parents: ['openpit'] },
  { id: 'machinery', name: 'Machinery', level: 0, maxLevel: 10, icon: '/tech/machinery.png', x: 3400, y: 260, parents: ['coinage'] },
  { id: 'shaftmining', name: 'Shaft Mining', level: 0, maxLevel: 10, icon: '/tech/shaftmining.png', x: 3400, y: 440, parents: ['openpit'] },

  // FINAL
  { id: 'carriage', name: 'Carriage', level: 0, maxLevel: 10, icon: '/tech/carriage.png', x: 3700, y: 260, parents: ['machinery'] },
  { id: 'cutting', name: 'Cutting & Polishing', level: 0, maxLevel: 10, icon: '/tech/cutting.png', x: 4000, y: 260, parents: ['carriage'] },
]
