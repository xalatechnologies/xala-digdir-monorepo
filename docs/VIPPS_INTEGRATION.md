# Vipps MobilePay Integration

> Complete integration guide for Vipps Login (OAuth2/OIDC) and Vipps Checkout (Payments) in the Digilist platform.

## Overview

Vipps MobilePay is integrated as the primary authentication and payment solution for the Digilist booking platform. The integration covers:

- **Vipps Login** - OAuth2/OIDC-based user authentication
- **Vipps Checkout** - Payment processing for bookings
- **Webhooks** - Real-time payment status updates

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Frontend                                     │
│   ┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐  │
│   │  Login Button   │     │ Payment Button  │     │  Callback Page   │  │
│   └────────┬────────┘     └────────┬────────┘     └────────┬─────────┘  │
└────────────┼──────────────────────┼───────────────────────┼─────────────┘
             │                      │                       │
             ▼                      ▼                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            SDK Layer                                      │
│   ┌────────────────────────────────────────────────────────────────────┐ │
│   │  vippsAuthService  │  vippsPaymentService  │  Hooks (useVipps*)    │ │
│   └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
             │                      │
             ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            API Layer                                      │
│   ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│   │ /api/auth/vipps │  │/api/payments/vipps│  │ /api/webhooks/vipps  │  │
│   └────────┬────────┘  └────────┬─────────┘  └───────────┬───────────┘  │
└────────────┼───────────────────┼────────────────────────┼───────────────┘
             │                   │                        │
             ▼                   ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                    │
│   ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
│   │  VippsLoginService    │  │       VippsCheckoutService             │  │
│   │  - OIDC Discovery     │  │  - Create checkout sessions            │  │
│   │  - Token exchange     │  │  - Capture payments                    │  │
│   │  - ID token validation│  │  - Refund payments                     │  │
│   │  - User info retrieval│  │  - Status polling                      │  │
│   └───────────────────────┘  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
             │                   │
             ▼                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Vipps Client                                     │
│   ┌────────────────────────────────────────────────────────────────────┐ │
│   │  - API authentication (OAuth client credentials)                   │ │
│   │  - Request signing (Ocp-Apim-Subscription-Key)                     │ │
│   │  - Retry logic with exponential backoff                            │ │
│   │  - Error handling (RFC7807)                                        │ │
│   └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Vipps MobilePay API                                  │
│   ┌───────────────────┐  ┌────────────────────┐  ┌───────────────────┐  │
│   │   Login API v2    │  │   Checkout API     │  │   Webhooks API    │  │
│   │  (OIDC/OAuth2)    │  │   (Payments)       │  │                   │  │
│   └───────────────────┘  └────────────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

```bash
# Vipps API Credentials (from Vipps Portal)
VIPPS_CLIENT_ID=your-client-id
VIPPS_CLIENT_SECRET=your-client-secret
VIPPS_SUBSCRIPTION_KEY=your-ocp-apim-subscription-key
VIPPS_MERCHANT_SERIAL_NUMBER=your-merchant-serial-number

# Environment (test or production)
VIPPS_ENVIRONMENT=test  # or 'production'

# Callback URLs
VIPPS_LOGIN_REDIRECT_URI=https://your-domain.no/api/auth/vipps/callback
VIPPS_PAYMENT_CALLBACK_URL=https://your-domain.no

# Optional: Webhook secret for signature validation
VIPPS_WEBHOOK_SECRET=your-webhook-secret
```

### API Endpoints

| Environment | Base URL |
|-------------|----------|
| Test | `https://apitest.vipps.no` |
| Production | `https://api.vipps.no` |

## Vipps Login (Authentication)

### Flow Overview

