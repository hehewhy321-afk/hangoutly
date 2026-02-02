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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          activity: string
          booking_date: string
          cancellation_reason: string | null
          cancelled_by: string | null
          companion_id: string
          companion_notes: string | null
          created_at: string
          duration_hours: number
          hourly_rate: number
          id: string
          location: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
          user_id: string
          user_notes: string | null
        }
        Insert: {
          activity: string
          booking_date: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          companion_id: string
          companion_notes?: string | null
          created_at?: string
          duration_hours: number
          hourly_rate: number
          id?: string
          location?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at?: string
          user_id: string
          user_notes?: string | null
        }
        Update: {
          activity?: string
          booking_date?: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          companion_id?: string
          companion_notes?: string | null
          created_at?: string
          duration_hours?: number
          hourly_rate?: number
          id?: string
          location?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          booking_id: string
          companion_id: string
          created_at: string
          ends_at: string
          grace_period_ends_at: string
          id: string
          is_active: boolean | null
          starts_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          companion_id: string
          created_at?: string
          ends_at: string
          grace_period_ends_at: string
          id?: string
          is_active?: boolean | null
          starts_at: string
          user_id: string
        }
        Update: {
          booking_id?: string
          companion_id?: string
          created_at?: string
          ends_at?: string
          grace_period_ends_at?: string
          id?: string
          is_active?: boolean | null
          starts_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_profiles: {
        Row: {
          activities: string[] | null
          availability_status: boolean | null
          average_rating: number | null
          created_at: string
          gallery_images: string[] | null
          hourly_rate: number
          id: string
          payment_method: string | null
          payment_qr_url: string | null
          profile_id: string
          total_bookings: number | null
          total_earnings: number | null
          updated_at: string
        }
        Insert: {
          activities?: string[] | null
          availability_status?: boolean | null
          average_rating?: number | null
          created_at?: string
          gallery_images?: string[] | null
          hourly_rate?: number
          id?: string
          payment_method?: string | null
          payment_qr_url?: string | null
          profile_id: string
          total_bookings?: number | null
          total_earnings?: number | null
          updated_at?: string
        }
        Update: {
          activities?: string[] | null
          availability_status?: boolean | null
          average_rating?: number | null
          created_at?: string
          gallery_images?: string[] | null
          hourly_rate?: number
          id?: string
          payment_method?: string | null
          payment_qr_url?: string | null
          profile_id?: string
          total_bookings?: number | null
          total_earnings?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companion_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          complaint_type: Database["public"]["Enums"]["complaint_type"]
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          reported_user_id: string
          reporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          complaint_type: Database["public"]["Enums"]["complaint_type"]
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          reported_user_id: string
          reporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          complaint_type?: Database["public"]["Enums"]["complaint_type"]
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          reported_user_id?: string
          reporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          companion_profile_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          companion_profile_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          companion_profile_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          booking_id: string
          companion_id: string
          confirmed_at: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_qr_url: string | null
          requested_at: string
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          companion_id: string
          confirmed_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_qr_url?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          companion_id?: string
          confirmed_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_qr_url?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          consent_accepted: boolean | null
          consent_accepted_at: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string
          gender: string | null
          id: string
          identity_verified_at: string | null
          identity_verified_by: string | null
          is_active: boolean | null
          is_companion: boolean | null
          is_identity_verified: boolean
          is_online: boolean | null
          is_verified: boolean | null
          last_name: string | null
          phone: string | null
          phone_verified: boolean | null
          profession: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          consent_accepted?: boolean | null
          consent_accepted_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          gender?: string | null
          id?: string
          identity_verified_at?: string | null
          identity_verified_by?: string | null
          is_active?: boolean | null
          is_companion?: boolean | null
          is_identity_verified?: boolean
          is_online?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profession?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          consent_accepted?: boolean | null
          consent_accepted_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          identity_verified_at?: string | null
          identity_verified_by?: string | null
          is_active?: boolean | null
          is_companion?: boolean | null
          is_identity_verified?: boolean
          is_online?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profession?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string
          document_back_url: string | null
          document_front_url: string
          document_number: string | null
          document_type: string
          full_name: string
          id: string
          profile_id: string
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          selfie_url: string
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_back_url?: string | null
          document_front_url: string
          document_number?: string | null
          document_type: string
          full_name: string
          id?: string
          profile_id: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          selfie_url: string
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string
          document_number?: string | null
          document_type?: string
          full_name?: string
          id?: string
          profile_id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          selfie_url?: string
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verifications_profile_id_fkey"
            columns: ["profile_id"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "active"
        | "completed"
        | "cancelled"
      complaint_status: "open" | "investigating" | "resolved" | "dismissed"
      complaint_type:
        | "payment_not_received"
        | "misbehavior"
        | "no_show"
        | "harassment"
        | "rule_violation"
        | "other"
      payment_status:
        | "pending"
        | "requested"
        | "paid"
        | "confirmed"
        | "disputed"
      verification_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "moderator", "user"],
      booking_status: [
        "pending",
        "accepted",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ],
      complaint_status: ["open", "investigating", "resolved", "dismissed"],
      complaint_type: [
        "payment_not_received",
        "misbehavior",
        "no_show",
        "harassment",
        "rule_violation",
        "other",
      ],
      payment_status: ["pending", "requested", "paid", "confirmed", "disputed"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
