import { NextResponse } from 'next/server'

export async function GET(req: Request) {

  const response = NextResponse.redirect(
    new URL('/admin-login', req.url)
  )

  response.cookies.delete(
    'admin-session'
  )

  return response
}