```
User                   Frontend                 API                     Vipps
 │                        │                      │                        │
 │  Click "Login"         │                      │                        │
 │───────────────────────>│                      │                        │
 │                        │  POST /auth/vipps/start                       │
 │                        │─────────────────────>│                        │
 │                        │                      │  Generate state/nonce  │
 │                        │  { authorizationUrl }│                        │
 │                        │<─────────────────────│                        │
 │                        │                      │                        │
 │  Redirect to Vipps     │                      │                        │
 │<───────────────────────│                      │                        │
 │                        │                      │                        │
 │  Enter phone, confirm in app                  │                        │
 │───────────────────────────────────────────────────────────────────────>│
 │                        │                      │                        │
 │  Redirect with code    │                      │                        │
 │<───────────────────────────────────────────────────────────────────────│
 │                        │                      │                        │
 │                        │  GET /auth/vipps/callback?code=xxx            │
 │───────────────────────────────────────────────>│                       │
 │                        │                      │  Exchange code         │
 │                        │                      │───────────────────────>│
 │                        │                      │  { tokens }            │
 │                        │                      │<───────────────────────│
 │                        │                      │  Validate ID token     │
 │                        │                      │  Get user info         │
 │                        │                      │  Create/link user      │
 │                        │                      │  Create session        │
 │  Set session cookie    │                      │                        │
 │<───────────────────────────────────────────────│                       │
```

### API Endpoints

#### Start Login

```http
POST /api/auth/vipps/start
Content-Type: application/json

{
  "redirectUri": "https://your-domain.no/auth/callback",
  "scopes": ["openid", "name", "email", "phoneNumber", "address"],
  "loginHint": "+4712345678"  // Optional: pre-fill phone number
}
```

**Response:**
```json
{
  "authorizationUrl": "https://api.vipps.no/access-management-1.0/access/oauth2/auth?...",
  "state": "abc123...",
  "nonce": "xyz789..."
}
```

#### Handle Callback

```http
GET /api/auth/vipps/callback?code=xxx&state=abc123
```

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "vippsId": "vipps-sub",
    "name": "Ola Nordmann",
    "email": "ola@example.no",
    "phone": "+4712345678"
  },
  "session": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": "2026-01-15T12:00:00Z"
  }
}
```

### ID Token Claims

The Vipps ID token includes standard OIDC claims:

| Claim | Description |
|-------|-------------|
| `sub` | Vipps user ID (unique identifier) |
| `name` | Full name |
| `given_name` | First name |
| `family_name` | Last name |
| `email` | Email address |
| `email_verified` | Email verification status |
| `phone_number` | Phone number (+47 format) |
| `address` | Structured address object |
| `birthdate` | Birth date (YYYY-MM-DD) |
| `nin` | National Identity Number (requires approval) |

### Security Considerations

1. **State Parameter** - Generated cryptographically, validated on callback for CSRF protection
2. **Nonce** - Embedded in ID token, validated to prevent replay attacks
3. **JWKS Validation** - ID token signature verified against Vipps JWKS
4. **Redirect URI** - Must match exactly what's registered in Vipps Portal

## Vipps Checkout (Payments)

### Flow Overview

```
User                   Frontend                 API                     Vipps
 │                        │                      │                        │
 │  Confirm booking       │                      │                        │
 │───────────────────────>│                      │                        │
 │                        │  POST /payments/vipps/session                 │
 │                        │─────────────────────>│                        │
 │                        │                      │  Create checkout       │
 │                        │                      │───────────────────────>│
 │                        │                      │  { token, redirectUrl }│
 │                        │                      │<───────────────────────│
 │                        │  { redirectUrl }     │                        │
 │                        │<─────────────────────│                        │
 │                        │                      │                        │
 │  Redirect to Vipps     │                      │                        │
 │<───────────────────────│                      │                        │
 │                        │                      │                        │
 │  Complete payment in Vipps app                │                        │
 │───────────────────────────────────────────────────────────────────────>│
 │                        │                      │                        │
 │  Redirect back         │                      │                        │
 │<───────────────────────────────────────────────────────────────────────│
 │                        │                      │                        │
 │                        │                      │   Webhook: authorized  │
 │                        │                      │<───────────────────────│
 │                        │                      │   Update booking       │
 │                        │                      │                        │
