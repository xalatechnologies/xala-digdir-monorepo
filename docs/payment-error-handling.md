# Payment Integration - Error Handling and Edge Cases

## Overview

This document describes error handling for the Vipps payment integration, including edge cases, expected behaviors, and recovery strategies.

## Error Categories

### 1. Payment Initiation Errors

#### 1.1 Payment Timeout
**Scenario:** User takes too long to complete payment in Vipps app (>10 minutes)

**Expected Behavior:**
- Payment status becomes `EXPIRED`
- User sees timeout message on callback page
- Clear explanation: "Betalingssessjonen utløp. Prøv igjen."
- Options: Retry payment, Return home

**Technical Details:**
- Vipps payment sessions expire after 10 minutes
- Backend should not process expired payments
- Frontend shows user-friendly message with retry option

**Implementation:**
```typescript
if (paymentStatus === 'EXPIRED') {
  return {
    type: 'timeout',
    title: 'Betalingssessjonen utløp',
    message: 'Betalingen tok for lang tid. Vennligst prøv igjen.',
    actions: ['retry', 'home']
  };
}
```

#### 1.2 Invalid Payment Amount
**Scenario:** Amount is negative, zero, or exceeds maximum

**Expected Behavior:**
- Payment initiation fails with validation error
- User sees error in booking dialog
- Clear message: "Ugyldig beløp"
- Payment button remains enabled for retry

**Validation Rules:**
- Amount must be > 0
- Amount must be <= 999,999 NOK
- Amount must be integer (øre)

#### 1.3 Network Timeout
**Scenario:** Network request to Vipps API times out

**Expected Behavior:**
- Loading state ends after timeout
- Error message: "Nettverksfeil. Vennligst sjekk tilkoblingen."
- Payment button becomes enabled again
- User can retry immediately

**Implementation:**
- Client-side timeout: 30 seconds
- Server-side timeout: 10 seconds
- Automatic retry with exponential backoff (not implemented yet)

#### 1.4 Duplicate Payment
**Scenario:** User tries to initiate payment for already-paid booking

**Expected Behavior:**
- Backend returns 409 Conflict
- Frontend shows: "Denne bookingen er allerede betalt"
- User redirected to booking confirmation
- No duplicate charge

**Prevention:**
- Check booking payment status before showing payment button
- Disable payment button if already paid
- Backend validates booking is unpaid before creating Vipps order

### 2. Payment Callback Errors

#### 2.1 User Cancels Payment
**Scenario:** User clicks "Cancel" in Vipps app

**Expected Behavior:**
- Payment status becomes `CANCELLED`
- Callback page shows: "Du avbrøt betalingen"
- Booking remains unpaid
- Options: Try again, Return home

**Implementation:**
```typescript
if (paymentStatus === 'CANCELLED') {
  return {
    type: 'cancelled',
    title: 'Betaling avbrutt',
    message: 'Du avbrøt betalingen. Bookingen er ikke bekreftet.',
    actions: ['retry', 'home']
  };
}
```

#### 2.2 Payment Declined
**Scenario:** Bank/card issuer declines payment

**Expected Behavior:**
- Payment status becomes `FAILED`
- User sees: "Betalingen ble avvist"
- Error reason if available: "Utilstrekkelige midler", "Kortet er utløpt"
- Options: Try different payment method, Contact bank

**Common Decline Reasons:**
- Insufficient funds
- Card expired
- Card blocked
- Invalid CVV/PIN
- Daily limit exceeded

#### 2.3 Missing Order ID
**Scenario:** User navigates to callback page without orderId parameter

**Expected Behavior:**
- Error page displays immediately (no loading)
- Message: "Ugyldig betalingslenke"
- Explanation: "Ingen ordre-ID ble funnet"
- Single action: Return home

**Implementation:**
```typescript
if (!orderId) {
  return <ErrorState
    title="Ugyldig betalingslenke"
    message="Ingen ordre-ID ble funnet. Vennligst start bookingen på nytt."
    action="home"
  />;
}
```

#### 2.4 Invalid Order ID
**Scenario:** Order ID doesn't exist in system

**Expected Behavior:**
- Backend returns 404 Not Found
- Frontend shows: "Betalingen ble ikke funnet"
- User can return home
- Booking may exist but payment record is missing

#### 2.5 Network Error During Status Check
**Scenario:** Cannot reach backend to check payment status

**Expected Behavior:**
- Loading state with retry spinner
- Auto-retry 3 times with delays: 2s, 4s, 8s
- After retries: Show error with manual retry button
- Message: "Kunne ikke sjekke betalingsstatus. Prøv igjen."

### 3. Refund Errors (Backoffice)

#### 3.1 Refund Amount Exceeds Available
**Scenario:** Admin tries to refund more than paid amount

**Expected Behavior:**
- Input validation shows error
- Error message: "Beløpet kan ikke overstige [maxAmount] kr"
- Confirm button disabled
- Max refundable amount shown clearly

