'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type LeaderboardRow = {
  user_id: string
  display_name: string
  avatar_url: string | null
  completed_count: number
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('leaderboard_2026')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) setRows(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="p-8">Loading leaderboard…</p>
  }

  return (
    <main className="p-8 max-w-xl">
      <h1 className="mb-2 text-2xl font-semibold">
        2026 Bingo Leaderboard
      </h1>

      <p className="mb-4 text-sm text-gray-500">
        Click a name to view their bingo board
      </p>

      <div className="divide-y rounded border">
        {rows.map((row, index) => (
          <div
            key={row.user_id}
            className="flex items-center justify-between p-3 hover:bg-gray-50"
          >
            {/* Left side: rank + user */}
            <div className="flex items-center gap-3">
              <span className="w-6 text-sm text-gray-500">
                {index + 1}
              </span>

              {row.avatar_url ? (
                <img
                  src={row.avatar_url}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300" />
              )}

              <Link
                href={`/card/${row.user_id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {row.display_name}
              </Link>
            </div>

            {/* Right side: score */}
            <span className="text-sm text-gray-700">
              {row.completed_count} / 25
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
