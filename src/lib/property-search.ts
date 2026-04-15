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
 * Coleta e decodifica os parâmetros de busca da URL, convertendo-os em um objeto de filtros.
 */
export function collectFilters(searchParams: URLSearchParams): PropertyFilters {
  const out: any = {};

  const decodeTerm = (term: string | null): string | undefined => {
    if (!term) return undefined;
    const cleanPlus = term.replace(/\+/g, ' ').trim();
    try {
      return decodeURIComponent(cleanPlus).trim();
    } catch (e) {
      return cleanPlus; // Retorna o termo como está se a decodificação falhar
    }
  };

  out.intent = decodeTerm(searchParams.get('intent'));
  out.category = decodeTerm(searchParams.get('category'));
  out.subcategory = decodeTerm(searchParams.get('subcategory'));
  out.status = decodeTerm(searchParams.get('status'));
  out.q = decodeTerm(searchParams.get('q')) || decodeTerm(searchParams.get('bairro'));

  const parseNum = (v: string | null) => v ? parseFloat(v) : undefined;
  out.min_price = parseNum(searchParams.get('min_price'));
  out.max_price = parseNum(searchParams.get('max_price'));
  out.min_area = parseNum(searchParams.get('min_area'));
  out.max_area = parseNum(searchParams.get('max_area'));
  
  const vagas = parseNum(searchParams.get('vagas'));
  if (vagas !== undefined) out.vagas = Math.floor(vagas);

  return out;
}

/**
 * Implementa a lógica de filtragem dinâmica e fluida conforme o Prompt Mestre.
 */
export function applyPropertyFilters(
  query: PostgrestFilterBuilder<Database['public'], PropertyRow, PropertyRow[]>,
  filters: PropertyFilters
) {
  if (filters.status) {
    query = query.ilike('status', filters.status)
  }

  if (filters.intent) {
    query = query.ilike('intent', filters.intent)
  }
  if (filters.category) {
    const categoryToQuery = filters.category.toLowerCase() === 'casa' ? 'Casas' : filters.category;
    query = query.ilike('category', categoryToQuery)
  }
  if (filters.subcategory) {
    query = query.ilike('subcategory', filters.subcategory)
  }

  if (filters.min_price !== undefined && filters.min_price !== null && !isNaN(filters.min_price)) {
    query = query.gte('price', filters.min_price)
  }
  if (filters.max_price !== undefined && filters.max_price !== null && !isNaN(filters.max_price)) {
    query = query.lte('price', filters.max_price)
  }

  if (filters.vagas !== undefined && filters.vagas !== null && !isNaN(filters.vagas)) {
    query = query.filter('features->vagas', 'gte', filters.vagas)
  }

  if (filters.min_area !== undefined && filters.min_area !== null && !isNaN(filters.min_area)) {
    query = query.filter('features->area_m2', 'gte', filters.min_area)
  }
  if (filters.max_area !== undefined && filters.max_area !== null && !isNaN(filters.max_area)) {
    query = query.filter('features->area_m2', 'lte', filters.max_area)
  }

  if (filters.features && Object.keys(filters.features).length > 0) {
    query = query.contains('features', filters.features)
  }

  if (filters.q) {
    query = query.textSearch('search_text', filters.q, {
      type: 'plain',
      config: 'portuguese'
    });
  }

  return query
}
