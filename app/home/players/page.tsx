'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Player = {
  id: number
  name: string
  active: boolean
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayer, setNewPlayer] = useState('')

  async function loadPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('id')

    if (data) {
      setPlayers(data)
    }
  }

  useEffect(() => {
    loadPlayers()
  }, [])

  async function addPlayer() {
    if (!newPlayer.trim()) return

    await supabase.from('players').insert({
      name: newPlayer,
      active: true,
    })

    setNewPlayer('')
    loadPlayers()
  }

  async function togglePlayer(
    id: number,
    active: boolean
  ) {
    await supabase
      .from('players')
      .update({ active: !active })
      .eq('id', id)

    loadPlayers()
  }

  return (
  <>
    <div className="glass-panel">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          👥 Players
        </h1>

        <button
          onClick={addPlayer}
          className="btn-primary"
        >
          + Add Player
        </button>
      </div>

      <div className="mb-6 max-w-sm">
        <input
          type="text"
          placeholder="Player name"
          value={newPlayer}
          onChange={(e) =>
            setNewPlayer(e.target.value)
          }
          className="input-modern"
        />
      </div>

      <table className="table-modern">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>{player.id}</td>

              <td>{player.name}</td>

              <td>
                <button
                  onClick={() =>
                    togglePlayer(
                      player.id,
                      player.active
                    )
                  }
                  className={
                    player.active
                      ? 'status-active'
                      : 'status-inactive'
                  }
                >
                  {player.active
                    ? 'ACTIVE'
                    : 'INACTIVE'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  </>
)
}