'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [message, setMessage] =
    useState('')
	const [
	  game1PredictionId,
	  setGame1PredictionId
	] = useState('')
	const [
	  game2PredictionId,
	  setGame2PredictionId
	] = useState('')
	const [
	  game2MatchId,
	  setGame2MatchId
	] = useState('')	
	
	const [
	  game2VisibilityMatchId,
	  setGame2VisibilityMatchId
	] = useState('')	
		
	const [
		  newPlayerName,
		  setNewPlayerName
		] = useState('')

	const [
	  playerStatusId,
	  setPlayerStatusId
	] = useState('')
	
				const [
				  liveMatchId,
				  setLiveMatchId
				] = useState('')

				const [
				  liveScore1,
				  setLiveScore1
				] = useState('')

				const [
				  liveScore2,
				  setLiveScore2
				] = useState('')

				const [
				  liveMinute,
				  setLiveMinute
				] = useState('')	
	
		const [
		  liveSource,
		  setLiveSource
		] = useState('auto')
	
async function togglePlayerStatus() {

  if (!playerStatusId) {

    setMessage(
      '❌ Enter player ID'
    )

    return
  }

  const numericId =
    Number(playerStatusId)

  const {
    data: player,
    error: fetchError
  } = await supabase
    .from('players')
    .select('active,name')
    .eq('id', numericId)
    .single()

  if (fetchError || !player) {

    setMessage(
      '❌ Player not found'
    )

    return
  }

  const { error } =
    await supabase
      .from('players')
      .update({
        active: !player.active
      })
      .eq(
        'id',
        numericId
      )

  if (error) {

    setMessage(
      '❌ Error updating player'
    )

    return
  }

  setMessage(
    `👤 ${player.name} is now ${
      !player.active
        ? 'ACTIVE'
        : 'INACTIVE'
    }`
  )

  setPlayerStatusId('')
}	
	
	
async function addPlayer() {

  if (!newPlayerName.trim()) {

    setMessage(
      '❌ Enter player name'
    )

    return
  }

  const { error } = await supabase
    .from('players')
    .insert({
      name: newPlayerName,
      active: true
    })

  if (error) {

    setMessage(
      '❌ Error adding player'
    )

    return
  }

  setMessage(
    `✅ Player "${newPlayerName}" added`
  )

  setNewPlayerName('')
}
	
	
	
  async function unlockGame1Results() {

    const { error } = await supabase
      .from('game1_results')
      .update({
        locked: false
      })
      .eq('id', 1)

    if (error) {

      setMessage(
        '❌ Error unlocking Game 1 results'
      )

      return
    }

    setMessage(
      '🔓 Game 1 results unlocked'
    )
  }


					async function unlockGame1Prediction() {

					  if (!game1PredictionId) {

						setMessage(
						  '❌ Enter prediction ID'
						)

						return
					  }

					  const { error } = await supabase
						.from('game1predictions')
						.update({
						  locked: false
						})
						.eq(
						  'id',
						  Number(game1PredictionId)
						)

					  if (error) {

						setMessage(
						  '❌ Error unlocking prediction'
						)

						return
					  }

					  setMessage(
						`🔓 Game 1 prediction #${game1PredictionId} unlocked`
					  )

					  setGame1PredictionId('')
					}

												async function unlockGame2Prediction() {

												  if (!game2PredictionId) {

													setMessage(
													  '❌ Enter prediction ID'
													)

													return
												  }

												  const { error } = await supabase
													.from('game2predictions')
													.update({
													  locked: false
													})
													.eq(
													  'id',
													  Number(game2PredictionId)
													)

												  if (error) {

													setMessage(
													  '❌ Error unlocking prediction'
													)

													return
												  }

												  setMessage(
													`🔓 Game 2 prediction #${game2PredictionId} unlocked`
												  )

												  setGame2PredictionId('')
												}


