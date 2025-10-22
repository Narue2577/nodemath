// middleware.ts (in your project root)
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // ไม่ต้องทำอะไรเพิ่มเติม
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicRoutes = ["/", "/auth/register"];
        const isPublic = publicRoutes.includes(req.nextUrl.pathname);

        // อนุญาตให้เข้าถึงหน้าแรก (/) และหน้าลงทะเบียน (/auth/register) ได้ทั่วไป
        if (isPublic) {
          return true;
        }

        // บังคับให้ Login ก่อนเข้าถึงหน้าอื่นๆ
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    // เพิ่ม route ที่ต้องการ Login ที่นี่
  ],
};
/*import { withAuth } from "next-auth/middleware"

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
} */