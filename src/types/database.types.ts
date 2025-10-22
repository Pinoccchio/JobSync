/**
 * Database Type Definitions
 *
 * These types should be auto-generated from your Supabase schema.
 * Once you create your database tables in Supabase, run:
 *
 * npx supabase gen types typescript --project-id ajmftwhmskcvljlfvhjf > src/types/database.types.ts
 *
 * Or use the Supabase CLI:
 * supabase gen types typescript --local > src/types/database.types.ts
 *
 * For now, here are placeholder types based on the required schema:
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT';
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string;
          degree_requirement: string;
          eligibilities: string[];
          skills: string[];
          years_of_experience: number;
          status: 'active' | 'hidden' | 'archived';
          created_by: string; // user_id (HR)
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          applicant_id: string;
          pds_file_url: string;
          status: 'pending' | 'approved' | 'denied';
          rank: number | null;
          match_score: number | null;
          education_score: number | null;
          experience_score: number | null;
          skills_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at' | 'rank' | 'match_score'>;
        Update: Partial<Database['public']['Tables']['applications']['Insert']>;
      };
      applicant_profiles: {
        Row: {
          id: string;
          user_id: string;
          education: any[]; // JSON array of education entries
          work_experience: any[]; // JSON array of work experience
          eligibilities: string[];
          skills: string[];
          total_years_experience: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applicant_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['applicant_profiles']['Insert']>;
      };
      training_programs: {
        Row: {
          id: string;
          title: string;
          description: string;
          duration: string;
          capacity: number;
          start_date: string;
          end_date: string;
          status: 'active' | 'completed' | 'cancelled';
          created_by: string; // user_id (PESO)
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['training_programs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['training_programs']['Insert']>;
      };
      training_applications: {
        Row: {
          id: string;
          program_id: string;
          applicant_id: string;
          id_image_url: string;
          status: 'pending' | 'approved' | 'denied';
          submitted_at: string;
        };
        Insert: Omit<Database['public']['Tables']['training_applications']['Row'], 'id' | 'submitted_at'>;
        Update: Partial<Database['public']['Tables']['training_applications']['Insert']>;
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          details: string;
          ip_address: string | null;
          timestamp: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'timestamp'>;
        Update: never; // Activity logs should not be updated
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT';
      application_status: 'pending' | 'approved' | 'denied';
      job_status: 'active' | 'hidden' | 'archived';
    };
  };
}
