import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          user_type: 'resident' | 'provider';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          user_type: 'resident' | 'provider';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          user_type?: 'resident' | 'provider';
          created_at?: string;
          updated_at?: string;
        };
      };
      service_providers: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          profile_image_url: string | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          profile_image_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          profile_image_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          description: string | null;
          category: string;
          price: number;
          price_type: 'fixed' | 'hourly';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          description?: string | null;
          category: string;
          price: number;
          price_type?: 'fixed' | 'hourly';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          price?: number;
          price_type?: 'fixed' | 'hourly';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          service_id: string;
          resident_id: string;
          provider_id: string;
          status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
          booking_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          resident_id: string;
          provider_id: string;
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
          booking_date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          resident_id?: string;
          provider_id?: string;
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
          booking_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
