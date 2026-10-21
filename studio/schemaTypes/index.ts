import { program } from './program';
import { region } from './region';
import { venue } from './venue';
import { tryoutSession } from './tryoutSession';
import { recSession, futuresSession } from './sessions';
import { event } from './event';
import { siteSettings } from './siteSettings';
import { networkPage } from './networkPage';
import { staff } from './staff';
import { submission } from './submission';
import { futuresRegistration } from './futuresRegistration';
import { adultLeague } from './adultLeague';

export const schemaTypes = [tryoutSession, recSession, futuresSession, event, venue, staff, program, adultLeague, region, siteSettings, networkPage, submission, futuresRegistration];
