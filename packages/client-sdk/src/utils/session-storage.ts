/**
 * Session Storage Utility
 * Persists session state across authentication flow
 *
 * Use case: User selects time slots, needs to login, comes back to same state
 */

const SESSION_STORAGE_KEY = 'digilist_auth_session_state';

export interface SessionState {
  // Current path user was on
  returnUrl: string;

  // Booking flow state
  selectedTimeSlots?: {
    listingId: string;
    startTime: string;
    endTime: string;
    date: string;
  }[];

  // Form data
  formData?: Record<string, unknown>;

  // Metadata
  timestamp: number;
  expiresAt: number;
}

/**
 * Save session state before redirecting to login
 */
export function saveSessionState(state: Partial<SessionState>): void {
  try {
    const fullState: SessionState = {
      returnUrl: window.location.pathname + window.location.search,
      timestamp: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      ...state,
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fullState));
  } catch (error) {
    console.error('Failed to save session state:', error);
  }
}

/**
 * Restore session state after successful login
 */
export function restoreSessionState(): SessionState | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const state: SessionState = JSON.parse(stored);

    // Check if expired
    if (Date.now() > state.expiresAt) {
      clearSessionState();
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to restore session state:', error);
    return null;
  }
}

/**
 * Clear session state after restoration
 */
export function clearSessionState(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session state:', error);
  }
}

/**
 * Check if there's a pending session to restore
 */
export function hasPendingSession(): boolean {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!stored) {
      return false;
    }

    const state: SessionState = JSON.parse(stored);

    // Check if expired
    if (Date.now() > state.expiresAt) {
      clearSessionState();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
