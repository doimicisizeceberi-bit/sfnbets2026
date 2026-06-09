import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between mb-10">

      <Link
        href="/home"
        className="text-3xl font-bold"
      >
        ⚽ SFN Bets 2026
      </Link>

      <div className="flex gap-6 text-lg font-semibold">

        <Link
          href="/home"
          className="hover:opacity-70"
        >
          Home
        </Link>

        <Link
          href="/home/game1"
          className="hover:opacity-70"
        >
          Game 1
        </Link>

        <Link
          href="/home/game2"
          className="hover:opacity-70"
        >
          Game 2
        </Link>

        <Link
          href="/home/players"
          className="hover:opacity-70"
        >
          Players
        </Link>

      </div>
    </nav>
  )
}