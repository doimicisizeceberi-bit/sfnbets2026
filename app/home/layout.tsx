'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router = useRouter()

  useEffect(() => {

    const auth =
      localStorage.getItem(
        'sfn-auth'
      )

    if (auth !== 'ok') {
      router.push('/login')
    }

  }, [router])

  return (
    <main className="page-container">

      <Navbar />

      {children}

    </main>
  )
}