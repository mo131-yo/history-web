import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

type AppMiddleware = (...args: any[]) => any;

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/atlas(.*)',
  '/api/clerk',
  '/api/env-check',
  '/api/clerk-check',
]);

const middleware: AppMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export default middleware;

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
