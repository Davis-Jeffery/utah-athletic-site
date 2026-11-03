// /sitemap.xml: every public page, for search engines. Built with the site, so new programs,
// regions, adult leagues and hosted tournament pages appear automatically. Region pages for a program that isn't offered
// there are left out (they only point to another region); so is the payment thank-you page.
import type { APIRoute } from 'astro';
import { ORDER, REGION_ORDER } from '../data/site';
import { loadEventPages, loadSite } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const data = await loadSite();
  const events = await loadEventPages();
  const paths = [
    '/', ...ORDER.map((k) => `/${k}/`),
    ...ORDER.flatMap((k) => REGION_ORDER.filter((r) => data.programs.find((p) => p.id === k)!.regions[r].status !== 'none').map((r) => `/${k}/${r}/`)),
    ...data.adult.map((a) => a.href), '/tryouts/', '/events/', '/network/', '/contact/', '/futures/register/',
    // Hosted tournament pages and their rules.
    ...events.flatMap((e) => [`/events/${e.slug}/`, ...(e.rules.length ? [`/events/${e.slug}/rules/`] : [])]),
  ];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc><lastmod>${data.builtOn}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
