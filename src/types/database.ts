export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'admin' | 'seller' | 'lead'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'seller' | 'lead'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'seller' | 'lead'
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          seller_id: string
          slug: string
          title: string
          description: string | null
          price: number | null
          address_city: string | null
          address_state: string | null
          specs: Json | null
          gallery: string[] | null
          main_image: string | null
          is_luxury: boolean
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          slug: string
          title: string
          description?: string | null
          price?: number | null
          address_city?: string | null
          address_state?: string | null
          specs?: Json | null
          gallery?: string[] | null
          main_image?: string | null
          is_luxury?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          slug?: string
          title?: string
          description?: string | null
          price?: number | null
          address_city?: string | null
          address_state?: string | null
          specs?: Json | null
          gallery?: string[] | null
          main_image?: string | null
          is_luxury?: boolean
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          property_id: string
          lead_id: string
          seller_id: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          lead_id: string
          seller_id: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          lead_id?: string
          seller_id?: string
          message?: string | null
          created_at?: string
        }
      }
    }
  }
}