**Validation:**
```typescript
const maxRefundable = originalAmount - refundedAmount;
if (refundAmount > maxRefundable) {
  return 'Beløpet kan ikke overstige ' + formatCurrency(maxRefundable);
}
```

#### 3.2 Refund of Already Refunded Payment
**Scenario:** Admin tries to refund payment that's fully refunded

**Expected Behavior:**
- Backend returns 409 Conflict
- Error message: "Denne betalingen er allerede refundert"
- Dialog closes automatically
- Payment status updated to show full refund

#### 3.3 Refund Processing Timeout
**Scenario:** Vipps API doesn't respond within timeout

**Expected Behavior:**
- Loading spinner with timeout message after 15s
- Message: "Refunderingen tar lengre tid enn forventet..."
- After 30s: "Refunderingen pågår fortsatt. Sjekk status om noen minutter."
- Status remains "processing" until confirmation

#### 3.4 Refund of Uncaptured Payment
**Scenario:** Admin tries to refund a payment that was only authorized

**Expected Behavior:**
- Backend returns 400 Bad Request
- Error: "Kan ikke refundere ufanget betaling"
- Explanation: "Betalingen må fanges før den kan refunderes"
- Suggest: Cancel authorization instead

#### 3.5 Insufficient Merchant Funds
**Scenario:** Merchant account has insufficient balance for refund

**Expected Behavior:**
- Backend returns 402 Payment Required
- Error: "Refundering feilet"
- Message: "Utilstrekkelige midler på merchant-konto"
- Action: Contact Vipps support

### 4. Capture Errors (Deposit/Reservation)

#### 4.1 Capture Amount Exceeds Authorized
**Scenario:** Admin tries to capture more than authorized amount

**Expected Behavior:**
- Validation error before API call
- Message: "Beløpet kan ikke overstige autorisert beløp ([amount])"
- Input field shows error state
- Confirm button disabled

#### 4.2 Capture of Already Captured Payment
**Scenario:** Admin tries to capture payment twice

**Expected Behavior:**
- Backend returns 409 Conflict
- Error: "Betalingen er allerede fanget"
- Dialog closes
- Payment status shows as captured

#### 4.3 Capture of Expired Authorization
**Scenario:** Authorization expired (typically after 7 days)

**Expected Behavior:**
- Backend returns 400 Bad Request
- Error: "Autorisasjonen har utløpt"
- Message: "Betalingen kan ikke lenger fanges. Kunde må betale på nytt."
- Payment status shows "expired"

#### 4.4 Capture of Cancelled Payment
**Scenario:** User cancelled payment but admin tries to capture

**Expected Behavior:**
- Backend returns 400 Bad Request
- Error: "Kan ikke fange kansellert betaling"
- Payment status updated to "cancelled"

### 5. Network and Infrastructure Errors

#### 5.1 Vipps API Unavailable (503)
**Scenario:** Vipps service is down for maintenance

**Expected Behavior:**
- Error message: "Vipps er midlertidig utilgjengelig"
- User-friendly explanation: "Prøv igjen om noen minutter"
- Show estimated time if available from Vipps status page
- Retry button with exponential backoff

#### 5.2 Rate Limiting (429)
**Scenario:** Too many requests to Vipps API

**Expected Behavior:**
- Backend queues request
- User sees: "Mange forespørsler akkurat nå. Vent litt..."
- Automatic retry after rate limit window
- Success after queue processes

#### 5.3 Complete Network Offline
**Scenario:** User loses internet connection

**Expected Behavior:**
- Browser's offline detection kicks in
- Message: "Du er frakoblet internett"
- Auto-retry when connection restored
- All pending actions preserved

### 6. Data Validation Errors

#### 6.1 Invalid Currency
**Scenario:** Non-NOK currency specified

**Expected Behavior:**
- Validation error
- Message: "Kun NOK støttes for Vipps-betaling"
- Payment blocked

#### 6.2 Missing Required Fields
**Scenario:** bookingId, amount, or returnUrl missing

**Expected Behavior:**
- TypeScript compile error (caught at build time)
- Runtime validation if dynamic
- Clear error message per field

#### 6.3 Malformed Data
**Scenario:** XSS attempt, SQL injection, etc.

**Expected Behavior:**
- Input sanitization on frontend
- Validation and sanitization on backend
- Rejected with 400 Bad Request
- No code execution, no data corruption

## Error Response Format (RFC 7807)

All API errors follow RFC 7807 Problem Details format:

```typescript
interface ProblemDetails {
  type: string;           // URI identifying error type
  title: string;          // Human-readable summary
  status: number;         // HTTP status code
  detail?: string;        // Human-readable explanation
  instance?: string;      // URI identifying specific occurrence
  [key: string]: any;    // Extension fields
}
```

