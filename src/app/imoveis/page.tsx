'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PropertyCard from '@/components/home/PropertyCard'
import HomePagination from '@/components/home/HomePagination'
import ImageCarousel from '@/components/common/ImageCarousel'
import { applyPropertyFilters, collectFilters } from '@/lib/property-search'
import { parseListingPage, PROPERTY_LIST_PAGE_SIZE } from '@/lib/property-listing'

// Interfaces e tipos de dados
interface Property {
  id: string; slug: string; title: string; price: number | null;
  address_city: string | null; address_state: string | null; main_image: string | null;
  gallery_urls?: string[] | null; quartos?: number | null; banheiros?: number | null;
  vagas?: number | null; area_util?: number | null; area_total?: number | null;
  features: { dormitorios?: number; banheiros?: number; vagas?: number; area_m2?: number; } | null;
}

function buildImoveisPageHref(filters: any, page: number) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
    }
  });
  params.set('page', String(page));
  return `/imoveis?${params.toString()}`;
}

export default function ImoveisPage() {
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [zoomedProperty, setZoomedProperty] = useState<Property | null>(null);

  const page = parseListingPage(searchParams);
  const filters = collectFilters(searchParams);

  const isFilterActive = Array.from(searchParams.keys()).some(key => key !== 'page');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const start = (page - 1) * PROPERTY_LIST_PAGE_SIZE;
    const end = start + PROPERTY_LIST_PAGE_SIZE - 1;

    let query = supabase.from('properties').select('*', { count: 'exact' });
      
    query = applyPropertyFilters(query, filters);

    // **CORREÇÃO APLICADA AQUI**
    // Garante que a listagem mostre apenas imóveis com status que a página de detalhes aceita.
    query = query.in('status', ['Ativo', 'cadastrado']);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(start, end);
      
    if (error) {
      console.error('ERRO NA QUERY SUPABASE:', error);
      setProperties([]);
      setCount(0);
    } else {
      setProperties(data as Property[] || []);
      setCount(count || 0);
    }
    setLoading(false);
  }, [page, JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (zoomedProperty) setZoomedProperty(null);
        else if (selectedProperty) setSelectedProperty(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedProperty, zoomedProperty]);

  const handleImageClick = (property: Property) => setSelectedProperty(property);
  const handleCloseCarousel = () => setSelectedProperty(null);
  const handleDoubleClick = (property: Property) => setZoomedProperty(property);
  const handleCloseZoom = () => setZoomedProperty(null);

  const totalItems = count;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / PROPERTY_LIST_PAGE_SIZE) : 0;
  const list = properties || [];
  const buildPageHref = (p: number) => buildImoveisPageHref(filters, p);

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-[5%] py-12">
        {isFilterActive && (
          <div className="mb-8">
            <p className="text-gray-500 text-[10px] uppercase tracking-[3px]">
              {totalItems > 0 ? `${totalItems} Anúncios Encontrados` : 'Nenhum Anúncio Encontrado'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading ? (
             <div className="col-span-full py-20 text-center text-gray-400 opacity-50">Carregando anúncios...</div>
          ) : list.length > 0 ? (
            list.map((prop) => (
              <PropertyCard key={prop.id} property={prop} onImageClick={handleImageClick} onDoubleClick={handleDoubleClick} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-50">
              <p className="text-[#CBA153] text-lg font-serif mb-2">Nenhum imóvel corresponde à sua busca.</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">Tente ajustar os filtros.</p>
            </div>
          )}
        </div>

        {!loading && totalPages > 1 && (
            <HomePagination page={page} totalPages={totalPages} totalItems={totalItems} buildPageHref={buildPageHref} />
        )}
      </main>

      <Footer />

      {selectedProperty && <ImageCarousel property={selectedProperty} onClose={handleCloseCarousel} />}

      {zoomedProperty && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={handleCloseZoom}  
        >
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md" onClick={(e) => e.stopPropagation()}>
            <div style={{ transform: 'scale(1.75)', transformOrigin: 'center' }}>
              <PropertyCard 
                property={zoomedProperty} 
                onImageClick={() => {}} 
                onDoubleClick={handleCloseZoom}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
