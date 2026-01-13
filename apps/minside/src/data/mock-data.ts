/**
 * Mock Data for Min Side Testing
 * Provides realistic sample data for the user dashboard when API returns empty
 */

import type { Booking, Conversation, Message } from '@digilist/client-sdk';

// The mock user from AuthProvider
export const MOCK_USER_ID = 'mock-saksbehandler-001';
export const MOCK_ADMIN_ID = 'mock-admin-001';

// Sample listings (facilities) that can be booked
export const MOCK_LISTINGS = [
  {
    id: 'listing-001',
    name: 'Hovedhall A',
    type: 'space' as const,
    organizationName: 'Skien Kultursenter',
  },
  {
    id: 'listing-002', 
    name: 'Møterom Sør',
    type: 'space' as const,
    organizationName: 'Skien Kultursenter',
  },
  {
    id: 'listing-003',
    name: 'Svømmehall',
    type: 'space' as const,
    organizationName: 'Skien Badeland',
  },
  {
    id: 'listing-004',
    name: 'Fotballbane 1',
    type: 'space' as const,
    organizationName: 'Skien Idrettspark',
  },
  {
    id: 'listing-005',
    name: 'Tennisbane Øst',
    type: 'space' as const,
    organizationName: 'Skien Idrettspark',
  },
];

// Helper to generate dates relative to today
function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function setTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Generate bookings for Ola Hansen (the mock user)
export const MOCK_BOOKINGS: Booking[] = [
  // Upcoming confirmed bookings
  {
    id: 'booking-001',
    listingId: 'listing-001',
    listingName: 'Hovedhall A',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(2), 10, 0).toISOString(),
    endTime: setTime(addDays(2), 12, 0).toISOString(),
    status: 'confirmed',
    totalPrice: 450,
    paymentStatus: 'paid',
    createdAt: addDays(-5).toISOString(),
    updatedAt: addDays(-5).toISOString(),
  },
  {
    id: 'booking-002',
    listingId: 'listing-003',
    listingName: 'Svømmehall',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(4), 16, 0).toISOString(),
    endTime: setTime(addDays(4), 18, 0).toISOString(),
    status: 'confirmed',
    totalPrice: 320,
    paymentStatus: 'paid',
    createdAt: addDays(-3).toISOString(),
    updatedAt: addDays(-3).toISOString(),
  },
  {
    id: 'booking-003',
    listingId: 'listing-004',
    listingName: 'Fotballbane 1',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(7), 18, 0).toISOString(),
    endTime: setTime(addDays(7), 20, 0).toISOString(),
    status: 'confirmed',
    totalPrice: 800,
    paymentStatus: 'paid',
    createdAt: addDays(-2).toISOString(),
    updatedAt: addDays(-2).toISOString(),
  },
  // Pending bookings (waiting for approval)
  {
    id: 'booking-004',
    listingId: 'listing-002',
    listingName: 'Møterom Sør',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(10), 9, 0).toISOString(),
    endTime: setTime(addDays(10), 11, 0).toISOString(),
    status: 'pending',
    totalPrice: 200,
    paymentStatus: 'unpaid',
    createdAt: addDays(-1).toISOString(),
    updatedAt: addDays(-1).toISOString(),
  },
  {
    id: 'booking-005',
    listingId: 'listing-005',
    listingName: 'Tennisbane Øst',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(14), 14, 0).toISOString(),
    endTime: setTime(addDays(14), 16, 0).toISOString(),
    status: 'pending',
    totalPrice: 150,
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Past bookings (completed)
  {
    id: 'booking-006',
    listingId: 'listing-001',
    listingName: 'Hovedhall A',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(-7), 10, 0).toISOString(),
    endTime: setTime(addDays(-7), 12, 0).toISOString(),
    status: 'completed',
    totalPrice: 450,
    paymentStatus: 'paid',
    createdAt: addDays(-14).toISOString(),
    updatedAt: addDays(-7).toISOString(),
  },
  {
    id: 'booking-007',
    listingId: 'listing-003',
    listingName: 'Svømmehall',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(-3), 16, 0).toISOString(),
    endTime: setTime(addDays(-3), 18, 0).toISOString(),
    status: 'completed',
    totalPrice: 320,
    paymentStatus: 'paid',
    createdAt: addDays(-10).toISOString(),
    updatedAt: addDays(-3).toISOString(),
  },
  // A cancelled booking
  {
    id: 'booking-008',
    listingId: 'listing-004',
    listingName: 'Fotballbane 1',
    userId: MOCK_USER_ID,
    startTime: setTime(addDays(-1), 18, 0).toISOString(),
    endTime: setTime(addDays(-1), 20, 0).toISOString(),
    status: 'cancelled',
    totalPrice: 800,
    paymentStatus: 'refunded',
    createdAt: addDays(-8).toISOString(),
    updatedAt: addDays(-2).toISOString(),
    cancellationReason: 'Vær forhold - regn',
  },
];

