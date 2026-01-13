import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Badge, Spinner } from '@xala/ds';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
  type Conversation,
  type Message,
} from '@xala/sdk';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('nb-NO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations from API
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations();
  const conversations = conversationsData?.data ?? [];

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(
    { conversationId: selectedConversationId! },
    !!selectedConversationId
  );
  const messages = messagesData?.data ?? [];

  // Mutations
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesRead();

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      const conversation = conversations.find((c) => c.id === selectedConversationId);
      if (conversation && conversation.unreadCount > 0) {
        markAsRead.mutate(selectedConversationId);
      }
    }
  }, [selectedConversationId, conversations]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Filter conversations by search query
  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          c.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    sendMessage.mutate(
      {
        conversationId: selectedConversationId,
        content: messageInput.trim(),
      },
      {
        onSuccess: () => {
          setMessageInput('');
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            {isLoadingConversations ? (
              <div style={{ padding: 'var(--ds-spacing-8)', display: 'flex', justifyContent: 'center' }}>
                <Spinner />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  {searchQuery ? 'Ingen samtaler funnet.' : 'Ingen samtaler ennå.'}
                </Paragraph>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    cursor: 'pointer',
                    backgroundColor: selectedConversationId === conversation.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-1)' }}>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)', fontSize: 'var(--ds-font-size-sm)' }}>
                      {conversation.userName || 'Ukjent bruker'}
                    </span>
                    <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ''}
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
                      {conversation.lastMessage || 'Ingen meldinger'}
                    </Paragraph>
                    {(conversation.unreadCount || 0) > 0 && (
                      <Badge data-color="danger" data-size="sm" style={{ marginLeft: 'var(--ds-spacing-2)' }}>
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
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
                    {selectedConversation.userName || 'Ukjent bruker'}
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
                {isLoadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
                    <Spinner />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                    <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                      Ingen meldinger ennå. Start samtalen!
                    </Paragraph>
                  </div>
                ) : (
                  messages.map((message) => (
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
                            {message.senderName || (message.sender === 'admin' ? 'Admin' : 'Bruker')}
                          </span>
                          <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginLeft: 'var(--ds-spacing-3)' }}>
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <Paragraph data-size="sm" style={{ margin: 0 }}>
                          {message.content}
                        </Paragraph>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div style={{ padding: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', gap: 'var(--ds-spacing-3)' }}>
                <input
                  type="text"
                  placeholder="Skriv en melding..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: 'var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                />
                <Button
                  type="button"
                  variant="primary"
                  data-size="md"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                >
                  <SendIcon />
                  {sendMessage.isPending ? 'Sender...' : 'Send'}
                </Button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {isLoadingConversations ? 'Laster samtaler...' : 'Velg en samtale for å se meldinger'}
              </Paragraph>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
