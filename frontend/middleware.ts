export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/budgets/:path*",
    "/reports/:path*",
    "/workspace/:path*",
    "/split-bills/:path*",
    "/admin/:path*",
  ],
};
