'use client'

export default function TechTree() {
  return (
    <div className="relative w-full overflow-x-auto">
      {/* Big horizontal canvas (ROK-style) */}
      <div
        className="relative h-[600px] min-w-[3200px] rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #0b5fa5 0%, #083e6b 100%)',
        }}
      >
        {/* Temporary test node */}
        <div
          className="absolute bg-blue-600 border border-blue-300 rounded-md px-4 py-2 text-white text-sm"
          style={{ left: 120, top: 260 }}
        >
          Quarrying
        </div>
      </div>
    </div>
  )
}
