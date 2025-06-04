import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  clockSkewInMs: process.env.NODE_ENV === "development" ? 60000 : 5000,
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|(?:embed)(?:$|/)|api/(?:embed-styles|public|webhooks)).*)",
  ],
};