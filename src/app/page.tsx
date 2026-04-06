'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PropertyCard from '@/components/home/PropertyCard'
import HomePagination from '@/components/home/HomePagination'
import { redirect } from 'next/navigation'
import { parseListingPage, PROPERTY_LIST_PAGE_SIZE } from '@/lib/property-listing'

export default function HomePage({
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end)

      setProperties(data || [])
      setCount(count || 0)
      setLoading(false)
    }
    fetchData()
  }, [page, start, end, supabase])

  const totalItems = count
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / PROPERTY_LIST_PAGE_SIZE) : 0
  const list = (properties ?? []).filter(
    (p) => p.slug && p.main_image && String(p.main_image).trim() !== ''
  )

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-[5%] py-12">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-[#CBA153] font-serif text-3xl tracking-wide mb-2">Imóveis Executivos</h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[3px]">
              {totalItems > 0
                ? `Encontramos ${totalItems} propriedades de alto padrão`
                : 'Nenhum anúncio disponível no momento'}
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
                Apenas anúncios cadastrados e completos são listados
              </p>
            </div>
          )}
        </div>

        <HomePagination page={page} totalPages={totalPages} totalItems={totalItems} />
      </main>

      <Footer />
    </div>
  )
}
