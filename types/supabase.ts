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
  calendar: {
    Tables: {
      appointment: {
        Row: {
          animal_id: string
          appointment_type_id: string
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          notes: string | null
          reason: string | null
          recurring_pattern_id: string | null
          start_time: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          animal_id: string
          appointment_type_id: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          notes?: string | null
          reason?: string | null
          recurring_pattern_id?: string | null
          start_time: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          animal_id?: string
          appointment_type_id?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          reason?: string | null
          recurring_pattern_id?: string | null
          start_time?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["animal_id"]
          },
          {
            foreignKeyName: "appointment_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "patient_appointment_history"
            referencedColumns: ["animal_id"]
          },
          {
            foreignKeyName: "appointment_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["appointment_type_id"]
          },
          {
            foreignKeyName: "appointment_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_availability_details"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointment_recurring_pattern_id_fkey"
            columns: ["recurring_pattern_id"]
            isOneToOne: false
            referencedRelation: "recurring_pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminder: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          reminder_type: string
          scheduled_time: string
          sent_time: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          reminder_type: string
          scheduled_time: string
          sent_time?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          reminder_type?: string
          scheduled_time?: string
          sent_time?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminder_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reminder_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_reminder_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "patient_appointment_history"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_reminder_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "room_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_reminder_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["appointment_id"]
          },
        ]
      }
      appointment_room: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          room_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          room_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          room_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_room_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_room_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_room_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "patient_appointment_history"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_room_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "room_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_room_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_room_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_room_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_schedule"
            referencedColumns: ["room_id"]
          },
        ]
      }
      appointment_staff: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          role: string
          staff_profile_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          role?: string
          staff_profile_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          role?: string
          staff_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_staff_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_staff_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_staff_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "patient_appointment_history"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_staff_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "room_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_staff_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_staff_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["staff_profile_id"]
          },
          {
            foreignKeyName: "appointment_staff_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_availability_details"
            referencedColumns: ["staff_profile_id"]
          },
          {
            foreignKeyName: "appointment_staff_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_type: {
        Row: {
          color: string | null
          created_at: string
          default_room_type: string | null
          description: string | null
          duration: number
          id: string
          name: string
          requires_equipment: boolean | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          default_room_type?: string | null
          description?: string | null
          duration: number
          id?: string
          name: string
          requires_equipment?: boolean | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          default_room_type?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          requires_equipment?: boolean | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_pattern: {
        Row: {
          count: number | null
          created_at: string
          days: number[] | null
          end_date: string | null
          frequency: string
          id: string
          interval: number
          start_date: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          days?: number[] | null
          end_date?: string | null
          frequency: string
          id?: string
          interval?: number
          start_date: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          count?: number | null
          created_at?: string
          days?: number[] | null
          end_date?: string | null
          frequency?: string
          id?: string
          interval?: number
          start_date?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      room: {
        Row: {
          capacity: number | null
          created_at: string
          equipment: Json | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          equipment?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          equipment?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_availability: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean
          specific_date: string | null
          staff_profile_id: string
          start_time: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean
          specific_date?: string | null
          staff_profile_id: string
          start_time: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean
          specific_date?: string | null
          staff_profile_id?: string
          start_time?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["staff_profile_id"]
          },
          {
            foreignKeyName: "staff_availability_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_availability_details"
            referencedColumns: ["staff_profile_id"]
          },
          {
            foreignKeyName: "staff_availability_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profile: {
        Row: {
          appointment_types: string[] | null
          color: string | null
          created_at: string
          id: string
          max_concurrent_appointments: number | null
          staff_type: string
          tenant_id: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_types?: string[] | null
          color?: string | null
          created_at?: string
          id?: string
          max_concurrent_appointments?: number | null
          staff_type: string
          tenant_id: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_types?: string[] | null
          color?: string | null
          created_at?: string
          id?: string
          max_concurrent_appointments?: number | null
          staff_type?: string
          tenant_id?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "staff_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "staff_availability_details"
            referencedColumns: ["user_id"]
          },
        ]
      }
      waitlist: {
        Row: {
          animal_id: string
          appointment_type_id: string
          created_at: string
          id: string
          notes: string | null
          preferred_staff_id: string | null
          requested_date: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          animal_id: string
          appointment_type_id: string
          created_at?: string
          id?: string
          notes?: string | null
          preferred_staff_id?: string | null
          requested_date?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          animal_id?: string
          appointment_type_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          preferred_staff_id?: string | null
          requested_date?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["animal_id"]
          },
          {
            foreignKeyName: "waitlist_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "patient_appointment_history"
            referencedColumns: ["animal_id"]
          },
          {
            foreignKeyName: "waitlist_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["appointment_type_id"]
          },
          {
            foreignKeyName: "waitlist_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_preferred_staff_id_fkey"
            columns: ["preferred_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_appointments"
            referencedColumns: ["staff_profile_id"]
          },
          {
            foreignKeyName: "waitlist_preferred_staff_id_fkey"
            columns: ["preferred_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_availability_details"
            referencedColumns: ["staff_profile_id"]
          },
          {
            foreignKeyName: "waitlist_preferred_staff_id_fkey"
            columns: ["preferred_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      appointment_details: {
        Row: {
          animal_breed: string | null
          animal_id: string | null
          animal_name: string | null
          animal_species: string | null
          appointment_id: string | null
          appointment_type_color: string | null
          appointment_type_duration: number | null
          appointment_type_id: string | null
          appointment_type_name: string | null
          check_in_time: string | null
          check_out_time: string | null
          end_time: string | null
          notes: string | null
          owner_email: string | null
          owner_first_name: string | null
          owner_id: string | null
          owner_last_name: string | null
          owner_phone: string | null
          reason: string | null
          start_time: string | null
          status: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      patient_appointment_history: {
        Row: {
          animal_id: string | null
          animal_name: string | null
          appointment_id: string | null
          appointment_type_name: string | null
          breed: string | null
          end_time: string | null
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          reason: string | null
          species: string | null
          staff_name: string | null
          staff_role: string | null
          start_time: string | null
          status: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      room_schedule: {
        Row: {
          animal_name: string | null
          appointment_id: string | null
          appointment_type_name: string | null
          end_time: string | null
          owner_name: string | null
          room_id: string | null
          room_name: string | null
          room_type: string | null
          start_time: string | null
          status: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      staff_appointments: {
        Row: {
          animal_name: string | null
          appointment_id: string | null
          appointment_type_name: string | null
          end_time: string | null
          owner_name: string | null
          staff_name: string | null
          staff_profile_id: string | null
          staff_role: string | null
          start_time: string | null
          status: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      staff_availability_details: {
        Row: {
          availability_id: string | null
          day_of_week: number | null
          end_time: string | null
          is_available: boolean | null
          specific_date: string | null
          staff_email: string | null
          staff_name: string | null
          staff_profile_id: string | null
          staff_type: string | null
          start_time: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_appointment_conflicts: {
        Args: {
          p_tenant_id: string
          p_staff_profile_id: string
          p_start_time: string
          p_end_time: string
          p_appointment_id?: string
        }
        Returns: {
          conflicting_appointment_id: string
          conflict_start_time: string
          conflict_end_time: string
          conflict_type: string
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
      owner_communication: {
        Row: {
          communication_type: string
          content: string
          created_at: string
          delivery_status: string | null
          id: string
          owner_id: string
          response: string | null
          response_received_at: string | null
          sent_at: string
          sent_by: string | null
          status: string
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          communication_type: string
          content: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          owner_id: string
          response?: string | null
          response_received_at?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          communication_type?: string
          content?: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          owner_id?: string
          response?: string | null
          response_received_at?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_communication_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_communication_tenant_id_fkey"
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
      get_appointments_in_range: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_staff_id?: string
          p_tenant_id?: string
        }
        Returns: {
          id: string
          staff_id: string
          animal_id: string
          owner_id: string
          title: string
          description: string
          appointment_type: string
          status: string
          start_time: string
          end_time: string
          duration_minutes: number
          all_day: boolean
          color: string
          staff_name: string
          animal_name: string
          owner_name: string
        }[]
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
      is_staff_available: {
        Args:
          | {
              p_staff_id: string
              p_start_time: string
              p_end_time: string
              p_exclude_appointment_id?: string
            }
          | {
              p_staff_id: string
              p_start_time: string
              p_end_time: string
              p_tenant_id: string
              p_exclude_appointment_id?: string
            }
        Returns: boolean
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
  calendar: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
