import { Database } from './database.types';

/**
 * Supabase Type Helpers
 *
 * These types provide convenient access to database table types
 * and help with type-safe database queries
 */

// Table row types (for SELECT queries)
export type User = Database['public']['Tables']['users']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicantProfile = Database['public']['Tables']['applicant_profiles']['Row'];
export type TrainingProgram = Database['public']['Tables']['training_programs']['Row'];
export type TrainingApplication = Database['public']['Tables']['training_applications']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

// Insert types (for INSERT queries)
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type ApplicantProfileInsert = Database['public']['Tables']['applicant_profiles']['Insert'];
export type TrainingProgramInsert = Database['public']['Tables']['training_programs']['Insert'];
export type TrainingApplicationInsert = Database['public']['Tables']['training_applications']['Insert'];
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];

// Update types (for UPDATE queries)
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];
export type ApplicantProfileUpdate = Database['public']['Tables']['applicant_profiles']['Update'];
export type TrainingProgramUpdate = Database['public']['Tables']['training_programs']['Update'];
export type TrainingApplicationUpdate = Database['public']['Tables']['training_applications']['Update'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type ApplicationStatus = Database['public']['Enums']['application_status'];
export type JobStatus = Database['public']['Enums']['job_status'];

// Extended types with relations (for joined queries)
export interface ApplicationWithRelations extends Application {
  applicant?: ApplicantProfile;
  job?: Job;
}

export interface JobWithApplications extends Job {
  applications?: Application[];
}

export interface TrainingProgramWithApplications extends TrainingProgram {
  applications?: TrainingApplication[];
}

// Gemini AI Ranking Types
export interface RankingScores {
  education_score: number;
  experience_score: number;
  skills_score: number;
  final_score: number;
}

export interface RankingDetails {
  score: number;
  reasoning: string;
  algorithm: string;
}

export interface FullRankingResult {
  application_id: string;
  education: RankingDetails;
  experience: RankingDetails;
  skills: RankingDetails;
  final: RankingDetails;
  ranked_at: string;
}
