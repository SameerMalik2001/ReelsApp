import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!

export async function middleware(req: NextRequest) {
  // Allow public routes without authentication
  const publicRoutes = ["/api/register/user", "/api/sendOtp/otp", "/api/validateOtp/otp"];
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Get token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "you are unauthorized bro" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  
  try {
    // Verify the token
    console.log(token, SECRET_KEY);
    const decoded = jwt.verify(token, SECRET_KEY);
    const res = NextResponse.next();
    // res.headers.set("x-user", JSON.stringify(decoded));
    // return res;
  } catch (error) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

// Apply middleware only to API routes
export const config = {
  matcher: "/api/:path*"
};
