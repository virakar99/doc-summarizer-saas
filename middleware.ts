import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api/summarize", "/api/extract-text"])

export default clerkMiddleware((auth, req) => {
  // Only protect routes if they match the pattern
  if (isProtectedRoute(req)) {
    try {
      auth().protect()
    } catch (error) {
      console.error("Auth protection failed:", error)
      // Let the request continue but log the error
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
