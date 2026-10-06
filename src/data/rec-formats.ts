// Rec program play formats by division. Edit here and the Rec page updates.
// Decisions to date are logged in docs/rec-program-plan.md.

export interface RecDivision {
  division: string;
  format: string;
  keepers: boolean;
  field: string; // yards, width x length
  goals: string; // feet, height x width
  ball: number;
  roster: string;
  referees: string;
  notes?: string;
}

export const REC_DIVISIONS: RecDivision[] = [
  {
    division: 'U5',
    format: '3v3',
    keepers: false,
    field: '20 x 25',
    goals: '4 x 6',
    ball: 3,
    roster: '5 to 7',
    referees: 'None. Coaches guide play on the field.',
  },
  {
    division: 'U6',
    format: '3v3',
    keepers: false,
    field: '20 x 25',
    goals: '4 x 6',
    ball: 3,
    roster: '5 to 7',
    referees: 'None. Coaches guide play on the field.',
  },
  {
    division: 'U7',
    format: '4v4',
    keepers: false,
    field: '25 x 35',
    goals: '6 x 12',
    ball: 3,
    roster: '7',
    referees: 'None. Field coordinator runs the game.',
  },
  {
    division: 'U8',
    format: '4v4',
    keepers: false,
    field: '30 x 40',
    goals: '6 x 12',
    ball: 3,
    roster: '7',
    referees: 'None. Field coordinator runs the game.',
  },
  {
    division: 'U9',
    format: '4v4',
    keepers: false,
    field: '30 x 40',
    goals: '6 x 12',
    ball: 4,
    roster: '7',
    referees: 'None. Field coordinator runs the game.',
  },
];

// Rules shared by every U5 to U9 game.
export const REC_GAME_RULES: string[] = [
  'Everyone plays: lines change on a timed horn, so playing time is equal.',
  'No goalkeepers. A no-entry crease in front of each goal keeps play moving.',
  'Kick-ins instead of throw-ins. No offside. No heading.',
  'Goals count from the attacking half (U7 to U9).',
  'Waiting players keep a ball at their feet on the sideline.',
];

// Shown on the registration section so families know the policy up front.
export const COMBINING_POLICY =
  "Divisions are formed by age group. If a division doesn't have enough players for a full league, players may be combined with the next older age group. Players will never be placed in a younger division. Final divisions are confirmed two weeks before the season starts.";

export const FORMAT_INSPIRATION =
  'Our formats are modeled on the youth systems of Germany and the Netherlands: small-sided games, no keepers, and as many touches and goals as possible.';