```

### API Endpoints

#### Create Checkout Session

```http
POST /api/payments/vipps/session
Content-Type: application/json

{
  "bookingId": "booking-uuid",
  "amount": 50000,           // Amount in øre (500.00 NOK)
  "currency": "NOK",
  "description": "Booking: Fotballbane A - 20.01.2026 18:00",
  "returnUrl": "https://your-domain.no/bookings/booking-uuid/confirmation",
  "customer": {
    "phoneNumber": "+4712345678",
    "email": "user@example.no"
  }
}
```

**Response:**
```json
{
  "reference": "digilist-booking-uuid-1737000000000",
  "redirectUrl": "https://checkout.vipps.no/...",
  "token": "checkout-token",
  "pollingUrl": "https://api.vipps.no/checkout/v1/session/..."
}
```

#### Get Payment Status

```http
GET /api/payments/vipps/{reference}/status
```

**Response:**
```json
{
  "reference": "digilist-booking-uuid-1737000000000",
  "status": "CAPTURED",
  "amount": 50000,
  "currency": "NOK",
  "bookingId": "booking-uuid",
  "modifiedAt": "2026-01-15T10:30:00Z",
  "capturedAmount": 50000,
  "transactionHistory": [
    { "type": "AUTHORIZED", "amount": 50000, "timestamp": "2026-01-15T10:29:00Z" },
    { "type": "CAPTURED", "amount": 50000, "timestamp": "2026-01-15T10:30:00Z" }
  ]
}
```

#### Capture Payment

```http
POST /api/payments/vipps/{reference}/capture
Content-Type: application/json

{
  "amount": 50000  // Optional: partial capture
}
```

#### Refund Payment

```http
POST /api/payments/vipps/{reference}/refund
Content-Type: application/json

{
  "amount": 25000,  // Optional: partial refund
  "reason": "Customer requested cancellation"
}
```

### Payment Statuses

| Status | Description |
|--------|-------------|
| `CREATED` | Checkout session created, awaiting user action |
| `AUTHORIZED` | User authorized payment, ready for capture |
| `CAPTURED` | Payment captured successfully |
| `CANCELLED` | Payment cancelled by user or merchant |
| `REFUNDED` | Payment has been refunded (full or partial) |
| `FAILED` | Payment failed |
| `EXPIRED` | Checkout session expired |

### Booking State Mapping

```
Payment Status      →    Booking Status
─────────────────────────────────────────
CREATED             →    pending_payment
AUTHORIZED          →    confirmed
CAPTURED            →    confirmed
CANCELLED           →    cancelled
REFUNDED (full)     →    cancelled
REFUNDED (partial)  →    confirmed (with note)
FAILED              →    cancelled
EXPIRED             →    cancelled
```

## Webhooks

### Endpoint

```
POST /api/webhooks/vipps
```

### Event Types

| Event | Description |
|-------|-------------|
| `checkout.session.completed` | User completed checkout flow |
| `checkout.session.paymentAuthorized` | Payment authorized |
| `checkout.session.paymentCaptured` | Payment captured |
| `checkout.session.paymentRefunded` | Payment refunded |
| `checkout.session.paymentCancelled` | Payment cancelled |
| `checkout.session.paymentFailed` | Payment failed |

### Webhook Payload

```json
{
  "eventId": "unique-event-id",
  "eventType": "checkout.session.paymentCaptured",
  "timestamp": "2026-01-15T10:30:00Z",
  "data": {
    "reference": "digilist-booking-uuid-1737000000000",
    "pspReference": "vipps-internal-ref",
    "amount": {
      "value": 50000,
      "currency": "NOK"
    },
    "success": true
  }
}
```

### Security

1. **Signature Validation** - HMAC-SHA256 signature verified against `X-Vipps-Signature` header
2. **Idempotency** - `eventId` tracked to prevent duplicate processing
3. **Audit Logging** - All webhook events logged for compliance

### Idempotency Implementation

```typescript
// Events are tracked in memory (use Redis in production)
const processedEvents = new Map<string, Date>();

