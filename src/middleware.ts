import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  clockSkewInMs: process.env.NODE_ENV === "development" ? 60000 : 5000,
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Run for API routes except for webhooks
    '/api((?!/webhooks).*)',
  ],
};