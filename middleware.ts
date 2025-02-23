import withAuth from "next-auth/middleware";

import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {

    return NextResponse.next();
  },
  {
    callbacks : {
      authorized: ({token, req}) => {
        const {pathname} = req.nextUrl;
        if(
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/login") ||
          pathname.startsWith("/api/register")
        ) {
          return true
        }

        return !!token;
      }
    }
  }
)

export const config = {
  matcher: [
    "/((?!^/api/auth|^/api/login|^/api/register|^/images|^/favicon.ico|^/_next/static|^/_next/image|^/public).*)"
  ]
}
