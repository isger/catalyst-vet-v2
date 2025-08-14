export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["calendar"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["calendar"]["Tables"])
    ? (Database["public"]["Tables"] & Database["calendar"]["Tables"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export interface Database {
  public: {
    Tables: {
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
          user_id: string
          tenant_id: string
          role: string
          status: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          role?: string
          status?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          role?: string
          status?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      activity_comment: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      // Add other tables as needed
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  calendar: {
    Tables: {
      appointment: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      appointment_type: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      staff_profile: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      appointment_staff: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}