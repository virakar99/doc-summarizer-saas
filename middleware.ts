import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/api/webhook", "/pricing", "/about", "/contact"],
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
