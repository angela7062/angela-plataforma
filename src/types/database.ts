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
          phone_number: string | null
          role: 'admin' | 'seller' | 'lead'
          user_role: 'Vendedor' | 'Comprador' | 'Ambos' | 'Anunciante' | null
          slug: string | null
          branding_data: Json | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          phone_number?: string | null
          role?: 'admin' | 'seller' | 'lead'
          user_role?: 'Vendedor' | 'Comprador' | 'Ambos' | 'Anunciante' | null
          slug?: string | null
          branding_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          phone_number?: string | null
          role?: 'admin' | 'seller' | 'lead'
          user_role?: 'Vendedor' | 'Comprador' | 'Ambos' | 'Anunciante' | null
          slug?: string | null
          branding_data?: Json | null
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
          features: Json | null
          meta_tags: Json | null
          gallery: string[] | null
          main_image: string | null
          is_luxury: boolean
          is_published: boolean | null
          status: 'Ativo' | 'Inativo' | 'Rascunho' | 'Vendido' | 'Alugado' | 'cadastrado' | null
          quartos: number | null
          banheiros: number | null
          vagas: number | null
          area_util: number | null
          area_total: number | null
          intent: 'Vender' | 'Alugar' | 'Temporada' | 'Leilão' | null
          category: string | null
          subcategory: string | null
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
          features?: Json | null
          meta_tags?: Json | null
          gallery?: string[] | null
          main_image?: string | null
          is_luxury?: boolean
          is_published?: boolean | null
          status?: 'Ativo' | 'Inativo' | 'Rascunho' | 'Vendido' | 'Alugado' | 'cadastrado' | null
          quartos?: number | null
          banheiros?: number | null
          vagas?: number | null
          area_util?: number | null
          area_total?: number | null
          intent?: 'Vender' | 'Alugar' | 'Temporada' | 'Leilão' | null
          category?: string | null
          subcategory?: string | null
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
          features?: Json | null
          meta_tags?: Json | null
          gallery?: string[] | null
          main_image?: string | null
          is_luxury?: boolean
          is_published?: boolean | null
          status?: 'Ativo' | 'Inativo' | 'Rascunho' | 'Vendido' | 'Alugado' | 'cadastrado' | null
          quartos?: number | null
          banheiros?: number | null
          vagas?: number | null
          area_util?: number | null
          area_total?: number | null
          intent?: 'Vender' | 'Alugar' | 'Temporada' | 'Leilão' | null
          category?: string | null
          subcategory?: string | null
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
