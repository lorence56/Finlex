import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema'
import { db } from '@/lib/db'

const isPublicRoute = createRouteMatcher([
  '/', // homepage
  '/sign-in(.*)', // sign-in page
  '/sign-up(.*)', // sign-up page
  '/api/health(.*)', // health check (no auth needed)
  '/api/webhooks/clerk(.*)', // Clerk webhook must be public
])

const isPortalRoute = createRouteMatcher(['/portal(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const session = await auth()
    await auth.protect()

    if (session.userId && (isPortalRoute(request) || isDashboardRoute(request))) {
      const rows = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1)

      const role = rows[0]?.role

      if (isPortalRoute(request) && role && role !== 'client') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      if (isDashboardRoute(request) && role === 'client') {
        return NextResponse.redirect(new URL('/portal', request.url))
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jinja2|txt|xml|map|ttf|woff2?|ico|gif|webp|png|jpe?g|svg|avif)).*)',
    '/(api|trpc)(.*)',
  ],
}
