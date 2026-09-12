export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      charging_sessions: {
        Row: {
          charge_type: string;
          charged_at: string;
          created_at: string;
          energy_kwh: number;
          id: string;
          location_name: string;
          residential_rate_snapshot: number;
          total_cost: number;
          updated_at: string;
          user_id: string;
          vehicle_consumption_snapshot: number;
          vehicle_id: string;
        };
        Insert: {
          charge_type: string;
          charged_at: string;
          created_at?: string;
          energy_kwh: number;
          id?: string;
          location_name: string;
          residential_rate_snapshot: number;
          total_cost: number;
          updated_at?: string;
          user_id: string;
          vehicle_consumption_snapshot: number;
          vehicle_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["charging_sessions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "charging_sessions_vehicle_owner_fk";
            columns: ["vehicle_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      monthly_goals: {
        Row: {
          created_at: string;
          distance_target_km: number;
          id: string;
          month: string;
          revenue_target: number;
          savings_target: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          distance_target_km?: number;
          id?: string;
          month: string;
          revenue_target?: number;
          savings_target?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["monthly_goals"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      vehicles: {
        Row: {
          consumption_kwh_per_100km: number;
          created_at: string;
          id: string;
          is_active: boolean;
          name_model: string;
          public_rate_per_kwh: number;
          range_km: number;
          reference_fuel_efficiency_km_per_liter: number;
          reference_gasoline_price_per_liter: number;
          residential_rate_per_kwh: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          consumption_kwh_per_100km: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name_model: string;
          public_rate_per_kwh: number;
          range_km: number;
          reference_fuel_efficiency_km_per_liter: number;
          reference_gasoline_price_per_liter: number;
          residential_rate_per_kwh: number;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
        Relationships: [];
      };
      work_sessions: {
        Row: {
          created_at: string;
          distance_km: number;
          energy_rate_snapshot: number;
          gasoline_price_snapshot: number;
          gross_earnings: number;
          id: string;
          online_minutes: number;
          platform: string;
          reference_fuel_efficiency_snapshot: number;
          tips: number;
          updated_at: string;
          user_id: string;
          vehicle_consumption_snapshot: number;
          vehicle_id: string;
          work_date: string;
        };
        Insert: {
          created_at?: string;
          distance_km: number;
          energy_rate_snapshot: number;
          gasoline_price_snapshot: number;
          gross_earnings: number;
          id?: string;
          online_minutes: number;
          platform: string;
          reference_fuel_efficiency_snapshot: number;
          tips?: number;
          updated_at?: string;
          user_id: string;
          vehicle_consumption_snapshot: number;
          vehicle_id: string;
          work_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["work_sessions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "work_sessions_vehicle_owner_fk";
            columns: ["vehicle_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
