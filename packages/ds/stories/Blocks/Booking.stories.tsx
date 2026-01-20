import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Alert,
} from '@xala/ds';
import { BookingFormModal } from '../../src/blocks/BookingFormModal';
import { BookingConfirmation } from '../../src/blocks/BookingConfirmation';
import { BookingSuccess } from '../../src/blocks/BookingSuccess';
import { PriceSummaryCard } from '../../src/blocks/PriceSummaryCard';
import type { TimeSlot, BookingDetails, AdditionalService } from '../../src/types/listing-detail';

/**
 * Booking flow components for the rental object booking experience.
 *
 * ## Components
 * - **BookingFormModal**: Modal for collecting booking details
 * - **BookingConfirmation**: Review step before submission
 * - **BookingSuccess**: Success message after booking
 * - **PriceSummaryCard**: Price breakdown display
 *
 * ## Booking Flow
 * 1. User selects time slots on calendar
 * 2. BookingFormModal collects contact info and purpose
 * 3. BookingConfirmation shows summary for review
 * 4. BookingSuccess displays confirmation
 */
const meta: Meta<typeof BookingFormModal> = {
  title: 'Blocks/Booking',
  component: BookingFormModal,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Booking flow components for municipal rental object reservations.

## Typical Flow
1. User browses available time slots
2. Selects desired slots on the calendar
3. Opens BookingFormModal to fill in details
4. Reviews booking in BookingConfirmation
5. Sees BookingSuccess on completion

## Form Fields
- Contact information (name, email, phone)
- Purpose and activity type
- Number of attendees
- Special notes
- Terms acceptance
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookingFormModal>;

// =============================================================================
// Sample Data
// =============================================================================

const sampleTimeSlots: TimeSlot[] = [
  {
    id: 'slot-1',
    date: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    status: 'selected',
  },
  {
    id: 'slot-2',
    date: new Date(),
    startTime: '11:00',
    endTime: '12:00',
    status: 'selected',
  },
  {
    id: 'slot-3',
    date: new Date(),
    startTime: '12:00',
    endTime: '13:00',
    status: 'selected',
  },
];

const sampleServices: AdditionalService[] = [
  {
    id: 'av-equipment',
    name: 'AV-utstyr',
    description: 'Projektor, mikrofon, og høyttalere',
    price: 200,
    currency: 'NOK',
  },
  {
    id: 'catering',
    name: 'Kaffe/te-servering',
    description: 'Kaffe, te og kjeks for møtedeltakere',
    price: 150,
    currency: 'NOK',
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard-kit',
    description: 'Whiteboard med tusjer og magneter',
    price: 50,
    currency: 'NOK',
  },
];

const sampleBookingDetails: BookingDetails = {
  name: 'Ola Nordmann',
  email: 'ola@example.no',
  phone: '+47 123 45 678',
  purpose: 'Kvartalsmøte med teamet',
  showPurposeInCalendar: true,
  bookMultipleDays: false,
  numberOfPeople: 12,
  activityType: 'meeting',
  notes: 'Vi trenger god plass til workshop-øvelser.',
  acceptedTerms: true,
  organization: 'Nordmann AS',
};

// =============================================================================
// BookingFormModal Stories
// =============================================================================

/**
 * Default booking form modal
 */
export const FormModalDefault: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Åpne booking-skjema
        </Button>
        <BookingFormModal
          open={open}
          onClose={() => setOpen(false)}
          selectedSlots={sampleTimeSlots}
          listingName="Møterom 101 - Rådhuset"
          basePrice={450}
          currency="NOK"
          maxCapacity={20}
          onConfirm={(details) => {
            console.log('Booking confirmed:', details);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

/**
 * Booking form with additional services
 */
export const FormModalWithServices: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Åpne booking med tilleggstjenester
        </Button>
        <BookingFormModal
          open={open}
          onClose={() => setOpen(false)}
          selectedSlots={sampleTimeSlots}
          selectedServices={['av-equipment', 'catering']}
          availableServices={sampleServices}
          listingName="Konferansesal Fjord - Kulturhuset"
          basePrice={1200}
          currency="NOK"
          maxCapacity={50}
          onConfirm={(details) => {
            console.log('Booking with services:', details);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

/**
 * Free booking (no price)
 */
export const FormModalFreeBooking: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Book gratis lokale
        </Button>
        <BookingFormModal
          open={open}
          onClose={() => setOpen(false)}
          selectedSlots={sampleTimeSlots.slice(0, 1)}
          listingName="Frivillighetssentralen - Rom A"
          maxCapacity={10}
          onConfirm={(details) => {
            console.log('Free booking:', details);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

// =============================================================================
// BookingConfirmation Stories
// =============================================================================

/**
 * Booking confirmation review step
 */
export const ConfirmationDefault: Story = {
  render: () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
      <div style={{ maxWidth: '600px' }}>
        <BookingConfirmation
          bookingDetails={sampleBookingDetails}
          selectedSlots={sampleTimeSlots}
          listingName="Møterom 101 - Rådhuset"
          basePrice={450}
          currency="NOK"
          isSubmitting={isSubmitting}
          onBack={() => console.log('Go back')}
          onConfirm={() => {
            setIsSubmitting(true);
            setTimeout(() => setIsSubmitting(false), 2000);
          }}
        />
      </div>
    );
  },
};

/**
 * Confirmation with additional services
 */
export const ConfirmationWithServices: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <BookingConfirmation
        bookingDetails={sampleBookingDetails}
        selectedSlots={sampleTimeSlots}
        selectedServices={['av-equipment', 'catering']}
        availableServices={sampleServices}
        listingName="Konferansesal Fjord"
        basePrice={1200}
        currency="NOK"
        onBack={() => console.log('Go back')}
        onConfirm={() => console.log('Confirm')}
      />
    </div>
  ),
};

/**
 * Confirmation submitting state
 */
export const ConfirmationSubmitting: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <BookingConfirmation
        bookingDetails={sampleBookingDetails}
        selectedSlots={sampleTimeSlots}
        listingName="Møterom 101"
        basePrice={450}
        isSubmitting={true}
        onBack={() => {}}
        onConfirm={() => {}}
      />
    </div>
  ),
};

// =============================================================================
// BookingSuccess Stories
// =============================================================================

/**
 * Booking success screen
 */
export const SuccessDefault: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Card>
        <BookingSuccess
          bookingReference="BK-2026-001234"
          bookingDetails={sampleBookingDetails}
          listingName="Møterom 101 - Rådhuset"
          venueEmail="booking@kommune.no"
          venuePhone="+47 22 33 44 55"
          onBackToListing={() => console.log('Back to listing')}
          onNewBooking={() => console.log('New booking')}
        />
      </Card>
    </div>
  ),
};

