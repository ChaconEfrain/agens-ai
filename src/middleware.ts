import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/((?!_next|.*\\..*|(?:embed)(?:$|/)|api/(?:embed-styles|public|webhooks)).*)",
]);

export default clerkMiddleware(
  (_, req) => {
    if (!isProtectedRoute(req)) return NextResponse.next();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (
      process.env.NODE_ENV === "production" &&
      !process.env.ALLOWED_IPS?.split(",").includes(ip)
    ) {
      return new NextResponse("Coming soon", { status: 403 });
    }

    return NextResponse.next();
  },
  {
    clockSkewInMs: process.env.NODE_ENV === "development" ? 60000 : 5000,
  }
);

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|(?:embed)(?:$|/)|api/(?:embed-styles|public|webhooks)).*)",
  ],
};
