import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET
)

export async function POST(req: Request) {
  const body = await req.json()

  if (body.password !== process.env.SITE_PASSWORD) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const token = await new SignJWT({
    authenticated: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const cookieStore = await cookies()

	cookieStore.set('session', token, {
	  httpOnly: true,
	  secure: true,
	  sameSite: 'lax',
	  path: '/',
	  maxAge: 60 * 60 * 24 * 7,
	})

  return Response.json({
    success: true,
  })
}