/**
 * Success without reference number
 */
export const SuccessNoReference: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Card>
        <BookingSuccess
          bookingDetails={sampleBookingDetails}
          listingName="Frivillighetssentralen"
          venueEmail="info@frivillig.no"
          onBackToListing={() => console.log('Back')}
        />
      </Card>
    </div>
  ),
};

/**
 * Success minimal (no contact info)
 */
export const SuccessMinimal: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Card>
        <BookingSuccess
          bookingReference="REF-789"
          bookingDetails={sampleBookingDetails}
          listingName="Utleielokale"
          onBackToListing={() => console.log('Back')}
        />
      </Card>
    </div>
  ),
};

// =============================================================================
// PriceSummaryCard Stories (if component exists)
// =============================================================================

/**
 * Price summary with breakdown
 */
export const PriceSummary: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Prissammendrag
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              3 timer × 450 kr
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>1 350 kr</Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              AV-utstyr
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>+200 kr</Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Kaffe/te-servering
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>+150 kr</Paragraph>
          </div>

          <div style={{
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            paddingTop: 'var(--ds-spacing-3)',
            marginTop: 'var(--ds-spacing-2)',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
              Totalt
            </Paragraph>
            <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-accent-base-default)' }}>
              1 700 kr
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  ),
};

// =============================================================================
// Complete Booking Flow Demo
// =============================================================================

/**
 * Complete booking flow demonstration
 */
export const CompleteBookingFlow: Story = {
  render: () => {
    const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
    const [formOpen, setFormOpen] = useState(false);
    const [details, setDetails] = useState<BookingDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormConfirm = (bookingDetails: BookingDetails) => {
      setDetails(bookingDetails);
      setFormOpen(false);
      setStep('confirm');
    };

    const handleFinalConfirm = () => {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep('success');
      }, 1500);
    };

    const resetFlow = () => {
      setStep('form');
      setDetails(null);
    };

    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Booking Flow Demo
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Current step: <strong>{step}</strong>
          </Paragraph>
        </div>

        {step === 'form' && (
          <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
            <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Steg 1: Fyll ut booking-skjema
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg tidsrom og fyll ut kontaktinformasjon
            </Paragraph>
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              Start booking
            </Button>
            <BookingFormModal
              open={formOpen}
              onClose={() => setFormOpen(false)}
              selectedSlots={sampleTimeSlots}
              listingName="Møterom 101 - Rådhuset"
              basePrice={450}
              maxCapacity={20}
              onConfirm={handleFormConfirm}
            />
          </Card>
        )}

        {step === 'confirm' && details && (
          <BookingConfirmation
            bookingDetails={details}
            selectedSlots={sampleTimeSlots}
            listingName="Møterom 101 - Rådhuset"
            basePrice={450}
            isSubmitting={isSubmitting}
            onBack={() => setStep('form')}
            onConfirm={handleFinalConfirm}
          />
        )}

        {step === 'success' && details && (
          <Card>
            <BookingSuccess
              bookingReference="BK-2026-DEMO"
              bookingDetails={details}
              listingName="Møterom 101 - Rådhuset"
              venueEmail="booking@kommune.no"
              venuePhone="+47 22 33 44 55"
              onBackToListing={resetFlow}
              onNewBooking={resetFlow}
            />
          </Card>
        )}

        {step !== 'form' && (
          <div style={{ marginTop: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Button variant="tertiary" onClick={resetFlow}>
              Tilbakestill demo
            </Button>
          </div>
        )}
      </div>
    );
  },
};

// =============================================================================
// Error States
// =============================================================================

/**
 * Booking form validation errors
 */
export const FormValidationErrors: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Alert data-color="danger" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <strong>Booking feilet</strong>
        <br />
        Vennligst rett feilene nedenfor og prøv igjen.
      </Alert>
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Feilmeldinger demonstrasjon
        </Heading>
        <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)', color: 'var(--ds-color-danger-text-default)' }}>
          <li>Navn er påkrevd</li>
          <li>Ugyldig e-postadresse</li>
          <li>Telefon er påkrevd</li>
          <li>Du må godkjenne vilkårene</li>
        </ul>
      </Card>
    </div>
  ),
};
