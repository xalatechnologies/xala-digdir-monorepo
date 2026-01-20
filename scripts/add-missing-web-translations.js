#!/usr/bin/env node
/**
 * Add missing translations for apps/web
 * Generated from i18n scanner on 2026-01-19
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const translationsPath = join(__dirname, 'packages/database-schema/seeds/platform/translations.json');
const translations = JSON.parse(readFileSync(translationsPath, 'utf-8'));

const tenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Default tenant

// Missing translations for apps/web
const webTranslations = [
  // Activity
  { key: 'activity.organizer', nb: 'Arrangør', en: 'Organizer' },
  { key: 'activity.events', nb: 'Aktiviteter', en: 'Events' },
  { key: 'activity.rentalHistory', nb: 'Utleiehistorikk', en: 'Rental History' },
  { key: 'activity.showingCount', nb: 'Viser {count} av {total}', en: 'Showing {count} of {total}' },

  // Status
  { key: 'status.completed', nb: 'Fullført', en: 'Completed' },
  { key: 'status.cancelled', nb: 'Avbrutt', en: 'Cancelled' },
  { key: 'status.pending', nb: 'Venter', en: 'Pending' },
  { key: 'status.paakrevd', nb: 'Påkrevd', en: 'Required' },

  // Booking
  { key: 'booking.selectTimeSlot', nb: 'Velg tidspunkt', en: 'Select time slot' },
  { key: 'booking.openingHours', nb: 'Åpningstider', en: 'Opening hours' },
  { key: 'booking.subtractThirtyMinutes', nb: 'Trekk fra 30 minutter', en: 'Subtract 30 minutes' },
  { key: 'booking.addThirtyMinutes', nb: 'Legg til 30 minutter', en: 'Add 30 minutes' },
  { key: 'booking.duration', nb: 'Varighet', en: 'Duration' },
  { key: 'booking.purpose', nb: 'Formål', en: 'Purpose' },
  { key: 'booking.purposePlaceholder', nb: 'Skriv inn formål...', en: 'Enter purpose...' },
  { key: 'booking.showPurposeInCalendar', nb: 'Vis formål i kalender', en: 'Show purpose in calendar' },
  { key: 'booking.attendees', nb: 'Deltakere', en: 'Attendees' },
  { key: 'booking.activityType', nb: 'Aktivitetstype', en: 'Activity type' },
  { key: 'booking.selectType', nb: 'Velg type', en: 'Select type' },
  { key: 'booking.activity.training', nb: 'Trening', en: 'Training' },
  { key: 'booking.activity.meeting', nb: 'Møte', en: 'Meeting' },
  { key: 'booking.activity.course', nb: 'Kurs', en: 'Course' },
  { key: 'booking.activity.event', nb: 'Arrangement', en: 'Event' },
  { key: 'booking.activity.other', nb: 'Annet', en: 'Other' },
  { key: 'booking.descriptionPlaceholder', nb: 'Skriv en beskrivelse...', en: 'Enter a description...' },
  { key: 'booking.fillRequiredFields', nb: 'Fyll ut alle påkrevde felt', en: 'Fill in all required fields' },
  { key: 'booking.confirmBooking', nb: 'Bekreft booking', en: 'Confirm booking' },
  { key: 'booking.opprettet', nb: 'Booking opprettet', en: 'Booking created' },
  { key: 'booking.mislyktes', nb: 'Booking mislyktes', en: 'Booking failed' },
  { key: 'booking.quote.total', nb: 'Totalt', en: 'Total' },
  { key: 'booking.additionalServices', nb: 'Tilleggstjenester', en: 'Additional services' },
  { key: 'booking.selectAvailableDates', nb: 'Velg tilgjengelige datoer', en: 'Select available dates' },
  { key: 'booking.priceGroup', nb: 'Prisgruppe', en: 'Price group' },
  { key: 'booking.priceGroupDescription', nb: 'Velg prisgruppe som passer', en: 'Select the appropriate price group' },
  { key: 'booking.canSelectMultiplePriceGroups', nb: 'Du kan velge flere prisgrupper', en: 'You can select multiple price groups' },
  { key: 'booking.perHour', nb: 'per time', en: 'per hour' },
  { key: 'booking.recommendedAddons', nb: 'Anbefalte tillegg', en: 'Recommended add-ons' },
  { key: 'booking.termsAndConditions', nb: 'Vilkår og betingelser', en: 'Terms and conditions' },
  { key: 'booking.readImportantTerms', nb: 'Les viktige vilkår', en: 'Read important terms' },
  { key: 'booking.acceptTermsLabel', nb: 'Jeg godtar vilkårene', en: 'I accept the terms' },
  { key: 'booking.selectedSlots', nb: 'Valgte tidspunkt', en: 'Selected slots' },
  { key: 'booking.removeTimeSlot', nb: 'Fjern tidspunkt', en: 'Remove time slot' },
  { key: 'booking.adjustTime', nb: 'Juster tid', en: 'Adjust time' },
  { key: 'booking.noSlotsSelected', nb: 'Ingen tidspunkt valgt', en: 'No slots selected' },
  { key: 'booking.totalPrice', nb: 'Totalpris', en: 'Total price' },
  { key: 'booking.selectTimeToSeePrice', nb: 'Velg tid for å se pris', en: 'Select time to see price' },
  { key: 'booking.recurring.endRecurrence', nb: 'Avslutt gjentakelse', en: 'End recurrence' },

  // Bookings mode
  { key: 'bookings.mode.single_slot', nb: 'Enkelt tidspunkt', en: 'Single slot' },
  { key: 'bookings.mode.in_game', nb: 'Inngangsbillett', en: 'In-game' },
  { key: 'bookings.mode.recurring', nb: 'Gjentakende', en: 'Recurring' },
  { key: 'bookings.mode.single_slot.description', nb: 'Book et enkelt tidspunkt', en: 'Book a single time slot' },
  { key: 'bookings.mode.in_game.description', nb: 'Kjøp inngangsbillett', en: 'Purchase entry ticket' },
  { key: 'bookings.mode.recurring.description', nb: 'Opprett gjentakende booking', en: 'Create recurring booking' },
  { key: 'bookings.time.minutes', nb: 'minutter', en: 'minutes' },
  { key: 'bookings.time.hours', nb: 'timer', en: 'hours' },

  // Common
  { key: 'common.close', nb: 'Lukk', en: 'Close' },
  { key: 'common.required', nb: 'Påkrevd', en: 'Required' },
  { key: 'common.description', nb: 'Beskrivelse', en: 'Description' },
  { key: 'common.optional', nb: 'Valgfritt', en: 'Optional' },
  { key: 'common.share', nb: 'Del', en: 'Share' },
  { key: 'common.cancel', nb: 'Avbryt', en: 'Cancel' },
  { key: 'common.or', nb: 'eller', en: 'or' },
  { key: 'common.goToHome', nb: 'Gå til forsiden', en: 'Go to home' },
  { key: 'common.tryAgain', nb: 'Prøv igjen', en: 'Try again' },
  { key: 'common.refreshStatus', nb: 'Oppdater status', en: 'Refresh status' },
  { key: 'common.showLess', nb: 'Vis mindre', en: 'Show less' },
  { key: 'common.showMore', nb: 'Vis mer', en: 'Show more' },
  { key: 'common.readFullTerms', nb: 'Les fullstendige vilkår', en: 'Read full terms' },
  { key: 'common.privacyPolicy', nb: 'Personvernerklæring', en: 'Privacy policy' },
  { key: 'common.text.velgBookingkontekst', nb: 'Velg bookingkontekst', en: 'Select booking context' },
  { key: 'common.text.formal', nb: 'Formål', en: 'Purpose' },
  { key: 'common.text.deltakere', nb: 'Deltakere', en: 'Participants' },
  { key: 'common.status.aktivitet', nb: 'Aktivitet', en: 'Activity' },
  { key: 'common.text.velgKalendersynlighet', nb: 'Velg kalendersynlighet', en: 'Select calendar visibility' },
  { key: 'common.text.velgAvslutningstype', nb: 'Velg avslutningstype', en: 'Select end type' },
  { key: 'common.basisdag_kan_ikke_fjernes', nb: 'Basisdag kan ikke fjernes', en: 'Base day cannot be removed' },
  { key: 'common.ikke_tillatt_for_dette', nb: 'Ikke tillatt for dette', en: 'Not allowed for this' },
  { key: 'common.universell_utforming', nb: 'Universell utforming', en: 'Universal design' },
  { key: 'common.sender_inn', nb: 'Sender inn...', en: 'Submitting...' },

  // Action
  { key: 'action.cancel', nb: 'Avbryt', en: 'Cancel' },
  { key: 'action.close', nb: 'Lukk', en: 'Close' },
  { key: 'action.back', nb: 'Tilbake', en: 'Back' },

  // Actions
  { key: 'actions.se_alle_bookinger', nb: 'Se alle bookinger', en: 'View all bookings' },
  { key: 'actions.endre_tidspunkt', nb: 'Endre tidspunkt', en: 'Change time' },
  { key: 'actions.book_valgte_tidspunkt', nb: 'Book valgte tidspunkt', en: 'Book selected slots' },
  { key: 'actions.hopp_over_denne_datoen', nb: 'Hopp over denne datoen', en: 'Skip this date' },
  { key: 'actions.angre_valg', nb: 'Angre valg', en: 'Undo selection' },

  // Calendar
  { key: 'calendar.selection.changed', nb: 'Valg endret', en: 'Selection changed' },
  { key: 'calendar.error.config', nb: 'Kalenderkonfigurasjonsfeil', en: 'Calendar configuration error' },
  { key: 'calendar.error.availability', nb: 'Kunne ikke hente tilgjengelighet', en: 'Could not fetch availability' },
  { key: 'calendar.empty', nb: 'Ingen aktiviteter', en: 'No activities' },

  // Listing
  { key: 'listing.faq', nb: 'Ofte stilte spørsmål', en: 'FAQ' },
  { key: 'listing.overview', nb: 'Oversikt', en: 'Overview' },
  { key: 'listing.rules', nb: 'Regler', en: 'Rules' },
  { key: 'listing.tabs', nb: 'Faner', en: 'Tabs' },
  { key: 'listing.contactInfo', nb: 'Kontaktinformasjon', en: 'Contact information' },
  { key: 'listing.contactPerson', nb: 'Kontaktperson', en: 'Contact person' },
  { key: 'listing.email', nb: 'E-post', en: 'Email' },
  { key: 'listing.phone', nb: 'Telefon', en: 'Phone' },
  { key: 'listing.closed', nb: 'Stengt', en: 'Closed' },
  { key: 'listing.openingHours', nb: 'Åpningstider', en: 'Opening hours' },
  { key: 'listing.specialDays', nb: 'Spesielle dager', en: 'Special days' },

  // Listings
  { key: 'listings.notFound', nb: 'Ikke funnet', en: 'Not found' },
  { key: 'listings.errorDescription', nb: 'En feil oppstod', en: 'An error occurred' },
  { key: 'listings.notFoundDescription', nb: 'Kunne ikke finne det du leter etter', en: 'Could not find what you are looking for' },
  { key: 'listings.backToOverview', nb: 'Tilbake til oversikt', en: 'Back to overview' },

  // Services
  { key: 'services.extraTime', nb: 'Ekstra tid', en: 'Extra time' },
  { key: 'services.extraTimeDesc', nb: 'Legg til ekstra tid', en: 'Add extra time' },
  { key: 'services.equipment', nb: 'Utstyr', en: 'Equipment' },
  { key: 'services.equipmentDesc', nb: 'Leie av utstyr', en: 'Equipment rental' },
  { key: 'services.caretaker', nb: 'Vaktmester', en: 'Caretaker' },
  { key: 'services.caretakerDesc', nb: 'Vaktmestertjenester', en: 'Caretaker services' },
  { key: 'services.security', nb: 'Sikkerhet', en: 'Security' },
  { key: 'services.securityDesc', nb: 'Sikkerhetstjenester', en: 'Security services' },

  // Overview
  { key: 'overview.description', nb: 'Beskrivelse', en: 'Description' },
  { key: 'overview.capacity.maxAllowed', nb: 'Maks tillatt', en: 'Max allowed' },
  { key: 'overview.capacity.people', nb: 'personer', en: 'people' },
  { key: 'overview.facilities', nb: 'Fasiliteter', en: 'Facilities' },
  { key: 'overview.additionalServices', nb: 'Tilleggstjenester', en: 'Additional services' },
  { key: 'overview.includedEquipment', nb: 'Inkludert utstyr', en: 'Included equipment' },
  { key: 'overview.highlights', nb: 'Høydepunkter', en: 'Highlights' },
  { key: 'overview.noInfo', nb: 'Ingen informasjon tilgjengelig', en: 'No information available' },

  // Payment
  { key: 'payment.description', nb: 'Betalingsbeskrivelse', en: 'Payment description' },
  { key: 'payment.invalidLink', nb: 'Ugyldig lenke', en: 'Invalid link' },
  { key: 'payment.missingOrderId', nb: 'Manglende ordre-ID', en: 'Missing order ID' },
  { key: 'payment.checkingStatus', nb: 'Sjekker status...', en: 'Checking status...' },
  { key: 'payment.pleaseWait', nb: 'Vennligst vent...', en: 'Please wait...' },
  { key: 'payment.failed', nb: 'Betaling feilet', en: 'Payment failed' },
  { key: 'payment.couldNotComplete', nb: 'Kunne ikke fullføre betaling', en: 'Could not complete payment' },
  { key: 'payment.orderId', nb: 'Ordre-ID', en: 'Order ID' },
  { key: 'payment.success', nb: 'Betaling vellykket', en: 'Payment successful' },
  { key: 'payment.amountApproved', nb: 'Beløp godkjent', en: 'Amount approved' },
  { key: 'payment.confirmationEmail', nb: 'Bekreftelse sendt på e-post', en: 'Confirmation sent by email' },
  { key: 'payment.processing', nb: 'Behandler betaling...', en: 'Processing payment...' },
  { key: 'payment.receivedProcessing', nb: 'Mottatt og behandles', en: 'Received and processing' },
  { key: 'payment.cancelled', nb: 'Betaling avbrutt', en: 'Payment cancelled' },
  { key: 'payment.cancelledDescription', nb: 'Betalingen ble avbrutt', en: 'The payment was cancelled' },

  // Rule
  { key: 'rule.payment', nb: 'Betalingsregler', en: 'Payment rules' },

  // Terms
  { key: 'terms.cancellationAndRefund', nb: 'Avbestilling og refusjon', en: 'Cancellation and refund' },
  { key: 'terms.damageResponsibility', nb: 'Skadeansvar', en: 'Damage responsibility' },
  { key: 'terms.houseRules', nb: 'Husregler', en: 'House rules' },

  // Validation
  { key: 'validation.required', nb: 'Dette feltet er påkrevd', en: 'This field is required' },
  { key: 'favorite', nb: 'Favoritt', en: 'Favorite' },

  // Months short
  { key: 'months.short.jan', nb: 'jan', en: 'Jan' },
  { key: 'months.short.feb', nb: 'feb', en: 'Feb' },
  { key: 'months.short.mar', nb: 'mar', en: 'Mar' },
  { key: 'months.short.apr', nb: 'apr', en: 'Apr' },
  { key: 'months.short.may', nb: 'mai', en: 'May' },
  { key: 'months.short.jun', nb: 'jun', en: 'Jun' },
  { key: 'months.short.jul', nb: 'jul', en: 'Jul' },
  { key: 'months.short.aug', nb: 'aug', en: 'Aug' },
  { key: 'months.short.sep', nb: 'sep', en: 'Sep' },
  { key: 'months.short.oct', nb: 'okt', en: 'Oct' },
  { key: 'months.short.nov', nb: 'nov', en: 'Nov' },
  { key: 'months.short.dec', nb: 'des', en: 'Dec' },

  // Months full
  { key: 'months.full.jan', nb: 'januar', en: 'January' },
  { key: 'months.full.feb', nb: 'februar', en: 'February' },
  { key: 'months.full.mar', nb: 'mars', en: 'March' },
  { key: 'months.full.apr', nb: 'april', en: 'April' },
  { key: 'months.full.may', nb: 'mai', en: 'May' },
  { key: 'months.full.jun', nb: 'juni', en: 'June' },
  { key: 'months.full.jul', nb: 'juli', en: 'July' },
  { key: 'months.full.aug', nb: 'august', en: 'August' },
  { key: 'months.full.sep', nb: 'september', en: 'September' },
  { key: 'months.full.oct', nb: 'oktober', en: 'October' },
  { key: 'months.full.nov', nb: 'november', en: 'November' },
  { key: 'months.full.dec', nb: 'desember', en: 'December' },

  // Weekdays
  { key: 'weekdays.monday', nb: 'mandag', en: 'Monday' },
  { key: 'weekdays.tuesday', nb: 'tirsdag', en: 'Tuesday' },
  { key: 'weekdays.wednesday', nb: 'onsdag', en: 'Wednesday' },
  { key: 'weekdays.thursday', nb: 'torsdag', en: 'Thursday' },
  { key: 'weekdays.friday', nb: 'fredag', en: 'Friday' },
  { key: 'weekdays.saturday', nb: 'lørdag', en: 'Saturday' },
  { key: 'weekdays.sunday', nb: 'søndag', en: 'Sunday' },

  // Weekday (singular)
  { key: 'weekday.sunday', nb: 'søndag', en: 'Sunday' },
  { key: 'weekday.monday', nb: 'mandag', en: 'Monday' },
  { key: 'weekday.tuesday', nb: 'tirsdag', en: 'Tuesday' },
  { key: 'weekday.wednesday', nb: 'onsdag', en: 'Wednesday' },
  { key: 'weekday.thursday', nb: 'torsdag', en: 'Thursday' },
  { key: 'weekday.friday', nb: 'fredag', en: 'Friday' },
  { key: 'weekday.saturday', nb: 'lørdag', en: 'Saturday' },

  // Time
  { key: 'time.justNow', nb: 'Akkurat nå', en: 'Just now' },
  { key: 'time.secondsAgo', nb: '{count} sekunder siden', en: '{count} seconds ago' },
  { key: 'time.minuteAgo', nb: '1 minutt siden', en: '1 minute ago' },
  { key: 'time.minutesAgo', nb: '{count} minutter siden', en: '{count} minutes ago' },
  { key: 'time.hourAgo', nb: '1 time siden', en: '1 hour ago' },
  { key: 'time.hoursAgo', nb: '{count} timer siden', en: '{count} hours ago' },
  { key: 'time.at', nb: 'kl.', en: 'at' },

  // Recurring pattern
  { key: 'recurringPattern.page.title', nb: 'Gjentakelsesmønster', en: 'Recurring Pattern' },
  { key: 'recurringPattern.frequency', nb: 'Frekvens', en: 'Frequency' },
  { key: 'recurringPattern.weekdays', nb: 'Ukedager', en: 'Weekdays' },
  { key: 'recurringPattern.daysSelected', nb: 'dager valgt', en: 'days selected' },
  { key: 'recurringPattern.timeSlot', nb: 'Tidspunkt', en: 'Time slot' },
  { key: 'recurringPattern.from', nb: 'Fra', en: 'From' },
  { key: 'recurringPattern.to', nb: 'Til', en: 'To' },
  { key: 'recurringPattern.duration', nb: 'Varighet', en: 'Duration' },
  { key: 'recurringPattern.endCondition', nb: 'Sluttbetingelse', en: 'End condition' },
  { key: 'recurringPattern.ends', nb: 'Slutter', en: 'Ends' },
  { key: 'recurringPattern.occurrences', nb: 'ganger', en: 'occurrences' },
  { key: 'recurringPattern.maxOccurrences', nb: 'Maks antall', en: 'Max occurrences' },
  { key: 'recurringPattern.endDate', nb: 'Sluttdato', en: 'End date' },
  { key: 'recurringPattern.summary', nb: 'Oppsummering', en: 'Summary' },
  { key: 'recurringPattern.everyWeek', nb: 'Hver uke', en: 'Every week' },
  { key: 'recurringPattern.everyMonth', nb: 'Hver måned', en: 'Every month' },
  { key: 'recurringPattern.onDays', nb: 'på', en: 'on' },
  { key: 'recurringPattern.timesPlural', nb: 'ganger', en: 'times' },
  { key: 'recurringPattern.times', nb: 'gang', en: 'time' },
  { key: 'recurringPattern.until', nb: 'til', en: 'until' },

  // Recurring preview
  { key: 'recurringPreview.noOccurrences', nb: 'Ingen forekomster', en: 'No occurrences' },
  { key: 'recurringPreview.page.title', nb: 'Forhåndsvisning', en: 'Preview' },
  { key: 'recurringPreview.occurrenceCount', nb: '{count} forekomster', en: '{count} occurrences' },
  { key: 'recurringPreview.availableCount', nb: '{count} tilgjengelig', en: '{count} available' },
  { key: 'recurringPreview.conflictCount', nb: '{count} konflikter', en: '{count} conflicts' },
  { key: 'recurringPreview.total', nb: 'Totalt', en: 'Total' },
  { key: 'recurringPreview.estimatedPrice', nb: 'Estimert pris', en: 'Estimated price' },
  { key: 'recurringPreview.selectAllAvailable', nb: 'Velg alle tilgjengelige', en: 'Select all available' },
  { key: 'recurringPreview.deselectAll', nb: 'Fjern alle valg', en: 'Deselect all' },
  { key: 'recurringPreview.selectedCount', nb: '{count} valgt', en: '{count} selected' },
  { key: 'recurringPreview.conflictWarning.titlePlural', nb: 'Konflikter funnet', en: 'Conflicts found' },
  { key: 'recurringPreview.conflictWarning.page.title', nb: 'Konfliktadvarsel', en: 'Conflict Warning' },
  { key: 'recurringPreview.conflictWarning.description', nb: 'Noen tidspunkt er ikke tilgjengelige', en: 'Some time slots are not available' },

  // Booking widget
  { key: 'bookingWidget.title', nb: 'Booking', en: 'Booking' },
  { key: 'bookingWidget.stepProgress', nb: 'Steg {current} av {total}', en: 'Step {current} of {total}' },
  { key: 'bookingWidget.error.missingListingId', nb: 'Mangler oppføring-ID', en: 'Missing listing ID' },
  { key: 'bookingWidget.error.bookingFailed', nb: 'Booking feilet', en: 'Booking failed' },
  { key: 'bookingWidget.error.timeOccupied', nb: 'Tidspunktet er opptatt', en: 'Time slot is occupied' },
  { key: 'bookingWidget.error.slotUnavailable', nb: 'Tidspunktet er utilgjengelig', en: 'Slot is unavailable' },
  { key: 'bookingWidget.info.selectedCount', nb: '{count} valgt', en: '{count} selected' },
  { key: 'bookingWidget.range.selectPeriod', nb: 'Velg periode', en: 'Select period' },
  { key: 'bookingWidget.range.selectPeriodDesc', nb: 'Velg start- og sluttdato', en: 'Select start and end date' },
  { key: 'bookingWidget.range.selectedPeriod', nb: 'Valgt periode', en: 'Selected period' },
  { key: 'bookingWidget.allDay.selectDays', nb: 'Velg dager', en: 'Select days' },
  { key: 'bookingWidget.allDay.selectDaysDesc', nb: 'Velg hvilke dager du vil booke', en: 'Select which days to book' },
  { key: 'bookingWidget.allDay.selectedDays', nb: 'Valgte dager', en: 'Selected days' },
  { key: 'bookingWidget.recurring.selectFirstTime', nb: 'Velg første tidspunkt', en: 'Select first time' },
  { key: 'bookingWidget.recurring.selectFirstTimeDesc', nb: 'Velg når gjentakende booking starter', en: 'Select when recurring booking starts' },
  { key: 'bookingWidget.today', nb: 'I dag', en: 'Today' },
  { key: 'bookingWidget.previousWeek', nb: 'Forrige uke', en: 'Previous week' },
  { key: 'bookingWidget.nextWeek', nb: 'Neste uke', en: 'Next week' },
  { key: 'bookingWidget.back', nb: 'Tilbake', en: 'Back' },
  { key: 'bookingWidget.recurring.generatePreview', nb: 'Generer forhåndsvisning', en: 'Generate preview' },
  { key: 'bookingWidget.recurring.backToPattern', nb: 'Tilbake til mønster', en: 'Back to pattern' },
  { key: 'bookingWidget.recurring.continueWith', nb: 'Fortsett med {count}', en: 'Continue with {count}' },
  { key: 'bookingWidget.season.page.title', nb: 'Sesongbooking', en: 'Season Booking' },
  { key: 'bookingWidget.season.description', nb: 'Book for hele sesongen', en: 'Book for the entire season' },
  { key: 'bookingWidget.season.goToPage', nb: 'Gå til sesongbooking', en: 'Go to season booking' },
  { key: 'bookingWidget.success.page.title', nb: 'Booking bekreftet', en: 'Booking Confirmed' },
  { key: 'bookingWidget.success.message', nb: 'Din booking er registrert', en: 'Your booking is registered' },
  { key: 'bookingWidget.submitting', nb: 'Sender...', en: 'Submitting...' },
  { key: 'bookingWidget.continueWithSlotsPlural', nb: 'Fortsett med {count} tidspunkt', en: 'Continue with {count} slots' },
  { key: 'bookingWidget.continueWithSlots', nb: 'Fortsett med {count} tidspunkt', en: 'Continue with {count} slot' },
  { key: 'bookingWidget.continueWithRange', nb: 'Fortsett med periode', en: 'Continue with range' },
  { key: 'bookingWidget.continueWithDays', nb: 'Fortsett med {count} dager', en: 'Continue with {count} days' },
  { key: 'bookingWidget.continueWithRecurring', nb: 'Fortsett med gjentakende', en: 'Continue with recurring' },
  { key: 'bookingWidget.selectTimeToContiue', nb: 'Velg tid for å fortsette', en: 'Select time to continue' },
  { key: 'bookingWidget.continueToConfirmation', nb: 'Fortsett til bekreftelse', en: 'Continue to confirmation' },
  { key: 'bookingWidget.continueToLogin', nb: 'Fortsett til innlogging', en: 'Continue to login' },
  { key: 'bookingWidget.loginToContinue', nb: 'Logg inn for å fortsette', en: 'Log in to continue' },
  { key: 'bookingWidget.sendRequest', nb: 'Send forespørsel', en: 'Send request' },
  { key: 'bookingWidget.done', nb: 'Ferdig', en: 'Done' },
  { key: 'bookingWidget.success.bookMore', nb: 'Book mer', en: 'Book more' },
  { key: 'bookingWidget.security.title', nb: 'Sikker betaling', en: 'Secure payment' },
  { key: 'bookingVisibility.page.title', nb: 'Kalendersynlighet', en: 'Calendar Visibility' },

  // Booking cart
  { key: 'bookingCart.page.title', nb: 'Handlekurv', en: 'Cart' },
  { key: 'bookingCart.empty.title', nb: 'Tom handlekurv', en: 'Empty cart' },
  { key: 'bookingCart.empty.page.title', nb: 'Ingen varer', en: 'No items' },
  { key: 'bookingCart.empty.description', nb: 'Legg til tidspunkt for å fortsette', en: 'Add time slots to continue' },
  { key: 'bookingCart.removeSlot', nb: 'Fjern', en: 'Remove' },
  { key: 'bookingCart.priceBreakdown', nb: 'Prisdetaljer', en: 'Price breakdown' },
  { key: 'bookingCart.subtotal', nb: 'Delsum', en: 'Subtotal' },
  { key: 'bookingCart.mva', nb: 'MVA', en: 'VAT' },
  { key: 'bookingCart.total', nb: 'Totalt', en: 'Total' },
  { key: 'bookingCart.priceIncludesMva', nb: 'Prisen inkluderer MVA', en: 'Price includes VAT' },

  // Auth
  { key: 'auth.demoLogin.errorName', nb: 'Navn er påkrevd', en: 'Name is required' },
  { key: 'auth.demoLogin.errorEmail', nb: 'Gyldig e-post er påkrevd', en: 'Valid email is required' },
  { key: 'auth.demoLogin.errorToken', nb: 'Token er påkrevd', en: 'Token is required' },
  { key: 'auth.demoLogin.errorInvalidToken', nb: 'Ugyldig token', en: 'Invalid token' },
  { key: 'auth.demoLogin.title', nb: 'Demo-innlogging', en: 'Demo Login' },
  { key: 'auth.demoLogin.formDescription', nb: 'Logg inn med demo-bruker', en: 'Log in with demo user' },
  { key: 'auth.demoLogin.nameLabel', nb: 'Navn', en: 'Name' },
  { key: 'auth.demoLogin.namePlaceholder', nb: 'Skriv inn navn', en: 'Enter name' },
  { key: 'auth.demoLogin.emailLabel', nb: 'E-post', en: 'Email' },
  { key: 'auth.demoLogin.emailPlaceholder', nb: 'Skriv inn e-post', en: 'Enter email' },
  { key: 'auth.demoLogin.tokenLabel', nb: 'Token', en: 'Token' },
  { key: 'auth.demoLogin.tokenPlaceholder', nb: 'Skriv inn token', en: 'Enter token' },
  { key: 'auth.demoLogin.tokenHint', nb: 'Bruk demo-token for testing', en: 'Use demo token for testing' },
  { key: 'auth.loggingIn', nb: 'Logger inn...', en: 'Logging in...' },
  { key: 'auth.demoLogin.submitButton', nb: 'Logg inn', en: 'Log in' },
  { key: 'auth.loginWithVipps', nb: 'Logg inn med Vipps', en: 'Log in with Vipps' },
  { key: 'auth.loginWithBankID', nb: 'Logg inn med BankID', en: 'Log in with BankID' },
  { key: 'auth.demoMode', nb: 'Demo-modus', en: 'Demo mode' },
  { key: 'auth.demoLoginButton', nb: 'Demo-innlogging', en: 'Demo login' },
  { key: 'auth.invalidToken', nb: 'Ugyldig token', en: 'Invalid token' },
  { key: 'auth.loginFailed', nb: 'Innlogging feilet', en: 'Login failed' },
  { key: 'auth.webPortal', nb: 'Brukerportal', en: 'User Portal' },
  { key: 'auth.webSubtitle', nb: 'Finn og book lokaler', en: 'Find and book venues' },
  { key: 'auth.webDescription', nb: 'Søk etter og book lokaler enkelt og raskt', en: 'Search and book venues easily and quickly' },
  { key: 'auth.easyBooking', nb: 'Enkel booking', en: 'Easy booking' },
  { key: 'auth.easyBookingDesc', nb: 'Book lokaler med noen få klikk', en: 'Book venues with a few clicks' },
  { key: 'auth.instantConfirmation', nb: 'Umiddelbar bekreftelse', en: 'Instant confirmation' },
  { key: 'auth.instantConfirmationDesc', nb: 'Få bekreftelse med en gang', en: 'Get confirmation immediately' },
  { key: 'auth.securePayment', nb: 'Sikker betaling', en: 'Secure payment' },
  { key: 'auth.securePaymentDesc', nb: 'Trygg betaling med Vipps', en: 'Safe payment with Vipps' },
  { key: 'auth.privacy', nb: 'Personvern', en: 'Privacy' },
  { key: 'auth.terms', nb: 'Vilkår', en: 'Terms' },
  { key: 'auth.contactSupport', nb: 'Kontakt support', en: 'Contact support' },

  // GDPR
  { key: 'gdpr.settings.tabsLabel', nb: 'Personverninnstillinger', en: 'Privacy settings' },
  { key: 'gdpr.settings.consentsTab', nb: 'Samtykker', en: 'Consents' },
  { key: 'gdpr.settings.requestsTab', nb: 'Forespørsler', en: 'Requests' },

  // Activity calendar
  { key: 'activityCalendar.page.title', nb: 'Aktivitetskalender', en: 'Activity Calendar' },
  { key: 'activityCalendar.page.description', nb: 'Oversikt over alle aktiviteter', en: 'Overview of all activities' },
  { key: 'activityCalendar.all', nb: 'Alle', en: 'All' },
  { key: 'activityCalendar.noActivities', nb: 'Ingen aktiviteter', en: 'No activities' },
  { key: 'activityCalendar.free', nb: 'Gratis', en: 'Free' },
  { key: 'activityCalendar.availability.full', nb: 'Fullt', en: 'Full' },
  { key: 'activityCalendar.availability.limited', nb: 'Begrenset', en: 'Limited' },
  { key: 'activityCalendar.availability.available', nb: 'Ledig', en: 'Available' },
  { key: 'activityCalendar.register', nb: 'Meld deg på', en: 'Register' },

  // Navigation
  { key: 'nav.home', nb: 'Hjem', en: 'Home' },
  { key: 'nav.listings', nb: 'Lokaler', en: 'Venues' },

  // Filter
  { key: 'filter.showingResults', nb: 'Viser {count} resultater', en: 'Showing {count} results' },
  { key: 'filter.showResults', nb: 'Vis resultater', en: 'Show results' },

  // Reviews
  { key: 'reviews.selectRating', nb: 'Velg vurdering', en: 'Select rating' },
  { key: 'form.reviews.placeholder', nb: 'Skriv din anmeldelse...', en: 'Write your review...' },

  // Accessibility
  { key: 'accessibility.skipToContent', nb: 'Hopp til hovedinnhold', en: 'Skip to main content' },

  // Norwegian standalone keys
  { key: 'dato', nb: 'Dato', en: 'Date' },
  { key: 'tidspunkt', nb: 'Tidspunkt', en: 'Time' },
  { key: 'status', nb: 'Status', en: 'Status' },
  { key: 'state.booked', nb: 'Booket', en: 'Booked' },
  { key: 'delvis.opprettet', nb: 'Delvis opprettet', en: 'Partially created' },
  { key: 'noen.datoer.kunne.ikke.bookes', nb: 'Noen datoer kunne ikke bookes', en: 'Some dates could not be booked' },
  { key: 'ingen.datoer.kunne.bookes', nb: 'Ingen datoer kunne bookes', en: 'No dates could be booked' },
  { key: 'årsak', nb: 'Årsak', en: 'Reason' },
  { key: 'bookinggebyr', nb: 'Bookinggebyr', en: 'Booking fee' },
  { key: 'betalingsmetode', nb: 'Betalingsmetode', en: 'Payment method' },
  { key: 'behandler', nb: 'Behandler', en: 'Processor' },
  { key: 'betal.med.vipps', nb: 'Betal med Vipps', en: 'Pay with Vipps' },
  { key: 'logg.inn.for.aa.fullfoere', nb: 'Logg inn for å fullføre', en: 'Log in to complete' },
  { key: 'for.aa.sende.bookingforespoersel', nb: 'For å sende bookingforespørsel', en: 'To send booking request' },
  { key: 'informasjon.behandles.sikkert', nb: 'Informasjonen behandles sikkert', en: 'Information is processed securely' },
  { key: 'hvordan.vil.du.booke', nb: 'Hvordan vil du booke?', en: 'How would you like to book?' },
  { key: 'velg.privatperson.eller.organisasjon', nb: 'Velg privatperson eller organisasjon', en: 'Select individual or organization' },
  { key: 'som.privatperson', nb: 'Som privatperson', en: 'As individual' },
  { key: 'booke.for.deg.selv', nb: 'Booke for deg selv', en: 'Book for yourself' },
  { key: 'paa.vegne.av.organisasjon', nb: 'På vegne av organisasjon', en: 'On behalf of organization' },
  { key: 'booke.for.organisasjon.du.representerer', nb: 'Booke for organisasjon du representerer', en: 'Book for organization you represent' },
  { key: 'du.ikke.tilknyttet.organisasjoner', nb: 'Du er ikke tilknyttet noen organisasjoner', en: 'You are not affiliated with any organizations' },
  { key: 'velg.organisasjon', nb: 'Velg organisasjon', en: 'Select organization' },
  { key: 'alle.områder', nb: 'Alle områder', en: 'All areas' },
  { key: 'lokaler', nb: 'Lokaler', en: 'Venues' },
  { key: 'filtrer', nb: 'Filtrer', en: 'Filter' },
  { key: 'type', nb: 'Type', en: 'Type' },
  { key: 'område', nb: 'Område', en: 'Area' },
  { key: 'kapasitet', nb: 'Kapasitet', en: 'Capacity' },
  { key: 'fasiliteter', nb: 'Fasiliteter', en: 'Facilities' },
  { key: 'søk.etter.lokaler', nb: 'Søk etter lokaler', en: 'Search for venues' },
];

let added = 0;

for (const item of webTranslations) {
  const existsNb = translations.some(t => t.key === item.key && t.language === 'nb');
  const existsEn = translations.some(t => t.key === item.key && t.language === 'en');
  
  if (!existsNb) {
    translations.push({
      tenantId,
      namespace: item.key.split('.')[0],
      key: item.key,
      language: 'nb',
      value: item.nb,
      isSystemDefault: true
    });
    added++;
  }
  
  if (!existsEn) {
    translations.push({
      tenantId,
      namespace: item.key.split('.')[0],
      key: item.key,
      language: 'en',
      value: item.en,
      isSystemDefault: true
    });
    added++;
  }
}

// Write back
writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf-8');

console.log(`✅ Added ${added} missing translations for apps/web`);
console.log(`📦 Total translations: ${translations.length}`);
