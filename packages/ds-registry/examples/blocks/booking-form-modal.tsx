import React from 'react';
import { BookingFormModal, Button } from '@xala/ds';
import type { TimeSlot, BookingDetails, AdditionalService } from '@xala/ds/types/listing-detail';

/**
 * BookingFormModal Component Examples
 *
 * NOTE: The BookingFormModal component is used to book rental objects (spaces, resources, vehicles, events).
 * The prop "listingName" is a legacy name - it refers to the rental object's name.
 * When integrating with the SDK, use "rentalObjectId" in booking payloads.
 */

/**
 * Example 1: Basic BookingFormModal
 *
 * The simplest way to use BookingFormModal with minimal required props.
 * Shows a basic booking form for a rental object time slot.
 */
export function BasicBookingFormModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedSlots: TimeSlot[] = [
    {
      date: '2024-12-15',
      startTime: '10:00',
      endTime: '11:00',
      available: true,
      price: 450
    }
  ];

  const handleConfirm = (details: BookingDetails) => {
    console.log('Booking confirmed:', details);
    setIsOpen(false);
    alert(`Booking bekreftet for ${details.name}`);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Åpne bookingskjema
      </Button>
      <BookingFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedSlots={selectedSlots}
        listingName="Møterom 101"
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Example 2: BookingFormModal with Pricing
 *
 * Shows booking form with price calculation based on time slots and services.
 * Displays total cost to the user before confirmation.
 */
export function BookingFormModalWithPricing() {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedSlots: TimeSlot[] = [
    {
      date: '2024-12-15',
      startTime: '10:00',
      endTime: '11:00',
      available: true,
      price: 450
    },
    {
      date: '2024-12-15',
      startTime: '11:00',
      endTime: '12:00',
      available: true,
      price: 450
    }
  ];

  const handleConfirm = (details: BookingDetails) => {
    console.log('Booking confirmed with pricing:', details);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Book med prising (2 timer)
      </Button>
      <BookingFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedSlots={selectedSlots}
        listingName="Konferanserom Bergen"
        basePrice={450}
        currency="NOK"
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Example 3: BookingFormModal with Additional Services
 *
 * Demonstrates booking form with optional additional services.
 * Users can select extra services that affect the total price.
 */
export function BookingFormModalWithServices() {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedSlots: TimeSlot[] = [
    {
      date: '2024-12-15',
      startTime: '14:00',
      endTime: '16:00',
      available: true,
      price: 500
    }
  ];

  const additionalServices: AdditionalService[] = [
    {
      id: 'service-1',
      name: 'Kaffe og te',
      description: 'Inkluderer kaffe, te og kjeks',
      price: 150,
      category: 'catering'
    },
    {
      id: 'service-2',
      name: 'Projektor',
      description: 'Profesjonell projektor med HDMI',
      price: 200,
      category: 'equipment'
    },
    {
      id: 'service-3',
      name: 'Whiteboard',
      description: 'Stort whiteboard med tusjer',
      price: 50,
      category: 'equipment'
    }
  ];

  const handleConfirm = (details: BookingDetails) => {
    console.log('Booking confirmed with services:', details);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Book med tilleggstjenester
      </Button>
      <BookingFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedSlots={selectedSlots}
        availableServices={additionalServices}
        selectedServices={['service-1']}
        listingName="Studio Lydopptak"
        basePrice={500}
        currency="NOK"
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Example 4: BookingFormModal with Capacity Limit
 *
 * Shows booking form with maximum capacity constraint.
 * Validates that number of people doesn't exceed venue capacity.
 */
export function BookingFormModalWithCapacity() {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedSlots: TimeSlot[] = [
    {
      date: '2024-12-20',
      startTime: '18:00',
      endTime: '22:00',
      available: true,
      price: 2000
    }
  ];

  const handleConfirm = (details: BookingDetails) => {
    console.log('Booking confirmed with capacity check:', details);
    setIsOpen(false);
    alert(`Booking for ${details.numberOfPeople} personer bekreftet`);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Book med kapasitetsbegrensning
      </Button>
      <BookingFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedSlots={selectedSlots}
        listingName="Idrettshall Vollene"
        basePrice={2000}
        currency="NOK"
        maxCapacity={50}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Example 5: Multi-Day Booking
 *
 * Demonstrates booking form with multiple days selected.
 * Shows how time slots are formatted when spanning multiple dates.
 */
export function MultiDayBookingFormModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedSlots: TimeSlot[] = [
    {
      date: '2024-12-15',
      startTime: '09:00',
      endTime: '17:00',
      available: true,
      price: 3000
    },
    {
      date: '2024-12-16',
      startTime: '09:00',
      endTime: '17:00',
      available: true,
      price: 3000
    },
    {
      date: '2024-12-17',
      startTime: '09:00',
      endTime: '17:00',
      available: true,
      price: 3000
    }
  ];

  const handleConfirm = (details: BookingDetails) => {
    console.log('Multi-day booking confirmed:', details);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Book flere dager
      </Button>
      <BookingFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedSlots={selectedSlots}
        listingName="Konferansesenter"
        basePrice={3000}
        currency="NOK"
        maxCapacity={30}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Example 6: Complete Booking Flow
 *
 * Full booking example showing integration with calendar selection.
 * Demonstrates the complete user journey from slot selection to confirmation.
 */
export function CompleteBookingFlow() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedSlots, setSelectedSlots] = React.useState<TimeSlot[]>([]);

  // Simulate time slot selection from calendar
  const handleSelectSlots = () => {
    const slots: TimeSlot[] = [
      {
        date: '2024-12-18',
        startTime: '10:00',
        endTime: '11:00',
        available: true,
        price: 450
      },
      {
        date: '2024-12-18',
        startTime: '11:00',
        endTime: '12:00',
        available: true,
        price: 450
      }
    ];
    setSelectedSlots(slots);
    setIsModalOpen(true);
  };

  const handleConfirm = (details: BookingDetails) => {
    console.log('Complete booking confirmed:', {
      slots: selectedSlots,
      details
    });
    setIsModalOpen(false);
    setSelectedSlots([]);

    // In real app, this would call SDK booking service
    alert(`Booking fullført!\nNavn: ${details.name}\nE-post: ${details.email}\nFormål: ${details.purpose}`);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedSlots([]);
  };

  return (
    <div>
      <Button onClick={handleSelectSlots}>
        Velg tidspunkter og book
      </Button>
      {selectedSlots.length > 0 && (
        <p style={{ marginTop: '12px', color: 'var(--ds-color-neutral-text-default)' }}>
          {selectedSlots.length} tidspunkt valgt
        </p>
      )}
      <BookingFormModal
        open={isModalOpen}
        onClose={handleCancel}
        selectedSlots={selectedSlots}
        listingName="Møterom A"
        basePrice={450}
        currency="NOK"
        maxCapacity={8}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Example 7: Event Booking with Organization
 *
 * Booking form for events requiring organization information.
 * Useful for workshops, courses, or large gatherings.
 */
export function EventBookingFormModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedSlots: TimeSlot[] = [
    {
      date: '2024-12-22',
      startTime: '09:00',
      endTime: '16:00',
      available: true,
      price: 5000
    }
  ];

  const services: AdditionalService[] = [
    {
      id: 'lunch',
      name: 'Lunsj for deltakere',
      description: 'Inkludert lunsj for alle deltakere',
      price: 200,
      category: 'catering'
    },
    {
      id: 'materials',
      name: 'Kursmateriale',
      description: 'Digitalt og fysisk kursmateriale',
      price: 150,
      category: 'materials'
    }
  ];

  const handleConfirm = (details: BookingDetails) => {
    console.log('Event booking confirmed:', details);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Book arrangement
      </Button>
      <BookingFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedSlots={selectedSlots}
        availableServices={services}
        listingName="Workshop: Digital Sikkerhet"
        basePrice={5000}
        currency="NOK"
        maxCapacity={50}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Example 8: Controlled Form State
 *
 * Demonstrates how to control the modal state externally.
 * Useful when integrating with routing or complex application state.
 */
export function ControlledBookingFormModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [bookingCount, setBookingCount] = React.useState(0);

  const selectedSlots: TimeSlot[] = [
    {
      date: '2024-12-25',
      startTime: '12:00',
      endTime: '14:00',
      available: true,
      price: 800
    }
  ];

  const handleConfirm = (details: BookingDetails) => {
    console.log('Controlled booking confirmed:', details);
    setBookingCount(prev => prev + 1);
    setIsOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button onClick={() => setIsOpen(true)}>
          Åpne bookingskjema
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsOpen(false)}
          disabled={!isOpen}
        >
          Lukk skjema
        </Button>
      </div>
      {bookingCount > 0 && (
        <p style={{ marginTop: '12px' }}>
          Antall bookinger: {bookingCount}
        </p>
      )}
      <BookingFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedSlots={selectedSlots}
        listingName="Restaurant bord"
        basePrice={800}
        currency="NOK"
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/**
 * Best Practices:
 *
 * 1. ✅ Always provide required props: open, onClose, selectedSlots, listingName (rental object name), onConfirm
 * 2. ✅ Handle form submission in onConfirm callback
 * 3. ✅ Close modal after successful booking (setIsOpen(false))
 * 4. ✅ Validate selectedSlots before opening modal
 * 5. ✅ Provide basePrice and currency for transparent pricing
 * 6. ✅ Set maxCapacity when venue has capacity limits
 * 7. ✅ Use availableServices for optional add-ons
 * 8. ❌ Don't submit booking directly in component - use onConfirm callback
 * 9. ❌ Don't open modal without selected time slots
 * 10. ✅ Handle modal close (X button, Escape key, backdrop click) gracefully
 *
 * Form Validation:
 * - Name, email, phone, and purpose are required fields
 * - Email format validation (pattern: xxx@xxx.xxx)
 * - Phone number required
 * - Number of people must be between 1 and maxCapacity
 * - Terms and conditions must be accepted
 * - Form validates on submit, shows inline error messages
 *
 * Time Slot Formatting:
 * - Single day: "mandag 15. desember 2024, 10:00 - 11:00"
 * - Multiple days: "3 dager valgt, 10:00 - 17:00"
 * - Slots are sorted chronologically before display
 *
 * Activity Types:
 * Available activity types for classification:
 * - meeting (Møte)
 * - training (Trening)
 * - event (Arrangement)
 * - workshop (Workshop)
 * - presentation (Presentasjon)
 * - party (Fest/Selskap)
 * - other (Annet)
 *
 * Additional Services:
 * Services can be pre-selected via selectedServices prop:
 * ```tsx
 * selectedServices={['service-1', 'service-2']}
 * ```
 * Service categories typically include:
 * - catering (food and beverages)
 * - equipment (technical equipment)
 * - materials (course materials, supplies)
 *
 * Accessibility:
 * - Modal is keyboard accessible (Tab, Escape, Enter)
 * - Form fields have proper labels and error messages
 * - Dialog element used for native modal behavior
 * - Focus management handled automatically
 * - Required fields marked with aria-required
 *
 * Integration with SDK:
 * When using with @digilist/client-sdk, integrate like this:
 *
 * ```tsx
 * import { useCreateBooking } from '@digilist/client-sdk/hooks';
 * import { BookingFormModal } from '@xala/ds';
 *
 * function BookingFlow() {
 *   const [isOpen, setIsOpen] = React.useState(false);
 *   const [selectedSlots, setSelectedSlots] = React.useState<TimeSlot[]>([]);
 *   const createBooking = useCreateBooking();
 *
 *   const handleConfirm = async (details: BookingDetails) => {
 *     try {
 *       await createBooking.mutateAsync({
 *         rentalObjectId: 'rental-object-123',
 *         timeSlots: selectedSlots,
 *         contactInfo: {
 *           name: details.name,
 *           email: details.email,
 *           phone: details.phone,
 *         },
 *         purpose: details.purpose,
 *         activityType: details.activityType,
 *         numberOfPeople: details.numberOfPeople,
 *         notes: details.notes,
 *         organization: details.organization,
 *       });
 *       setIsOpen(false);
 *       // Show success message
 *     } catch (error) {
 *       // Handle error (show error message)
 *       console.error('Booking failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <BookingFormModal
 *       open={isOpen}
 *       onClose={() => setIsOpen(false)}
 *       selectedSlots={selectedSlots}
 *       listingName="Møterom 101"
 *       onConfirm={handleConfirm}
 *     />
 *   );
 * }
 * ```
 *
 * Error Handling:
 * - Form validation errors shown inline below each field
 * - Submit button disabled during submission
 * - Network errors should be handled in onConfirm callback
 * - Consider showing loading state during async operations
 *
 * Responsive Design:
 * - Modal adapts to mobile viewports
 * - Form fields stack vertically on small screens
 * - Touch-friendly input sizes
 * - Scrollable content area for long forms
 */
