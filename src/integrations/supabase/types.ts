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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          bandera_riesgo: boolean | null
          caja_catarsis: string | null
          created_at: string
          emocion_principal: Database["public"]["Enums"]["emocion_plutchik"]
          fecha_hora: string
          id: string
          nivel_animo: number
          nivel_energia: number
          voluntario_id: string
        }
        Insert: {
          bandera_riesgo?: boolean | null
          caja_catarsis?: string | null
          created_at?: string
          emocion_principal: Database["public"]["Enums"]["emocion_plutchik"]
          fecha_hora?: string
          id?: string
          nivel_animo: number
          nivel_energia: number
          voluntario_id: string
        }
        Update: {
          bandera_riesgo?: boolean | null
          caja_catarsis?: string | null
          created_at?: string
          emocion_principal?: Database["public"]["Enums"]["emocion_plutchik"]
          fecha_hora?: string
          id?: string
          nivel_animo?: number
          nivel_energia?: number
          voluntario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_voluntario_id_fkey"
            columns: ["voluntario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nombre_completo: string
          rol_asignado: Database["public"]["Enums"]["rol_asignado"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nombre_completo: string
          rol_asignado?: Database["public"]["Enums"]["rol_asignado"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nombre_completo?: string
          rol_asignado?: Database["public"]["Enums"]["rol_asignado"] | null
          updated_at?: string
        }
        Relationships: []
      }
      recursos_apoyo: {
        Row: {
          created_at: string
          id: string
          nombre_recurso: string
          tipo_intervencion: Database["public"]["Enums"]["tipo_intervencion"]
          umbral_recomendado: number | null
          url_contenido: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre_recurso: string
          tipo_intervencion: Database["public"]["Enums"]["tipo_intervencion"]
          umbral_recomendado?: number | null
          url_contenido: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre_recurso?: string
          tipo_intervencion?: Database["public"]["Enums"]["tipo_intervencion"]
          umbral_recomendado?: number | null
          url_contenido?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "voluntario" | "coordinador" | "admin"
      emocion_plutchik:
        | "alegria"
        | "confianza"
        | "miedo"
        | "sorpresa"
        | "tristeza"
        | "disgusto"
        | "enojo"
        | "anticipacion"
      rol_asignado: "campo" | "soporte_telefonico" | "logistica"
      tipo_intervencion:
        | "mindfulness"
        | "tcc"
        | "linea_crisis"
        | "reestructuracion_cognitiva"
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
      app_role: ["voluntario", "coordinador", "admin"],
      emocion_plutchik: [
        "alegria",
        "confianza",
        "miedo",
        "sorpresa",
        "tristeza",
        "disgusto",
        "enojo",
        "anticipacion",
      ],
      rol_asignado: ["campo", "soporte_telefonico", "logistica"],
      tipo_intervencion: [
        "mindfulness",
        "tcc",
        "linea_crisis",
        "reestructuracion_cognitiva",
      ],
    },
  },
} as const
