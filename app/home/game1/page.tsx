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

  teams?: any
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

const [message, setMessage] = useState('')

const [leaderboard, setLeaderboard] = useState<any[]>([])

const [predictions, setPredictions] =
  useState<any[]>([])

const [expandedSection, setExpandedSection] =
  useState<string | null>(null)


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
				  teams:team_id (
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
	
	
				const { data: predictionsData } =
				  await supabase
					.from('game1predictions')
					.select(`
					  *,
					  players (
						id,
						name
					  )
					`)

				if (predictionsData) {
				  setPredictions(
					predictionsData
				  )
				}	
	
	
	
	await loadLeaderboard()
  }

async function updateResults() {

  const { error } = await supabase
    .from('game1_results')
    .upsert({
      id: 1,

      champion_team_id: champion,
      finalist_team_id: finalist,

      semifinalist1_team_id: semi1,
      semifinalist2_team_id: semi2,

      top_goal_player_id: topGoal,

      surprise_team_id: surprise,

      locked: false,
    })

  if (error) {

    setMessage(
      '❌ Error updating results'
    )

    return
  }

  setLocked(false)

  setMessage(
    '✅ Results updated successfully'
  )

  loadData()
  await loadLeaderboard()
}

async function lockResults() {

  const { error } = await supabase
    .from('game1_results')
    .update({
      locked: true
    })
    .eq('id', 1)

  if (error) {

    setMessage(
      '❌ Error locking results'
    )

    return
  }

  setLocked(true)

  setMessage(
    '🔒 Results locked'
  )
  await loadLeaderboard()
}


					  function availableTeams(excluded: string[]) {
						return teams.filter(
						  (team) =>
							!excluded.includes(team.id.toString())
						)
					  }


function toggleSection(
  section: string
) {

  setExpandedSection((prev) =>

    prev === section
      ? null
      : section
  )
}

function getTeamName(
  teamId: number | null
) {

  return (
    teams.find(
      (team) =>
        team.id === teamId
    )?.name || '-'
  )
}

function getGoalPlayerName(
  playerId: number | null
) {

  return (
    goalPlayers.find(
      (player) =>
        player.id === playerId
    )?.name || '-'
  )
}


async function loadLeaderboard() {

  const { data: results } = await supabase
    .from('game1_results')
    .select('*')
    .eq('id', 1)
    .single()

  if (!results) return

  const { data: predictions } = await supabase
    .from('game1predictions')
    .select(`
      *,
      players (
        id,
        name
      )
    `)

  if (!predictions) return

  const rows = predictions.map((prediction: any) => {

    let score = 0

    if (
      prediction.champion_team_id ===
      results.champion_team_id
    ) {
      score += 20
    }

    if (
      prediction.finalist_team_id ===
      results.finalist_team_id
    ) {
      score += 10
    }

    const resultSemis = [
      results.semifinalist1_team_id,
      results.semifinalist2_team_id,
    ]

    const predictionSemis = [
      prediction.semifinalist1_team_id,
      prediction.semifinalist2_team_id,
    ]

    predictionSemis.forEach((semi: any) => {

      if (resultSemis.includes(semi)) {
        score += 5
      }

    })

    if (
      prediction.top_goal_player_id ===
      results.top_goal_player_id
    ) {
      score += 10
    }

    if (
      prediction.surprise_team_id ===
      results.surprise_team_id
    ) {
      score += 10
    }

    return {
      id: prediction.players.id,
      name: prediction.players.name,
      score,
    }
  })

  rows.sort((a, b) => {

    if (b.score !== a.score) {
      return b.score - a.score
    }

    return a.id - b.id
  })

  setLeaderboard(rows)
}


