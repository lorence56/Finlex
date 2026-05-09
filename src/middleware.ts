import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// NOTE: No `export const runtime` here — middleware always runs on Edge.
// DB queries are not allowed in middleware. Role-based redirects are
// handled in layout.tsx files where Node.js runtime is available.

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health(.*)',
  '/api/webhooks/clerk(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const session = await auth()
    if (!session.userId) {
      return (await auth()).redirectToSignIn()
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jinja2|txt|xml|map|ttf|woff2?|ico|gif|webp|png|jpe?g|svg|avif)).*)',
    '/(api|trpc)(.*)',
  ],
}
