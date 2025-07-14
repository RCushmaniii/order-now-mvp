// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for your database
export interface Database {
    public: {
        Tables: {
            stores: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    phone: string | null
                    address: string | null
                    is_active: boolean
                    stripe_account_id: string | null
                    owner_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    phone?: string | null
                    address?: string | null
                    is_active?: boolean
                    stripe_account_id?: string | null
                    owner_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    phone?: string | null
                    address?: string | null
                    is_active?: boolean
                    stripe_account_id?: string | null
                    owner_id?: string
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
                    image_url: string | null
                    category: string | null
                    is_available: boolean
                    sort_order: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    name: string
                    description?: string | null
                    price: number
                    image_url?: string | null
                    category?: string | null
                    is_available?: boolean
                    sort_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    image_url?: string | null
                    category?: string | null
                    is_available?: boolean
                    sort_order?: number | null
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
                    stripe_session_id: string | null
                    stripe_payment_intent_id: string | null
                    notes: string | null
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
                    stripe_session_id?: string | null
                    stripe_payment_intent_id?: string | null
                    notes?: string | null
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
                    stripe_session_id?: string | null
                    stripe_payment_intent_id?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    menu_item_id: string
                    quantity: number
                    unit_price: number
                    total_price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    menu_item_id: string
                    quantity: number
                    unit_price: number
                    total_price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    menu_item_id?: string
                    quantity?: number
                    unit_price?: number
                    total_price?: number
                    created_at?: string
                }
            }
        }
    }
}