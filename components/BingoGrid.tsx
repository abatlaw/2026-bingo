'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import BingoTile from './BingoTile'

type Tile = {
  id: string
  position: number
  text: string
  is_completed: boolean
}

type CardMode = 'edit' | 'play'

export default function BingoGrid({ cardId }: { cardId: string }) {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [locked, setLocked] = useState(false)
  const [mode, setMode] = useState<CardMode>('play')

  useEffect(() => {
    async function load() {
      const { data: card } = await supabase
        .from('bingo_cards')
        .select('is_locked')
        .eq('id', cardId)
        .single()

      setLocked(card?.is_locked ?? false)

      const { data: tiles } = await supabase
        .from('bingo_tiles')
        .select('*')
        .eq('card_id', cardId)
        .order('position')

      setTiles(tiles ?? [])
    }

    load()
  }, [cardId])

  // STEP 1: Auto-enter edit mode if any tile is empty (unless locked)
  useEffect(() => {
    if (locked) return

    const hasEmptyTile = tiles.some(
      (t) => !t.text || !t.text.trim()
    )

    if (hasEmptyTile) {
      setMode('edit')
    }
  }, [tiles, locked])

  // STEP 3: Enforce all tiles filled before exiting edit mode
  function handleSaveAndExit() {
    const hasEmptyTile = tiles.some(
      (t) => !t.text || !t.text.trim()
    )

    if (hasEmptyTile) {
      alert('Please fill in all 25 bingo tiles before continuing.')
      return
    }

    setMode('play')
  }

  return (
    <div className="mt-8">
      {/* STEP 2: Edit / Play mode header */}
      <div className="mb-4 flex items-center justify-end">

        {mode === 'edit' ? (
          <button
            onClick={handleSaveAndExit}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Save & exit
          </button>
        ) : (
          <button
            onClick={() => setMode('edit')}
            disabled={locked}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            Edit board
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {tiles.map((tile) => (
          <BingoTile
            key={tile.id}
            tile={tile}
            locked={locked}
            mode={mode}
            onTextUpdate={(text) => {
              setTiles((prev) =>
                prev.map((t) =>
                  t.id === tile.id ? { ...t, text } : t
                )
              )
            }}
            onToggleComplete={(isCompleted) => {
              setTiles((prev) =>
                prev.map((t) =>
                  t.id === tile.id
                    ? { ...t, is_completed: isCompleted }
                    : t
                )
              )
            }}
          />
        ))}
      </div>
    </div>
  )
}
