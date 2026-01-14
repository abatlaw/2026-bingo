'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function BingoTile({
  tile,
  locked,
  mode,
  onTextUpdate,
  onToggleComplete,
}: {
  tile: {
    id: string
    text: string
    is_completed: boolean
  }
  locked: boolean
  mode: 'edit' | 'play'
  onTextUpdate: (text: string) => void
  onToggleComplete: (isCompleted: boolean) => void
}) {
  const [value, setValue] = useState(tile.text)
  const [updating, setUpdating] = useState(false)

  // Keep local state in sync if parent updates text
  useEffect(() => {
    setValue(tile.text)
  }, [tile.text])

  async function toggleCompletion() {
    if (mode !== 'play') return
    if (updating) return

    setUpdating(true)

    const { error } = await supabase.rpc(
      'toggle_bingo_tile_completion',
      {
        p_tile_id: tile.id,
        p_completed: !tile.is_completed,
      }
    )

    setUpdating(false)

    if (!error) {
      onToggleComplete(!tile.is_completed)
    } else {
      alert(error.message)
    }
  }

  async function saveText() {
    if (mode !== 'edit') return
    if (locked) return

    const trimmed = value.trim()

    const { error } = await supabase
      .from('bingo_tiles')
      .update({ text: trimmed })
      .eq('id', tile.id)

    if (!error) {
      onTextUpdate(trimmed)
    }
  }

  return (
    <div
      onClick={toggleCompletion}
      className={`relative flex h-24 items-center justify-center rounded border p-2 text-center text-sm
        transition-all duration-150
        ${
          tile.is_completed && mode === 'play'
            ? 'bg-[#009689] border-[#009689] text-white'
            : 'bg-white text-gray-900'
        }
        ${
          mode === 'edit'
            ? 'cursor-default'
            : tile.is_completed
              ? 'hover:scale-[1.02]'
              : 'hover:bg-gray-50'
        }
      `}
    >

      {mode === 'edit' ? (
        <textarea
          value={value}
          placeholder="Enter goal…"
          onChange={(e) => setValue(e.target.value)}
          onBlur={saveText}
          className="h-full w-full resize-none bg-transparent text-sm outline-none"
        />
      ) : (
        <span className="select-none">
          {tile.text || '—'}
        </span>
      )}
    </div>
  )
}
