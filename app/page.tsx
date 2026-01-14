'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import BingoGrid from '@/components/BingoGrid'
import Link from 'next/link'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [cardId, setCardId] = useState<string | null>(null)



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

  useEffect(() => {
    if (!session) return

    supabase
      .from('bingo_cards')
      .select('id')
      .eq('year', 2026)
      .single()
      .then(({ data }) => {
        if (data) setCardId(data.id)
      })
  }, [session])

  if (!session) {
    return (
      <main className="p-8 max-w-2xl">
        <p className="text-gray-600">
          Sign in to create your 2026 bingo card and track your goals.
        </p>
      </main>
    )
  }


  return (
    <main className="p-8">
      {!cardId ? (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <button
            className="rounded bg-[#009689] px-6 py-3 text-lg font-medium text-white hover:opacity-90"
            onClick={async () => {
              const { error } = await supabase.rpc(
                'initialize_2026_bingo_card'
              )
              if (error) alert(error.message)
              else location.reload()
            }}
          >
            Create my 2026 bingo board
          </button>
        </div>
      ) : (
        <BingoGrid cardId={cardId} />
      )}
    </main>
  )

}