return (

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

    <div className="glass-panel max-w-2xl">

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold">
          🏆 Game 1 Results
        </h1>

				<div className="flex gap-4 items-center">

				  <button
					disabled={locked}
					onClick={updateResults}
					className="btn-primary"
				  >
					Update Results
				  </button>

				  {!locked ? (

					<button
					  disabled={
						!champion ||
						!finalist ||
						!semi1 ||
						!semi2 ||
						!topGoal ||
						!surprise
					  }
					  onClick={lockResults}
					  className="btn-primary"
					>
					  🔒 Lock
					</button>

				  ) : (

					<div className="text-sm font-semibold">
					  🔒 Locked
					</div>

				  )}

				</div>

      </div>

      <div className="grid gap-4 max-w-md">


				{message && (

				  <div className="text-sm font-semibold mb-2">
					{message}
				  </div>

				)}


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





<div
  className="
    mt-2
    cursor-pointer
    font-semibold
    text-yellow-400
    hover:text-yellow-300
    transition-colors
  "
  onClick={() =>
    toggleSection(
      'champion'
    )
  }
>

  {expandedSection === 'champion'
    ? '▼ Predictions'
    : '▶ Predictions'}

</div>

{expandedSection === 'champion' && (

  <div
    className="
      mt-3
      border-t
      border-white/10
      pt-3
    "
  >

    <table className="w-full text-sm">

      <tbody>

        {predictions.map(
          (prediction: any) => (

            <tr
              key={
                prediction.id
              }
              className="
                border-b
                border-white/10
              "
            >

			<td
			  className="
				py-2
				pr-6
				text-right
				font-semibold
			  "
			>
			  {prediction.players?.name}
			</td>

			<td
			  className="
				py-2
				text-left
				text-yellow-300
				font-semibold
			  "
			>
			  {getTeamName(
				prediction.champion_team_id
			  )}
			</td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

)}











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




<div
  className="
    mt-2
    cursor-pointer
    font-semibold
    text-yellow-400
    hover:text-yellow-300
    transition-colors
  "
  onClick={() =>
    toggleSection(
      'finalist'
    )
  }
>

  {expandedSection === 'finalist'
    ? '▼ Predictions'
    : '▶ Predictions'}

</div>

{expandedSection === 'finalist' && (

  <div
    className="
      mt-3
      border-t
      border-white/10
      pt-3
    "
  >

    <table
      className="
        mx-auto
        text-sm
      "
    >

      <tbody>

        {predictions.map(
          (prediction: any) => (

            <tr
              key={prediction.id}
              className="
                border-b
                border-white/10
              "
            >

              <td
                className="
                  py-2
                  pr-6
                  text-right
                  font-semibold
                "
              >
                {prediction.players?.name}
              </td>

              <td
                className="
                  py-2
                  text-left
                  text-yellow-300
                  font-semibold
                "
              >
                {getTeamName(
                  prediction.finalist_team_id
                )}
              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

)}







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




<div
  className="
    mt-2
    cursor-pointer
    font-semibold
    text-yellow-400
    hover:text-yellow-300
    transition-colors
  "
onClick={() =>
  toggleSection(
    'semi1'
  )
}
>

  {expandedSection === 'semi1'
    ? '▼ Predictions'
    : '▶ Predictions'}

</div>

{expandedSection === 'semi1' && (

  <div
    className="
      mt-3
      border-t
      border-white/10
      pt-3
    "
  >

    <table
      className="
        mx-auto
        text-sm
      "
    >

      <tbody>

        {predictions.map(
          (prediction: any) => (

            <tr
              key={prediction.id}
              className="
                border-b
                border-white/10
              "
            >

              <td
                className="
                  py-2
                  pr-6
                  text-right
                  font-semibold
                "
              >
                {prediction.players?.name}
              </td>

              <td
                className="
                  py-2
                  text-left
                  text-yellow-300
                  font-semibold
                "
              >
                {getTeamName(
                  prediction.semifinalist1_team_id
                )}
              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

)}







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




<div
  className="
    mt-2
    cursor-pointer
    font-semibold
    text-yellow-400
    hover:text-yellow-300
    transition-colors
  "
onClick={() =>
  toggleSection(
    'semi2'
  )
}
>

  {expandedSection === 'semi2'
    ? '▼ Predictions'
    : '▶ Predictions'}

</div>

{expandedSection === 'semi2' && (

  <div
    className="
      mt-3
      border-t
      border-white/10
      pt-3
    "
  >

    <table
      className="
        mx-auto
        text-sm
      "
    >

      <tbody>

        {predictions.map(
          (prediction: any) => (

            <tr
              key={prediction.id}
              className="
                border-b
                border-white/10
              "
            >

              <td
                className="
                  py-2
                  pr-6
                  text-right
                  font-semibold
                "
              >
                {prediction.players?.name}
              </td>

              <td
                className="
                  py-2
                  text-left
                  text-yellow-300
                  font-semibold
                "
              >
                {getTeamName(
                  prediction.semifinalist2_team_id
                )}
              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

)}






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
				{player.teams
				  ? ` (${player.teams.name})`
				  : ''}
              </option>
            ))}
          </select>
        </div>
		
		
		
<div
  className="
    mt-2
    cursor-pointer
    font-semibold
    text-yellow-400
    hover:text-yellow-300
    transition-colors
  "
onClick={() =>
  toggleSection(
    'topGoal'
  )
}
>

  {expandedSection === 'topGoal'
    ? '▼ Predictions'
    : '▶ Predictions'}

</div>

{expandedSection === 'topGoal' && (

  <div
    className="
      mt-3
      border-t
      border-white/10
      pt-3
    "
  >

    <table
      className="
        mx-auto
        text-sm
      "
    >

      <tbody>

        {predictions.map(
          (prediction: any) => (

            <tr
              key={prediction.id}
              className="
                border-b
                border-white/10
              "
            >

              <td
                className="
                  py-2
                  pr-6
                  text-right
                  font-semibold
                "
              >
                {prediction.players?.name}
              </td>

				<td
				  className="
					py-2
					text-left
					text-yellow-300
					font-semibold
				  "
				>
				  {getGoalPlayerName(
					prediction.top_goal_player_id
				  )}
				</td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

)}

		
		
		
		

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
		
		
		
<div
  className="
    mt-2
    cursor-pointer
    font-semibold
    text-yellow-400
    hover:text-yellow-300
    transition-colors
  "
onClick={() =>
  toggleSection(
    'surprise'
  )
}
>

  {expandedSection === 'surprise'
    ? '▼ Predictions'
    : '▶ Predictions'}

</div>

{expandedSection === 'surprise' && (

  <div
    className="
      mt-3
      border-t
      border-white/10
      pt-3
    "
  >

    <table
      className="
        mx-auto
        text-sm
      "
    >

      <tbody>

        {predictions.map(
          (prediction: any) => (

            <tr
              key={prediction.id}
              className="
                border-b
                border-white/10
              "
            >

              <td
                className="
                  py-2
                  pr-6
                  text-right
                  font-semibold
                "
              >
                {prediction.players?.name}
              </td>

              <td
                className="
                  py-2
                  text-left
                  text-yellow-300
                  font-semibold
                "
              >
                {getTeamName(
                  prediction.surprise_team_id
                )}
              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

)}		
		
		
		
		

      </div>

    </div>

    <div className="glass-panel h-fit">

      <h2 className="text-3xl font-bold mb-6">
        🏅 Game 1 Standings
      </h2>

      <table className="table-modern">

        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Points</th>
          </tr>
        </thead>

        <tbody>

          {leaderboard.map((row, index) => (

            <tr key={row.id}>

<td>

  {index === 0 ||

   leaderboard[index - 1].score !==
   row.score

    ? index + 1
    : ''}

</td>

              <td>
                {row.name}
              </td>

              <td className="font-bold">
                {row.score}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>
)
}