async function unlockGame2Match() {

  if (!game2MatchId) {

    setMessage(
      '❌ Enter match ID'
    )

    return
  }

  const numericMatchId =
    Number(game2MatchId)

  const { error } = await supabase
    .from('game2matches')
    .update({
      locked: false
    })
    .eq(
      'id',
      numericMatchId
    )

  if (error) {

    setMessage(
      '❌ Error unlocking match'
    )

    return
  }

  await supabase
    .from('game2predictions')
    .update({
      points_gained: 0
    })
    .eq(
      'match_id',
      numericMatchId
    )

  setMessage(
    `🔓 Game 2 match #${game2MatchId} unlocked and points reset`
  )

  setGame2MatchId('')
}





			async function addGame2Match() {

			  const { error } = await supabase
				.from('game2matches')
				.insert({
				  match_date: new Date()
					.toISOString()
					.split('T')[0],

				  match_time: '18:00',

				  team1_id: 1,
				  team2_id: 2,

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
				'✅ Game 2 match added'
			  )
			}





async function toggleGame2MatchVisibility() {

  if (!game2VisibilityMatchId) {

    setMessage(
      '❌ Enter match ID'
    )

    return
  }

  const numericMatchId =
    Number(game2VisibilityMatchId)

  const {
    data: match,
    error: fetchError
  } = await supabase
    .from('game2matches')
    .select('visible')
    .eq('id', numericMatchId)
    .single()

  if (fetchError || !match) {

    setMessage(
      '❌ Match not found'
    )

    return
  }

  const { error } =
    await supabase
      .from('game2matches')
      .update({
        visible: !match.visible
      })
      .eq(
        'id',
        numericMatchId
      )

  if (error) {

    setMessage(
      '❌ Error updating visibility'
    )

    return
  }

  setMessage(
    `👁️ Match #${numericMatchId} visibility changed to ${
      !match.visible
        ? 'VISIBLE'
        : 'HIDDEN'
    }`
  )

  setGame2VisibilityMatchId('')
}




							async function enableLiveMatch() {



							  if (!liveMatchId) {

								setMessage(
								  '❌ Enter match ID'
								)

								return
							  }

							  const numericMatchId =
								Number(liveMatchId)


										


							  //
							  // Disable live on ALL matches
							  //

							  const { error: disableError } =
								await supabase
								  .from('game2matches')
								  .update({
									live_enabled: false
								  })
								  .neq('id', 0)

							  if (disableError) {

								setMessage(
								  '❌ Error disabling other live matches'
								)

								return
							  }

							  //
							  // Enable selected match
							  //

							  const { error } =
								await supabase
								  .from('game2matches')
									.update({

									  live_enabled: true,

									  live_source:
										liveSource

									})
								  .eq(
									'id',
									numericMatchId
								  )

							  if (error) {

								setMessage(
								  '❌ Error enabling live mode'
								)

								return
							  }

							  setMessage(
								`🔴 Match #${liveMatchId} live enabled`
							  )
							}



async function updateLiveMatch() {

  if (!liveMatchId) {

    setMessage(
      '❌ Enter match ID'
    )

    return
  }

  const { error } =
    await supabase
      .from('game2matches')
			.update({

			  live_score1:
				liveScore1 === ''
				  ? null
				  : Number(liveScore1),

			  live_score2:
				liveScore2 === ''
				  ? null
				  : Number(liveScore2),

			  live_minute:
				liveMinute || null,

			  live_source:
				liveSource

			})
      .eq(
        'id',
        Number(liveMatchId)
      )

  if (error) {

    setMessage(
      '❌ Error updating live score'
    )

    return
  }

  setMessage(
    `📡 Live updated for match #${liveMatchId}`
  )
}



						async function disableLiveMatch() {

						  if (!liveMatchId) {

							setMessage(
							  '❌ Enter match ID'
							)

							return
						  }

						  const { error } =
							await supabase
							  .from('game2matches')
							  .update({

								live_enabled: false,

								live_score1: null,
								live_score2: null,

								live_minute: null

							  })
							  .eq(
								'id',
								Number(liveMatchId)
							  )

						  if (error) {

							setMessage(
							  '❌ Error disabling live mode'
							)

							return
						  }

						  setMessage(
							`⚫ Match #${liveMatchId} live disabled`
						  )
						}





  return (

    <div className="glass-panel max-w-3xl">

<div className="flex justify-between items-center mb-10">

  <h1 className="text-4xl font-bold">
    🛠️ Admin Panel
  </h1>

  <a
    href="/admin-logout"
    className="btn-primary"
  >
    Logout
  </a>

</div>

      {message && (

        <div className="text-sm font-semibold mb-6">
          {message}
        </div>

      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-bold mb-2">
              🏆 Game 1 Results
            </h2>

            <div className="text-white/70">
              Unlock official Game 1 results
            </div>

          </div>

          <button
            onClick={unlockGame1Results}
            className="btn-primary"
          >
            🔓 Unlock
          </button>

        </div>

      </div>
	  
								  
							<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

							  <div className="flex justify-between items-center gap-6">

								<div>

								  <h2 className="text-2xl font-bold mb-2">
									🎯 Game 1 Prediction
								  </h2>

								  <div className="text-white/70">
									Unlock specific prediction
								  </div>

								</div>

								<div className="flex items-center gap-3">

								  <input
									type="number"

									placeholder="Prediction ID"

									value={game1PredictionId}

									onChange={(e) =>
									  setGame1PredictionId(
										e.target.value
									  )
									}

									className="input-modern w-40"
								  />

								  <button
									onClick={
									  unlockGame1Prediction
									}
									className="btn-primary"
								  >
									🔓 Unlock
								  </button>

								</div>

							  </div>

							</div>	  
								  
					  
				<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

				  <div className="flex justify-between items-center gap-6">

					<div>

					  <h2 className="text-2xl font-bold mb-2">
						⚽ Game 2 Prediction
					  </h2>

					  <div className="text-white/70">
						Unlock specific prediction
					  </div>

					</div>

					<div className="flex items-center gap-3">

					  <input
						type="number"

						placeholder="Prediction ID"

						value={game2PredictionId}

						onChange={(e) =>
						  setGame2PredictionId(
							e.target.value
						  )
						}

						className="input-modern w-40"
					  />

					  <button
						onClick={
						  unlockGame2Prediction
						}
						className="btn-primary"
					  >
						🔓 Unlock
					  </button>

					</div>

				  </div>

				</div>	  
	  
								<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

								  <div className="flex justify-between items-center gap-6">

									<div>

									  <h2 className="text-2xl font-bold mb-2">
										🏟️ Game 2 Match
									  </h2>

									  <div className="text-white/70">
										Unlock official match
									  </div>

									</div>

									<div className="flex items-center gap-3">

									  <input
										type="number"

										placeholder="Match ID"

										value={game2MatchId}

										onChange={(e) =>
										  setGame2MatchId(
											e.target.value
										  )
										}

										className="input-modern w-40"
									  />

									  <button
										onClick={
										  unlockGame2Match
										}
										className="btn-primary"
									  >
										🔓 Unlock
									  </button>

									</div>

								  </div>

								</div>	  
		


<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

  <div className="flex justify-between items-center">

    <div>

      <h2 className="text-2xl font-bold mb-2">
        ➕ Game 2 Match
      </h2>

      <div className="text-white/70">
        Create new match
      </div>

    </div>

    <button
      onClick={addGame2Match}
      className="btn-primary"
    >
      + Add Match
    </button>

  </div>

</div>




		
	  
<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

  <div className="flex justify-between items-center gap-6">

    <div>

      <h2 className="text-2xl font-bold mb-2">
        👁️ Game 2 Visibility
      </h2>

      <div className="text-white/70">
        Toggle match visibility
      </div>

    </div>

    <div className="flex items-center gap-3">

      <input
        type="number"
        placeholder="Match ID"
        value={game2VisibilityMatchId}
        onChange={(e) =>
          setGame2VisibilityMatchId(
            e.target.value
          )
        }
        className="input-modern w-40"
      />

      <button
        onClick={
          toggleGame2MatchVisibility
        }
        className="btn-primary"
      >
        👁️ Toggle
      </button>

    </div>

  </div>

</div>	  
	  


						<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

						  <div>

							<h2 className="text-2xl font-bold mb-2">
							  📡 Game 2 Live
							</h2>

							<div className="text-white/70 mb-4">
							  Manual live score control
							</div>

							<div className="flex flex-wrap gap-3">

							  <input
								type="number"
								placeholder="Match ID"
								value={liveMatchId}
								onChange={(e) =>
								  setLiveMatchId(
									e.target.value
								  )
								}
								className="input-modern w-32"
							  />

							  <input
								type="number"
								placeholder="Home"
								value={liveScore1}
								onChange={(e) =>
								  setLiveScore1(
									e.target.value
								  )
								}
								className="input-modern w-24"
							  />

							  <input
								type="number"
								placeholder="Away"
								value={liveScore2}
								onChange={(e) =>
								  setLiveScore2(
									e.target.value
								  )
								}
								className="input-modern w-24"
							  />

							  <input
								type="text"
								placeholder="67'"
								value={liveMinute}
								onChange={(e) =>
								  setLiveMinute(
									e.target.value
								  )
								}
								className="input-modern w-24"
							  />

							</div>


									<div
									  className="
										mt-4
										flex
										gap-6
										items-center
									  "
									>

									  <label
										className="
										  flex
										  items-center
										  gap-2
										  cursor-pointer
										"
									  >

										<input
										  type="radio"
										  name="liveSource"
										  value="auto"
										  checked={
											liveSource ===
											'auto'
										  }
										  onChange={() =>
											setLiveSource(
											  'auto'
											)
										  }
										/>

										<span>
										  Auto
										</span>

									  </label>

									  <label
										className="
										  flex
										  items-center
										  gap-2
										  cursor-pointer
										"
									  >

										<input
										  type="radio"
										  name="liveSource"
										  value="manual"
										  checked={
											liveSource ===
											'manual'
										  }
										  onChange={() =>
											setLiveSource(
											  'manual'
											)
										  }
										/>

										<span>
										  Manual
										</span>

									  </label>

									</div>






							<div className="flex gap-3 mt-4">

							  <button
								onClick={
								  enableLiveMatch
								}
								className="btn-primary"
							  >
								🔴 Enable
							  </button>

							  <button
								onClick={
								  updateLiveMatch
								}
								className="btn-primary"
							  >
								📡 Update
							  </button>

							  <button
								onClick={
								  disableLiveMatch
								}
								className="btn-primary"
							  >
								⚫ Disable
							  </button>

							</div>

						  </div>

						</div>






	  
<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

  <div className="flex justify-between items-center gap-6">

    <div>

      <h2 className="text-2xl font-bold mb-2">
        👤 Player
      </h2>

      <div className="text-white/70">
        Add new player
      </div>

    </div>

    <div className="flex items-center gap-3">

      <input
        type="text"
        placeholder="Player name"
        value={newPlayerName}
        onChange={(e) =>
          setNewPlayerName(
            e.target.value
          )
        }
        className="input-modern w-60"
      />

      <button
        onClick={addPlayer}
        className="btn-primary"
      >
        + Add
      </button>

    </div>

  </div>

</div>	  
	  
<div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">

  <div className="flex justify-between items-center gap-6">

    <div>

      <h2 className="text-2xl font-bold mb-2">
        👥 Player Status
      </h2>

      <div className="text-white/70">
        Toggle active/inactive player
      </div>

    </div>

    <div className="flex items-center gap-3">

      <input
        type="number"
        placeholder="Player ID"
        value={playerStatusId}
        onChange={(e) =>
          setPlayerStatusId(
            e.target.value
          )
        }
        className="input-modern w-40"
      />

      <button
        onClick={
          togglePlayerStatus
        }
        className="btn-primary"
      >
        🔄 Toggle
      </button>

    </div>

  </div>

</div>	  
	  

    </div>
  )
}