function isEventProcessed(eventId: string): boolean {
  return processedEvents.has(eventId);
}

function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, new Date());
}
```

## SDK Usage

### React Hooks

```typescript
import {
  useVippsLogin,
  useVippsCallback,
  useVippsPayment,
} from '@digilist/client-sdk/hooks';

// Login with Vipps
function LoginButton() {
  const { mutate: startLogin, isPending } = useVippsLogin();

  return (
    <Button 
      onClick={() => startLogin({ 
        redirectUri: '/auth/callback',
        scopes: ['openid', 'name', 'email'] 
      })}
      disabled={isPending}
    >
      {isPending ? 'Redirecting...' : 'Login with Vipps'}
    </Button>
  );
}

// Handle Vipps callback
function VippsCallbackPage() {
  const { mutate: handleCallback, isPending, error } = useVippsCallback();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    
    if (code && state) {
      handleCallback({ code, state });
    }
  }, []);

  if (isPending) return <Spinner />;
  if (error) return <Alert>Login failed: {error.message}</Alert>;
  return <Redirect to="/dashboard" />;
}

// Create payment
function PaymentButton({ booking }) {
  const { mutate: createPayment, isPending } = useVippsPayment();

  return (
    <Button
      onClick={() => createPayment({
        bookingId: booking.id,
        amount: booking.totalPrice * 100, // Convert to øre
        description: `Booking: ${booking.listingName}`,
        returnUrl: `/bookings/${booking.id}/confirmation`,
      })}
      disabled={isPending}
    >
      {isPending ? 'Creating...' : 'Pay with Vipps'}
    </Button>
  );
}
```

### Service Methods

```typescript
import { vippsAuthService, vippsPaymentService } from '@digilist/client-sdk/services';

// Start Vipps login
const { authorizationUrl, state, nonce } = await vippsAuthService.startLogin({
  redirectUri: '/auth/callback',
});
// Store state and nonce in session for validation
window.location.href = authorizationUrl;

// Create payment session
const { redirectUrl } = await vippsPaymentService.createCheckoutSession({
  bookingId: 'booking-123',
  amount: 50000,
  description: 'Booking payment',
  returnUrl: '/payment/complete',
});
window.location.href = redirectUrl;

// Check payment status (polling fallback)
const status = await vippsPaymentService.getPaymentStatus('digilist-booking-123-...');
```

## Testing

### Test Environment

Vipps provides a test environment at `https://apitest.vipps.no` with:
- Test phone numbers
- Simulated payment flows
- No real money transferred

### Test Users

Use the Vipps test app or simulator with configured test phone numbers.

### Integration Tests

```typescript
describe('Vipps Login', () => {
  it('should generate authorization URL', async () => {
    const result = await vippsLoginService.getAuthorizationUrl({
      state: 'test-state',
      nonce: 'test-nonce',
      redirectUri: 'http://localhost:3000/callback',
    });

    expect(result.authorizationUrl).toContain('apitest.vipps.no');
    expect(result.state).toBe('test-state');
  });

  it('should exchange code for tokens', async () => {
    // Mock Vipps token endpoint
    const tokens = await vippsLoginService.exchangeCodeForTokens({
      code: 'test-code',
      redirectUri: 'http://localhost:3000/callback',
    });

    expect(tokens.access_token).toBeDefined();
    expect(tokens.id_token).toBeDefined();
  });
});

describe('Vipps Checkout', () => {
  it('should create checkout session', async () => {
    const session = await vippsCheckoutService.createCheckoutSession({
      bookingId: 'test-booking',
      amount: 10000,
      description: 'Test payment',
      returnUrl: 'http://localhost:3000/complete',
    });

    expect(session.reference).toContain('digilist-test-booking');
    expect(session.redirectUrl).toBeDefined();
  });
});

describe('Vipps Webhooks', () => {
  it('should process payment authorized event', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/webhooks/vipps',
      payload: {
        eventId: 'unique-event-1',
        eventType: 'checkout.session.paymentAuthorized',
        data: { reference: 'digilist-booking-123-1234567890' },
      },
    });

    expect(response.statusCode).toBe(200);
  });

  it('should handle duplicate events idempotently', async () => {
    // Send same event twice
    await app.inject({ /* ... */ });
    const response = await app.inject({ /* same payload */ });

    expect(response.json().data.status).toBe('already_processed');
  });
});
```

