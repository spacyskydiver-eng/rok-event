'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

/* =======================
   Types
======================= */
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

/* =======================
   Component
======================= */
export default function TechTree({ title, nodes }: TechTreeProps) {
  /* --- STATE --- */
  const [activeTree, setActiveTree] =
    useState<'economy' | 'military'>('economy')

  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollX, setScrollX] = useState(0)

  /* --- FILTER NODES --- */
  const visibleNodes = nodes.filter(n =>
    n.id.startsWith(activeTree)
  )

  /* --- DRAG TO PAN (HORIZONTAL ONLY) --- */
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    if (!containerRef.current) return
    setScrollX(containerRef.current.scrollLeft)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    containerRef.current.scrollLeft =
      scrollX - (e.clientX - startX)
  }

  const stopDrag = () => setIsDragging(false)

  /* =======================
     Render
  ======================= */
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b4e87] to-[#08345d] p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-xl font-semibold">
            {title}
          </h2>

          {/* Tree Switch */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTree('economy')}
              className={clsx(
                'w-12 h-12 rounded-xl border text-xl',
                activeTree === 'economy'
                  ? 'bg-[#2aa8ff] border-white shadow-[0_0_20px_rgba(80,200,255,0.8)]'
                  : 'bg-[#0e4f7c] border-white/30'
              )}
            >
              🏛️
            </button>

            <button
              onClick={() => setActiveTree('military')}
              className={clsx(
                'w-12 h-12 rounded-xl border text-xl',
                activeTree === 'military'
                  ? 'bg-[#ff5c5c] border-white shadow-[0_0_20px_rgba(255,100,100,0.8)]'
                  : 'bg-[#0e4f7c] border-white/30'
              )}
            >
              ⚔️
            </button>
          </div>
        </div>

        <span className="text-white/70 text-sm">
          Drag to explore →
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[520px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div className="relative w-[1800px] h-[900px]">
          {/* Branch Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {visibleNodes.map(node =>
              node.parents.map(pid => {
                const parent = visibleNodes.find(n => n.id === pid)
                if (!parent) return null
                return (
                  <line
                    key={`${pid}-${node.id}`}
                    x1={parent.x + 220}
                    y1={parent.y + 50}
                    x2={node.x}
                    y2={node.y + 50}
                    stroke="#1f6aa5"
                    strokeWidth="3"
                    strokeDasharray="8 6"
                  />
                )
              })
            )}
          </svg>

          {/* Nodes */}
          {visibleNodes.map(node => {
            const progress =
              node.maxLevel > 0
                ? node.level / node.maxLevel
                : 0

            return (
              <div
                key={node.id}
                className={clsx(
                  'absolute',
                  'w-[260px] h-[110px]',
                  'bg-[#1b6fa8]',
                  'rounded-xl border border-white/20',
                  'shadow-[0_0_30px_rgba(0,160,255,0.25)]',
                  'hover:shadow-[0_0_45px_rgba(0,200,255,0.5)]',
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
                <div className="pl-12 pr-3 py-3 text-white">
                  <div className="text-sm font-semibold">
                    {node.name}
                  </div>

                  <div className="text-xs text-white/70 mb-2">
                    {node.level} / {node.maxLevel}
                  </div>

                  <div className="h-3 bg-[#0b3556] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4fd1ff] rounded-full transition-all"
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
