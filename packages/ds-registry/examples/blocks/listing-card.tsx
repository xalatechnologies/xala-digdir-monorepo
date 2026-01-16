import React from 'react';
import { ListingCard } from '@xala/ds';

/**
 * Example 1: Basic ListingCard
 *
 * The simplest way to use ListingCard with minimal required props.
 * Shows a basic rental object (bookable space) with name, type, location, and description.
 *
 * NOTE: "ListingCard" is a legacy component name - it displays rental objects (spaces, resources, vehicles, events).
 */
export function BasicListingCard() {
  return (
    <ListingCard
      id="rental-object-1"
      name="Storsal A"
      type="Møterom"
      location="Oslo sentrum"
      description="Et romslig møterom perfekt for mindre møter og workshops."
      image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    />
  );
}

/**
 * Example 2: Grid Variant with Facilities
 *
 * ListingCard in grid variant (compact view) with facilities displayed.
 * This is the default variant optimized for grid layouts displaying rental objects.
 */
export function GridListingCardWithFacilities() {
  return (
    <ListingCard
      id="rental-object-2"
      name="Konferanserom Bergen"
      type="Konferansesal"
      listingType="SPACE"
      location="Bergen, Vestland"
      description="Moderne konferanserom med alle fasiliteter du trenger."
      image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
      facilities={['WiFi', 'Projektor', 'Whiteboard', 'Videokonferanse']}
      capacity={20}
      showFacilities={true}
      showCapacity={true}
      showListingType={true}
    />
  );
}

/**
 * Example 3: ListingCard with Pricing
 *
 * Display pricing information with the rental object.
 * Useful for paid bookings or rentals.
 */
export function ListingCardWithPricing() {
  return (
    <ListingCard
      id="rental-object-3"
      name="Studio Lydopptak"
      type="Lydstudio"
      listingType="RESOURCE"
      location="Trondheim"
      description="Profesjonelt lydstudio med førsteklasses utstyr."
      image="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"
      price={500}
      priceUnit="time"
      currency="kr"
      facilities={['Mikrofoner', 'Miksebord', 'Lydisolert']}
      capacity={4}
      showPrice={true}
      showFacilities={true}
      showCapacity={true}
    />
  );
}

/**
 * Example 4: Detailed Variant (Modal/Popup View)
 *
 * ListingCard in detailed variant with close button.
 * This variant is designed for modal overlays or detailed views.
 */
export function DetailedListingCard() {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 24px',
          background: 'var(--ds-color-accent-base-default)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Åpne detaljert visning
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{ maxWidth: '900px', width: '100%' }}>
        <ListingCard
          id="rental-object-4"
          name="Idrettshall Vollene"
          type="Idrettshall"
          listingType="SPACE"
          location="Drammen"
          description="Full-størrelse idrettshall egnet for basketball, volleyball, håndball og mer. Moderne fasiliteter med garderoberom og dusjer."
          image="https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800"
          facilities={['Garderober', 'Dusjer', 'Tribuner', 'Lydanlegg', 'Scoreboard']}
          moreFacilities={3}
          capacity={200}
          variant="detailed"
          imageHeight={400}
          showFacilities={true}
          showCapacity={true}
          showDescription={true}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

/**
 * Example 5: Interactive Card with Actions
 *
 * ListingCard with favorite and share functionality.
 * Shows how to handle user interactions.
 */
