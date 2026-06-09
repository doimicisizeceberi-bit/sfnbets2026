import Navbar from '@/components/Navbar'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="page-container">

      <Navbar />

      {children}

    </main>
  )
}