'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Team = {
  id: number
  name: string
  top: boolean
}

type GoalPlayer = {
  id: number
  name: string

	teams?: {
	  name: string
	}[]
}

export default function Game1Page() {

  const [teams, setTeams] = useState<Team[]>([])
  const [goalPlayers, setGoalPlayers] = useState<GoalPlayer[]>([])

  const [champion, setChampion] = useState('')
  const [finalist, setFinalist] = useState('')
  const [semi1, setSemi1] = useState('')
  const [semi2, setSemi2] = useState('')
  const [topGoal, setTopGoal] = useState('')
  const [surprise, setSurprise] = useState('')

  const [locked, setLocked] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (teamsData) {
      setTeams(teamsData)
    }

	const { data: goalData } = await supabase
	  .from('top_goal')
	  .select(`
		id,
		name,
		teams (
		  name
		)
	  `)
  .order('name')

    if (goalData) {
      setGoalPlayers(goalData)
    }

    const { data: resultData } = await supabase
      .from('game1_results')
      .select('*')
      .eq('id', 1)
      .single()

    if (resultData) {

      setChampion(
        resultData.champion_team_id?.toString() || ''
      )

      setFinalist(
        resultData.finalist_team_id?.toString() || ''
      )

      setSemi1(
        resultData.semifinalist1_team_id?.toString() || ''
      )

      setSemi2(
        resultData.semifinalist2_team_id?.toString() || ''
      )

      setTopGoal(
        resultData.top_goal_player_id?.toString() || ''
      )

      setSurprise(
        resultData.surprise_team_id?.toString() || ''
      )

      setLocked(resultData.locked)
    }
  }

  async function saveResults(newLocked: boolean) {

    await supabase
      .from('game1_results')
      .upsert({
        id: 1,

        champion_team_id: champion,
        finalist_team_id: finalist,

        semifinalist1_team_id: semi1,
        semifinalist2_team_id: semi2,

        top_goal_player_id: topGoal,

        surprise_team_id: surprise,

        locked: newLocked,
      })

    setLocked(newLocked)
  }

  function availableTeams(excluded: string[]) {
    return teams.filter(
      (team) =>
        !excluded.includes(team.id.toString())
    )
  }

  return (
    <div className="glass-panel max-w-2xl">

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold">
          🏆 Game 1 Results
        </h1>

        <button
          onClick={() => saveResults(!locked)}
          className="btn-primary"
        >
          {locked ? '🔓 Unlock' : '🔒 Lock'}
        </button>

      </div>

      <div className="grid gap-4 max-w-md">

        <div>
          <label className="block mb-1 text-sm font-semibold">
            Campioana
          </label>

          <select
            disabled={locked}
            value={champion}
            onChange={(e) =>
              setChampion(e.target.value)
            }
            className="input-modern"
          >
            <option value="">Selecteaza</option>

            {teams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">
            Finalista
          </label>

          <select
            disabled={locked}
            value={finalist}
            onChange={(e) =>
              setFinalist(e.target.value)
            }
            className="input-modern"
          >
            <option value="">Selecteaza</option>

            {availableTeams([champion]).map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">
            Semifinalista 1
          </label>

          <select
            disabled={locked}
            value={semi1}
            onChange={(e) =>
              setSemi1(e.target.value)
            }
            className="input-modern"
          >
            <option value="">Selecteaza</option>

            {availableTeams([
              champion,
              finalist,
            ]).map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">
            Semifinalista 2
          </label>

          <select
            disabled={locked}
            value={semi2}
            onChange={(e) =>
              setSemi2(e.target.value)
            }
            className="input-modern"
          >
            <option value="">Selecteaza</option>

            {availableTeams([
              champion,
              finalist,
              semi1,
            ]).map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">
            Golgheter
          </label>

          <select
            disabled={locked}
            value={topGoal}
            onChange={(e) =>
              setTopGoal(e.target.value)
            }
            className="input-modern"
          >
            <option value="">Selecteaza</option>

            {goalPlayers.map((player) => (
              <option
                key={player.id}
                value={player.id}
              >
				{player.name}
				{player.teams?.[0]
				  ? ` (${player.teams[0].name})`
				  : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">
            Echipa surpriza
          </label>

          <select
            disabled={locked}
            value={surprise}
            onChange={(e) =>
              setSurprise(e.target.value)
            }
            className="input-modern"
          >
            <option value="">Selecteaza</option>

            {teams
              .filter((team) => !team.top)
              .map((team) => (
                <option
                  key={team.id}
                  value={team.id}
                >
                  {team.name}
                </option>
              ))}
          </select>
        </div>

      </div>

    </div>
  )
}