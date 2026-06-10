import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET
)

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const cookieStore =
    await cookies()

  const session =
    cookieStore.get(
      'admin-session'
    )?.value

  if (!session) {
    redirect('/admin-login')
  }

  try {

    await jwtVerify(
      session,
      secret
    )

  } catch {

    redirect('/admin-login')
  }

  return (
    <>
      {children}
    </>
  )
}