'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

export default function NavBar() {
  const [session, setSession] = useState<Session | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  function navLinkClass(href: string) {
    const isActive =
      href === '/'
        ? pathname === '/'
        : pathname.startsWith(href)

    return isActive
      ? 'text-gray-900 font-medium border-b-2 border-gray-900 pb-1'
      : 'text-gray-500 hover:text-gray-900 pb-1'
  }


  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        {/* Left: App navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-semibold text-gray-900"
          >
            2026 Bingo
          </Link>

          {session && (
            <Link
              href="/"
              className={`text-sm ${navLinkClass('/')}`}
            >
              Your Board
            </Link>
          )}

          <Link
            href="/leaderboard"
            className={`text-sm ${navLinkClass('/leaderboard')}`}
          >
            Leaderboard
          </Link>
        </div>

        {/* Right: Auth actions */}
        <div className="flex items-center gap-3">
          {!session ? (
            <button
              onClick={() =>
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              Sign in
            </button>
          ) : (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-gray-500 hover:text-black"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
