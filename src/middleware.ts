// Blocks POSTs (and other writes) to the server routes from other websites, like Astro's built-in
// security.checkOrigin, which is switched off in astro.config.mjs because it can't make exceptions.
// The one exception: the Studio sends group emails through /api/broadcast/ from its own address.
// Stripe's webhook sends no Origin header, so it passes, as it did before.
import { defineMiddleware } from 'astro:middleware';
import { STUDIO_ORIGINS } from './lib/server/origins';

const SAFE = ['GET', 'HEAD', 'OPTIONS'];

export const onRequest = defineMiddleware((context, next) => {
  const { request, url, isPrerendered } = context;
  if (isPrerendered || SAFE.includes(request.method)) return next();
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  const crossSite = site ? !['same-origin', 'none'].includes(site) : !!origin && origin !== url.origin;
  if (crossSite && !(url.pathname === '/api/broadcast/' && origin && STUDIO_ORIGINS.includes(origin))) {
    return new Response(`Cross-site ${request.method} requests are forbidden`, { status: 403 });
  }
  return next();
});
