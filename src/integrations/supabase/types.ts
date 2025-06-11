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
      companies: {
        Row: {
          company_size: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string
          website: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          availability: string | null
          cover_letter: string | null
          created_at: string
          experience_summary: string | null
          id: string
          job_id: string
          portfolio_url: string | null
          resume_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          availability?: string | null
          cover_letter?: string | null
          created_at?: string
          experience_summary?: string | null
          id?: string
          job_id: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          availability?: string | null
          cover_letter?: string | null
          created_at?: string
          experience_summary?: string | null
          id?: string
          job_id?: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_email: string | null
          application_url: string | null
          benefits: string | null
          company_id: string
          created_at: string
          description: string
          experience_level: string | null
          id: string
          images: string[] | null
          is_remote: boolean | null
          job_type: string | null
          location: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_email?: string | null
          application_url?: string | null
          benefits?: string | null
          company_id: string
          created_at?: string
          description: string
          experience_level?: string | null
          id?: string
          images?: string[] | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_email?: string | null
          application_url?: string | null
          benefits?: string | null
          company_id?: string
          created_at?: string
          description?: string
          experience_level?: string | null
          id?: string
          images?: string[] | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          experience: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          skills: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