### E2E Tests (Playwright)

```typescript
test('complete booking with Vipps payment', async ({ page }) => {
  // Navigate to listing
  await page.goto('/listings/test-listing');
  
  // Select time slot and confirm
  await page.click('[data-testid="time-slot-18:00"]');
  await page.click('[data-testid="confirm-booking"]');
  
  // Redirect to Vipps (mock)
  await page.click('[data-testid="pay-with-vipps"]');
  
  // Simulate Vipps callback
  await page.goto('/payment/complete?status=success');
  
  // Verify booking confirmed
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Confirmed');
});
```

## Error Handling

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "/errors/vipps-token-exchange",
  "title": "Token exchange failed",
  "status": 401,
  "detail": "Failed to exchange code for tokens: invalid_grant"
}
```

### Common Error Types

| Error Type | Status | Description |
|------------|--------|-------------|
| `/errors/vipps-oidc-discovery` | 502 | Failed to fetch OIDC configuration |
| `/errors/vipps-token-exchange` | 401 | Code exchange failed |
| `/errors/vipps-invalid-token` | 400 | ID token malformed |
| `/errors/vipps-token-expired` | 401 | ID token expired |
| `/errors/vipps-invalid-nonce` | 401 | Nonce mismatch (replay attack) |
| `/errors/payment-not-found` | 404 | Payment reference not found |

## Audit Logging

All Vipps interactions are logged for compliance:

```typescript
// Login events
'vipps_login_initiated'    // User started login flow
'vipps_token_exchanged'    // Tokens received from Vipps
'vipps_login_completed'    // User successfully authenticated

// Payment events
'checkout_session_created' // Payment session created
'checkout_session_failed'  // Session creation failed
'payment_captured'         // Payment captured
'payment_refunded'         // Payment refunded
'payment_cancelled'        // Payment cancelled

// Webhook events
'vipps_webhook_received'   // Incoming webhook
'vipps_webhook_signature_invalid' // Signature validation failed
'booking_payment_authorized' // Booking updated from webhook
'booking_payment_captured'   // Booking payment captured
```

## Important Notes

### ID-porten vs Vipps Login

> **Important**: Vipps Login is **not** ID-porten. For Norwegian municipal compliance requirements that specifically mandate ID-porten (eIDAS/digital citizen identity), Vipps Login is not a substitute.

Use case guidance:
- **Vipps Login**: Convenient authentication for general users, especially for payment flows
- **ID-porten**: Required for formal citizen authentication in government/municipal contexts

### Rate Limits

Vipps enforces rate limits on API calls. The integration includes:
- Exponential backoff on retries
- Caching of OIDC configuration (1 hour TTL)
- Caching of JWKS keys (1 hour TTL)

### Multi-Tenancy

Each tenant can have their own Vipps credentials configured via:
- Tenant settings in database
- Per-tenant encryption for secrets
- Tenant-scoped audit logging

## References

- [Vipps Login API Documentation](https://developer.vippsmobilepay.com/docs/APIs/login-api/)
- [Vipps Checkout API Documentation](https://developer.vippsmobilepay.com/docs/APIs/checkout-api/)
- [Vipps Webhooks Guide](https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/)
- [Vipps Test Environment](https://developer.vippsmobilepay.com/docs/test-environment/)
