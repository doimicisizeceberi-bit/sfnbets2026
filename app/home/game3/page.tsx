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
	  
		  live_enabled: boolean

		  live_score1: number | null
		  live_score2: number | null

		  live_minute: string | null	  
	  
	
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
    points_gained_game3: number
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

						function getLivePoints(
						  prediction: PredictionRow,
						  liveScore1: number,
						  liveScore2: number
						) {

						  if (
							prediction.team1_goals === null ||
							prediction.team2_goals === null
						  ) {
							return 0
						  }

						  const predictedScore1 =
							prediction.team1_goals

						  const predictedScore2 =
							prediction.team2_goals

						  // Exact score

						  if (

							predictedScore1 ===
							  liveScore1 &&

							predictedScore2 ===
							  liveScore2

						  ) {

							return 8
						  }

						  const liveResult =
							getMatchResult(
							  liveScore1,
							  liveScore2
							)

						  const predictionResult =
							getMatchResult(
							  predictedScore1,
							  predictedScore2
							)

						  const liveGoalDiff =
							liveScore1 -
							liveScore2

						  const predictionGoalDiff =
							predictedScore1 -
							predictedScore2

						  const correctGoalDiff =
							liveGoalDiff ===
							predictionGoalDiff

						  const correctHomeGoals =
							liveScore1 ===
							predictedScore1

						  const correctAwayGoals =
							liveScore2 ===
							predictedScore2

						  if (
							liveResult ===
							predictionResult
						  ) {

							if (

							  correctGoalDiff ||

							  correctHomeGoals ||

							  correctAwayGoals

							) {

							  return 4
							}

							return 3
						  }

						  if (

							correctHomeGoals ||

							correctAwayGoals

						  ) {

							return 1
						  }

						  return 0
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

useEffect(() => {

  const channel = supabase

    .channel(
      'game2matches-live'
    )

    .on(

      'postgres_changes',

      {
        event: '*',
        schema: 'public',
        table: 'game2matches'
      },

      () => {

        loadData()
      }

    )

    .subscribe()

  return () => {

    supabase.removeChannel(
      channel
    )
  }

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
						row.points_gained || 0,
						
						points_gained_game3:
						  row.points_gained_game3 || 0
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
				  points_gained_game3,
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

					  points: 0,

					  exactCount: 0,   // 8 pts

					  closeCount: 0,   // 4 pts

					  resultCount: 0,  // 3 pts

					  goalCount: 0     // 1 pt
					}
				}

				grouped[playerId].points +=
				  row.points_gained_game3 || 0
				  
				  
						if (

						  row.points_gained_game3 === 8 ||

						  row.points_gained_game3 === 9

						) {

						  grouped[playerId].exactCount += 1

						}

						if (

						  row.points_gained_game3 === 3 ||

						  row.points_gained_game3 === 4

						) {

						  grouped[playerId].resultCount += 1

						}

						if (

						  row.points_gained_game3 === 9 ||

						  row.points_gained_game3 === 4 ||

						  row.points_gained_game3 === 1

						) {

						  grouped[playerId].goalCount += 1

						}				  
				  
				  
				  
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



  return (

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

      <div className="glass-panel lg:col-span-3">

		<div className="flex justify-between items-center mb-8">

		  <h1 className="text-4xl font-bold">
			⚽ Game 3 Concept
		  </h1>
				<div className="mt-2 text-sm text-white/70">
				  					
				  Joc TEST • Premii:
				  <br /><span className="font-semibold"> 8p</span> scor corect,
				  <br /><span className="font-semibold"> 3p</span> pronostic corect (1/X/2),
				  <br /><span className="font-semibold"> 1p bonus</span> pentru diferență exacta de scor la victorie
				  <br /><span className="font-semibold"> 1p bonus</span> pentru numar exact de goluri marcate de gazde
				  <br /><span className="font-semibold"> 1p bonus</span> pentru numar exact de goluri marcate de oaspeți			  
				  <br /><span className="font-semibold"> 1p bonus</span> pentru castigatoare la penalty-uri in meciuri eliminatorii
				</div>
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

																		{match.live_enabled && '🔴 LIVE '}

																		#{match.id}

																		{' '}

																		{match.locked && '🔒 '}

																		{match.team1?.name}

																		{' '}

																		{match.live_enabled

																		  ? `${match.live_score1 ?? 0}-${match.live_score2 ?? 0}`

																		  : (

																			  match.team1_goals !== null &&
																			  match.team2_goals !== null

																				? `${match.team1_goals}-${match.team2_goals}`
																				: '-'
																			)
																		}

																		{' '}

																		{match.team2?.name}

																		{' '}

																		{match.live_enabled &&
																		  match.live_minute}

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

		<span>
		  {match.match_date}
		</span>

		<span>
		  {match.match_time}
		</span>

        {match.locked && (

          <span className="font-semibold">
            🔒 Locked
          </span>

        )}

      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto_1fr_auto] gap-3 items-center">

		<div className="font-semibold">
		  {match.team1?.name}
		</div>

		<div
		  className="
			w-16
			h-12
			flex
			items-center
			justify-center
			text-xl
			font-bold
			rounded-lg
			bg-white/10
			border
			border-white/20
		  "
		>
		  {match.team1_goals ?? '-'}
		</div>

        <div className="font-bold text-xl">
          -
        </div>

			<div
			  className="
				w-16
				h-12
				flex
				items-center
				justify-center
				text-xl
				font-bold
				rounded-lg
				bg-white/10
				border
				border-white/20
			  "
			>
			  {match.team2_goals ?? '-'}
			</div>

		<div className="font-semibold">
		  {match.team2?.name}
		</div>

		<div className="text-sm font-semibold">
		  🔒 Read Only
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

    {match.live_enabled && (

      <div
        className="
          mb-4
          rounded-xl
          border
          border-red-500/40
          bg-red-500/10
          p-4
          text-center
        "
      >

        <div
          className="
            text-red-400
            font-bold
            text-lg
          "
        >
          🔴 LIVE
        </div>

        <div
          className="
            mt-1
            text-xl
            font-bold
          "
        >

          {match.team1?.name}

          {' '}

          {match.live_score1 ?? 0}

          {' - '}

          {match.live_score2 ?? 0}

          {' '}

          {match.team2?.name}

        </div>

        <div
          className="
            mt-1
            text-white/70
          "
        >
          {match.live_minute}
        </div>

      </div>

    )}

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
				  
				  
				const livePoints =

				  match.live_enabled &&

				  p

					? getLivePoints(
						p,
						match.live_score1 ?? 0,
						match.live_score2 ?? 0
					  )

					: 0				  
				  

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



{p?.points_gained_game3 === 9 && (

  <>
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
      8
    </span>

    <span
      className="
        inline-block
        px-2
        py-1
        rounded-lg
        font-bold
        bg-blue-500
        text-white
      "
    >
      1
    </span>
  </>

)}

{p?.points_gained_game3 === 8 && (

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
    8
  </span>

)}

{p?.points_gained_game3 === 4 && (

  <>
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
      3
    </span>

    <span
      className="
        inline-block
        px-2
        py-1
        rounded-lg
        font-bold
        bg-blue-500
        text-white
      "
    >
      1
    </span>
  </>

)}

{p?.points_gained_game3 === 3 && (

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
    3
  </span>

)}

{p?.points_gained_game3 === 1 && (

  <span
    className="
      inline-block
      px-2
      py-1
      rounded-lg
      font-bold
      bg-blue-500
      text-white
    "
  >
    1
  </span>

)}

</td>





                    )}
					
					
					
