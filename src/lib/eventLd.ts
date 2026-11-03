// schema.org SportsEvent for a tournament session (/events and each hosted event page), so Google
// can show its dates, place and price.
type Session = { label: string; start: string; end: string; location: string; geo: { lat: number; lng: number } | null; fees: { label: string; price: number }[]; registerUrl: string | null; regOpen: string; full: boolean };
type Event = { name: string; tagline: string; href: string; logo?: { src: string } };

export function sportsEvent(e: Event, s: Session, site: URL, organizer: object) {
  const url = new URL(e.href, site).href;
  return {
    '@context': 'https://schema.org', '@type': 'SportsEvent', name: `${e.name} ${s.label}`.trim(), description: e.tagline, sport: 'Soccer',
    startDate: s.start, endDate: s.end, eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: s.location, address: s.location, ...(s.geo ? { geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng } } : {}) },
    url, organizer, ...(e.logo ? { image: e.logo.src } : {}),
    ...(s.fees.length ? {
      offers: s.fees.map((f) => ({
        '@type': 'Offer', name: f.label, price: f.price, priceCurrency: 'USD', url: s.registerUrl ?? url, validFrom: s.regOpen,
        availability: s.full ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      })),
    } : {}),
  };
}
