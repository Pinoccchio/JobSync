export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      training_programs: {
        Row: {
          id: string
          title: string
          description: string
          duration: string
          start_date: string
          end_date: string | null
          capacity: number
          enrolled_count: number
          location: string | null
          schedule: string | null
          skills_covered: string[] | null
          icon: string | null
          status: Database["public"]["Enums"]["training_program_status"]
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          duration: string
          start_date: string
          end_date?: string | null
          capacity: number
          enrolled_count?: number
          location?: string | null
          schedule?: string | null
          skills_covered?: string[] | null
          icon?: string | null
          status?: Database["public"]["Enums"]["training_program_status"]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          duration?: string
          start_date?: string
          end_date?: string | null
          capacity?: number
          enrolled_count?: number
          location?: string | null
          schedule?: string | null
          skills_covered?: string[] | null
          icon?: string | null
          status?: Database["public"]["Enums"]["training_program_status"]
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      training_program_status: "active" | "upcoming" | "completed" | "cancelled" | "archived" | "scheduled" | "ongoing"
      application_status: "pending" | "approved" | "denied" | "under_review" | "shortlisted" | "interviewed" | "hired" | "archived" | "withdrawn" | "enrolled" | "in_progress" | "completed" | "certified" | "failed"
      user_role: "ADMIN" | "HR" | "PESO" | "APPLICANT"
      user_status: "active" | "inactive"
      job_status: "active" | "hidden" | "archived"
    }
  }
}
