import { SignJWT } from 'jose'
import { NextResponse } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET
)

export async function POST(req: Request) {

  const body = await req.json()

  if (
    body.password !== process.env.SITE_PASSWORD
  ) {
    return new NextResponse(
      'Unauthorized',
      { status: 401 }
    )
  }

  const token = await new SignJWT({
    authenticated: true,
  })
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setExpirationTime('7d')
    .sign(secret)

const response =
  NextResponse.json({
    success: true,
  })

response.cookies.set(
  'session',
  token,
  {
    path: '/',
  }
)

response.cookies.set(
  'session_test',
  'ok',
  {
    path: '/',
  }
)

return response

  return response
}