// Minimal Supabase types for build compatibility
export interface Database {
  public: {
    Tables: {
      tenant: {
        Row: {
          id: string
          name: string
          slug: string
          logo: string | null
          subdomain: string | null
          custom_domain: string | null
          primary_color: string | null
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      tenant_membership: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          role: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
  }
  calendar: {
    Tables: {
      appointment: {
        Row: {
          id: string
          title: string
          start_time: string
          end_time: string
          status: string
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          start_time: string
          end_time: string
          status?: string
          tenant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          start_time?: string
          end_time?: string
          status?: string
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointment_type: {
        Row: {
          id: string
          name: string
          color: string | null
          duration: number | null
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          duration?: number | null
          tenant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          duration?: number | null
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      staff_profile: {
        Row: {
          id: string
          user_id: string
          staff_type: string
          color: string | null
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          staff_type: string
          color?: string | null
          tenant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          staff_type?: string
          color?: string | null
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      appointment_details: {
        Row: {
          appointment_id: string | null
          start_time: string | null
          end_time: string | null
          status: string | null
          reason: string | null
          notes: string | null
          appointment_type_name: string | null
          appointment_type_color: string | null
          appointment_type_duration: number | null
          owner_id: string | null
          owner_first_name: string | null
          owner_last_name: string | null
          owner_email: string | null
          owner_phone: string | null
          animal_id: string | null
          animal_name: string | null
          animal_species: string | null
          animal_breed: string | null
          staff_id: string | null
          staff_first_name: string | null
          staff_last_name: string | null
          staff_color: string | null
          tenant_id: string | null
        }
      }
    }
    Functions: {}
  }
}