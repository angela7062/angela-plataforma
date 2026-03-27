import React from 'react'
import Link from 'next/link'
import { BedDouble, Bath, Car, Maximize, MapPin, ShieldCheck } from 'lucide-react'

// Interface básica para o card
interface PropertyCardProps {
  property: {
    id: string
    slug: string
    title: string
    price: number
    address_city: string
    address_state: string
    main_image: string | null
    specs: {
      dormitorios?: number
      banheiros?: number
      vagas?: number
      area_m2?: number
    }
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const sp = property.specs

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden group hover:border-[#CBA153]/50 transition-all duration-500 shadow-xl flex flex-col h-full relative cursor-pointer">
      
      {/* Imagem Padrão ou Principal */}
      <Link href={`/imovel/${property.slug}`} className="w-full aspect-[4/3] bg-[#121212] relative overflow-hidden block">
        {property.main_image ? (
          <img 
            src={property.main_image} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-700 text-[10px] uppercase tracking-widest font-bold">
            Sem Imagem
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-black/60 backdrop-blur-md text-[#CBA153] border border-[#CBA153]/30 px-3 py-1 text-[9px] uppercase tracking-[2px] font-bold rounded-sm">
            Exclusivo
          </span>
        </div>
      </Link>

      {/* Conteúdo do Card */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Preço e Local */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[#CBA153] text-2xl font-serif font-medium tracking-wide">
              {formatPrice(property.price)}
            </h3>
            <p className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-widest mt-1">
              <MapPin size={12} className="text-[#CBA153]" /> 
              {property.address_city} - {property.address_state}
            </p>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="grid grid-cols-4 gap-2 py-4 border-y border-white/5 mt-auto">
          <div className="flex flex-col items-center justify-center text-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <BedDouble size={16} className="text-[#CBA153]" />
            <span className="text-gray-300 text-xs font-bold">{sp.dormitorios || '-'}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity border-l border-white/5">
            <Bath size={16} className="text-[#CBA153]" />
            <span className="text-gray-300 text-xs font-bold">{sp.banheiros || '-'}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity border-l border-white/5">
            <Car size={16} className="text-[#CBA153]" />
            <span className="text-gray-300 text-xs font-bold">{sp.vagas || '-'}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity border-l border-white/5">
            <Maximize size={16} className="text-[#CBA153]" />
            <span className="text-gray-300 text-xs font-bold">{sp.area_m2 ? `${sp.area_m2}m²` : '-'}</span>
          </div>
        </div>

        {/* Título discreto no rodapé do card */}
        <div className="mt-4 flex items-center gap-2">
           <ShieldCheck size={14} className="text-gray-600" />
           <p className="text-gray-600 text-[9px] uppercase tracking-widest truncate flex-1">
             Anúncio Verificado
           </p>
        </div>
      </div>
    </div>
  )
}
