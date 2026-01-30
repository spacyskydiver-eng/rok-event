'use client'

import Image from 'next/image'
import clsx from 'clsx'

type TechNode = {
  id: string
  name: string
  level: number
  maxLevel: number
  icon: string
}

type TechTreeProps = {
  title: string
  nodes: TechNode[]
}

export default function TechTree({ title, nodes }: TechTreeProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="text-xl font-semibold tracking-tight">
        {title}
      </h2>

      {/* Horizontal scroll container */}
      <div className="relative overflow-x-auto">
        <div className="flex gap-6 min-w-max px-2 pb-4">
          {nodes.map((node) => {
            const progress =
              node.maxLevel > 0
                ? Math.min(node.level / node.maxLevel, 1)
                : 0

            return (
              <div
                key={node.id}
                className={clsx(
                  'w-[180px] shrink-0 rounded-xl',
                  'bg-black/30 border border-white/10',
                  'p-4 space-y-3',
                  'hover:border-white/20 transition'
                )}
              >
                {/* Icon */}
                <div className="relative w-14 h-14 mx-auto">
                  <Image
                    src={node.icon}
                    alt={node.name}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Name */}
                <div className="text-sm font-medium text-center">
                  {node.name}
                </div>

                {/* Level */}
                <div className="text-xs text-muted-foreground text-center">
                  {node.level} / {node.maxLevel}
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
