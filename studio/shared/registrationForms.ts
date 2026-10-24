// The registration forms families fill in on the website, so waivers can be required for them
// (Studio > Waivers > Required for). Futures registers on the site today; when another program
// starts, add its form here and show the waivers on its form (see FuturesRegister.jsx and
// src/pages/api/futures/checkout.ts). Values are saved in Sanity: never rename one.
export const REGISTRATION_FORMS = [
  { value: 'futures', title: 'Futures registration' },
] as const;
