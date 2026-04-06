'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PropertyCard from '@/components/home/PropertyCard'
import HomePagination from '@/components/home/HomePagination'
import { parseListingPage, PROPERTY_LIST_PAGE_SIZE } from '@/lib/property-listing'
import { applyPropertyFilters, PropertyFilters } from '@/lib/property-search'

const FILTER_KEYS = ['intent', 'bairro', 'cidade', 'estado', 'status', 'category', 'subcategory', 'min_price', 'max_price', 'min_area', 'max_area', 'vagas'] as const

function collectFilters(searchParams: { [key: string]: string | string[] | undefined }): PropertyFilters {
  const out: any = {}
  
  console.log('--- RAW SEARCH PARAMS ---', JSON.stringify(searchParams));

  const decodeTerm = (term: any): string | undefined => {
    if (!term) return undefined;
    const rawValue = Array.isArray(term) ? term[0] : term;
    if (typeof rawValue !== 'string') return undefined;

    // Em Next.js searchParams costuma vir já decodificado, mas o + pode persistir
    // Tentamos limpar o + independente de decodeURIComponent
    const cleanPlus = rawValue.replace(/\+/g, ' ').trim();
    
    try {
      // Se ainda houver codificação tipo %20 ou %C3, limpamos
      return decodeURIComponent(cleanPlus).trim();
    } catch (e) {
      return cleanPlus;
    }
  }

  if (searchParams.intent) out.intent = decodeTerm(searchParams.intent)
  if (searchParams.category) out.category = decodeTerm(searchParams.category)
  if (searchParams.subcategory) out.subcategory = decodeTerm(searchParams.subcategory)
  if (searchParams.status) out.status = decodeTerm(searchParams.status)
  
  const parseNum = (v: any) => {
    const val = Array.isArray(v) ? v[0] : v;
    return val ? parseFloat(val) : undefined;
  }

  if (searchParams.min_price) out.min_price = parseNum(searchParams.min_price)
  if (searchParams.max_price) out.max_price = parseNum(searchParams.max_price)
  if (searchParams.min_area) out.min_area = parseNum(searchParams.min_area)
  if (searchParams.max_area) out.max_area = parseNum(searchParams.max_area)
  
  if (searchParams.vagas) {
    const v = parseNum(searchParams.vagas);
    if (v !== undefined) out.vagas = Math.floor(v);
  }
  
  if (searchParams.q) out.q = decodeTerm(searchParams.q)
  if (searchParams.bairro) out.q = decodeTerm(searchParams.bairro)

  // Log de Verificação no Servidor para Debug Crítico
  console.log('--- DEBUG BUSCA SUPABASE ---');
  console.log('Categoria (Original):', searchParams.category);
  console.log('Categoria (Tratada):', out.category);
  console.log('Subcategoria (Original):', searchParams.subcategory);
  console.log('Subcategoria (Tratada):', out.subcategory);
  console.log('Filtros Finais:', JSON.stringify(out));
  console.log('----------------------------');

  return out
}

function buildImoveisPageHref(filters: PropertyFilters, page: number) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v))
  })
  params.set('page', String(page))
  const q = params.toString()
  return q ? `/imoveis?${q}` : `/imoveis?page=${page}`
}

export default function ImoveisPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [properties, setProperties] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const page = parseListingPage(searchParams)
  const start = (page - 1) * PROPERTY_LIST_PAGE_SIZE
  const end = start + PROPERTY_LIST_PAGE_SIZE - 1
  const filters = collectFilters(searchParams)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
      
      query = applyPropertyFilters(query, filters)

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(start, end)
      
      if (error) console.error('ERRO NA QUERY SUPABASE:', error)
      
      setProperties(data || [])
      setCount(count || 0)
      setLoading(false)
    }
    fetchData()
  }, [page, JSON.stringify(filters), start, end, supabase])

  const totalItems = count
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / PROPERTY_LIST_PAGE_SIZE) : 0
  const list = properties || []
  
  console.log('Total de imóveis brutos retornados:', list.length);
  if (list.length > 0) {
    console.log('Exemplo de imóvel retornado:', JSON.stringify(list[0].subcategory));
  }

  const buildPageHref = (p: number) => buildImoveisPageHref(filters, p)

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-[5%] py-12">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-[#CBA153] font-serif text-3xl tracking-wide mb-2">Resultados da busca</h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[3px]">
              {totalItems > 0
                ? `${totalItems} imóveis encontrados`
                : 'Nenhum imóvel corresponde aos filtros'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading ? (
             <div className="col-span-full py-20 text-center opacity-50">Carregando...</div>
          ) : list.length > 0 ? (
            list.map((prop) => <PropertyCard key={prop.id} property={prop} />)
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
              <p className="text-[#CBA153] text-lg font-serif mb-2">Nenhum imóvel em exibição.</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">
                Ajuste os filtros ou volte à página inicial
              </p>
            </div>
          )}
        </div>

        <HomePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          buildPageHref={buildPageHref}
        />
      </main>

      <Footer />
    </div>
  )
}
