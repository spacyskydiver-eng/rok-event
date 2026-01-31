import type { TechNode } from '@/lib/tech-tree/types'
/**
 * GRID TUNING (RoK-style tight layout)
 */
const COL = 300   // horizontal spacing (TIGHTER)
const ROW = 120   // vertical spacing (TIGHTER)

export const militaryTree: TechNode[] = [
  // ===== COLUMN 0 =====
  {
    id: 'military',
    name: 'Military Disipline',
    level: 0,
    maxLevel: 1,
    icon: '/tech/military.png',
    x: 0 * COL,
    y: 2 * ROW,
    parents: [],
  },
    // ===== COLUMN 1 =====
    
  ]