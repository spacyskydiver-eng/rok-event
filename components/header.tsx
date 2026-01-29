'use client'

import { useRouter } from 'next/navigation'
import type { UserPermissions } from '@/lib/types'
import { signOut } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, LogOut, Shield, UserCircle } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  permissions: UserPermissions
  userEmail?: string
}

export function Header({ permissions, userEmail }: HeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="container flex h-16 items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              <Link href="/">RoK Kingdom Calendar</Link>
            </h1>
            <p className="text-xs text-muted-foreground">
              Days 1–130 Event Tracker
            </p>
          </div>
        </div>

        {/* CENTER NAV */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition">
            Calendar
          </Link>
          <Link href="/calculator" className="hover:text-foreground transition">
            Calculator
          </Link>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {permissions.isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">{userEmail}</span>

                {permissions.isAdmin && (
                  <Badge className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

