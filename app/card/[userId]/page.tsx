'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Tile = {
  id: string
  position: number
  text: string
  is_completed: boolean
}

export default function PublicCardPage() {
  const { userId } = useParams<{ userId: string }>()
  const [tiles, setTiles] = useState<Tile[]>([])
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Fetch profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single()

      // Fetch user's 2026 card
      const { data: card } = await supabase
        .from('bingo_cards')
        .select('id')
        .eq('user_id', userId)
        .eq('year', 2026)
        .single()

      if (!card) {
        setLoading(false)
        return
      }

      // Fetch tiles
      const { data: tiles } = await supabase
        .from('bingo_tiles')
        .select('*')
        .eq('card_id', card.id)
        .order('position')

      setName(profile?.display_name ?? null)
      setTiles(tiles ?? [])
      setLoading(false)
    }

    load()
  }, [userId])

  if (loading) {
    return <p className="p-8">Loading card…</p>
  }

  return (
    <main className="p-8 max-w-4xl">
      <h1 className="mb-4 text-2xl font-semibold">
        {name ? `${name}’s 2026 Bingo Card` : 'Bingo Card'}
      </h1>

      <p className="mb-4 text-sm text-gray-500">
        Public, read-only view
      </p>

      <div className="grid grid-cols-5 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`rounded border p-2 text-sm ${
              tile.is_completed
                ? 'bg-green-100 border-green-400'
                : 'bg-white'
            }`}
          >
            {tile.text || '—'}
          </div>
        ))}
      </div>
    </main>
  )
}
