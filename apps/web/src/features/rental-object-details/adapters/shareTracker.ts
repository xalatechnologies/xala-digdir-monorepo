/**
 * Share Tracker Adapter
 *
 * Handles share functionality with native share API fallback
 * and audit logging for all share actions.
 */

import { logAuditEvent } from './auditProvider';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export type ShareMedium = 'native' | 'copy' | 'email' | 'whatsapp' | 'facebook' | 'twitter' | 'linkedin';

export interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

export interface ShareResult {
  success: boolean;
  medium: ShareMedium;
  error?: string;
}

// =============================================================================
// UTM Tag Builder
// =============================================================================

export function buildShareUrl(baseUrl: string, medium: ShareMedium): string {
  const t = useT();
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', 'share');
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', 'listing');
  return url.toString();
}

// =============================================================================
// Share Functions
// =============================================================================

/**
 * Check if native share is available
 */
export function isNativeShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share using native share API
 */
export async function shareNative(data: ShareData): Promise<ShareResult> {
  if (!isNativeShareAvailable()) {
    return { success: false, medium: 'native', error: 't('errors.native_share_not_available')' };
  }

  try {
    const sharePayload: { title: string; url: string; text?: string } = {
      title: data.title,
      url: buildShareUrl(data.url, 'native'),
    };
    if (data.description) {
      sharePayload.text = data.description;
    }
    await navigator.share(sharePayload);
    return { success: true, medium: 'native' };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, medium: 'native', error: 't('errors.share_cancelled')' };
    }
    return { success: false, medium: 'native', error: 't('errors.share_failed')' };
  }
}

/**
 * Copy link to clipboard
 */
export async function shareCopyLink(data: ShareData): Promise<ShareResult> {
  try {
    const url = buildShareUrl(data.url, 'copy');
    await navigator.clipboard.writeText(url);
    return { success: true, medium: 'copy' };
  } catch {
    return { success: false, medium: 'copy', error: 't('errors.could_not_copy_to')' };
  }
}

/**
 * Share via email
 */
export function shareEmail(data: ShareData): ShareResult {
  const url = buildShareUrl(data.url, 'email');
  const subject = encodeURIComponent(data.title);
  const body = encodeURIComponent(`${data.description || ''}\n\n${url}`);
  window.open(`mailto:?subject=${subject}&body=${body}`t('common.blank_return_success_true')`${data.title}\n${url}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
  return { success: true, medium: 'whatsapp' };
}

/**
 * Share via Facebook
 */
export function shareFacebook(data: ShareData): ShareResult {
  const url = buildShareUrl(data.url, 'facebook');
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  return { success: true, medium: 'facebook' };
}

/**
 * Share via Twitter/X
 */
export function shareTwitter(data: ShareData): ShareResult {
  const url = buildShareUrl(data.url, 'twitter');
  const text = encodeURIComponent(data.title);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  return { success: true, medium: 'twitter' };
}

/**
 * Share via LinkedIn
 */
export function shareLinkedIn(data: ShareData): ShareResult {
  const url = buildShareUrl(data.url, 'linkedin');
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  return { success: true, medium: 'linkedin' };
}

// =============================================================================
// Share with Audit Logging
// =============================================================================

export async function shareWithAudit(
  data: ShareData,
  medium: ShareMedium,
  tenantId: string,
  rentalObjectId: string,
  userId?: string
): Promise<ShareResult> {
  let result: ShareResult;

  switch (medium) {
    case 'native':
      result = await shareNative(data);
      break;
    case 'copy':
      result = await shareCopyLink(data);
      break;
    case 'email':
      result = shareEmail(data);
      break;
    case 'whatsapp':
      result = shareWhatsApp(data);
      break;
    case 'facebook':
      result = shareFacebook(data);
      break;
    case 'twitter':
      result = shareTwitter(data);
      break;
    case 'linkedin':
      result = shareLinkedIn(data);
      break;
    default:
      result = { success: false, medium, error: 't('errors.unknown_share_medium')' };
  }

  // Log audit event (even for anonymous users)
  if (result.success) {
    await logAuditEvent('RENTAL_OBJECT_SHARED', tenantId, rentalObjectId, userId, {
      medium,
      url: data.url,
    });
  }

  return result;
}
