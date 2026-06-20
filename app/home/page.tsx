import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <Link
        href="/home/game1"
        className="dashboard-card"
      >
        🏆 Game 1
      </Link>

      <Link
        href="/home/game2"
        className="dashboard-card"
      >
        🎯 Game 2
      </Link>

      <Link
        href="/home/players"
        className="dashboard-card"
      >
        👥 Players
      </Link>


      <Link
        href="/home/game3"
        className="dashboard-card"
      >
        🏆 Game 3 (experiment)
      </Link>

    

    </div>
	
  )
}