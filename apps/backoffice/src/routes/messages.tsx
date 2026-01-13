import { useState } from 'react';
import { Card, Heading, Paragraph, Button, Badge } from '@xala/ds';

// Mock data
interface Conversation {
  id: string;
  userName: string;
  organization?: string;
  bookingId?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'resolved';
}

interface Message {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  content: string;
  timestamp: string;
}

const mockConversations: Conversation[] = [
  { id: '1', userName: 'Nordre Follo IL', organization: 'Nordre Follo IL', bookingId: 'BOK-2847', lastMessage: 'Kan vi flytte bookingen til torsdag i stedet?', lastMessageTime: '2024-01-13 10:30', unreadCount: 2, status: 'active' },
  { id: '2', userName: 'Erik Hansen', bookingId: 'REQ-2845', lastMessage: 'Ja, vi har projektor tilgjengelig i rommet.', lastMessageTime: '2024-01-13 09:15', unreadCount: 0, status: 'active' },
  { id: '3', userName: 'Ski Håndball', organization: 'Ski Håndball', bookingId: 'BOK-2844', lastMessage: 'Tusen takk for hjelpen!', lastMessageTime: '2024-01-12 16:45', unreadCount: 0, status: 'resolved' },
  { id: '4', userName: 'Vestby Korps', organization: 'Vestby Korps', bookingId: 'REQ-2840', lastMessage: 'Vi trenger informasjon om strømuttak i lokalet.', lastMessageTime: '2024-01-12 14:20', unreadCount: 1, status: 'active' },
  { id: '5', userName: 'Mari Olsen', bookingId: 'REQ-2842', lastMessage: 'Kan jeg få bekreftelse på bookingen?', lastMessageTime: '2024-01-11 11:00', unreadCount: 1, status: 'active' },
];

const mockMessages: Message[] = [
  { id: '1', sender: 'user', senderName: 'Nordre Follo IL', content: 'Hei! Vi har en booking på mandag, men det har oppstått en konflikt. Kan vi flytte bookingen til torsdag i stedet?', timestamp: '2024-01-13 10:15' },
  { id: '2', sender: 'admin', senderName: 'Kari Nordmann', content: 'Hei! La meg sjekke tilgjengeligheten for torsdag. Hvilket tidspunkt passer for dere?', timestamp: '2024-01-13 10:20' },
  { id: '3', sender: 'user', senderName: 'Nordre Follo IL', content: 'Samme tidspunkt som opprinnelig, 17:00-20:00. Er det ledig?', timestamp: '2024-01-13 10:30' },
];

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0] ?? null);
  const [messageInput, setMessageInput] = useState('');

  const unreadTotal = mockConversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Meldinger
          {unreadTotal > 0 && (
            <Badge data-color="danger" data-size="sm" style={{ marginLeft: 'var(--ds-spacing-2)' }}>
              {unreadTotal} uleste
            </Badge>
          )}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Kommunikasjon med brukere og organisasjoner.
        </Paragraph>
      </div>

      {/* Chat Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 'var(--ds-spacing-4)', flex: 1, minHeight: 0 }}>
        {/* Conversation List */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <input
              type="text"
              placeholder="Søk i samtaler..."
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-3)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                style={{
                  padding: 'var(--ds-spacing-4)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conversation.id
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-1)' }}>
                  <span style={{ fontWeight: 'var(--ds-font-weight-medium)', fontSize: 'var(--ds-font-size-sm)' }}>
                    {conversation.userName}
                  </span>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {conversation.lastMessageTime.split(' ')[1]}
                  </span>
                </div>
                {conversation.bookingId && (
                  <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {conversation.bookingId}
                  </Paragraph>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      color: 'var(--ds-color-neutral-text-subtle)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {conversation.lastMessage}
                  </Paragraph>
                  {conversation.unreadCount > 0 && (
                    <Badge data-color="danger" data-size="sm" style={{ marginLeft: 'var(--ds-spacing-2)' }}>
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Message Thread */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                    {selectedConversation.userName}
                  </Heading>
                  {selectedConversation.bookingId && (
                    <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Tilknyttet: {selectedConversation.bookingId}
                    </Paragraph>
                  )}
                </div>
                <Badge data-color={selectedConversation.status === 'active' ? 'success' : 'neutral'} data-size="sm">
                  {selectedConversation.status === 'active' ? 'Aktiv' : 'Løst'}
                </Badge>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: 'var(--ds-spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                        borderRadius: 'var(--ds-border-radius-lg)',
                        backgroundColor: message.sender === 'admin'
                          ? 'var(--ds-color-accent-surface-default)'
                          : 'var(--ds-color-neutral-surface-hover)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-1)' }}>
                        <span style={{ fontSize: 'var(--ds-font-size-xs)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {message.senderName}
                        </span>
                        <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginLeft: 'var(--ds-spacing-3)' }}>
                          {message.timestamp.split(' ')[1]}
                        </span>
                      </div>
                      <Paragraph data-size="sm" style={{ margin: 0 }}>
                        {message.content}
                      </Paragraph>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div style={{ padding: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', gap: 'var(--ds-spacing-3)' }}>
                <input
                  type="text"
                  placeholder="Skriv en melding..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 'var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                />
                <Button type="button" variant="primary" data-size="md">
                  <SendIcon />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Velg en samtale for å se meldinger
              </Paragraph>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
