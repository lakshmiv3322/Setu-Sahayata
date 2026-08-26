import { supabaseBrowser as supabase } from './supabase-browser';

export type AuditAction =
  | 'PROFILE_CREATED'
  | 'PROFILE_UPDATED'
  | 'DOCUMENT_EXTRACTED'
  | 'CONSENT_GRANTED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_OUTCOME_REPORTED'
  | 'ACCOUNT_DELETED';

/**
 * Asynchronously writes an audit event to the Supabase audit_logs table.
 * Fails silently if Supabase is offline/misconfigured so main UI flows are never blocked.
 */
export async function logAuditEvent(
  action: AuditAction,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      },
    });
  } catch (err) {
    console.warn('[AuditLogger] Failed to log audit event:', err);
  }
}
