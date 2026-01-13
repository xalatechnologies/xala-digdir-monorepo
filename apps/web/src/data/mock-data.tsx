/**
 * Mock Data
 *
 * Demo data for listings page and search functionality.
 */
import React from 'react';
import { CalendarIcon, UserIcon, SettingsIcon, MapPinIcon } from '@xala/ds';
import type { SearchResultGroup } from '@xala/ds';
import type { UiListing } from '@digilist/client-sdk';

// Demo search data
export const demoSearchResults: SearchResultGroup[] = [
  {
    id: 'actions',
    label: 'Hurtighandlinger',
    items: [
      { id: 'new-booking', label: 'Ny booking', description: 'Opprett en ny booking', icon: <CalendarIcon size={18} />, shortcut: '⌘N' },
      { id: 'settings', label: 'Innstillinger', description: 'Åpne innstillinger', icon: <SettingsIcon size={18} />, shortcut: '⌘,' },
    ]
  },
  {
    id: 'locations',
    label: 'Steder',
    items: [
      { id: 'oslo', label: 'Oslo', description: 'Hovedkontor', icon: <MapPinIcon size={18} />, meta: '12 bookinger' },
      { id: 'bergen', label: 'Bergen', description: 'Vestlandskontor', icon: <MapPinIcon size={18} />, meta: '8 bookinger' },
      { id: 'trondheim', label: 'Trondheim', description: 'Midtbykontor', icon: <MapPinIcon size={18} />, meta: '5 bookinger' },
    ]
  },
  {
    id: 'users',
    label: 'Brukere',
    items: [
      { id: 'user-1', label: 'Ola Nordmann', description: 'ola@example.com', icon: <UserIcon size={18} /> },
      { id: 'user-2', label: 'Kari Hansen', description: 'kari@example.com', icon: <UserIcon size={18} /> },
    ]
  }
];

// Filter options
export const listingTypeOptions = [
  { id: 'ALL', label: 'Alle' },
  { id: 'SPACE', label: 'Lokaler' },
  { id: 'RESOURCE', label: 'Ressurser' },
  { id: 'EVENT', label: 'Arrangementer' },
  { id: 'SERVICE', label: 'Tjenester' },
  { id: 'VEHICLE', label: 'Kjøretøy' },
];

// Capacity range options
export const capacityOptions = [
  { id: 'all', label: 'Alle størrelser', min: 0, max: Infinity },
  { id: '1-10', label: '1-10 personer', min: 1, max: 10 },
  { id: '11-25', label: '11-25 personer', min: 11, max: 25 },
  { id: '26-50', label: '26-50 personer', min: 26, max: 50 },
  { id: '51-100', label: '51-100 personer', min: 51, max: 100 },
  { id: '100+', label: 'Over 100 personer', min: 101, max: Infinity },
];

