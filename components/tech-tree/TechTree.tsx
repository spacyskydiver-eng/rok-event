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
    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)]">
      {/* ===== ROK-style blue background ===== */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b4fa3] via-[#0a3d7a] to-[#082e5c]" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />

      {/* ===== Content ===== */}
      <div className="relative p-6 space-y-4">
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <div className="text-xs text-white/60">
            Drag or scroll →
          </div>
        </div>

        {/* ===== Horizontal scroll area ===== */}
        <div className="relative overflow-x-auto">
          <div className="flex gap-10 min-w-max px-4 pb-6">
            {nodes.map((node) => {
              const progress =
                node.maxLevel > 0
                  ? Math.min(node.level / node.maxLevel, 1)
                  : 0

              return (
                <div
                  key={node.id}
                  className={clsx(
                    'relative w-[240px] shrink-0 rounded-xl',
                    'bg-[#0e6bb8]/90 border border-white/20',
                    'p-4 space-y-3',
                    'transition-all duration-200',
                    'hover:scale-[1.04]',
                    'hover:shadow-[0_0_30px_rgba(96,165,250,0.6)]',
                    'hover:border-blue-300'
                  )}
                >
                  {/* Icon frame */}
                  <div className="relative w-20 h-20 mx-auto rounded-lg bg-black/30 border border-white/20 shadow-inner">
                    <Image
                      src={node.icon}
                      alt={node.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Name */}
                  <div className="text-sm font-semibold text-center text-white">
                    {node.name}
                  </div>

                  {/* Level badge */}
                  <div className="flex justify-center">
                    <span className="text-xs rounded-md px-2 py-0.5 bg-black/40 border border-white/20 text-white/90">
                      {node.level} / {node.maxLevel}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-black/30 overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  {/* Helper text */}
                  <div className="text-[11px] text-center text-emerald-300">
                    Set current level {node.level}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

