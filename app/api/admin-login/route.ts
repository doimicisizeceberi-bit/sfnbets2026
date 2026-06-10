import { SignJWT } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET
)

export async function POST(
  req: NextRequest
) {

  const { password } =
    await req.json()

  if (
    password !==
    process.env.ADMIN_PASSWORD
  ) {

    return NextResponse.json(
      {
        error: 'Invalid password'
      },
      {
        status: 401
      }
    )
  }

  const token =
    await new SignJWT({
      admin: true
    })
      .setProtectedHeader({
        alg: 'HS256'
      })
      .setExpirationTime('7d')
      .sign(secret)

  const response =
    NextResponse.json({
      success: true
    })

  response.cookies.set(
    'admin-session',
    token,
    {
      httpOnly: true,
      path: '/',
    }
  )

  return response
}