'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'

export function SaveNotice() {
  return (
    <div className="
      flex items-center gap-3
      rounded-lg border border-white/10
      bg-black/40 px-4 py-3
      text-sm text-muted-foreground
      shadow-[0_0_40px_rgba(255,255,255,0.04)]
    ">
      <Info className="h-4 w-4 text-amber-400 shrink-0" />
      <span>
        Sign in to automatically save your calendar & calculator progress.
      </span>
      <Link
        href="/auth/login"
        className="ml-auto text-amber-400 hover:text-amber-300 transition"
      >
        Sign in
      </Link>
    </div>
  )
}