export function InteractiveListingCard() {
  const [isFavorited, setIsFavorited] = React.useState(false);

  const handleFavorite = (id: string) => {
    setIsFavorited(!isFavorited);
    console.log(`Toggled favorite for rental object: ${id}`);
  };

  const handleShare = (id: string) => {
    console.log(`Share rental object: ${id}`);
    alert('Delingsfunksjonalitet kommer snart!');
  };

  const handleClick = (id: string) => {
    console.log(`Clicked rental object card: ${id}`);
  };

  return (
    <ListingCard
      id="rental-object-5"
      name="Bibliotek lesesesal"
      type="Studierom"
      listingType="SPACE"
      location="Universitetet i Oslo"
      description="Rolig og fokusert studiemiljø med god belysning og ergonomiske arbeidsplasser."
      image="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800"
      facilities={['WiFi', 'Stikkontakter', 'Stilleområde']}
      capacity={30}
      isFavorited={isFavorited}
      onClick={handleClick}
      onFavorite={handleFavorite}
      onShare={handleShare}
      showFavoriteButton={true}
      showShareButton={true}
    />
  );
}

/**
 * Example 6: Vehicle Rental Object
 *
 * Example showing how to use ListingCard for vehicle rental objects.
 * This demonstrates a vehicle booking use case.
 */
export function VehicleListingCard() {
  return (
    <ListingCard
      id="rental-object-6"
      name="Tesla Model 3"
      type="Elbil"
      listingType="VEHICLE"
      location="Oslo Varebil Pool"
      description="Elektrisk firmabil tilgjengelig for kommunale tjenestereiser. Rekkevidde opptil 500 km."
      image="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800"
      facilities={['Autopilot', 'GPS', 'Hengerfeste']}
      capacity={5}
      price={350}
      priceUnit="dag"
      currency="kr"
      showPrice={true}
      showListingType={true}
      showCapacity={true}
    />
  );
}

/**
 * Example 7: Event Rental Object
 *
 * ListingCard configured for displaying event rental objects.
 * Shows how the component adapts to different rental object types.
 */
export function EventListingCard() {
  return (
    <ListingCard
      id="rental-object-7"
      name="Workshop: Digital Sikkerhet"
      type="Kurs & Workshop"
      listingType="EVENT"
      location="Digitalt (Zoom)"
      description="Lær grunnleggende prinsipper for digital sikkerhet og personvern. Kurset passer for alle ansatte."
      image="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800"
      capacity={50}
      price={0}
      priceUnit="person"
      currency="kr"
      showPrice={true}
      showListingType={true}
      showCapacity={true}
      available={true}
    />
  );
}

/**
 * Example 8: Grid Layout with Multiple Cards
 *
 * Demonstrates how to arrange multiple ListingCards in a grid layout.
 * This is the typical usage pattern for rental object browsing pages.
 */
export function ListingCardGrid() {
  const rentalObjects = [
    {
      id: 'grid-1',
      name: 'Møterom A',
      type: 'Møterom',
      listingType: 'SPACE' as const,
      location: 'Oslo',
      description: 'Lite møterom for 4-6 personer',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      capacity: 6,
      facilities: ['WiFi', 'TV', 'Whiteboard']
    },
    {
      id: 'grid-2',
      name: 'Laptop Dell XPS',
      type: 'PC-utstyr',
      listingType: 'RESOURCE' as const,
      location: 'IT-avdeling',
      description: 'Høyytelseslaptop for krevende oppgaver',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
      facilities: ['16GB RAM', 'SSD', 'Bæreveske']
    },
    {
      id: 'grid-3',
      name: 'Служебный автомобиль',
      type: 'Varebil',
      listingType: 'VEHICLE' as const,
      location: 'Bilparken',
      description: 'Praktisk varebil for transport',
      image: 'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?w=400',
      capacity: 3,
      price: 200,
      priceUnit: 'dag',
      currency: 'kr'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      padding: '24px'
    }}>
      {rentalObjects.map((rentalObject) => (
        <ListingCard
          key={rentalObject.id}
          {...rentalObject}
          showPrice={!!rentalObject.price}
          showCapacity={!!rentalObject.capacity}
          showFacilities={true}
          showListingType={true}
        />
      ))}
    </div>
  );
}

/**
 * Example 9: Customized Appearance
 *
 * Shows how to customize the appearance and visibility of different elements.
 * Useful for adapting the card to specific design requirements.
 */
