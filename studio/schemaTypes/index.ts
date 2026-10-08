import { program } from './program';
import { region } from './region';
import { venue } from './venue';
import { tryoutSession } from './tryoutSession';
import { season } from './season';
import { event } from './event';
import { siteSettings } from './siteSettings';

export const schemaTypes = [tryoutSession, season, event, venue, program, region, siteSettings];
