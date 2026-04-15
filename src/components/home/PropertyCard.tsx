import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BedDouble, Bath, Car, Maximize, MapPin, ShieldCheck } from 'lucide-react'

interface PropertyCardProps {
  property: {
    slug: string
    title: string
    price: number | null
    address_city: string | null
    address_state: string | null
    main_image: string | null
    bedrooms: number | null
    suites: number | null
    parking_spots: number | null
    area: number | null
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const img = property.main_image?.trim()
  if (!img) return null

  const formatPrice = (price: number | null) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price ?? 0)
  }

  return (
    <div className="luxury-card bg-[#1A1A1A] rounded-xl overflow-hidden group flex flex-col h-full relative border border-white/5 transition-all duration-500 hover:border-[#B8860B]/30">
      
      {/* LINK COM PASSAGEM DE IMAGEM PARA PERFORMANCE HERO */}
      <Link 
        href={{
          pathname: `/imovel/${property.slug}`,
          query: { cover: property.main_image },
        }}
        scroll
        className="w-full aspect-[4/3] relative overflow-hidden block"
      >
        <Image
          src={img}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-black/60 backdrop-blur-md text-[#B8860B] border border-[#B8860B]/30 px-3 py-1 text-[9px] uppercase tracking-[2px] font-bold rounded-sm">
            Exclusivo
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-[#FFFFF0] text-2xl font-serif font-medium tracking-wide">
            {formatPrice(property.price)}
          </h3>
          <p className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-widest mt-1">
            <MapPin size={12} className="text-[#B8860B]" />
            {property.address_city ?? '—'} - {property.address_state ?? '—'}
          </p>
        </div>

        {/* GRID DE CARACTERÍSTICAS - DOURADO BRONZE #B8860B */}
        <div className="grid grid-cols-4 gap-2 py-4 border-y border-white/5 mt-auto">
          <div className="flex flex-col items-center justify-center text-center gap-1 transition-opacity">
            <BedDouble size={16} className="text-[#B8860B]" />
            <span className="text-[#B8860B] text-xs font-bold">{property.bedrooms ?? '—'}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 border-l border-white/5">
            <Bath size={16} className="text-[#B8860B]" />
            <span className="text-[#B8860B] text-xs font-bold">{property.suites ?? '—'}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 border-l border-white/5">
            <Car size={16} className="text-[#B8860B]" />
            <span className="text-[#B8860B] text-xs font-bold">{property.parking_spots ?? '0'}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 border-l border-white/5">
            <Maximize size={16} className="text-[#B8860B]" />
            <span className="text-[#B8860B] text-xs font-bold">
              {property.area ? `${property.area}m²` : '—'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <ShieldCheck size={14} className="text-gray-600" />
          <p className="text-gray-600 text-[9px] uppercase tracking-widest truncate flex-1">
            Anúncio Verificado pela Imóvel Forte
          </p>
        </div>
      </div>
    </div>
  )
}