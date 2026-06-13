'use client'

import { Fragment, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Team = {
  id: number
  name: string
}

type Match = {
  id: number

  match_date: string
	match_time: string | null
	
	  visible: boolean
	
  team1_id: number
  team2_id: number

  team1_goals: number | null
  team2_goals: number | null

  locked: boolean

  team1?: {
    name: string
  }

  team2?: {
    name: string
  }
}

type PredictionRow = {
  playerId: number
  playerName: string

  team1_goals: number | null
  team2_goals: number | null

  locked: boolean

  points_gained: number
}



function getMatchResult(
  score1: number,
  score2: number
) {

  if (score1 > score2) {
    return 'HOME_WIN'
  }

  if (score1 === score2) {
    return 'DRAW'
  }

  return 'AWAY_WIN'
}


export default function Game2Page() {

  const [teams, setTeams] = useState<Team[]>([])

  const [matches, setMatches] = useState<Match[]>([])

  const [message, setMessage] = useState('')

	const [leaderboard, setLeaderboard] =
	  useState<any[]>([])

				const [expandedMatchId, setExpandedMatchId] =
				  useState<number | null>(null)

				const [activePlayers, setActivePlayers] =
				  useState<any[]>([])

				const [totalPlayers, setTotalPlayers] =
				  useState(0)

				const [lockedPredictionsByMatch, setLockedPredictionsByMatch] =
				  useState<Record<number, number>>({})

				const [predictionsByMatch, setPredictionsByMatch] =
				  useState<Record<number, PredictionRow[]>>({})



  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .order('name')
	  
			const { data: playersData } = await supabase
			  .from('players')
			  .select('*')
			  .eq('active', true)
			  .order('name')

			const { data: allPlayersData } = await supabase
			  .from('players')
			  .select('id')

			if (playersData) {
			  setActivePlayers(playersData)
			}

			if (allPlayersData) {
			  setTotalPlayers(allPlayersData.length)
			}
	  
			const { data: predictionsData } =
			  await supabase
				.from('game2predictions')
				.select(`
				  *,
				  players (
					id,
					name
				  )
				`)	  

				if (predictionsData) {

				  const grouped:
					Record<number, PredictionRow[]> = {}

				  const lockedCounts:
					Record<number, number> = {}

				  predictionsData.forEach((row: any) => {

					if (!grouped[row.match_id]) {
					  grouped[row.match_id] = []
					}

					if (row.locked) {
					  lockedCounts[row.match_id] =
						(lockedCounts[row.match_id] || 0) + 1
					}

					grouped[row.match_id].push({

					  playerId:
						row.players.id,

					  playerName:
						row.players.name,

					  team1_goals:
						row.team1_goals,

					  team2_goals:
						row.team2_goals,

					  locked:
						row.locked,

					  points_gained:
						row.points_gained || 0
					})
				  })

				  setPredictionsByMatch(grouped)
				  setLockedPredictionsByMatch(lockedCounts)
				}



    if (teamsData) {
      setTeams(teamsData)
    }

				const { data: matchesData } = await supabase
				  .from('game2matches')
				  .select(`
					*,
					team1:team1_id (
					  name
					),
					team2:team2_id (
					  name
					)
				  `)

				  .order('id', { ascending: false })

    if (matchesData) {
      setMatches(matchesData)
    }
	await loadLeaderboard()
  }

  async function addMatch() {

    const { error } = await supabase
      .from('game2matches')
				.insert({
				  match_date: new Date()
					.toISOString()
					.split('T')[0],

				  match_time: '18:00',

				  team1_id: teams[0]?.id,
				  team2_id: teams[1]?.id,

				  locked: false,
				  visible: false
				})

    if (error) {

      setMessage(
        '❌ Error adding match'
      )

      return
    }

    setMessage(
      '✅ Match added'
    )

    loadData()
  }

  async function updateMatch(
    match: Match
  ) {

    const { error } = await supabase
      .from('game2matches')
      .update({
        match_date: match.match_date,
		match_time: match.match_time,
        team1_id: match.team1_id,
        team2_id: match.team2_id,

        team1_goals: match.team1_goals,
        team2_goals: match.team2_goals,
      })
      .eq('id', match.id)

    if (error) {

      setMessage(
        '❌ Error updating match'
      )

      return
    }

    setMessage(
      `✅ Match #${match.id} updated`
    )

    loadData()
  }

  async function lockMatch(
    matchId: number
  ) {

    const { error } = await supabase
      .from('game2matches')
      .update({
        locked: true
      })
      .eq('id', matchId)

    if (error) {

      setMessage(
        '❌ Error locking match'
      )

      return
    }

    setMessage(
      `🔒 Match #${matchId} locked`
    )

				await calculateMatchPoints(
				  matchId
				)


    loadData()
  }


function toggleMatch(
  matchId: number
) {

  setExpandedMatchId((prev) =>

    prev === matchId
      ? null
      : matchId
  )
}


function predictionCount(
  matchId: number
) {

  return (
    predictionsByMatch[
      matchId
    ]?.length || 0
  )
}

function getMatchRows(
  matchId: number
) {

  const predictions =
    predictionsByMatch[
      matchId
    ] || []

  const predictionMap =
    new Map()

  predictions.forEach((p) => {

    predictionMap.set(
      p.playerId,
      p
    )
  })

  const rows =
    activePlayers.map(
      (player) => ({

        playerId:
          player.id,

        playerName:
          player.name,

        prediction:
          predictionMap.get(
            player.id
          )
      })
    )

  return rows
}

function canRevealPrediction(
  match: Match
) {

  return (
    match.locked ||
    (
      totalPlayers > 0 &&
      (
        lockedPredictionsByMatch[
          match.id
        ] || 0
      ) >= totalPlayers
    )
  )
}




					async function calculateMatchPoints(
					  matchId: number
					) {

					  const { data: match } = await supabase
						.from('game2matches')
						.select('*')
						.eq('id', matchId)
						.single()

					  if (!match) return

					  const { data: predictions } =
						await supabase
						  .from('game2predictions')
						  .select('*')
						  .eq('match_id', matchId)

					  if (!predictions) return

					  for (const prediction of predictions) {

						let points = 0

						const officialScore1 =
						  match.team1_goals

						const officialScore2 =
						  match.team2_goals

						const predictedScore1 =
						  prediction.team1_goals

						const predictedScore2 =
						  prediction.team2_goals

						if (
						  predictedScore1 === null ||
						  predictedScore2 === null
						) {

						  points = 0

						} else if (

						  predictedScore1 ===
							officialScore1 &&

						  predictedScore2 ===
							officialScore2

						) {

						  points = 5

						} else {

						  const officialResult =
							getMatchResult(
							  officialScore1,
							  officialScore2
							)

						  const predictedResult =
							getMatchResult(
							  predictedScore1,
							  predictedScore2
							)

						  if (
							officialResult ===
							predictedResult
						  ) {
							points = 2
						  }
						}

						await supabase
						  .from('game2predictions')
						  .update({
							points_gained: points
						  })
						  .eq('id', prediction.id)
					  }
					}

			async function loadLeaderboard() {

			  const { data } = await supabase
				.from('game2predictions')
				.select(`
				  player_id,
				  points_gained,
				  players (
					id,
					name
				  )
				`)

			  if (!data) return

			  const grouped: any = {}

			  data.forEach((row: any) => {

				const playerId =
				  row.player_id

				if (!grouped[playerId]) {

				  grouped[playerId] = {

					id: row.players.id,

					name: row.players.name,

					points: 0
				  }
				}

				grouped[playerId].points +=
				  row.points_gained || 0
			  })

			  const rows =
				Object.values(grouped)

			  rows.sort((a: any, b: any) => {

				if (b.points !== a.points) {
				  return b.points - a.points
				}

				return a.id - b.id
			  })

			  setLeaderboard(rows)
			}

  function updateLocalMatch(
    id: number,
    field: string,
    value: any
  ) {

    setMatches((prev) =>
      prev.map((match) => {

        if (match.id !== id) {
          return match
        }

        return {
          ...match,
          [field]: value
        }
      })
    )
  }

  function availableTeams(
    currentTeamId: number
  ) {

    return teams.filter(
      (team) =>
        team.id !== currentTeamId
    )
  }

  return (

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

      <div className="glass-panel lg:col-span-3">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold">
            ⚽ Game 2 Results
          </h1>

          <button
            onClick={addMatch}
            className="btn-primary"
          >
            + Add Match
          </button>

        </div>

        {message && (

          <div className="text-sm font-semibold mb-6">
            {message}
          </div>

        )}

        <div className="flex flex-col gap-6">

  {matches.map((match) => (
	
	<Fragment key={match.id}>

										<div
										  className="
											flex
											justify-between
											items-center
											cursor-pointer
											mb-4
										  "
										  onClick={() =>
											toggleMatch(match.id)
										  }
										>

														<div
														  className="
															text-lg
															font-bold
														  "
														>

																{expandedMatchId === match.id
																  ? '▼'
																  : '▶'}

																{' '}

																#{match.id}

																{' '}

																{match.locked && '🔒 '}

																{match.team1?.name}

														  {' '}

														  {match.team1_goals !== null &&
														   match.team2_goals !== null
															? `${match.team1_goals}-${match.team2_goals}`
															: '-'}

														  {' '}

														  {match.team2?.name}

														  {' '}

														  ({predictionCount(match.id)}/{activePlayers.length})

														</div>

										</div>




{match.visible && (










    <div
      key={match.id}
      className="bg-white/5 rounded-xl p-4 border border-white/10"
    >

      <div className="flex items-center gap-4 text-sm text-white/70 mb-3">

        <span className="font-bold">
          #{match.id}
        </span>

        <input
          type="date"

          disabled={match.locked}

          value={match.match_date}

          onChange={(e) =>
            updateLocalMatch(
              match.id,
              'match_date',
              e.target.value
            )
          }

          className="bg-transparent border border-white/10 rounded px-2 py-1"
        />

        <input
          type="time"

          disabled={match.locked}

          value={match.match_time ?? ''}

          onChange={(e) =>
            updateLocalMatch(
              match.id,
              'match_time',
              e.target.value
            )
          }

          className="bg-transparent border border-white/10 rounded px-2 py-1 w-[90px]"
        />

        {match.locked && (

          <span className="font-semibold">
            🔒 Locked
          </span>

        )}

      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto_1fr_auto] gap-3 items-center">

        <select
          disabled={match.locked}

          value={match.team1_id}

          onChange={(e) =>
            updateLocalMatch(
              match.id,
              'team1_id',
              Number(e.target.value)
            )
          }

          className="input-modern"
        >

          {teams
            .filter(
              (team) =>
                team.id !==
                match.team2_id
            )
            .map((team) => (

              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>

            ))}

        </select>

        <input
          type="number"

          disabled={match.locked}

          value={
            match.team1_goals ?? ''
          }

          onChange={(e) =>
            updateLocalMatch(
              match.id,
              'team1_goals',
              e.target.value === ''
                ? null
                : Number(e.target.value)
            )
          }

          className="w-16 h-12 text-center text-xl font-bold rounded-lg bg-white/10 border border-white/20 text-white"
        />

        <div className="font-bold text-xl">
          -
        </div>

        <input
          type="number"

          disabled={match.locked}

          value={
            match.team2_goals ?? ''
          }

          onChange={(e) =>
            updateLocalMatch(
              match.id,
              'team2_goals',
              e.target.value === ''
                ? null
                : Number(e.target.value)
            )
          }

          className="w-16 h-12 text-center text-xl font-bold rounded-lg bg-white/10 border border-white/20 text-white"
        />

        <select
          disabled={match.locked}

          value={match.team2_id}

          onChange={(e) =>
            updateLocalMatch(
              match.id,
              'team2_id',
              Number(e.target.value)
            )
          }

          className="input-modern"
        >

          {teams
            .filter(
              (team) =>
                team.id !==
                match.team1_id
            )
            .map((team) => (

              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>

            ))}

        </select>

        <div>

          {!match.locked ? (

            <div className="flex gap-2">

              <button
                onClick={() =>
                  updateMatch(match)
                }
                className="btn-primary"
              >
                Update
              </button>

              <button
                disabled={
                  match.team1_goals === null ||
                  match.team2_goals === null
                }
                onClick={() =>
                  lockMatch(match.id)
                }
                className="btn-primary"
              >
                🔒
              </button>

            </div>

          ) : (

            <div className="text-sm font-semibold">
              🔒 Match #{match.id}
            </div>

          )}

        </div>

      </div>

      </div>

)}









      {expandedMatchId === match.id && (

        <div
          className="
            mt-4
            border-t
            border-white/10
            pt-4
          "
        >

          <table
            className="
				mx-auto
              text-sm
            "
          >

            <thead>

              <tr>

                <th className="text-left">
                  
                </th>

                <th className="text-left">
                  
                </th>

                {match.locked && (

                  <th className="text-left">
                    
                  </th>

                )}

              </tr>

            </thead>

            <tbody>

              {getMatchRows(
                match.id
              ).map((row) => {

                const p =
                  row.prediction

				const maskPrediction =
				  p?.locked &&
				  !canRevealPrediction(match)

                return (

					<tr
					  key={
						row.playerId
					  }
					  className="
						border-b
						border-white/10
					  "
					>

<td
  className="
    text-right
    text-medium
	font-bold
	pr-6
  "
>
  {row.playerName}
</td>

						<td>

						  <span
							className="
							  inline-block
							  px-3
							  py-1
							  rounded-lg
							  bg-white/8
							  font-bold
							  text-lg
							  min-w-[60px]
							  text-center
							"
						  >

							{p
							  ? (
								  maskPrediction
									? '??'
									: `${p.team1_goals}-${p.team2_goals}`
								)
							  : '❗'}

						  </span>

						</td>

                    {match.locked && (

<td
  className="
    text-left
    pl-3
  "
>

  {p?.points_gained === 5 && (

    <span
      className="
        inline-block
        px-2
        py-1
        rounded-lg
        font-bold
        bg-yellow-500
        text-black
      "
    >
      5
    </span>

  )}

  {p?.points_gained === 2 && (

    <span
      className="
        inline-block
        px-2
        py-1
        rounded-lg
        font-bold
        bg-gray-300
        text-black
      "
    >
      2
    </span>

  )}

</td>

                    )}

                  </tr>

                )
              })}

            </tbody>

          </table>

        </div>

      )}



	</Fragment>

  ))}

</div>

      </div>

      <div className="glass-panel h-fit lg:col-span-1">

        <h2 className="text-3xl font-bold mb-6">
          🏅 Game 2 Standings
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

				  {leaderboard.map(
					(row, index) => (

					  <tr key={row.id}>

<td>

  {index === 0 ||

   leaderboard[index - 1].points !==
   row.points

    ? index + 1
    : ''}

</td>

						<td>
						  {row.name}
						</td>

						<td className="font-bold">
						  {row.points}
						</td>

					  </tr>

					)
				  )}

				</tbody>

        </table>

      </div>

    </div>
  )
}
