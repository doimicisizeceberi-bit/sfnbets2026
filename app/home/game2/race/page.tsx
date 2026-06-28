'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'



type PredictionRow = {
  match_id: number

  points_gained: number | null

  players: {
    id: number
    name: string
  }

  game2matches: {
    id: number
    match_date: string
    match_time: string
  }
}

export default function RacePage() {
	
const [chartData, setChartData] =
useState<any[]>([])
  
			const [
			  selectedPlayers,
			  setSelectedPlayers
			] = useState<string[]>([])
  
			const players = [

			  'Marius',
			  'Puiu',
			  'Bogdan',
			  'Ciprian',
			  'Cristi',
			  'Stefan',
			  'Nenea',
			  'Florin',
			  'Vlad'

			]
  
const playerColors: Record<string, string> = {

  Marius: '#3b82f6',
  Puiu: 'orange',
  Bogdan: '#10b981',
  Ciprian: '#8b5cf6',
  Cristi: '#D1D5DB',
  Stefan: 'red',
  Nenea: '#ec4899',
  Florin: 'black',
  Vlad: 'yellow'

}
	
	
	
useEffect(() => {

  loadRace()

}, [])


function togglePlayer(
  player: string
) {

  setSelectedPlayers(prev => {

    if (
      prev.includes(player)
    ) {

      return prev.filter(
        p => p !== player
      )
    }

    return [...prev, player]
  })
}



async function loadRace() {

  const { data, error } =
    await supabase

      .from('game2predictions')

      .select(`
        match_id,
        points_gained,

        players (
          id,
          name
        ),

        game2matches!inner (
          id,
          match_date,
          match_time,
          locked
        )
      `)

      .eq(
        'game2matches.locked',
        true
      )

  if (error) {

    console.error(error)

    return
  }

  buildChart(
    data as any[]
  )
}

function buildChart(
  rows: PredictionRow[]
) {

  const sortedRows =

    [...rows].sort(
      (a, b) => {

        const da =
          `${a.game2matches.match_date} ${a.game2matches.match_time}`

        const db =
          `${b.game2matches.match_date} ${b.game2matches.match_time}`

        return da.localeCompare(db)
      }
    )

  const totals:
    Record<string, number> = {}

  const grouped:
    Record<number, any[]> = {}

  sortedRows.forEach(row => {

    if (
      !grouped[row.match_id]
    ) {

      grouped[row.match_id] = []
    }

    grouped[row.match_id]
      .push(row)
  })

  const chart: any[] = []

  Object
    .keys(grouped)

    .sort(
      (a, b) =>
        Number(a) - Number(b)
    )

    .forEach(matchId => {

	const point: any = {

	  match:
		`M${matchId}`
	}

	Object.keys(totals)
	  .forEach(player => {

		point[player] =
		  totals[player]

	  })

      grouped[
        Number(matchId)
      ].forEach(row => {

        const player =
          row.players.name

        totals[player] =

          (totals[player] || 0)

          +

          (row.points_gained || 0)

        point[player] =
          totals[player]
      })

chart.push(point)
})

console.log('RACE DATA')
console.log(chart)

setChartData(chart)
}







	
  return (

    <div className="max-w-7xl mx-auto p-4">

      <h1 className="text-3xl font-bold mb-6">
        🏁 Leaderboard Race
      </h1>

      <div className="
        bg-white/5
        border border-white/10
        rounded-xl
        p-6
      ">
	  
	  
			<div className="
			  flex
			  flex-wrap
			  gap-2
			  mb-6
			">

			  {players.map(player => {

				const active =

				  selectedPlayers.length === 0 ||

				  selectedPlayers.includes(
					player
				  )

				return (

				  <button
					key={player}

					onClick={() =>
					  togglePlayer(player)
					}

					className="
					  px-3
					  py-1
					  rounded-lg
					  font-semibold
					  border
					  transition
					"

					style={{

					  backgroundColor:

						active
						  ? playerColors[player]
						  : '#ffffff10',

					  opacity:
						active
						  ? 1
						  : 0.3

					}}
				  >

					{player}

				  </button>

				)
			  })}

			</div>

						<div className="h-[600px]">

						  <ResponsiveContainer
							width="100%"
							height="100%"
						  >

							<LineChart
							  data={chartData}
							  margin={{
								top: 20,
								right: 40,
								left: 10,
								bottom: 20
							  }}
							>

							  <CartesianGrid
								strokeDasharray="3 3"
								stroke="#ffffff20"
							  />

							  <XAxis
								dataKey="match"
								stroke="#ffffff"
							  />

							  <YAxis
								stroke="#ffffff"
							  />

							  <Tooltip />



							  {players.map(player => (

												<Line

												  key={player}

												  type="monotone"

												  dataKey={player}

												  stroke={
													playerColors[player]
												  }

												  strokeWidth={

													selectedPlayers.length === 0

													  ? 3

													  : selectedPlayers.includes(
														  player
														)

														? 5

														: 2
												  }

												  opacity={

													selectedPlayers.length === 0

													  ? 1

													  : selectedPlayers.includes(
														  player
														)

														? 1

														: 0.15
												  }

												  dot={false}

												  isAnimationActive={true}

												  animationDuration={3000}

												/>

							  ))}

							</LineChart>

						  </ResponsiveContainer>

						</div>

      </div>

    </div>

  )
}