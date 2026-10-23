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
import { emailBroadcast } from './emailBroadcast';
import { pageContact, pageEvents, pageFutures, pageHome, pageTryouts } from './pages';

export const schemaTypes = [tryoutSession, recSession, futuresSession, event, venue, staff, program, adultLeague, region, siteSettings, pageHome, pageTryouts, pageEvents, pageContact, pageFutures, networkPage, submission, futuresRegistration, emailBroadcast];