// Conversations between user and admin
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    subject: 'Spørsmål om Hovedhall A booking',
    participantIds: [MOCK_USER_ID, MOCK_ADMIN_ID],
    lastMessage: 'Alt er klart for din booking!',
    lastMessageAt: addDays(-1).toISOString(),
    unreadCount: 0,
    createdAt: addDays(-5).toISOString(),
    updatedAt: addDays(-1).toISOString(),
  },
  {
    id: 'conv-002',
    subject: 'Svømmehall tilgjengelighet',
    participantIds: [MOCK_USER_ID, MOCK_ADMIN_ID],
    lastMessage: 'Vi har ledige tider på lørdag!',
    lastMessageAt: addDays(-2).toISOString(),
    unreadCount: 1,
    createdAt: addDays(-7).toISOString(),
    updatedAt: addDays(-2).toISOString(),
  },
  {
    id: 'conv-003',
    subject: 'Kansellering av fotballbane',
    participantIds: [MOCK_USER_ID, MOCK_ADMIN_ID],
    lastMessage: 'Refusjon er behandlet.',
    lastMessageAt: addDays(-2).toISOString(),
    unreadCount: 0,
    createdAt: addDays(-3).toISOString(),
    updatedAt: addDays(-2).toISOString(),
  },
];

// Messages for each conversation
export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-001': [
    {
      id: 'msg-001-1',
      conversationId: 'conv-001',
      senderId: MOCK_USER_ID,
      senderName: 'Ola Hansen',
      content: 'Hei! Jeg lurer på om det er mulig å forlenge bookingen min i Hovedhall A med en time?',
      createdAt: addDays(-5).toISOString(),
      readAt: addDays(-5).toISOString(),
    },
    {
      id: 'msg-001-2',
      conversationId: 'conv-001',
      senderId: MOCK_ADMIN_ID,
      senderName: 'Kari Nordmann (Admin)',
      content: 'Hei Ola! Ja, det er mulig. Jeg ser at timen etter din booking er ledig. Ønsker du at jeg oppdaterer bookingen?',
      createdAt: addDays(-4).toISOString(),
      readAt: addDays(-4).toISOString(),
    },
    {
      id: 'msg-001-3',
      conversationId: 'conv-001',
      senderId: MOCK_USER_ID,
      senderName: 'Ola Hansen',
      content: 'Ja, det hadde vært fantastisk! Kan du også bekrefte totalprisen?',
      createdAt: addDays(-3).toISOString(),
      readAt: addDays(-3).toISOString(),
    },
    {
      id: 'msg-001-4',
      conversationId: 'conv-001',
      senderId: MOCK_ADMIN_ID,
      senderName: 'Kari Nordmann (Admin)',
      content: 'Bookingen er nå oppdatert til 3 timer (10:00-13:00). Ny totalpris er 675 kr. Betalingslink er sendt på e-post.',
      createdAt: addDays(-2).toISOString(),
      readAt: addDays(-2).toISOString(),
    },
    {
      id: 'msg-001-5',
      conversationId: 'conv-001',
      senderId: MOCK_USER_ID,
      senderName: 'Ola Hansen',
      content: 'Takk for rask hjelp! 👍',
      createdAt: addDays(-2).toISOString(),
      readAt: addDays(-2).toISOString(),
    },
    {
      id: 'msg-001-6',
      conversationId: 'conv-001',
      senderId: MOCK_ADMIN_ID,
      senderName: 'Kari Nordmann (Admin)',
      content: 'Alt er klart for din booking!',
      createdAt: addDays(-1).toISOString(),
      readAt: addDays(-1).toISOString(),
    },
  ],
  'conv-002': [
    {
      id: 'msg-002-1',
      conversationId: 'conv-002',
      senderId: MOCK_USER_ID,
      senderName: 'Ola Hansen',
      content: 'Hei, jeg ser at svømmehallen er fullbooket på fredag. Har dere noen ledige tider i helgen?',
      createdAt: addDays(-7).toISOString(),
      readAt: addDays(-7).toISOString(),
    },
    {
      id: 'msg-002-2',
      conversationId: 'conv-002',
      senderId: MOCK_ADMIN_ID,
      senderName: 'Kari Nordmann (Admin)',
      content: 'Hei Ola! La meg sjekke kalenderen.',
      createdAt: addDays(-6).toISOString(),
      readAt: addDays(-6).toISOString(),
    },
    {
      id: 'msg-002-3',
      conversationId: 'conv-002',
      senderId: MOCK_ADMIN_ID,
      senderName: 'Kari Nordmann (Admin)',
      content: 'Vi har ledige tider på lørdag! Klokken 14:00-16:00 og 16:00-18:00 er begge tilgjengelige. Hvilken passer best?',
      createdAt: addDays(-2).toISOString(),
      readAt: null, // Unread
    },
  ],
  'conv-003': [
    {
      id: 'msg-003-1',
      conversationId: 'conv-003',
      senderId: MOCK_USER_ID,
      senderName: 'Ola Hansen',
      content: 'Hei, jeg må dessverre kansellere min booking på fotballbane 1. Det regner hele dagen og vi kan ikke spille.',
      createdAt: addDays(-3).toISOString(),
      readAt: addDays(-3).toISOString(),
    },
    {
      id: 'msg-003-2',
      conversationId: 'conv-003',
      senderId: MOCK_ADMIN_ID,
      senderName: 'Kari Nordmann (Admin)',
      content: 'Hei Ola, jeg forstår. Jeg kansellerer bookingen nå. Siden det er værrelatert, gir vi full refusjon.',
      createdAt: addDays(-3).toISOString(),
      readAt: addDays(-3).toISOString(),
    },
    {
      id: 'msg-003-3',
      conversationId: 'conv-003',
      senderId: MOCK_USER_ID,
      senderName: 'Ola Hansen',
      content: 'Tusen takk for forståelsen! Når kan jeg forvente refusjonen?',
      createdAt: addDays(-2).toISOString(),
      readAt: addDays(-2).toISOString(),
    },
    {
      id: 'msg-003-4',
      conversationId: 'conv-003',
      senderId: MOCK_ADMIN_ID,
      senderName: 'Kari Nordmann (Admin)',
      content: 'Refusjon er behandlet. Du vil motta pengene innen 3-5 virkedager. Ha en fin dag!',
      createdAt: addDays(-2).toISOString(),
      readAt: addDays(-2).toISOString(),
    },
  ],
};

// Helper functions to filter mock data
export function getMockBookingsByStatus(status?: string): Booking[] {
  if (!status) return MOCK_BOOKINGS;
  return MOCK_BOOKINGS.filter(b => b.status === status);
}

export function getMockBookingsStats() {
  return {
    total: MOCK_BOOKINGS.length,
    confirmed: MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length,
    pending: MOCK_BOOKINGS.filter(b => b.status === 'pending').length,
    cancelled: MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length,
    completed: MOCK_BOOKINGS.filter(b => b.status === 'completed').length,
  };
}

export function getMockMessagesForConversation(conversationId: string): Message[] {
  return MOCK_MESSAGES[conversationId] ?? [];
}