// Demo listings - various types according to schema (used as fallback when API unavailable)
export const mockListings: UiListing[] = [
  // SPACE listings
  {
    id: '1',
    name: 'Bragernes Møterom',
    type: 'Møterom',
    listingType: 'SPACE' as const,
    location: 'Nedre Storgate 15',
    description: 'Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for presentasjoner og videokonferanser.',
    facilities: ['Projektor', 'Tavle', 'WiFi'],
    moreFacilities: 2,
    capacity: 25,
    price: 450,
    priceUnit: 'time',
    rating: 4.8,
    reviewCount: 24,
    available: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    latitude: 59.7439,
    longitude: 10.2045
  },
  {
    id: '2',
    name: 'Solberghallen',
    type: 'Idrettshall',
    listingType: 'SPACE' as const,
    location: 'Gamle Riksvei 102A, 3057 Solbergelva',
    description: 'Solberghallen er en moderne idrettshall for innedretter, foreninger og arrangementer.',
    facilities: ['Garderober', 'Dusj', 'Fotball'],
    moreFacilities: 1,
    capacity: 100,
    price: 1200,
    priceUnit: 'time',
    rating: 4.6,
    reviewCount: 18,
    available: true,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    latitude: 59.7312,
    longitude: 10.1523
  },
  {
    id: '3',
    name: 'Drammen Svømmehall',
    type: 'Svømmehall',
    listingType: 'SPACE' as const,
    location: 'Danvikgata 40, 3045 Drammen',
    description: 'Moderne svømmeanlegg med 25m basseng, barnebasseng og badstue.',
    facilities: ['25m basseng', 'Barnebasseng', 'Badstue'],
    moreFacilities: 3,
    capacity: 80,
    price: 180,
    priceUnit: 'person',
    rating: 4.9,
    reviewCount: 56,
    available: false,
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop',
    latitude: 59.7401,
    longitude: 10.1892
  },
  // RESOURCE listings
  {
    id: '4',
    name: 'Projektor og lerret',
    type: 'AV-utstyr',
    listingType: 'RESOURCE' as const,
    location: 'Drammen Bibliotek',
    description: 'Profesjonell projektor med stort lerret. Perfekt for presentasjoner og filmvisninger.',
    facilities: ['4K oppløsning', 'HDMI', 'Fjernkontroll'],
    moreFacilities: 0,
    capacity: 1,
    price: 200,
    priceUnit: 'dag',
    rating: 4.7,
    reviewCount: 12,
    available: true,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop',
    latitude: 59.7425,
    longitude: 10.2038
  },
  {
    id: '5',
    name: 'PA-anlegg komplett',
    type: 'Lydutstyr',
    listingType: 'RESOURCE' as const,
    location: 'Kulturhuset Drammen',
    description: 'Komplett PA-anlegg med mikrofoner, miksebord og høyttalere for arrangementer.',
    facilities: ['2x høyttalere', 'Miksebord', '4x mikrofoner'],
    moreFacilities: 3,
    capacity: 1,
    price: 800,
    priceUnit: 'dag',
    rating: 4.5,
    reviewCount: 8,
    available: true,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    latitude: 59.7448,
    longitude: 10.2112
  },
  {
    id: '6',
    name: 'Kajakk dobbeltseter',
    type: 'Vannsport',
    listingType: 'RESOURCE' as const,
    location: 'Drammenselva Padleklubb',
    description: 'Stabil dobbelkajakk perfekt for turer på Drammenselva. Inkluderer årer og redningsvester.',
    facilities: ['2 årer', 'Redningsvester', 'Tørrpose'],
    moreFacilities: 0,
    capacity: 2,
    price: 350,
    priceUnit: 'dag',
    rating: 4.8,
    reviewCount: 22,
    available: true,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    latitude: 59.7389,
    longitude: 10.1956
  },
  // EVENT listings
  {
    id: '7',
    name: 'Yoga i parken',
    type: 'Trening',
    listingType: 'EVENT' as const,
    location: 'Bragernes Torg',
    description: 'Utendørs yoga-klasse for alle nivåer. Ta med egen matte eller lån på stedet.',
    facilities: ['Instruktør', 'Utlånsmatter', 'Parkering'],
    moreFacilities: 0,
    capacity: 30,
    price: 150,
    priceUnit: 'person',
    rating: 4.9,
    reviewCount: 45,
    available: true,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    latitude: 59.7441,
    longitude: 10.2048
  },
  {
    id: '8',
    name: 'Keramikk-kurs for nybegynnere',
    type: 'Kurs',
    listingType: 'EVENT' as const,
    location: 'Drammens Kunstverksted',
    description: '3-timers introduksjonskurs i dreiing og glasering. Alt materiale inkludert.',
    facilities: ['Materiale inkl.', 'Forkle', 'Brenning'],
    moreFacilities: 1,
    capacity: 8,
    price: 650,
    priceUnit: 'person',
    rating: 4.6,
    reviewCount: 19,
    available: true,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop',
    latitude: 59.7462,
    longitude: 10.1978
  },
  {
    id: '9',
    name: 'Sommerkonsert: Drammens Storband',
    type: 'Konsert',
    listingType: 'EVENT' as const,
    location: 'Union Scene',
    description: 'Storband-konsert med klassiske jazz-standarder og moderne arrangementer.',
    facilities: ['Sitteplasser', 'Bar', 'Garderobe'],
    moreFacilities: 0,
    capacity: 250,
    price: 350,
    priceUnit: 'person',
    rating: 4.8,
    reviewCount: 67,
    available: false,
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop',
    latitude: 59.7398,
    longitude: 10.2089
  },
  // SERVICE listings
  {
    id: '10',
    name: 'Personlig trener - Ole Berg',
    type: 'PT',
    listingType: 'SERVICE' as const,
    location: 'SATS Drammen',
    description: 'Sertifisert personlig trener med 10 års erfaring. Spesialisert på styrketrening og vektnedgang.',
    facilities: ['Treningsprogram', 'Kostholdsråd', 'Oppfølging'],
    moreFacilities: 1,
    capacity: 1,
    price: 750,
    priceUnit: 'time',
    rating: 4.9,
    reviewCount: 34,
    available: true,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
    latitude: 59.7456,
    longitude: 10.2134
  },
  {
    id: '11',
    name: 'Gitarlærer - Lise Haugen',
    type: 'Musikk',
    listingType: 'SERVICE' as const,
    location: 'Drammen Kulturskole',
    description: 'Gitarundervisning for barn og voksne. Klassisk, akustisk og elektrisk gitar.',
    facilities: ['Lånegitar', 'Noter inkl.', 'Øvingsrom'],
    moreFacilities: 0,
    capacity: 1,
    price: 450,
    priceUnit: 'time',
    rating: 4.7,
    reviewCount: 28,
    available: true,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
    latitude: 59.7478,
    longitude: 10.1923
  },
  {
    id: '12',
    name: 'Fotograf - Bryllup & Events',
    type: 'Foto',
    listingType: 'SERVICE' as const,
    location: 'Drammen og omegn',
    description: 'Profesjonell fotograf for bryllup, konfirmasjon og bedriftsarrangementer.',
    facilities: ['Redigering inkl.', 'Digitale filer', 'Album'],
    moreFacilities: 2,
    capacity: 1,
    price: 8500,
    priceUnit: 'dag',
    rating: 4.8,
    reviewCount: 52,
    available: true,
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop',
    latitude: 59.7412,
    longitude: 10.2067
  },
  // VEHICLE listings
  {
    id: '13',
    name: 'Elektrisk varebil',
    type: 'Varebil',
    listingType: 'VEHICLE' as const,
    location: 'Drammen sentrum',
    description: 'Miljøvennlig elektrisk varebil for flytting og transport. Rekkevidde 250 km.',
    facilities: ['GPS', 'Lastestropper', 'Tralle'],
    moreFacilities: 1,
    capacity: 2,
    price: 890,
    priceUnit: 'dag',
    rating: 4.6,
    reviewCount: 31,
    available: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    latitude: 59.7435,
    longitude: 10.2025
  },
  {
    id: '14',
    name: 'Elsykkel - Bysykkel',
    type: 'Sykkel',
    listingType: 'VEHICLE' as const,
    location: 'Drammen Stasjon',
    description: 'Komfortabel elsykkel for bytur eller lengre turer langs Drammenselva.',
    facilities: ['Hjelm inkl.', 'Lås', 'Kurv'],
    moreFacilities: 0,
    capacity: 1,
    price: 250,
    priceUnit: 'dag',
    rating: 4.5,
    reviewCount: 18,
    available: true,
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop',
    latitude: 59.7367,
    longitude: 10.2145
  },
  {
    id: '15',
    name: 'Minibuss 9-seter',
    type: 'Minibuss',
    listingType: 'VEHICLE' as const,
    location: 'Gulskogen',
    description: 'Romslig minibuss perfekt for familieturer, lagsport eller gruppereiser.',
    facilities: ['Aircondition', 'Bluetooth', 'Bagasjerom'],
    moreFacilities: 2,
    capacity: 9,
    price: 1400,
    priceUnit: 'dag',
    rating: 4.7,
    reviewCount: 14,
    available: false,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
    latitude: 59.7289,
    longitude: 10.1834
  },
];
