'use client'

import Image from 'next/image'
import clsx from 'clsx'

export type TechNode = {
  id: string
  name: string
  level: number
  maxLevel: number
  icon: string
  x: number
  y: number
  parents: string[]
}

type TechTreeProps = {
  title: string
  nodes: TechNode[]
}

export default function TechTree({ title, nodes }: TechTreeProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b4e87] to-[#08345d] p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-semibold">
          {title}
        </h2>
        <span className="text-white/70 text-sm">
          Scroll to explore →
        </span>
      </div>

      {/* Scrollable Canvas */}
      <div className="relative w-full h-[520px] overflow-auto">
        <div className="relative w-[2200px] h-[1200px]">

          {/* Branch Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map(node =>
              node.parents.map(pid => {
                const parent = nodes.find(n => n.id === pid)
                if (!parent) return null

                return (
                  <line
                    key={`${pid}-${node.id}`}
                    x1={parent.x + 220}
                    y1={parent.y + 50}
                    x2={node.x}
                    y2={node.y + 50}
                    stroke="#2c7ec7"
                    strokeWidth="3"
                    strokeDasharray="8 6"
                  />
                )
              })
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const progress = node.level / node.maxLevel

            return (
              <div
                key={node.id}
                className={clsx(
                  'absolute w-[240px] h-[100px] rounded-xl',
                  'bg-[#1b6fa8]',
                  'border border-white/20',
                  'shadow-[0_0_30px_rgba(0,160,255,0.25)]',
                  'hover:shadow-[0_0_50px_rgba(0,200,255,0.9)]',
                  'hover:scale-[1.03]',
                  'transition-all duration-200'
                )}
                style={{ left: node.x, top: node.y }}
              >
                {/* Icon */}
                <div className="absolute -left-6 top-4 w-14 h-14 bg-[#0e4f7c] rounded-xl border border-white/30 flex items-center justify-center">
                  <Image
                    src={node.icon}
                    alt={node.name}
                    width={40}
                    height={40}
                  />
                </div>

                {/* Content */}
                <div className="pl-12 pr-3 py-2 text-white">
                  <div className="text-sm font-semibold">
                    {node.name}
                  </div>

                  <div className="text-xs text-white/70 mb-1">
                    {node.level} / {node.maxLevel}
                  </div>

                  <div className="h-3 bg-[#0b3556] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4fd1ff] rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
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
