export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          details: string
          event_category: Database["public"]["Enums"]["event_category"]
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["event_status"]
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          details: string
          event_category: Database["public"]["Enums"]["event_category"]
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["event_status"]
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          details?: string
          event_category?: Database["public"]["Enums"]["event_category"]
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["event_status"]
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          category: Database["public"]["Enums"]["announcement_category"]
          created_at: string
          created_by: string
          description: string
          id: string
          image_url: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["announcement_category"]
          created_at?: string
          created_by: string
          description: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["announcement_category"]
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applicant_profiles: {
        Row: {
          ai_processed: boolean | null
          blood_type: string | null
          citizenship: string | null
          civil_status: string | null
          created_at: string
          date_of_birth: string | null
          education: Json | null
          eligibilities: Json | null
          extraction_confidence: number | null
          extraction_date: string | null
          first_name: string | null
          height: number | null
          highest_educational_attainment: string | null
          id: string
          middle_name: string | null
          mobile_number: string | null
          ocr_processed: boolean | null
          permanent_address: string | null
          phone_number: string | null
          place_of_birth: string | null
          residential_address: string | null
          sex: string | null
          skills: string[] | null
          surname: string | null
          total_years_experience: number | null
          trainings_attended: Json | null
          updated_at: string
          user_id: string
          weight: number | null
          work_experience: Json | null
        }
        Insert: {
          ai_processed?: boolean | null
          blood_type?: string | null
          citizenship?: string | null
          civil_status?: string | null
          created_at?: string
          date_of_birth?: string | null
          education?: Json | null
          eligibilities?: Json | null
          extraction_confidence?: number | null
          extraction_date?: string | null
          first_name?: string | null
          height?: number | null
          highest_educational_attainment?: string | null
          id?: string
          middle_name?: string | null
          mobile_number?: string | null
          ocr_processed?: boolean | null
          permanent_address?: string | null
          phone_number?: string | null
          place_of_birth?: string | null
          residential_address?: string | null
          sex?: string | null
          skills?: string[] | null
          surname?: string | null
          total_years_experience?: number | null
          trainings_attended?: Json | null
          updated_at?: string
          user_id: string
          weight?: number | null
          work_experience?: Json | null
        }
        Update: {
          ai_processed?: boolean | null
          blood_type?: string | null
          citizenship?: string | null
          civil_status?: string | null
          created_at?: string
          date_of_birth?: string | null
          education?: Json | null
          eligibilities?: Json | null
          extraction_confidence?: number | null
          extraction_date?: string | null
          first_name?: string | null
          height?: number | null
          highest_educational_attainment?: string | null
          id?: string
          middle_name?: string | null
          mobile_number?: string | null
          ocr_processed?: boolean | null
          permanent_address?: string | null
          phone_number?: string | null
          place_of_birth?: string | null
          residential_address?: string | null
          sex?: string | null
          skills?: string[] | null
          surname?: string | null
          total_years_experience?: number | null
          trainings_attended?: Json | null
          updated_at?: string
          user_id?: string
          weight?: number | null
          work_experience?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "applicant_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          algorithm_used: string | null
          applicant_id: string
          applicant_profile_id: string | null
          created_at: string
          education_score: number | null
          eligibility_score: number | null
          experience_score: number | null
          id: string
          job_id: string
          match_score: number | null
          notification_sent: boolean | null
          pds_file_name: string
          pds_file_url: string
          rank: number | null
          ranking_reasoning: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          skills_score: number | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          algorithm_used?: string | null
          applicant_id: string
          applicant_profile_id?: string | null
          created_at?: string
          education_score?: number | null
          eligibility_score?: number | null
          experience_score?: number | null
          id?: string
          job_id: string
          match_score?: number | null
          notification_sent?: boolean | null
          pds_file_name: string
          pds_file_url: string
          rank?: number | null
          ranking_reasoning?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skills_score?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          algorithm_used?: string | null
          applicant_id?: string
          applicant_profile_id?: string | null
          created_at?: string
          education_score?: number | null
          eligibility_score?: number | null
          experience_score?: number | null
          id?: string
          job_id?: string
          match_score?: number | null
          notification_sent?: boolean | null
          pds_file_name?: string
          pds_file_url?: string
          rank?: number | null
          ranking_reasoning?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skills_score?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_applicant_profile_id_fkey"
            columns: ["applicant_profile_id"]
            isOneToOne: false
            referencedRelation: "applicant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          changed_fields: string[] | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          operation: Database["public"]["Enums"]["audit_operation"]
          record_id: string
          table_name: string
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          changed_fields?: string[] | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          operation: Database["public"]["Enums"]["audit_operation"]
          record_id: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          changed_fields?: string[] | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: Database["public"]["Enums"]["audit_operation"]
          record_id?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          created_by: string
          degree_requirement: string
          description: string
          eligibilities: string[]
          employment_type: string | null
          id: string
          location: string | null
          skills: string[]
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          years_of_experience: number
        }
        Insert: {
          created_at?: string
          created_by: string
          degree_requirement: string
          description: string
          eligibilities?: string[]
          employment_type?: string | null
          id?: string
          location?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          years_of_experience?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          degree_requirement?: string
          description?: string
          eligibilities?: string[]
          employment_type?: string | null
          id?: string
          location?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type:
            | Database["public"]["Enums"]["related_entity_type"]
            | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?:
            | Database["public"]["Enums"]["related_entity_type"]
            | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?:
            | Database["public"]["Enums"]["related_entity_type"]
            | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_login_at: string | null
          phone: string | null
          profile_image_url: string | null
          remember_token: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          last_login_at?: string | null
          phone?: string | null
          profile_image_url?: string | null
          remember_token?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          phone?: string | null
          profile_image_url?: string | null
          remember_token?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      training_applications: {
        Row: {
          address: string
          applicant_id: string
          created_at: string
          email: string
          full_name: string
          highest_education: string
          id: string
          id_image_name: string
          id_image_url: string
          notification_sent: boolean | null
          phone: string
          program_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          address: string
          applicant_id: string
          created_at?: string
          email: string
          full_name: string
          highest_education: string
          id?: string
          id_image_name: string
          id_image_url: string
          notification_sent?: boolean | null
          phone: string
          program_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          address?: string
          applicant_id?: string
          created_at?: string
          email?: string
          full_name?: string
          highest_education?: string
          id?: string
          id_image_name?: string
          id_image_url?: string
          notification_sent?: boolean | null
          phone?: string
          program_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          capacity: number
          created_at: string
          created_by: string
          description: string
          duration: string
          end_date: string | null
          enrolled_count: number
          icon: string | null
          id: string
          location: string | null
          schedule: string | null
          skills_covered: string[] | null
          start_date: string
          status: Database["public"]["Enums"]["training_program_status"]
          title: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          created_by: string
          description: string
          duration: string
          end_date?: string | null
          enrolled_count?: number
          icon?: string | null
          id?: string
          location?: string | null
          schedule?: string | null
          skills_covered?: string[] | null
          start_date: string
          status?: Database["public"]["Enums"]["training_program_status"]
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          created_by?: string
          description?: string
          duration?: string
          end_date?: string | null
          enrolled_count?: number
          icon?: string | null
          id?: string
          location?: string | null
          schedule?: string | null
          skills_covered?: string[] | null
          start_date?: string
          status?: Database["public"]["Enums"]["training_program_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_programs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_application: {
        Args: { p_application_id: string; p_reviewer_id: string }
        Returns: boolean
      }
      can_apply_to_job: {
        Args: { p_job_id: string; p_user_id: string }
        Returns: boolean
      }
      can_delete_profile: {
        Args: { p_deleter_id: string; p_target_user_id: string }
        Returns: boolean
      }
      can_modify_profile_role: {
        Args: {
          p_modifier_id: string
          p_new_role: Database["public"]["Enums"]["user_role"]
          p_target_user_id: string
        }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_link_url?: string
          p_message: string
          p_related_entity_id?: string
          p_related_entity_type?: Database["public"]["Enums"]["related_entity_type"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      deny_application: {
        Args: {
          p_application_id: string
          p_reason?: string
          p_reviewer_id: string
        }
        Returns: boolean
      }
      get_applicant_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: {
          approved_applications: number
          approved_training: number
          denied_applications: number
          has_profile: boolean
          pending_applications: number
          pending_training: number
          profile_completeness: number
          total_applications: number
          training_applications: number
        }[]
      }
      get_application_statistics: {
        Args: never
        Returns: {
          active_jobs: number
          approved_applications: number
          denied_applications: number
          pending_applications: number
          total_applicants: number
          total_applications: number
        }[]
      }
      get_available_training_slots: {
        Args: { p_program_id: string }
        Returns: number
      }
      get_hr_dashboard_stats: {
        Args: { p_user_id?: string }
        Returns: {
          active_jobs: number
          approved_applications: number
          avg_match_score: number
          denied_applications: number
          hidden_jobs: number
          pending_applications: number
          total_applicants: number
          total_applications: number
          total_jobs: number
        }[]
      }
      get_peso_dashboard_stats: {
        Args: { p_user_id?: string }
        Returns: {
          active_programs: number
          approved_applications: number
          completed_programs: number
          denied_applications: number
          pending_applications: number
          total_applications: number
          total_capacity: number
          total_enrolled: number
          total_programs: number
          upcoming_programs: number
        }[]
      }
      get_training_statistics: {
        Args: never
        Returns: {
          active_programs: number
          approved_applications: number
          filled_slots: number
          pending_applications: number
          total_applications: number
          total_programs: number
          total_slots: number
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          can_approve_applications: boolean
          can_approve_training_applications: boolean
          can_manage_jobs: boolean
          can_manage_training: boolean
          can_manage_users: boolean
          can_view_activity_logs: boolean
          can_view_audit_logs: boolean
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role:
        | { Args: { required_role: string; user_id: string }; Returns: boolean }
        | {
            Args: {
              check_role: Database["public"]["Enums"]["user_role"]
              user_id: string
            }
            Returns: boolean
          }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_content_creator: {
        Args: { p_content_id: string; p_table_name: string; p_user_id: string }
        Returns: boolean
      }
      log_activity:
        | {
            Args: {
              p_details: string
              p_event_category: string
              p_event_type: string
              p_metadata?: Json
              p_status?: string
              p_user_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_details: string
              p_event_category: Database["public"]["Enums"]["event_category"]
              p_event_type: string
              p_metadata?: Json
              p_status?: Database["public"]["Enums"]["event_status"]
              p_user_id: string
            }
            Returns: string
          }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      soft_delete_profile: { Args: { p_user_id: string }; Returns: boolean }
      update_user_last_login: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      validate_job_application: {
        Args: { p_applicant_id: string; p_job_id: string }
        Returns: {
          can_apply: boolean
          reason: string
        }[]
      }
    }
    Enums: {
      announcement_category: "job_opening" | "training" | "notice" | "general"
      announcement_status: "active" | "archived"
      application_status: "pending" | "approved" | "denied"
      audit_operation: "INSERT" | "UPDATE" | "DELETE"
      event_category:
        | "auth"
        | "user_management"
        | "application"
        | "job"
        | "training"
        | "system"
      event_status: "success" | "failed"
      job_status: "active" | "hidden" | "archived"
      notification_type:
        | "application_status"
        | "training_status"
        | "announcement"
        | "system"
      related_entity_type:
        | "application"
        | "training_application"
        | "announcement"
        | "job"
      training_program_status: "active" | "upcoming" | "completed" | "cancelled"
      user_role: "ADMIN" | "HR" | "PESO" | "APPLICANT"
      user_status: "active" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_category: ["job_opening", "training", "notice", "general"],
      announcement_status: ["active", "archived"],
      application_status: ["pending", "approved", "denied"],
      audit_operation: ["INSERT", "UPDATE", "DELETE"],
      event_category: [
        "auth",
        "user_management",
        "application",
        "job",
        "training",
        "system",
      ],
      event_status: ["success", "failed"],
      job_status: ["active", "hidden", "archived"],
      notification_type: [
        "application_status",
        "training_status",
        "announcement",
        "system",
      ],
      related_entity_type: [
        "application",
        "training_application",
        "announcement",
        "job",
      ],
      training_program_status: ["active", "upcoming", "completed", "cancelled"],
      user_role: ["ADMIN", "HR", "PESO", "APPLICANT"],
      user_status: ["active", "inactive"],
    },
  },
} as const
