import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema'
import { db } from '@/lib/db'

// 1. Force Node.js runtime to allow database connections in middleware
export const runtime = 'nodejs'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health(.*)',
  '/api/webhooks/clerk(.*)',
])

const isPortalRoute = createRouteMatcher(['/portal(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const session = await auth()

    // If the user isn't logged in, redirect to sign-in
    if (!session.userId) {
      return (await auth()).redirectToSignIn()
    }

    if (isPortalRoute(request) || isDashboardRoute(request)) {
      try {
        const rows = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1)

        const role = rows[0]?.role

        // Redirect logic based on roles
        if (isPortalRoute(request) && role && role !== 'client') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        if (isDashboardRoute(request) && role === 'client') {
          return NextResponse.redirect(new URL('/portal', request.url))
        }
      } catch (error) {
        console.error('Database connection failed in proxy:', error)
        // Fallback: If DB is down, allow the request to proceed
        // or redirect to an error page to prevent the infinite "fetch failed" loop
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jinja2|txt|xml|map|ttf|woff2?|ico|gif|webp|png|jpe?g|svg|avif)).*)',
    '/(api|trpc)(.*)',
  ],
}
