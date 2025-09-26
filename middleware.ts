// middleware.ts (in your project root)
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Do nothing, just protect routes
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }
        return true
      },
    },
    // Do NOT set a custom signIn page here
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    // Add other protected routes here
  ]
}