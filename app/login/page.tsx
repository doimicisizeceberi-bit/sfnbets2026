'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

					async function handleLogin(
					  e: React.FormEvent
					) {
					  e.preventDefault()

					  if (
						password ===
						process.env.NEXT_PUBLIC_SITE_PASSWORD
					  ) {

						localStorage.setItem(
						  'sfn-auth',
						  'ok'
						)

						window.location.href =
						  '/home'

						return
					  }

					  setError(
						'Invalid password'
					  )
					}

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-80"
      >
        <h1 className="text-3xl font-bold text-center">
          sfnbets2026
        </h1>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-3"
        />

        <button
          type="submit"
          className="bg-black text-white rounded p-3"
        >
          Enter
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}
      </form>
    </main>
  )
}