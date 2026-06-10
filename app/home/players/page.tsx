'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import React from 'react'

type Player = {
  id: number
  name: string
  active: boolean
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayer, setNewPlayer] = useState('')


		const [expandedPlayerId, setExpandedPlayerId] =
		  useState<number | null>(null)

		const [predictionId, setPredictionId] =
		  useState<number | null>(null)

		const [predictionLocked, setPredictionLocked] =
		  useState(false)

		const [champion, setChampion] = useState('')
		const [finalist, setFinalist] = useState('')
		const [semi1, setSemi1] = useState('')
		const [semi2, setSemi2] = useState('')
		const [topGoal, setTopGoal] = useState('')
		const [surprise, setSurprise] = useState('')

		const [teams, setTeams] = useState<any[]>([])
		const [goalPlayers, setGoalPlayers] = useState<any[]>([])

		const [message, setMessage] = useState('')

		const [expandedGame2PlayerId, setExpandedGame2PlayerId] =
		  useState<number | null>(null)

		const [game2Matches, setGame2Matches] =
		  useState<any[]>([])

		const [game2Predictions, setGame2Predictions] =
		  useState<any[]>([])

		const [game2Message, setGame2Message] =
		  useState('')



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
	loadGame1Data()
	loadGame2Matches()
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

		async function loadGame1Data() {

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
		}


					async function loadGame2Matches() {

					  const { data } = await supabase
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
						.order('id', {
						  ascending: false
						})

					  if (data) {
						setGame2Matches(data)
					  }
					}




							async function openGame1(playerId: number) {

								setExpandedPlayerId(playerId)

							  setExpandedPlayerId(playerId)

							  const { data } = await supabase
								.from('game1predictions')
								.select('*')
								.eq('player_id', playerId)
								.single()

							  if (data) {

								setPredictionId(data.id)

								setChampion(
								  data.champion_team_id?.toString() || ''
								)

								setFinalist(
								  data.finalist_team_id?.toString() || ''
								)

								setSemi1(
								  data.semifinalist1_team_id?.toString() || ''
								)

								setSemi2(
								  data.semifinalist2_team_id?.toString() || ''
								)

								setTopGoal(
								  data.top_goal_player_id?.toString() || ''
								)

								setSurprise(
								  data.surprise_team_id?.toString() || ''
								)

								setPredictionLocked(data.locked)

							  } else {

								setPredictionId(null)

								setChampion('')
								setFinalist('')
								setSemi1('')
								setSemi2('')
								setTopGoal('')
								setSurprise('')

								setPredictionLocked(false)
							  }
							}


					async function openGame2(playerId: number) {

					  setExpandedGame2PlayerId(playerId)

					  setGame2Message('')

					  const { data } = await supabase
						.from('game2predictions')
						.select('*')
						.eq('player_id', playerId)
						.order('match_id', {
						  ascending: false
						})

					  if (data) {
						setGame2Predictions(data)
					  }
					}


							async function loadGame2Predictions(
							  playerId: number
							) {

							  for (const match of game2Matches) {

								const exists =
								  game2Predictions.find(
									(prediction) =>
									  prediction.match_id === match.id
								  )

								if (exists) continue

								await supabase
								  .from('game2predictions')
								  .insert({
									match_id: match.id,
									player_id: playerId,
									locked: false
								  })
							  }

							  setGame2Message(
								'✅ Matches loaded'
							  )

							  await openGame2(playerId)
							}

					async function updateGame2Prediction(
					  predictionId: number,
					  team1Goals: number | null,
					  team2Goals: number | null
					) {

					  const { error } = await supabase
						.from('game2predictions')
						.update({
						  team1_goals: team1Goals,
						  team2_goals: team2Goals,
						  locked: false
						})
						.eq('id', predictionId)

					  if (error) {

						setGame2Message(
						  '❌ Error updating prediction'
						)

						return
					  }

					  setGame2Message(
						`✅ Prediction updated (#${predictionId})`
					  )

					  if (expandedGame2PlayerId) {
						await openGame2(
						  expandedGame2PlayerId
						)
					  }
					}


											async function lockGame2Prediction(
											  predictionId: number
											) {

											  const { error } = await supabase
												.from('game2predictions')
												.update({
												  locked: true
												})
												.eq('id', predictionId)

											  if (error) {

												setGame2Message(
												  '❌ Error locking prediction'
												)

												return
											  }

											  setGame2Message(
												`🔒 Prediction locked (#${predictionId})`
											  )

											  if (expandedGame2PlayerId) {
												await openGame2(
												  expandedGame2PlayerId
												)
											  }
											}

						function updateLocalGame2Prediction(
						  predictionId: number,
						  field: string,
						  value: any
						) {

						  setGame2Predictions((prev) =>
							prev.map((prediction) => {

							  if (
								prediction.id !== predictionId
							  ) {
								return prediction
							  }

							  return {
								...prediction,
								[field]: value
							  }
							})
						  )
						}

								async function updatePrediction() {

								  if (!expandedPlayerId) return

										const { error } = await supabase
										  .from('game1predictions')
										  .upsert({
											player_id: expandedPlayerId,

											champion_team_id: champion,
											finalist_team_id: finalist,

											semifinalist1_team_id: semi1,
											semifinalist2_team_id: semi2,

											top_goal_player_id: topGoal,

											surprise_team_id: surprise,

											locked: false,
										  },
										  {
											onConflict: 'player_id'
										  })

								  if (error) {

									setMessage(
									  '❌ Error updating predictions'
									)

									return
								  }

								  setMessage(
									'✅ Predictions updated successfully'
								  )

								  await openGame1(expandedPlayerId)
								}


												async function lockPrediction() {

												  if (!predictionId) return

												  const { error } = await supabase
													.from('game1predictions')
													.update({
													  locked: true
													})
													.eq('id', predictionId)

												  if (error) {

													setMessage(
													  '❌ Error locking prediction'
													)

													return
												  }

												  setPredictionLocked(true)

												  setMessage(
													`🔒 Prediction locked (#${predictionId})`
												  )
												}


			function availableTeams(excluded: string[]) {
			  return teams.filter(
				(team) =>
				  !excluded.includes(team.id.toString())
			  )
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
            <th>Game 1</th>
            <th>Game 2</th>
          </tr>
        </thead>

        <tbody>

          {players.map((player) => (
            <React.Fragment key={player.id}>
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

                <td>

                  {player.active ? (

                    <button
							onClick={() => {

								if (expandedPlayerId === player.id) {

								  setExpandedPlayerId(null)
								  setMessage('')

								} else {

								  setMessage('')
								  openGame1(player.id)

								}

							}}
                      className="btn-primary"
                    >
                      {expandedPlayerId === player.id
                        ? '▲ Game 1'
                        : '▼ Game 1'}
                    </button>

                  ) : (
                    '🚫'
                  )}

                </td>

						<td>

						  {player.active ? (

							<button
							  onClick={() => {

								if (
								  expandedGame2PlayerId ===
								  player.id
								) {

								  setExpandedGame2PlayerId(null)
								  setGame2Message('')

								} else {

								  openGame2(player.id)

								}

							  }}
							  className="btn-primary"
							>
							  {expandedGame2PlayerId === player.id
								? '▲ Game 2'
								: '▼ Game 2'}
							</button>

						  ) : (
							'🚫'
						  )}

						</td>

              </tr>

              {expandedPlayerId === player.id && (

                <tr>

                  <td colSpan={5} className="pt-4 pb-8">

                    <div className="glass-panel max-w-2xl">

                      <div className="grid gap-4 max-w-md">

									{message && (

									  <div className="text-sm font-semibold">
										{message}
									  </div>

									)}



                        <div>
                          <label className="block mb-1 text-sm font-semibold">
                            Campioana
                          </label>

                          <select
                            disabled={predictionLocked}
                            value={champion}
                            onChange={(e) =>
                              setChampion(e.target.value)
                            }
                            className="input-modern"
                          >
                            <option value="">
                              Selecteaza
                            </option>

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
                            disabled={predictionLocked}
                            value={finalist}
                            onChange={(e) =>
                              setFinalist(e.target.value)
                            }
                            className="input-modern"
                          >
                            <option value="">
                              Selecteaza
                            </option>

                            {availableTeams([
                              champion
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
                            Semifinalista 1
                          </label>

                          <select
                            disabled={predictionLocked}
                            value={semi1}
                            onChange={(e) =>
                              setSemi1(e.target.value)
                            }
                            className="input-modern"
                          >
                            <option value="">
                              Selecteaza
                            </option>

                            {availableTeams([
                              champion,
                              finalist
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
                            disabled={predictionLocked}
                            value={semi2}
                            onChange={(e) =>
                              setSemi2(e.target.value)
                            }
                            className="input-modern"
                          >
                            <option value="">
                              Selecteaza
                            </option>

                            {availableTeams([
                              champion,
                              finalist,
                              semi1
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
                            disabled={predictionLocked}
                            value={topGoal}
                            onChange={(e) =>
                              setTopGoal(e.target.value)
                            }
                            className="input-modern"
                          >
                            <option value="">
                              Selecteaza
                            </option>

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

                        <div>
                          <label className="block mb-1 text-sm font-semibold">
                            Echipa surpriza
                          </label>

                          <select
                            disabled={predictionLocked}
                            value={surprise}
                            onChange={(e) =>
                              setSurprise(e.target.value)
                            }
                            className="input-modern"
                          >
                            <option value="">
                              Selecteaza
                            </option>

                            {teams
                              .filter(
                                (team) => !team.top
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
                        </div>

                        <div className="flex gap-4 mt-4">

                          <button
                            disabled={predictionLocked}
                            onClick={updatePrediction}
                            className="btn-primary"
                          >
                            Update Predictions
                          </button>

                          {!predictionLocked ? (

                            <button
                              disabled={
                                !champion ||
                                !finalist ||
                                !semi1 ||
                                !semi2 ||
                                !topGoal ||
                                !surprise
                              }
                              onClick={lockPrediction}
                              className="btn-primary"
                            >
                              🔒 Lock
                            </button>

                          ) : (

                            <div className="text-sm font-semibold flex items-center">
                              🔒 Locked
                              {predictionId
                                ? ` (#${predictionId})`
                                : ''}
                            </div>

                          )}

                        </div>

                      </div>

                    </div>

                  </td>

                </tr>

              )}


{expandedGame2PlayerId === player.id && (

  <tr>

    <td colSpan={5} className="pt-4 pb-8">

      <div className="glass-panel">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            ⚽ Game 2 Predictions
          </h2>

          <button
            onClick={() =>
              loadGame2Predictions(
                player.id
              )
            }
            className="btn-primary"
          >
            Load Matches
          </button>

        </div>

        {game2Message && (

          <div className="text-sm font-semibold mb-4">
            {game2Message}
          </div>

        )}

        <div className="flex flex-col gap-6">

          {game2Predictions.map(
            (prediction) => {

              const match =
                game2Matches.find(
                  (m) =>
                    m.id ===
                    prediction.match_id
                )

              if (!match) return null

              return (

                <div
                  key={prediction.id}
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

                    {prediction.locked && (

                      <span className="font-semibold">
                        🔒 Locked
                      </span>

                    )}

                  </div>

                  <div className="grid grid-cols-[1fr_auto_auto_auto_1fr_auto] gap-3 items-center">

                    <div className="input-modern">
                      {match.team1?.name}
                    </div>

                    <input
                      type="number"

                      disabled={
                        prediction.locked
                      }

                      value={
                        prediction.team1_goals ?? ''
                      }

                      onChange={(e) =>
                        updateLocalGame2Prediction(
                          prediction.id,
                          'team1_goals',
                          e.target.value === ''
                            ? null
                            : Number(
                                e.target.value
                              )
                        )
                      }

                      className="w-16 h-12 text-center text-xl font-bold rounded-lg bg-white/10 border border-white/20 text-white"
                    />

                    <div className="font-bold text-xl">
                      -
                    </div>

                    <input
                      type="number"

                      disabled={
                        prediction.locked
                      }

                      value={
                        prediction.team2_goals ?? ''
                      }

                      onChange={(e) =>
                        updateLocalGame2Prediction(
                          prediction.id,
                          'team2_goals',
                          e.target.value === ''
                            ? null
                            : Number(
                                e.target.value
                              )
                        )
                      }

                      className="w-16 h-12 text-center text-xl font-bold rounded-lg bg-white/10 border border-white/20 text-white"
                    />

                    <div className="input-modern">
                      {match.team2?.name}
                    </div>

                    <div>

                      {!prediction.locked ? (

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              updateGame2Prediction(
                                prediction.id,
                                prediction.team1_goals,
                                prediction.team2_goals
                              )
                            }
                            className="btn-primary"
                          >
                            Update
                          </button>

                          <button
                            disabled={
                              prediction.team1_goals === null ||
                              prediction.team2_goals === null
                            }
                            onClick={() =>
                              lockGame2Prediction(
                                prediction.id
                              )
                            }
                            className="btn-primary"
                          >
                            🔒
                          </button>

                        </div>

                      ) : (

                        <div className="text-sm font-semibold">
                          🔒 Locked
                          {' '}
                          (#{prediction.id})
                        </div>

                      )}

                    </div>

                  </div>

                </div>

              )
            }
          )}

        </div>

      </div>

    </td>

  </tr>

)}

            </React.Fragment>
          ))}

        </tbody>

      </table>

    </div>
  </>
)
}