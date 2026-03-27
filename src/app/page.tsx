import React from 'react'
import { createClient } from '@/lib/supabase-server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FilterBar from '@/components/home/FilterBar'
import PropertyCard from '@/components/home/PropertyCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// O Next.js permite que páginas recebam `searchParams` para lidar com paginação
export default async function HomePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = createClient()
  
  // Lógica de Paginação Básica
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const limit = 28
  const start = (page - 1) * limit
  const end = start + limit - 1

  // Buscar os imóveis aprovados/disponíveis no banco de dados
  const { data: properties, count } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end)

  // Calcular total de páginas
  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans">
      <Header />
      <FilterBar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-[5%] py-12">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-[#CBA153] font-serif text-3xl tracking-wide mb-2">Imóveis Executivos</h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[3px]">
              Encontramos {totalItems} propriedades de alto padrão
            </p>
          </div>
        </div>

        {/* Grade de 4 Colunas para Anúncios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties && properties.length > 0 ? (
            properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
              <p className="text-[#CBA153] text-lg font-serif mb-2">Nenhum imóvel encontrado.</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">Tente ajustar seus filtros de busca</p>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalItems > limit && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <a 
              href={hasPrevPage ? `/?page=${page - 1}` : '#'}
              className={`flex items-center justify-center w-10 h-10 border rounded-sm transition-colors ${
                hasPrevPage 
                  ? 'border-[#CBA153] text-[#CBA153] hover:bg-[#CBA153] hover:text-[#121212]' 
                  : 'border-white/10 text-gray-700 pointer-events-none'
              }`}
            >
              <ChevronLeft size={18} />
            </a>
            
            <span className="text-gray-400 text-xs tracking-widest uppercase">
              Página {page} de {totalPages || 1}
            </span>

            <a 
              href={hasNextPage ? `/?page=${page + 1}` : '#'}
              className={`flex items-center justify-center w-10 h-10 border rounded-sm transition-colors ${
                hasNextPage 
                  ? 'border-[#CBA153] text-[#CBA153] hover:bg-[#CBA153] hover:text-[#121212]' 
                  : 'border-white/10 text-gray-700 pointer-events-none'
              }`}
            >
              <ChevronRight size={18} />
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
