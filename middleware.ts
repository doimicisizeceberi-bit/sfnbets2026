import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET
)

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value

console.log(
  'PATH:',
  req.nextUrl.pathname,
  'SESSION:',
  !!session
)


  const isLoginPage =
    req.nextUrl.pathname === '/login'

  if (!session) {
    if (isLoginPage) {
      return NextResponse.next()
    }

    return NextResponse.redirect(
      new URL('/login', req.url)
    )
  }

  try {

  const payload =
    await jwtVerify(session, secret)

  console.log(
    'JWT OK',
    payload.payload
  )

  if (isLoginPage) {
    return NextResponse.redirect(
      new URL('/home', req.url)
    )
  }

  return NextResponse.next()

} catch (err) {

  console.log(
    'JWT ERROR',
    err
  )

  return NextResponse.redirect(
    new URL('/login', req.url)
  )
}
}

export const config = {
  matcher: ['/home/:path*'],
}