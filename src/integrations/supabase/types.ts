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
      accounts: {
        Row: {
          balance: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          is_active: boolean | null
          routing_number: string | null
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          created_at: string
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          id: string
          is_active: boolean | null
          updated_at: string
          wallet_address: string
          wallet_name: string
        }
        Insert: {
          created_at?: string
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          id?: string
          is_active?: boolean | null
          updated_at?: string
          wallet_address: string
          wallet_name: string
        }
        Update: {
          created_at?: string
          crypto_type?: Database["public"]["Enums"]["crypto_type"]
          id?: string
          is_active?: boolean | null
          updated_at?: string
          wallet_address?: string
          wallet_name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient: string
          sent_at: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient: string
          sent_at?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient?: string
          sent_at?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_number: string
          country: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          country: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          country?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          bank_details_id: string | null
          bank_name: string | null
          created_at: string
          crypto_type: Database["public"]["Enums"]["crypto_type"] | null
          crypto_wallet_id: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          description: string | null
          id: string
          notification_sent: boolean | null
          phone_number: string | null
          recipient_account: string | null
          recipient_name: string | null
          recipient_user_id: string | null
          reference_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          transfer_type: Database["public"]["Enums"]["transfer_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_details_id?: string | null
          bank_name?: string | null
          created_at?: string
          crypto_type?: Database["public"]["Enums"]["crypto_type"] | null
          crypto_wallet_id?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          id?: string
          notification_sent?: boolean | null
          phone_number?: string | null
          recipient_account?: string | null
          recipient_name?: string | null
          recipient_user_id?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          transfer_type?: Database["public"]["Enums"]["transfer_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_details_id?: string | null
          bank_name?: string | null
          created_at?: string
          crypto_type?: Database["public"]["Enums"]["crypto_type"] | null
          crypto_wallet_id?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          id?: string
          notification_sent?: boolean | null
          phone_number?: string | null
          recipient_account?: string | null
          recipient_name?: string | null
          recipient_user_id?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          transfer_type?: Database["public"]["Enums"]["transfer_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_details_id: string | null
          created_at: string
          crypto_wallet_id: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          updated_at: string
          user_id: string
          withdrawal_method: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_details_id?: string | null
          created_at?: string
          crypto_wallet_id?: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string
          user_id: string
          withdrawal_method: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_details_id?: string | null
          created_at?: string
          crypto_wallet_id?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string
          user_id?: string
          withdrawal_method?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_user_id: string
          p_message: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_recipient: string
          p_transaction_id?: string
        }
        Returns: string
      }
      generate_account_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_internal_transfer: {
        Args: {
          p_from_user_id: string
          p_to_user_id: string
          p_amount: number
          p_currency: Database["public"]["Enums"]["currency_type"]
          p_description?: string
        }
        Returns: boolean
      }
      update_account_balance: {
        Args: {
          p_user_id: string
          p_currency: Database["public"]["Enums"]["currency_type"]
          p_amount: number
          p_operation: string
        }
        Returns: boolean
      }
    }
    Enums: {
      crypto_type: "BTC" | "ETH" | "USDT" | "BNB" | "ADA" | "DOT"
      currency_type: "USD" | "NGN" | "ZAR" | "BTC" | "ETH" | "USDT"
      notification_type: "sms" | "email"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "transfer_in"
        | "transfer_out"
        | "airtime"
        | "data"
      transfer_type: "internal" | "external" | "crypto"
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
      crypto_type: ["BTC", "ETH", "USDT", "BNB", "ADA", "DOT"],
      currency_type: ["USD", "NGN", "ZAR", "BTC", "ETH", "USDT"],
      notification_type: ["sms", "email"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "transfer_in",
        "transfer_out",
        "airtime",
        "data",
      ],
      transfer_type: ["internal", "external", "crypto"],
    },
  },
} as const
