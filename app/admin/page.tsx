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