**Example:**
```json
{
  "type": "https://digilist.no/errors/payment-timeout",
  "title": "Payment Timeout",
  "status": 408,
  "detail": "Payment session expired after 10 minutes of inactivity",
  "orderId": "order-123",
  "expiresAt": "2024-01-14T12:00:00Z"
}
```

## User Experience Guidelines

### Error Message Best Practices

1. **Be Clear and Specific**
   - ❌ "Feil oppstod"
   - ✅ "Betalingen ble avvist av banken"

2. **Provide Context**
   - ❌ "Error 404"
   - ✅ "Betalingen ble ikke funnet. Sjekk ordre-ID og prøv igjen."

3. **Offer Solutions**
   - ❌ "Betaling feilet"
   - ✅ "Betaling feilet. Prøv igjen eller kontakt support."

4. **Use User's Language**
   - All messages in Norwegian (bokmål)
   - Technical details only in logs

5. **Show Progress**
   - Loading states with spinners
   - "Sjekker betalingsstatus..."
   - "Behandler refundering..."

### Recovery Strategies

Every error state should provide:

1. **Clear explanation** - What went wrong
2. **Why it happened** - Context if helpful
3. **What to do** - Actionable next steps
4. **Alternative actions** - Return home, contact support

## Testing Strategy

### Unit Tests (Vitest)
- ✅ All SDK hooks with error mocking
- ✅ Validation functions with edge cases
- ✅ Error message formatting
- ✅ Type checking for ProblemDetails

### Integration Tests
- ✅ Component error states
- ✅ Error boundary behavior
- ✅ Toast/alert notifications
- ✅ Navigation on error

### E2E Tests (Playwright)
- ✅ Payment timeout flow
- ✅ User cancellation flow
- ✅ Network error recovery
- ✅ Duplicate payment prevention
- ✅ Refund failures
- ✅ Capture failures
- ⚠️ Some tests require backend mocks

### Manual Testing Checklist

#### Payment Initiation
- [ ] Enter negative amount → validation error
- [ ] Enter zero amount → validation error
- [ ] Disconnect network → network error
- [ ] Click pay button 3x rapidly → single payment
- [ ] Wait 31 seconds → timeout error

#### Payment Callback
- [ ] Cancel in Vipps app → cancellation message
- [ ] Decline payment → decline message with reason
- [ ] Navigate without orderId → invalid link error
- [ ] Invalid orderId → not found error
- [ ] Network offline → auto-retry on reconnect

#### Refunds
- [ ] Refund amount > paid → validation error
- [ ] Refund fully refunded payment → conflict error
- [ ] Refund without reason → button disabled
- [ ] Network error during refund → retry option
- [ ] Timeout during refund → processing message

#### Captures
- [ ] Capture amount > authorized → validation error
- [ ] Capture already captured → conflict error
- [ ] Capture expired auth → expiration error
- [ ] Capture cancelled payment → invalid state error

## Monitoring and Alerting

### Key Metrics to Track

1. **Error Rate**
   - Payment initiation failures
   - Callback errors
   - Refund failures
   - Capture failures

2. **Error Types**
   - 4xx client errors
   - 5xx server errors
   - Network timeouts
   - Vipps API errors

3. **User Actions**
   - Retry attempts
   - Abandonment after error
   - Support contact rate

### Alert Thresholds

- **Critical:** Error rate > 10% (immediate alert)
- **Warning:** Error rate > 5% (30min alert)
- **Info:** New error type detected

## Security Considerations

### Sensitive Data in Errors

Never expose in error messages:
- Full card numbers
- CVV codes
- User passwords
- API keys
- Internal system details

### Error Logging

Log all errors with:
- ✅ Timestamp
- ✅ User ID (anonymized)
- ✅ Request ID
- ✅ Error type
- ✅ Stack trace (server-side only)
- ❌ Sensitive user data
- ❌ Payment credentials

## Future Improvements

1. **Automatic Retry Logic**
   - Implement exponential backoff
   - Queue failed requests
   - Auto-retry on network restore

2. **Error Analytics**
   - Track error patterns
   - Identify common failure points
   - A/B test error messages

3. **Proactive Error Prevention**
   - Pre-validate payment methods
   - Check Vipps status before initiating
   - Warn users of connectivity issues

4. **Enhanced Error Recovery**
   - Save form state across errors
   - Resume payments after timeout
   - Partial payment support

## Contact and Support

For questions about payment error handling:
- Technical: dev-team@digilist.no
- Business: support@digilist.no
- Vipps Support: https://vipps.no/kontakt-oss

## References

- [RFC 7807 - Problem Details](https://tools.ietf.org/html/rfc7807)
- [Vipps eCom API Documentation](https://vippsas.github.io/vipps-ecom-api/)
- [Vipps Error Codes](https://vippsas.github.io/vipps-ecom-api/#error-codes)
- [HTTP Status Codes](https://httpstatuses.com/)