{match.live_enabled && (

  <td
    className="
      text-left
      pl-3
    "
  >

{livePoints === 8 && (

  <span
    className="
      inline-flex
      items-center
      gap-2
      animate-pulse
    "
  >

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
      8
    </span>

    <span
      className="
        text-red-400
        font-bold
        animate-pulse
      "
    >
      LIVE
    </span>

  </span>

)}

{livePoints === 4 && (

  <span
    className="
      inline-flex
      items-center
      gap-2
      animate-pulse
    "
  >

    <span
      className="
        inline-block
        px-2
        py-1
        rounded-lg
        font-bold
        bg-green-500
        text-black
      "
    >
      4
    </span>

    <span
      className="
        text-red-400
        font-bold
        animate-pulse
      "
    >
      LIVE
    </span>

  </span>

)}

{livePoints === 3 && (

  <span
    className="
      inline-flex
      items-center
      gap-2
      animate-pulse
    "
  >

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
      3
    </span>

    <span
      className="
        text-red-400
        font-bold
        animate-pulse
      "
    >
      LIVE
    </span>

  </span>

)}

{livePoints === 1 && (

  <span
    className="
      inline-flex
      items-center
      gap-2
      animate-pulse
    "
  >

    <span
      className="
        inline-block
        px-2
        py-1
        rounded-lg
        font-bold
        bg-blue-500
        text-white
      "
    >
      1
    </span>

    <span
      className="
        text-red-400
        font-bold
        animate-pulse
      "
    >
      LIVE
    </span>

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
          🏅 Game 3 Standings
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

<Fragment key={row.id}>

<tr>

  <td
    className="
      font-bold
      text-xl
      text-White-800
    "
  >

    {index === 0 ||

     leaderboard[index - 1].points !==
     row.points

      ? index + 1
      : ''}

  </td>

  <td
    className="
      font-bold
      text-xl
      text-White-800
    "
  >
    {row.name}
  </td>

  <td
    className="
      font-extrabold
      text-2xl
      text-White-800
    "
  >
    {row.points}
  </td>

</tr>

<tr>

  <td></td>

  <td
    className="
      text-xs
      text-white/50
      pb-3
      pl-2
    "
  >

<div className="mb-1">

  <span
    className="
      inline-block
      px-1.5
      py-0.5
      rounded-lg
      font-bold
      text-xs
      bg-yellow-500
      text-black
      mr-1
    "
  >
    8
  </span>

  × {row.exactCount}

</div>


<div className="mb-1">

  <span
    className="
      inline-block
      px-1.5
      py-0.5
      rounded-lg
      font-bold
      text-xs
      bg-gray-300
      text-black
      mr-1
    "
  >
    3
  </span>

  × {row.resultCount}

</div>

<div>

  <span
    className="
      inline-block
      px-1.5
      py-0.5
      rounded-lg
      font-bold
      text-xs
      bg-blue-500
      text-white
      mr-1
    "
  >
    1
  </span>

  × {row.goalCount}

</div>

  </td>

  <td></td>

</tr>

</Fragment>

					)
				  )}

				</tbody>

        </table>

      </div>

    </div>
  )
}
