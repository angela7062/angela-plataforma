import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { Database } from '@/types/database'

type PropertyTable = Database['public']['Tables']['properties']
type PropertyRow = PropertyTable['Row']

export interface PropertyFilters {
  intent?: string
  category?: string
  subcategory?: string
  min_price?: number
  max_price?: number
  min_area?: number
  max_area?: number
  vagas?: number
  status?: string
  features?: Record<string, any>
  q?: string // Busca textual
}

/**
 * Implementa a lógica de filtragem dinâmica e fluida conforme o Prompt Mestre.
 * Garante que múltiplos filtros funcionem simultaneamente sem conflitos.
 * Trata parâmetros nulos automaticamente (cláusula WHERE ignora filtros não selecionados).
 */
export function applyPropertyFilters(
  query: PostgrestFilterBuilder<Database['public'], PropertyRow, PropertyRow[]>,
  filters: PropertyFilters
) {
  console.log('--- APLICANDO FILTROS ---');
  console.log('Filtros recebidos:', JSON.stringify(filters));

  // 1. Filtro de Status (Padrão: Ativo)
  if (filters.status) {
    query = query.ilike('status', filters.status)
  }
  // Removido temporariamente para diagnóstico ou mantido se quiser ser menos restritivo
  /* 
  else {
    query = query.or('status.ilike.Ativo,status.ilike.cadastrado')
  } 
  */

  // 2. Filtros Exatos (Tipo de Imóvel, Finalidade, Categoria)
  if (filters.intent) {
    console.log('Filtrando por Intent:', filters.intent);
    query = query.ilike('intent', filters.intent)
  }
  if (filters.category) {
    const categoryToQuery = filters.category.toLowerCase() === 'casa' ? 'Casas' : filters.category;
    console.log('Filtrando por Categoria:', categoryToQuery);
    query = query.ilike('category', categoryToQuery)
  }
  if (filters.subcategory) {
    console.log('Filtrando por Subcategoria:', filters.subcategory);
    query = query.ilike('subcategory', filters.subcategory)
  }

  // 3. Filtros de Range (Preço, Área, Vagas)
  if (filters.min_price !== undefined && filters.min_price !== null && !isNaN(filters.min_price)) {
    query = query.gte('price', filters.min_price)
  }
  if (filters.max_price !== undefined && filters.max_price !== null && !isNaN(filters.max_price)) {
    query = query.lte('price', filters.max_price)
  }

  // Vagas e Área estão dentro do JSONB 'features'
  if (filters.vagas !== undefined && filters.vagas !== null && !isNaN(filters.vagas)) {
    query = query.filter('features->vagas', 'gte', filters.vagas)
  }

  if (filters.min_area !== undefined && filters.min_area !== null && !isNaN(filters.min_area)) {
    query = query.filter('features->area_m2', 'gte', filters.min_area)
  }
  if (filters.max_area !== undefined && filters.max_area !== null && !isNaN(filters.max_area)) {
    query = query.filter('features->area_m2', 'lte', filters.max_area)
  }

  // 4. Flexibilidade: Filtros em JSONB (features)
  // Permite filtrar por atributos dinâmicos sem alterar o schema
  if (filters.features && Object.keys(filters.features).length > 0) {
    query = query.contains('features', filters.features)
  }

  // 5. Busca Profissional (PostgreSQL Full Text Search)
  // Substitui múltiplos ILIKE/OR por busca indexada em tsvector para performance e precisão
  if (filters.q) {
    console.log('Aplicando busca profissional PostgreSQL para:', filters.q);
    query = query.textSearch('search_text', filters.q, {
      type: 'plain',
      config: 'portuguese'
    });
  }

  return query
}
