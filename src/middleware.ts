import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/', // homepage
  '/sign-in(.*)', // sign-in page
  '/sign-up(.*)', // sign-up page
  '/api/health(.*)', // health check (no auth needed)
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jinja2|txt|xml|map|ttf|woff2?|ico|gif|webp|png|jpe?g|svg|avif)).*)',
    '/(api|trpc)(.*)',
  ],
}
