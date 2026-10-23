// Where the Studio runs: the deployed Studio and `sanity dev` on this computer. The only other
// sites allowed to call the server routes, and only /api/broadcast/ (see src/middleware.ts).
export const STUDIO_ORIGINS = ['https://utah-athletic.sanity.studio', 'http://localhost:3333'];
