export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  calendar: {
    Tables: {
      appointment: {
        Row: {
          id: string
          tenant_id: string
          animal_id: string
          appointment_type_id: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          animal_id: string
          appointment_type_id: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          animal_id?: string
          appointment_type_id?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointment_staff: {
        Row: {
          id: string
          appointment_id: string
          staff_profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          staff_profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          staff_profile_id?: string
          created_at?: string
        }
      }
      appointment_type: {
        Row: {
          id: string
          name: string
          description: string | null
          duration: number
          color: string | null
          default_room_type: string | null
          requires_equipment: boolean | null
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration: number
          color?: string | null
          default_room_type?: string | null
          requires_equipment?: boolean | null
          tenant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration?: number
          color?: string | null
          default_room_type?: string | null
          requires_equipment?: boolean | null
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_appointments_in_range: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_staff_id?: string
          p_tenant_id: string
        }
        Returns: any[]
      }
    }
  }
  public: {
    Tables: {
      animal: {
        Row: {
          id: string
          name: string
          species: string
          breed: string | null
          color: string | null
          gender: string | null
          date_of_birth: string | null
          weight_kg: number | null
          microchip_id: string | null
          owner_id: string
          insurance_provider: string | null
          insurance_policy_number: string | null
          allergies: Json | null
          medical_conditions: Json | null
          medications: Json | null
          behavioral_notes: string | null
          dietary_requirements: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          species: string
          breed?: string | null
          color?: string | null
          gender?: string | null
          date_of_birth?: string | null
          weight_kg?: number | null
          microchip_id?: string | null
          owner_id: string
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          allergies?: Json | null
          medical_conditions?: Json | null
          medications?: Json | null
          behavioral_notes?: string | null
          dietary_requirements?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          species?: string
          breed?: string | null
          color?: string | null
          gender?: string | null
          date_of_birth?: string | null
          weight_kg?: number | null
          microchip_id?: string | null
          owner_id?: string
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          allergies?: Json | null
          medical_conditions?: Json | null
          medications?: Json | null
          behavioral_notes?: string | null
          dietary_requirements?: string | null
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      customer: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      tenant: {
        Row: {
          id: string
          name: string
          subdomain: string
          custom_domain: string | null
          logo: string | null
          primary_color: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          custom_domain?: string | null
          logo?: string | null
          primary_color?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          custom_domain?: string | null
          logo?: string | null
          primary_color?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tenant_membership: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: string
          status: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          created_at: string
          updated_at: string
          user: {
            id: string
            email: string
            name: string | null
          }
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role: string
          status?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: string
          status?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      add_audit_triggers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_tenant_membership: {
        Args: {
          tenant_uuid: string
        }
        Returns: boolean
      }
      get_upcoming_vaccinations: {
        Args: {
          tenant_uuid: string
          days_ahead: number
        }
        Returns: any[]
      }
      is_staff_available: {
        Args: {
          staff_id: string
          start_time: string
          end_time: string
          exclude_appointment_id?: string
        }
        Returns: boolean
      }
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["calendar"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database["public"]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database["public"]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["calendar"]["Tables"])
    ? (Database["public"]["Tables"] &
        Database["calendar"]["Tables"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never