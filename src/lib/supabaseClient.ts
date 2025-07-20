// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database type definitions for better TypeScript support
export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          banner_url: string | null
          hours: Record<string, string | number | boolean> | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          banner_url?: string | null
          hours?: Record<string, string | number | boolean> | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          banner_url?: string | null
          hours?: Record<string, string | number | boolean> | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          store_id: string | null
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          store_id?: string | null
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string | null
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          category: string | null
          image_url: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: number
          category?: string | null
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string | null
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          store_id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          total_amount: number
          status: string
          payment_method: string
          delivery_address: string | null
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          total_amount: number
          status?: string
          payment_method: string
          delivery_address?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          total_amount?: number
          status?: string
          payment_method?: string
          delivery_address?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Export typed client
export type SupabaseClient = typeof supabase
