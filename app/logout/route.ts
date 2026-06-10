import { NextResponse } from 'next/server'

export async function GET(req: Request) {

  const response = NextResponse.redirect(
    new URL('/login', req.url)
  )

  response.cookies.delete('session')

  return response
}