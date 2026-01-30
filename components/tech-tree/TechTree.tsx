'use client'

import { useRef, useState } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setStartX(e.clientX)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const dx = e.clientX - startX
    containerRef.current.scrollLeft = scrollLeft - dx
  }

  const stopDrag = () => setIsDragging(false)

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b4e87] to-[#08345d] p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-semibold">
          {title}
        </h2>
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
        <div className="relative w-[2000px] h-[900px]">

          {/* Branch lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map(node =>
              node.parents.map(pid => {
                const parent = nodes.find(n => n.id === pid)
                if (!parent) return null
                return (
                  <line
                    key={`${pid}-${node.id}`}
                    x1={parent.x + 240}
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
          {nodes.map(node => {
            const progress = node.level / node.maxLevel

            return (
              <div
                key={node.id}
                className={clsx(
                  'absolute w-[240px] h-[96px]',
                  'rounded-lg bg-[#1b6fa8]',
                  'border border-white/20',
                  'shadow-[0_0_30px_rgba(0,160,255,0.35)]'
                )}
                style={{ left: node.x, top: node.y }}
              >
                {/* Icon slot */}
                <div className="absolute -left-6 top-3 w-14 h-14 rounded-lg bg-[#0e4f7c] border border-white/30 flex items-center justify-center">
                  <Image src={node.icon} alt={node.name} width={40} height={40} />
                </div>

                {/* Text */}
                <div className="pl-12 pr-3 py-2 text-white">
                  <div className="text-sm font-semibold">{node.name}</div>
                  <div className="text-xs text-white/70 mb-1">
                    {node.level} / {node.maxLevel}
                  </div>

                  {/* Progress */}
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
