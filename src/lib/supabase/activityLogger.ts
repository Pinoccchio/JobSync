import { supabase } from './auth';

/**
 * Activity Logger
 *
 * Centralized utility for logging user activities to the activity_logs table.
 * All logs are automatically tracked with user context, timestamp, and metadata.
 */

export type EventCategory = 'auth' | 'user_management' | 'application' | 'job' | 'training' | 'system';
export type EventStatus = 'success' | 'failed';

export interface ActivityLogParams {
  eventType: string;
  eventCategory: EventCategory;
  details: string;
  metadata?: Record<string, any>;
  status?: EventStatus;
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * Log an activity to the database
 *
 * @example
 * // Log successful login
 * await logActivity({
 *   eventType: 'login',
 *   eventCategory: 'auth',
 *   details: 'User logged in successfully',
 *   status: 'success'
 * });
 *
 * // Log user creation
 * await logActivity({
 *   eventType: 'user_created',
 *   eventCategory: 'user_management',
 *   details: `Created new user account: ${email}`,
 *   metadata: { role: 'HR', email }
 * });
 */
export async function logActivity(params: ActivityLogParams): Promise<void> {
  try {
    // Get current user session if not provided
    let userId = params.userId;
    let userEmail = params.userEmail;
    let userRole = params.userRole;

    if (!userId || !userEmail || !userRole) {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile for complete data
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          userId = userId || profile.id;
          userEmail = userEmail || profile.email;
          userRole = userRole || profile.role;
        }
      }
    }

    // Insert activity log
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId || null,
        event_type: params.eventType,
        event_category: params.eventCategory,
        user_email: userEmail || null,
        user_role: userRole || null,
        details: params.details,
        status: params.status || 'success',
        metadata: params.metadata || null,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log activity:', error);
    } else {
      console.log(`✅ Activity logged: ${params.eventType}`);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not break the app
  }
}

/**
 * Pre-configured activity loggers for common actions
 */

export const ActivityLogger = {
  // Auth events
  login: (email: string, userId: string, role: string) =>
    logActivity({
      eventType: 'login',
      eventCategory: 'auth',
      details: `User logged in: ${email}`,
      userId,
      userEmail: email,
      userRole: role,
      metadata: { action: 'login' }
    }),

  logout: (email: string, userId: string, role: string) =>
    logActivity({
      eventType: 'logout',
      eventCategory: 'auth',
      details: `User logged out: ${email}`,
      userId,
      userEmail: email,
      userRole: role,
      metadata: { action: 'logout' }
    }),

  loginFailed: (email: string, reason?: string) =>
    logActivity({
      eventType: 'login_failed',
      eventCategory: 'auth',
      details: `Failed login attempt: ${email}${reason ? ` - ${reason}` : ''}`,
      status: 'failed',
      userEmail: email,
      metadata: { reason }
    }),

  // User management events
  userCreated: (email: string, role: string, createdByUserId?: string) =>
    logActivity({
      eventType: 'user_created',
      eventCategory: 'user_management',
      details: `New user account created: ${email} (${role})`,
      userId: createdByUserId,
      metadata: { targetEmail: email, targetRole: role }
    }),

  userDeactivated: (email: string, deactivatedByUserId?: string) =>
    logActivity({
      eventType: 'user_deactivated',
      eventCategory: 'user_management',
      details: `User account deactivated: ${email}`,
      userId: deactivatedByUserId,
      metadata: { targetEmail: email }
    }),

  userDeleted: (email: string, deletedByUserId?: string) =>
    logActivity({
      eventType: 'user_deleted',
      eventCategory: 'user_management',
      details: `User account deleted: ${email}`,
      userId: deletedByUserId,
      metadata: { targetEmail: email }
    }),

  // Application events
  applicationSubmitted: (applicantId: string, jobTitle: string) =>
    logActivity({
      eventType: 'application_submitted',
      eventCategory: 'application',
      details: `Application submitted for: ${jobTitle}`,
      userId: applicantId,
      metadata: { jobTitle }
    }),

  applicationApproved: (applicationId: string, applicantEmail: string, jobTitle: string) =>
    logActivity({
      eventType: 'application_approved',
      eventCategory: 'application',
      details: `Application approved: ${applicantEmail} for ${jobTitle}`,
      metadata: { applicationId, applicantEmail, jobTitle }
    }),

  applicationDenied: (applicationId: string, applicantEmail: string, jobTitle: string) =>
    logActivity({
      eventType: 'application_denied',
      eventCategory: 'application',
      details: `Application denied: ${applicantEmail} for ${jobTitle}`,
      metadata: { applicationId, applicantEmail, jobTitle }
    }),

  // Job events
  jobCreated: (jobTitle: string, createdByUserId?: string) =>
    logActivity({
      eventType: 'job_created',
      eventCategory: 'job',
      details: `New job posting created: ${jobTitle}`,
      userId: createdByUserId,
      metadata: { jobTitle }
    }),

  jobUpdated: (jobTitle: string, updatedByUserId?: string) =>
    logActivity({
      eventType: 'job_updated',
      eventCategory: 'job',
      details: `Job posting updated: ${jobTitle}`,
      userId: updatedByUserId,
      metadata: { jobTitle }
    }),

  jobDeleted: (jobTitle: string, deletedByUserId?: string) =>
    logActivity({
      eventType: 'job_deleted',
      eventCategory: 'job',
      details: `Job posting deleted: ${jobTitle}`,
      userId: deletedByUserId,
      metadata: { jobTitle }
    }),

  // Training events
  trainingProgramCreated: (programTitle: string, createdByUserId?: string) =>
    logActivity({
      eventType: 'training_created',
      eventCategory: 'training',
      details: `New training program created: ${programTitle}`,
      userId: createdByUserId,
      metadata: { programTitle }
    }),

  trainingApplicationSubmitted: (applicantId: string, programTitle: string) =>
    logActivity({
      eventType: 'training_application_submitted',
      eventCategory: 'training',
      details: `Training application submitted for: ${programTitle}`,
      userId: applicantId,
      metadata: { programTitle }
    }),

  // System events
  systemEvent: (description: string, metadata?: Record<string, any>) =>
    logActivity({
      eventType: 'system_event',
      eventCategory: 'system',
      details: description,
      metadata
    }),
};
