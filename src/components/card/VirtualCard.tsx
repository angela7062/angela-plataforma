import React from 'react';
import { ExternalLink, MessageCircle, Phone, Home } from 'lucide-react';
import { PropertyData } from '../landing/PropertyPage';

export default function VirtualCard({ property, slug }: { property: PropertyData, slug: string }) {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 sm:p-10 font-sans">
      <div className="w-full max-w-[400px] h-full flex flex-col items-center">
        {/* PWA Brand */}
        <div className="mb-10 text-center">
          <h1 className="text-[#CBA153] font-serif text-3xl tracking-widest leading-none">Imóvel Forte</h1>
          <p className="text-[10px] uppercase tracking-[4px] text-gray-500 mt-2">Cartão Digital</p>
        </div>

        {/* Card Content */}
        <div className="luxury-card w-full aspect-[4/5] rounded-[20px] overflow-hidden flex flex-col group relative">
          <div className="relative h-2/3 w-full">
            {property.main_image ? (
              <img src={property.main_image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-gray-600 uppercase text-[10px] tracking-widest">
                Sem Imagem
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
          </div>
          
          <div className="flex-1 bg-[#1A1A1A] p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-[#CBA153] text-xl font-serif mb-1 leading-tight">{property.title}</h2>
              <p className="text-gray-400 text-[10px] uppercase tracking-[2px]">{property.city} • {property.state}</p>
            </div>
            
            <div className="text-2xl font-serif text-white font-light tracking-wide">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="w-full grid grid-cols-2 gap-4 mt-8">
          <a href={`/imovel/${slug}`} 
             className="flex flex-col items-center justify-center gap-3 luxury-card py-6 rounded-xl group">
            <div className="w-10 h-10 rounded-full border border-[#CBA153]/20 flex items-center justify-center text-[#CBA153] group-hover:bg-[#CBA153] group-hover:text-[#121212] transition-all">
              <Home size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[9px] uppercase tracking-[2px] text-gray-400 group-hover:text-white transition-colors">Detalhes</span>
          </a>

          <a href={`https://wa.me/${property.seller_phone}`} 
             className="flex flex-col items-center justify-center gap-3 luxury-card py-6 rounded-xl group">
            <div className="w-10 h-10 rounded-full border border-[#CBA153]/20 flex items-center justify-center text-[#CBA153] group-hover:bg-[#CBA153] group-hover:text-[#121212] transition-all">
              <MessageCircle size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[9px] uppercase tracking-[2px] text-gray-400 group-hover:text-white transition-colors">WhatsApp</span>
          </a>
        </div>

        {/* Footer Link */}
        <a href="/" className="mt-12 text-[10px] uppercase tracking-[4px] text-gray-600 flex items-center gap-2 hover:text-[#CBA153] transition-colors">
          Acessar Portal <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
