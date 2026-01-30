'use client'

import clsx from 'clsx'
import type { TechTreeNode } from '@/lib/tech-tree/economy'

type TechTreeProps = {
  title: string
  nodes: TechTreeNode[]
}

export default function TechTree({ title, nodes }: TechTreeProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0b4d8a] to-[#083c6d] p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>
        <span className="text-sm text-white/70">
          Drag or scroll →
        </span>
      </div>

      {/* Scroll container */}
      <div className="relative overflow-x-auto">
        <div className="relative min-w-[1200px] h-[420px]">
          {/* Connector lines */}
          {nodes.map(node =>
            node.parents?.map(parentId => {
              const parent = nodes.find(n => n.id === parentId)
              if (!parent) return null

              return (
                <div
                  key={`${parent.id}-${node.id}`}
                  className="absolute bg-white/20"
                  style={{
                    left: parent.x + 220,
                    top: parent.y + 70,
                    width: node.x - parent.x - 220,
                    height: 2,
                  }}
                />
              )
            })
          )}

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={clsx(
                'absolute w-[220px] h-[140px]',
                'rounded-xl bg-[#1b6fb3]',
                'border border-white/20',
                'shadow-lg',
                'transition-all duration-200',
                'hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(80,180,255,0.6)]'
              )}
              style={{
                left: node.x,
                top: node.y,
              }}
            >
              <div className="p-4 space-y-2">
                <div className="text-white font-semibold">
                  {node.name}
                </div>

                <div className="text-xs text-white/70">
                  {node.level} / {node.maxLevel}
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{
                      width: `${(node.level / node.maxLevel) * 100}%`,
                    }}
                  />
                </div>

                <div className="text-[11px] text-emerald-300">
                  Set current level {node.level}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


