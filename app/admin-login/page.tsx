'use client'

import { useState } from 'react'

export default function AdminLoginPage() {

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault()

    const res = await fetch(
      '/api/admin-login',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          password,
        }),
      }
    )

    if (res.ok) {

      window.location.href =
        '/admin'

    } else {

      setError(
        'Invalid admin password'
      )
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center">

      <div className="glass-panel max-w-md w-full">

        <h1 className="text-4xl font-bold mb-8 text-center">
          🔐 Admin Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
        >

          <input
            type="password"

            placeholder="Admin password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            className="input-modern"
          />

          <button
            type="submit"
            className="btn-primary"
          >
            Login
          </button>

          {error && (

            <div className="text-red-400 text-sm">
              {error}
            </div>

          )}

        </form>

      </div>

    </div>
  )
}