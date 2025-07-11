export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      animal: {
        Row: {
          allergies: Json
          behavioral_notes: string | null
          breed: string | null
          color: string | null
          created_at: string
          date_of_birth: string | null
          dietary_requirements: string | null
          gender: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          medical_conditions: Json
          medications: Json
          microchip_id: string | null
          name: string
          owner_id: string
          species: string
          tenant_id: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: Json
          behavioral_notes?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_requirements?: string | null
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_conditions?: Json
          medications?: Json
          microchip_id?: string | null
          name: string
          owner_id: string
          species: string
          tenant_id: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: Json
          behavioral_notes?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_requirements?: string | null
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_conditions?: Json
          medications?: Json
          microchip_id?: string | null
          name?: string
          owner_id?: string
          species?: string
          tenant_id?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contact: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_authorized_for_medical_decisions: boolean
          last_name: string
          notes: string | null
          owner_id: string
          phone: string
          relationship: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_authorized_for_medical_decisions?: boolean
          last_name: string
          notes?: string | null
          owner_id: string
          phone: string
          relationship: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_authorized_for_medical_decisions?: boolean
          last_name?: string
          notes?: string | null
          owner_id?: string
          phone?: string
          relationship?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contact_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_contact_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_record: {
        Row: {
          animal_id: string
          created_at: string
          diagnosis: string | null
          follow_up_date: string | null
          id: string
          lab_results: Json | null
          medications: Json | null
          notes: string | null
          tenant_id: string
          treatment: string | null
          updated_at: string
          veterinarian: string
          visit_date: string
          visit_type: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          lab_results?: Json | null
          medications?: Json | null
          notes?: string | null
          tenant_id: string
          treatment?: string | null
          updated_at?: string
          veterinarian: string
          visit_date: string
          visit_type: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          lab_results?: Json | null
          medications?: Json | null
          notes?: string | null
          tenant_id?: string
          treatment?: string | null
          updated_at?: string
          veterinarian?: string
          visit_date?: string
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animal_with_owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      owner: {
        Row: {
          additional_notes: string | null
          address: Json
          created_at: string
          email: string
          first_name: string
          gdpr_consent: boolean
          id: string
          last_name: string
          phone: string
          preferred_practice: string | null
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          address: Json
          created_at?: string
          email: string
          first_name: string
          gdpr_consent?: boolean
          id?: string
          last_name: string
          phone: string
          preferred_practice?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          address?: Json
          created_at?: string
          email?: string
          first_name?: string
          gdpr_consent?: boolean
          id?: string
          last_name?: string
          phone?: string
          preferred_practice?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant: {
        Row: {
          created_at: string
          custom_domain: string | null
          id: string
          logo: string | null
          name: string
          primary_color: string | null
          settings: Json
          subdomain: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo?: string | null
          name: string
          primary_color?: string | null
          settings?: Json
          subdomain: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo?: string | null
          name?: string
          primary_color?: string | null
          settings?: Json
          subdomain?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_membership: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          role: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role: string
          status: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_membership_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_membership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          email: string
          id: string
          image: string | null
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          image?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          image?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vaccination: {
        Row: {
          administered_by: string | null
          administered_date: string
          animal_id: string
          batch_number: string | null
          created_at: string
          expiration_date: string | null
          id: string
          manufacturer: string | null
          notes: string | null
          tenant_id: string
          updated_at: string
          vaccine_name: string
          vaccine_type: string
        }
        Insert: {
          administered_by?: string | null
          administered_date: string
          animal_id: string
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          manufacturer?: string | null
          notes?: string | null
          tenant_id: string
          updated_at?: string
          vaccine_name: string
          vaccine_type: string
        }
        Update: {
          administered_by?: string | null
          administered_date?: string
          animal_id?: string
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          manufacturer?: string | null
          notes?: string | null
          tenant_id?: string
          updated_at?: string
          vaccine_name?: string
          vaccine_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animal_with_owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      animal_with_owner: {
        Row: {
          allergies: Json | null
          behavioral_notes: string | null
          breed: string | null
          color: string | null
          created_at: string | null
          date_of_birth: string | null
          dietary_requirements: string | null
          gender: string | null
          id: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          medical_conditions: Json | null
          medications: Json | null
          microchip_id: string | null
          name: string | null
          owner_email: string | null
          owner_first_name: string | null
          owner_id: string | null
          owner_last_name: string | null
          owner_phone: string | null
          species: string | null
          tenant_id: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_audit_triggers: {
        Args: { target_table: string }
        Returns: undefined
      }
      check_tenant_membership: {
        Args: { tenant_id: string; user_id: string }
        Returns: boolean
      }
      get_upcoming_vaccinations: {
        Args: { days_ahead?: number; tenant_id_param?: string }
        Returns: {
          animal_id: string
          animal_name: string
          species: string
          breed: string
          owner_id: string
          owner_first_name: string
          owner_last_name: string
          owner_email: string
          owner_phone: string
          vaccine_name: string
          vaccine_type: string
          expiration_date: string
          days_until_expiration: number
        }[]
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
    Enums: {},
  },
} as const
