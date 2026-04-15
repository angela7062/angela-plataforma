/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { formatPrice } from '@/lib/format-price';
import { WhatsAppIcon, EyeIcon } from '@/components/Icons'; // Importado EyeIcon
import PhotoAlbum from "react-photo-album";

// Tipagem dos dados do imóvel que o componente espera
export type PropertyData = {
  title: string;
  subtitle: string;
  price: number;
  description: string;
  city: string;
  state: string;
  specs: { [key: string]: string | number };
  seller_name: string;
  seller_phone: string;
  main_image?: string;
  image_gallery?: string[];
  property_type: string;
  status: 'cadastrado' | 'Ativo' | 'Inativo' | 'vendido' | 'alugado';
  finality: 'Venda' | 'Aluguel';
};

interface PropertyPageProps {
  property: PropertyData;
}

const DetailItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="border-b border-white/10 py-3">
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-base font-medium text-gray-200">{value}</p>
  </div>
);

export default function PropertyPage({ property }: PropertyPageProps) {
  const { 
    title, subtitle, price, description, specs, 
    seller_name, seller_phone, main_image, image_gallery,
    status
  } = property;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const allImages = [main_image, ...(image_gallery || [])].filter(Boolean) as string[];
  const photos = allImages.map(src => ({ src, width: 4, height: 3 }));

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  const formattedPrice = price > 0 ? formatPrice(price) : 'Consulte';
  const whatsappMessage = `Olá, ${seller_name}. Tenho interesse no imóvel \"${title}\" que vi no seu site. Podemos conversar?`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=55${seller_phone.replace(/\D/g, '')}&text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-[#141414] min-h-screen text-white">
      {/* IMPLEMENTAÇÃO: Banner de pré-visualização refinado com ícone e layout. */}
      {status === 'Ativo' && (
        <div className="bg-black/20 text-center p-4 border-b border-[#CBA153]/30 shadow-lg">
          <div className="flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EyeIcon className="w-5 h-5 mr-3 text-[#CBA153]/70" />
            <p className="text-sm font-medium text-[#CBA153]">
              <span className="font-semibold">PRÉ-VISUALIZAÇÃO:</span> Este anúncio ainda não está visível para o público.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cabeçalho com Título e Preço */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-serif">{title}</h1>
          <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-400">{subtitle}</p>
          <p className="mt-4 text-4xl font-bold text-[#CBA153]">{formattedPrice}</p>
        </div>

        {/* Galeria de Fotos */}
        {allImages.length > 0 && (
          <div className="mb-12 shadow-2xl shadow-black/30 rounded-lg overflow-hidden border-4 border-transparent hover:border-[#CBA153]/50 transition-all duration-300">
            <PhotoAlbum 
              layout="rows" 
              photos={photos}
              targetRowHeight={350}
              onClick={({ index }) => openLightbox(index)}
              componentsProps={{
                image: {
                  className: "hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                }
              }}
            />
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-105">
            <WhatsAppIcon className="w-5 h-5 mr-2" />
            Chamar no WhatsApp
          </a>
        </div>

        {/* Layout de 2 colunas: Descrição e Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-100 mb-4 font-serif">Descrição do Imóvel</h2>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') || '' }} />
          </div>
          
          <div>
            <div className="sticky top-24">
              <div className="bg-[#1C1C1C] rounded-lg shadow-lg p-6 border border-white/10">
                <h2 className="text-xl font-bold text-gray-100 mb-4 font-serif">Detalhes</h2>
                <div className="space-y-2">
                  {Object.entries(specs).map(([key, value]) => (
                     <DetailItem key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} value={String(value)} />
                  ))}
                </div>
              </div>
              <div className="bg-[#1C1C1C] rounded-lg shadow-lg p-6 mt-6 border border-white/10">
                  <h3 className="text-xl font-bold text-gray-100 mb-4 font-serif">Anunciante</h3>
                  <p className="text-lg font-medium text-gray-200">{seller_name}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {lightboxOpen && (
        <div className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center' onClick={() => setLightboxOpen(false)}>
          <button className='absolute top-4 right-4 text-white text-3xl z-50'>&times;</button>
          <div className='relative w-full h-full max-w-4xl max-h-screen p-4 flex items-center justify-center'>
            <img src={allImages[photoIndex]} alt="Expanded view" className='max-w-full max-h-full object-contain' />
            <button 
              className='absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full' 
              onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + allImages.length - 1) % allImages.length); }}>
              &#10094;
            </button>
            <button 
              className='absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full' 
              onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + 1) % allImages.length); }}>
              &#10095;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
