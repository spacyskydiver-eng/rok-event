'use client'

import Image from 'next/image'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import type { TechNode } from '@/lib/tech-tree/types'

/* =======================
   CONFIG
======================= */
const NODE_WIDTH = 360
const NODE_HEIGHT = 150


const OFFSET_X = 40
const OFFSET_Y = 60
const SCALE = 0.65

const PAD_RIGHT = 160
const PAD_BOTTOM = 180

/* =======================
   HELPERS
======================= */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

/* =======================
   TYPES
======================= */
type TechTreeProps = {
  title: string
  nodes: TechNode[]
}

/* =======================
   COMPONENT
======================= */
export default function TechTree({ title, nodes }: TechTreeProps) {
  /* -------- state -------- */
  const [goals, setGoals] = useState<Record<string, number>>({})

  const saveGoals = () => {
  localStorage.setItem('techTreeGoals', JSON.stringify(goals))
}

const resetGoals = () => {
  const reset: Record<string, number> = {}
  nodes.forEach((n) => (reset[n.id] = n.level))
  setGoals(reset)
}

const maxAllGoals = () => {
  const maxed: Record<string, number> = {}
  nodes.forEach((n) => (maxed[n.id] = n.maxLevel))
  setGoals(maxed)
}


  /* -------- init goals -------- */
useEffect(() => {
  const saved = localStorage.getItem('techTreeGoals')

  if (saved) {
    setGoals(JSON.parse(saved))
    return
  }

  const init: Record<string, number> = {}
  nodes.forEach((n) => (init[n.id] = n.level))
  setGoals(init)
}, [nodes])


  /* -------- bounds -------- */
  const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH), 0)
  const maxY = Math.max(...nodes.map((n) => n.y + NODE_HEIGHT), 0)

  const canvasWidth = (OFFSET_X + maxX + PAD_RIGHT) * SCALE
  const canvasHeight = (OFFSET_Y + maxY + PAD_BOTTOM) * SCALE

  const parentAnchorX = (x: number) => x + NODE_WIDTH
  const anchorY = (y: number) => y + NODE_HEIGHT / 2

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b4e87] to-[#08345d] p-4 shadow-2xl">
{/* HEADER */}
<div className="flex items-center justify-between mb-4">
  <h2 className="text-white text-2xl font-bold">{title}</h2>
<button
  onClick={saveGoals}
  className="
    px-4 py-2
    rounded-lg
    bg-blue-500/20
    text-blue-200
    border border-blue-400/40
    hover:bg-blue-500/30
    active:scale-95
    transition
  "
>
  Save
</button>

  <div className="flex gap-2">
    <button
      onClick={maxAllGoals}
      className="
        px-4 py-2
        rounded-lg
        bg-yellow-400/20
        text-yellow-200
        border border-yellow-300/40
        hover:bg-yellow-400/30
        active:scale-95
        transition
      "
    >
      Max All
    </button>

    <button
      onClick={resetGoals}
      className="
        px-4 py-2
        rounded-lg
        bg-red-500/20
        text-red-200
        border border-red-400/40
        hover:bg-red-500/30
        active:scale-95
        transition
      "
    >
      Reset
    </button>
  </div>
</div>
  
{/* SCROLL CONTAINER */}
      <div
        className="relative w-full h-[520px] overflow-x-auto overflow-y-hidden"
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.preventDefault()
        }}
      >
        {/* SCROLL BOUNDS */}
        <div style={{ width: canvasWidth, height: canvasHeight }}>
          {/* VISUAL LAYER */}
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              transform: `scale(${SCALE}) translate(${OFFSET_X}px, ${OFFSET_Y}px)`,
            }}
          >
            {/* ===== BRANCHES ===== */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={maxX + PAD_RIGHT + 300}
              height={maxY + PAD_BOTTOM + 300}
            >
              {nodes.map((node) =>
                node.parents.map((pid) => {
                  const parent = nodes.find((n) => n.id === pid)
                  if (!parent) return null

                  return (
                    <line
                      key={`${pid}-${node.id}`}
                      x1={parentAnchorX(parent.x)}
                      y1={anchorY(parent.y)}
                      x2={node.x}
                      y2={anchorY(node.y)}
                      stroke="#2c7ec7"
                      strokeWidth={3}
                      strokeDasharray="8 6"
                    />
                  )
                })
              )}
            </svg>

            {/* ===== NODES ===== */}
            {nodes.map((node) => {
              const goal = goals[node.id] ?? node.level
              const progressPct =
                node.maxLevel > 0 ? node.level / node.maxLevel : 0
              const goalPct =
                node.maxLevel > 0 ? goal / node.maxLevel : 0

              return (
                <div
                  key={node.id}
                  className={clsx(
                    'absolute select-none',
                    'w-[360px] h-[150px] rounded-xl',
                    'bg-[#1b6fa8]',
                    'border border-white/20',
                    
                    'shadow-[0_0_30px_rgba(0,160,255,0.25)]',
                    // glow overlay
  'before:absolute before:inset-[-8px] before:rounded-[18px]',
  'before:bg-gradient-to-r before:from-cyan-400/0 before:via-cyan-300/0 before:to-blue-400/0',
  'before:blur-xl before:opacity-0 before:transition',
  'hover:before:opacity-100',
  'hover:before:from-cyan-400/35 hover:before:via-cyan-300/25 hover:before:to-blue-400/35'
                  )}
                  style={{ left: node.x, top: node.y }}
                >
                  {/* ICON FRAME */}
                  <div className="absolute -left-8 top-4 w-[110px] h-[110px] rounded-xl bg-gradient-to-br from-[#ffe28a] via-[#d6a93b] to-[#9c6b12] shadow-[0_0_14px_rgba(255,200,80,0.9)] flex items-center justify-center">
                    <div className="w-[100px] h-[100px] rounded-lg bg-[#0e4f7c] flex items-center justify-center">
                      <Image
                        src={node.icon}
                        alt={node.name}
                        width={90}
                        height={90}
                      />
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="pl-24 pr-5 py-6 text-white">
                    <div className="text-2xl font-extrabold leading-tight">
                      {node.name}
                    </div>

                    <div className="text-xl text-white/80 mb-2">
                      {goal} / {node.maxLevel}
                    </div>

                    {/* ===== DRAG BAR ===== */}
                    <div
                      className="mt-3 select-none"
                      onPointerDown={(e) => e.preventDefault()}
                    >
                      <div className="relative h-5 w-[170px] rounded-full bg-[#0b3556]">
                        {/* current */}
                        <div
                          className="absolute inset-y-0 left-0 bg-[#4fd1ff]/40"
                          style={{ width: `${progressPct * 100}%` }}
                        />

                        {/* goal */}
                        <div
                          className="absolute inset-y-0 left-0 bg-[#4fd1ff]"
                          style={{ width: `${goalPct * 100}%` }}
                        />

                        {/* ===== QUICK ACTIONS ===== */}
<div className="absolute bottom-[-8px] right-[-75px]">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      setGoals((prev) => ({
        ...prev,
        [node.id]: node.maxLevel,
      }))
    }}
    className="
      px-3 py-2
      text-xs font-bold
      rounded-lg
      bg-[#ffd978]
      text-[#3a2a00]
      border border-[#ffeb9a]
      shadow-[0_0_10px_rgba(255,220,120,0.8)]
      hover:brightness-110
      active:scale-95
      transition
      select-none
    "
  >
    MAX
  </button>
</div>


                        {/* KNOB */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2"
                          style={{
                            left: `calc(${goalPct * 100}% - 14px)`,
                          }}
                        >
                          <button
                            type="button"
                            className="w-7 h-7 rounded-full bg-[#7be7ff] border-2 border-white shadow-[0_0_14px_rgba(79,209,255,1)] cursor-grab active:cursor-grabbing select-none touch-none"
                            onPointerDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              e.currentTarget.setPointerCapture(e.pointerId)

                              const track =
                                e.currentTarget.parentElement!
                                  .parentElement as HTMLDivElement
                              const rect = track.getBoundingClientRect()

                              const move = (ev: PointerEvent) => {
                                ev.preventDefault()
                                const pct = clamp(
                                  (ev.clientX - rect.left) / rect.width,
                                  0,
                                  1
                                )
                                const newGoal = Math.round(
                                  pct * node.maxLevel
                                )
                                setGoals((prev) => ({
                                  ...prev,
                                  [node.id]: newGoal,
                                }))
                              }

                              const up = () => {
                                window.removeEventListener(
                                  'pointermove',
                                  move
                                )
                                window.removeEventListener('pointerup', up)
                              }

                              window.addEventListener('pointermove', move, {
                                passive: false,
                              })
                              window.addEventListener('pointerup', up)
                            }}
                          />
                        </div>
                      </div>
                    </div>
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
