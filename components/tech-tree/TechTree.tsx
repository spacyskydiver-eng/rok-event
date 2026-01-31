'use client'

import Image from 'next/image'
import clsx from 'clsx'
import type { TechNode } from '@/lib/tech-tree/types'

const NODE_WIDTH = 240
const NODE_HEIGHT = 100
const OFFSET_X = 200   // move right
const OFFSET_Y = 120   // move down

type TechTreeProps = {
  title: string
  nodes: TechNode[]
}

export default function TechTree({ title, nodes }: TechTreeProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b4e87] to-[#08345d] p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        <span className="text-white/70 text-sm">Scroll to explore →</span>
      </div>

      {/* Scroll container */}
      <div
  className="relative w-full h-[520px] overflow-x-auto overflow-y-hidden"
  onWheel={(e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault()
    }
  }}
>

        {/* Canvas */}
<div
  className="relative origin-top-left"
  style={{
    width: 4600,
    height: 1600,
    transform: `translate(${OFFSET_X}px, ${OFFSET_Y}px) scale(0.60)`,
  }}
>

          {/* Branch lines */}
<svg className="absolute inset-0 w-full h-full pointer-events-none">
  {nodes.map((node) =>
    node.parents.map((pid) => {
      const parent = nodes.find((n) => n.id === pid)
      if (!parent) return null

      return (
        <line
          key={`${pid}-${node.id}`}
          x1={parent.x + NODE_WIDTH}
          y1={parent.y + NODE_HEIGHT / 2}
          x2={node.x}
          y2={node.y + NODE_HEIGHT / 2}
          stroke="#2c7ec7"
          strokeWidth={3}
          strokeDasharray="8 6"
        />
      )
    })
  )}
</svg>


          {/* Nodes */}
          {nodes.map((node) => {
            const progress = node.maxLevel > 0 ? node.level / node.maxLevel : 0

            return (
              <div
                key={node.id}
                className={clsx(
                  'absolute w-[240px] h-[100px] rounded-xl',
                  'bg-[#1b6fa8]',
                  'border border-white/20',
                  'shadow-[0_0_30px_rgba(0,160,255,0.25)]',
                  'hover:shadow-[0_0_60px_rgba(0,200,255,0.9)]',
                  'hover:scale-[1.04]',
                  'transition-all duration-200'
                )}
                style={{ left: node.x, top: node.y }}
              >
<div
  className="
    absolute
    -left-8 top-3
    w-[72px] h-[72px]
    rounded-xl
    bg-gradient-to-br from-[#ffe28a] via-[#d6a93b] to-[#9c6b12]
    shadow-[0_0_14px_rgba(255,200,80,0.9)]
    flex items-center justify-center
  "
>
  <div
    className="
      w-[62px] h-[62px]
      rounded-lg
      bg-[#0e4f7c]
      flex items-center justify-center
    "
  >
    <Image
      src={node.icon}
      alt={node.name}
      width={48}
      height={48}
    />
  </div>
</div>

                <div className="pl-12 pr-3 py-2 text-white">
                  <div className="text-sm font-semibold">{node.name}</div>
                  <div className="text-xs text-white/70 mb-1">
                    {node.level} / {node.maxLevel}
                  </div>

                  <div className="h-3 bg-[#0b3556] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4fd1ff]" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

