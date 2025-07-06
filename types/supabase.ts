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
      Appointment: {
        Row: {
          createdAt: string
          duration: number
          id: string
          notes: string | null
          patientId: string
          scheduledAt: string
          status: string
          tenantId: string
          type: string
          updatedAt: string
          veterinarianId: string
        }
        Insert: {
          createdAt?: string
          duration: number
          id: string
          notes?: string | null
          patientId: string
          scheduledAt: string
          status: string
          tenantId: string
          type: string
          updatedAt: string
          veterinarianId: string
        }
        Update: {
          createdAt?: string
          duration?: number
          id?: string
          notes?: string | null
          patientId?: string
          scheduledAt?: string
          status?: string
          tenantId?: string
          type?: string
          updatedAt?: string
          veterinarianId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Appointment_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Appointment_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      Invoice: {
        Row: {
          appointmentId: string | null
          createdAt: string
          dueDate: string
          id: string
          items: Json[] | null
          paidAt: string | null
          patientId: string
          status: string
          subtotal: number
          tax: number
          tenantId: string
          total: number
          updatedAt: string
        }
        Insert: {
          appointmentId?: string | null
          createdAt?: string
          dueDate: string
          id: string
          items?: Json[] | null
          paidAt?: string | null
          patientId: string
          status: string
          subtotal: number
          tax: number
          tenantId: string
          total: number
          updatedAt: string
        }
        Update: {
          appointmentId?: string | null
          createdAt?: string
          dueDate?: string
          id?: string
          items?: Json[] | null
          paidAt?: string | null
          patientId?: string
          status?: string
          subtotal?: number
          tax?: number
          tenantId?: string
          total?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Invoice_appointmentId_fkey"
            columns: ["appointmentId"]
            isOneToOne: false
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invoice_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invoice_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      MedicalRecord: {
        Row: {
          chiefComplaint: string
          createdAt: string
          diagnosis: string[] | null
          id: string
          notes: string
          patientId: string
          prescriptions: Json[] | null
          tenantId: string
          treatments: Json[] | null
          updatedAt: string
          veterinarianId: string
          visitDate: string
        }
        Insert: {
          chiefComplaint: string
          createdAt?: string
          diagnosis?: string[] | null
          id: string
          notes: string
          patientId: string
          prescriptions?: Json[] | null
          tenantId: string
          treatments?: Json[] | null
          updatedAt: string
          veterinarianId: string
          visitDate: string
        }
        Update: {
          chiefComplaint?: string
          createdAt?: string
          diagnosis?: string[] | null
          id?: string
          notes?: string
          patientId?: string
          prescriptions?: Json[] | null
          tenantId?: string
          treatments?: Json[] | null
          updatedAt?: string
          veterinarianId?: string
          visitDate?: string
        }
        Relationships: [
          {
            foreignKeyName: "MedicalRecord_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MedicalRecord_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      Owner: {
        Row: {
          additionalNotes: string | null
          address: Json
          createdAt: string
          email: string
          firstName: string
          gdprConsent: boolean
          id: string
          lastName: string
          phone: string
          preferredPractice: string | null
          tenantId: string
          title: string | null
          updatedAt: string
        }
        Insert: {
          additionalNotes?: string | null
          address: Json
          createdAt?: string
          email: string
          firstName: string
          gdprConsent?: boolean
          id: string
          lastName: string
          phone: string
          preferredPractice?: string | null
          tenantId: string
          title?: string | null
          updatedAt: string
        }
        Update: {
          additionalNotes?: string | null
          address?: Json
          createdAt?: string
          email?: string
          firstName?: string
          gdprConsent?: boolean
          id?: string
          lastName?: string
          phone?: string
          preferredPractice?: string | null
          tenantId?: string
          title?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Owner_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      Patient: {
        Row: {
          breed: string | null
          createdAt: string
          dateOfBirth: string | null
          id: string
          microchipId: string | null
          name: string
          ownerId: string
          species: string
          tenantId: string
          updatedAt: string
        }
        Insert: {
          breed?: string | null
          createdAt?: string
          dateOfBirth?: string | null
          id: string
          microchipId?: string | null
          name: string
          ownerId: string
          species: string
          tenantId: string
          updatedAt: string
        }
        Update: {
          breed?: string | null
          createdAt?: string
          dateOfBirth?: string | null
          id?: string
          microchipId?: string | null
          name?: string
          ownerId?: string
          species?: string
          tenantId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Patient_ownerId_fkey"
            columns: ["ownerId"]
            isOneToOne: false
            referencedRelation: "Owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Patient_ownerId_fkey"
            columns: ["ownerId"]
            isOneToOne: false
            referencedRelation: "OwnerDetails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Patient_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      Tenant: {
        Row: {
          createdAt: string
          customDomain: string | null
          id: string
          logo: string | null
          name: string
          primaryColor: string | null
          settings: Json
          subdomain: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          customDomain?: string | null
          id: string
          logo?: string | null
          name: string
          primaryColor?: string | null
          settings?: Json
          subdomain: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          customDomain?: string | null
          id?: string
          logo?: string | null
          name?: string
          primaryColor?: string | null
          settings?: Json
          subdomain?: string
          updatedAt?: string
        }
        Relationships: []
      }
      TenantMembership: {
        Row: {
          createdAt: string
          id: string
          invitedAt: string | null
          invitedBy: string | null
          joinedAt: string | null
          role: string
          status: string
          tenantId: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          invitedAt?: string | null
          invitedBy?: string | null
          joinedAt?: string | null
          role: string
          status: string
          tenantId: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          invitedAt?: string | null
          invitedBy?: string | null
          joinedAt?: string | null
          role?: string
          status?: string
          tenantId?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "TenantMembership_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TenantMembership_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          image: string | null
          name: string | null
          phone: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
          image?: string | null
          name?: string | null
          phone?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          image?: string | null
          name?: string | null
          phone?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      OwnerDetails: {
        Row: {
          additionalNotes: string | null
          address: Json | null
          createdAt: string | null
          email: string | null
          firstName: string | null
          gdprConsent: boolean | null
          id: string | null
          lastName: string | null
          phone: string | null
          practiceName: string | null
          practiceSubdomain: string | null
          preferredPractice: string | null
          tenantId: string | null
          title: string | null
          updatedAt: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Owner_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
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