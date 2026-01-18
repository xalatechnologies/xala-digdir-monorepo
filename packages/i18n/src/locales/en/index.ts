/**
 * EN Translations Index
 * Auto-generated - do not edit manually
 */
import coreNested from './core.json';
import common from './common.json';
import allTranslationsNested from './all-translations.json';

// Flatten nested JSON objects to dot-notation keys
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  return result;
}

const core = flatten(coreNested);
const allTranslations = flatten(allTranslationsNested);
import nav from './nav.json';
import auth from './auth.json';
import dashboard from './dashboard.json';
import listings from './listings.json';
import calendar from './calendar.json';
import days from './days.json';
import bookings from './bookings.json';
import messages from './messages.json';
import reports from './reports.json';
import organizations from './organizations.json';
import users from './users.json';
import settings from './settings.json';
import seasons from './seasons.json';
import requests from './requests.json';
import tenantAdmin from './tenantAdmin.json';
import saasAdmin from './saasAdmin.json';
import security from './security.json';
import form from './form.json';
import status from './status.json';
import payment from './payment.json';
import rentalObjects from './rentalObjects.json';
import validation from './validation.json';
import docs from './docs.json';
import help from './help.json';
import integrations from './integrations.json';
import misc from './misc.json';

export const en = {
  // Comprehensive translations from database (14,683 keys)
  ...allTranslations,
  
  // Global/Common namespaces (exposed without prefix)
  ...core,
  ...common,
  ...misc,

  // Namespaced access
  ...Object.fromEntries(Object.entries(core).map(([k, v]) => [`core.${k}`, v])),
  ...Object.fromEntries(Object.entries(common).map(([k, v]) => [`common.${k}`, v])),
  ...Object.fromEntries(Object.entries(nav).map(([k, v]) => [`nav.${k}`, v])),
  ...Object.fromEntries(Object.entries(auth).map(([k, v]) => [`auth.${k}`, v])),
  ...Object.fromEntries(Object.entries(dashboard).map(([k, v]) => [`dashboard.${k}`, v])),
  ...Object.fromEntries(Object.entries(listings).map(([k, v]) => [`listings.${k}`, v])),
  ...Object.fromEntries(Object.entries(calendar).map(([k, v]) => [`calendar.${k}`, v])),
  ...Object.fromEntries(Object.entries(days).map(([k, v]) => [`days.${k}`, v])),
  ...Object.fromEntries(Object.entries(bookings).map(([k, v]) => [`bookings.${k}`, v])),
  ...Object.fromEntries(Object.entries(messages).map(([k, v]) => [`messages.${k}`, v])),
  ...Object.fromEntries(Object.entries(reports).map(([k, v]) => [`reports.${k}`, v])),
  ...Object.fromEntries(Object.entries(organizations).map(([k, v]) => [`organizations.${k}`, v])),
  ...Object.fromEntries(Object.entries(users).map(([k, v]) => [`users.${k}`, v])),
  ...Object.fromEntries(Object.entries(settings).map(([k, v]) => [`settings.${k}`, v])),
  ...Object.fromEntries(Object.entries(seasons).map(([k, v]) => [`seasons.${k}`, v])),
  ...Object.fromEntries(Object.entries(requests).map(([k, v]) => [`requests.${k}`, v])),
  ...Object.fromEntries(Object.entries(tenantAdmin).map(([k, v]) => [`tenantAdmin.${k}`, v])),
  ...Object.fromEntries(Object.entries(saasAdmin).map(([k, v]) => [`saasAdmin.${k}`, v])),
  ...Object.fromEntries(Object.entries(security).map(([k, v]) => [`security.${k}`, v])),
  ...Object.fromEntries(Object.entries(form).map(([k, v]) => [`form.${k}`, v])),
  ...Object.fromEntries(Object.entries(status).map(([k, v]) => [`status.${k}`, v])),
  ...Object.fromEntries(Object.entries(payment).map(([k, v]) => [`payment.${k}`, v])),
  ...Object.fromEntries(Object.entries(rentalObjects).map(([k, v]) => [`rentalObjects.${k}`, v])),
  ...Object.fromEntries(Object.entries(validation).map(([k, v]) => [`validation.${k}`, v])),
  ...Object.fromEntries(Object.entries(docs).map(([k, v]) => [`docs.${k}`, v])),
  ...Object.fromEntries(Object.entries(help).map(([k, v]) => [`help.${k}`, v])),
  ...Object.fromEntries(Object.entries(integrations).map(([k, v]) => [`integrations.${k}`, v])),
  ...Object.fromEntries(Object.entries(misc).map(([k, v]) => [`misc.${k}`, v])),
};