export function CustomizedListingCard() {
  return (
    <ListingCard
      id="rental-object-9"
      name="Auditorium Hovedscenen"
      type="Auditorium"
      listingType="SPACE"
      location="Kulturhuset"
      description="Stort auditorium med plass til 500 personer. Profesjonelt lyd- og lysanlegg."
      image="https://images.unsplash.com/photo-1519167758481-83f29da8c9a1?w=800"
      facilities={['Lyd', 'Lys', 'Scene', 'Garderober']}
      capacity={500}
      price={5000}
      priceUnit="dag"
      currency="kr"
      imageHeight={250}
      showRating={false}
      showPrice={true}
      showCapacity={true}
      showFacilities={true}
      showDescription={true}
      showLocation={true}
      showTypeBadge={true}
      showGradientOverlay={true}
      showFavoriteButton={false}
      showShareButton={false}
      maxFacilities={4}
      className="custom-listing-card"
    />
  );
}

/**
 * Best Practices:
 *
 * 1. ✅ Always provide required props: id, name, type, location, description, image
 * 2. ✅ Use listingType enum for proper categorization and badge colors (SPACE, RESOURCE, VEHICLE, EVENT, SERVICE, OTHER)
 * 3. ✅ Set variant="grid" for card grids, variant="detailed" for modals
 * 4. ✅ Show pricing only when relevant (showPrice={true})
 * 5. ✅ Provide onClick handler for navigation to detail pages
 * 6. ✅ Use onFavorite and onShare for interactive features
 * 7. ❌ Don't show too many facilities - use maxFacilities to limit
 * 8. ❌ Don't hardcode image URLs in production - use CDN or asset management
 * 9. ✅ Use appropriate imageHeight based on variant and layout
 * 10. ✅ Provide capacity for SPACE and VEHICLE rental object types
 *
 * Rental Object Type Guidelines (listingType prop):
 * - SPACE: Rooms, halls, venues (show capacity, facilities)
 * - RESOURCE: Equipment, tools, devices (show facilities)
 * - EVENT: Workshops, courses, meetings (show capacity, price)
 * - SERVICE: Services, consultations (show price)
 * - VEHICLE: Cars, vans, bikes (show capacity, price)
 * - OTHER: Miscellaneous items
 *
 * Responsive Behavior:
 * - Grid variant works best in grid layouts with minmax(320px, 1fr)
 * - Detailed variant is designed for modal overlays (max-width: 900px)
 * - Cards automatically adjust spacing and font sizes based on viewport
 *
 * Accessibility:
 * - All interactive elements are keyboard accessible
 * - Images should have meaningful alt text (handled internally)
 * - Use semantic HTML structure with proper heading hierarchy
 * - Ensure sufficient color contrast for badges and text
 *
 * Integration with SDK:
 * When using with @digilist/client-sdk, map rental object DTOs directly to props:
 *
 * ```tsx
 * import { useRentalObjects } from '@digilist/client-sdk/hooks';
 *
 * function RentalObjectsPage() {
 *   const { data: rentalObjects } = useRentalObjects();
 *
 *   return (
 *     <div className="rental-objects-grid">
 *       {rentalObjects?.map(rentalObject => (
 *         <ListingCard
 *           key={rentalObject.id}
 *           id={rentalObject.id}
 *           name={rentalObject.name}
 *           type={rentalObject.category}
 *           listingType={rentalObject.type}
 *           location={rentalObject.location}
 *           description={rentalObject.description}
 *           image={rentalObject.imageUrl}
 *           facilities={rentalObject.facilities}
 *           capacity={rentalObject.capacity}
 *           price={rentalObject.pricing?.amount}
 *           priceUnit={rentalObject.pricing?.unit}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * NOTE: The component name "ListingCard" is legacy - it's used to display rental objects.
 * The domain model uses "rental_object" as the canonical term for bookable items (spaces, resources, vehicles, events).
 */
