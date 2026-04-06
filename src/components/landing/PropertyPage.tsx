import React from 'react';
import { Share2, Phone, Bookmark, UserPlus, Globe, Check, Image as ImageIcon } from 'lucide-react';

export interface PropertyAdminField {
  name: string;
  value: string;
  isPublic: boolean;
}

interface PropertySpecs {
  tipo_imovel?: string;
  dormitorios?: number;
  suites?: number;
  vagas?: number;
  tipo_vaga?: string;
  banheiros?: number;
  area_m2?: number;
  area_terreno?: number;
  tempo_construcao_anos?: number;
  documentacao?: string;
  conservacao?: string;
  mobiliada?: string;
  reformada?: boolean;
  casa_nova?: boolean;
  tem_edicula?: boolean;
  tem_piscina?: boolean;
  tem_hidro?: boolean;
  tem_ar?: boolean;
  admin_fields?: PropertyAdminField[];
}

export interface PropertyData {
  title: string;
  subtitle?: string;
  price: number;
  description: string;
  city: string;
  state: string;
  specs: PropertySpecs;
  seller_name: string;
  seller_phone: string;
  main_image?: string;
  gallery?: string[];
}

export default function PropertyPage({ property }: { property: PropertyData }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const sp = property.specs;
  const publicAdminFields = (sp.admin_fields || []).filter(f => f.isPublic && f.name && f.value);

  // Comodidades array
  const amenities = [];
  if (sp.tem_piscina) amenities.push("Piscina");
  if (sp.tem_ar) amenities.push("Ar Condicionado");
  if (sp.tem_hidro) amenities.push("Hidromassagem");
  if (sp.tem_edicula) amenities.push("Edícula");
  if (sp.mobiliada) amenities.push(`Mobília: ${sp.mobiliada}`);
  if (sp.reformada) amenities.push("Reformada Recentemente");
  if (sp.casa_nova) amenities.push("Casa Nova / Em Planta");

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans pb-20">
      {/* HEADER */}
      <header className="flex justify-between items-center px-[5%] py-6 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 relative w-full z-50">
        <div>
          <h1 className="text-[#CBA153] font-serif text-xl tracking-widest leading-none">Imóvel Forte</h1>
          <p className="text-[9px] uppercase tracking-[4px] text-gray-500 mt-1.5">imovelforte.com.br</p>
        </div>
        <div className="flex items-center gap-5">
          <button className="w-[38px] h-[38px] border border-[#CBA153] text-[#CBA153] flex items-center justify-center rounded-sm hover:bg-[#CBA153] hover:text-[#121212] transition-colors">
            <Share2 size={16} strokeWidth={1.5} />
          </button>
          <button className="px-6 py-3 bg-[#CBA153] text-[#121212] text-[10px] font-bold tracking-[2px] uppercase rounded-sm hover:bg-white transition-colors">
            Falar com Corretor
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#1A1A1A]">
          {property.main_image ? (
            <img src={property.main_image} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm tracking-widest uppercase">
              Sem imagem principal
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-black/30 pointer-events-none" />
        </div>
        
        <div className="relative z-10 text-center px-5 mt-32 max-w-4xl">
          <div className="inline-block px-4 py-1 border border-[#CBA153] text-[#CBA153] text-[9px] uppercase tracking-[3px] mb-6 rounded-sm bg-black/50 backdrop-blur-sm">
            {sp.tipo_imovel || 'Imóvel Exclusivo'}
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-serif tracking-wide mb-4 drop-shadow-2xl">
            {property.title}
          </h1>
          <p className="text-[11px] uppercase tracking-[4px] text-gray-300 drop-shadow-md mb-8">
            {property.subtitle || `${property.city} • ${property.state}`}
          </p>
          <div className="font-serif text-[#CBA153] text-4xl mt-4 tracking-wider drop-shadow-2xl">
            {formatPrice(property.price)}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] w-[90%] mx-auto mt-[-40px] relative z-20">
        
        {/* CARDS DE DESTAQUE PRINCIPAIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 bg-[#1A1A1A] p-4 rounded-xl shadow-2xl border border-white/5">
          {sp.dormitorios ? (
            <div className="flex flex-col items-center justify-center p-6 border-r border-white/5 last:border-0">
              <span className="text-2xl text-[#CBA153] font-serif mb-1">{sp.dormitorios}</span>
              <span className="text-[9px] uppercase tracking-[2px] text-gray-500">Dormitórios</span>
            </div>
          ) : null}
          
          {sp.suites ? (
            <div className="flex flex-col items-center justify-center p-6 border-r border-white/5 last:border-0">
              <span className="text-2xl text-[#CBA153] font-serif mb-1">{sp.suites}</span>
              <span className="text-[9px] uppercase tracking-[2px] text-gray-500">Suítes</span>
            </div>
          ) : null}
          
          {sp.vagas ? (
            <div className="flex flex-col items-center justify-center p-6 border-r border-white/5 last:border-0">
              <span className="text-2xl text-[#CBA153] font-serif mb-1">{sp.vagas}</span>
              <span className="text-[9px] uppercase tracking-[2px] text-gray-500">Vagas {sp.tipo_vaga ? `(${sp.tipo_vaga})` : ''}</span>
            </div>
          ) : null}
          
          {sp.area_m2 ? (
            <div className="flex flex-col items-center justify-center p-6">
              <span className="text-2xl text-[#CBA153] font-serif mb-1">{sp.area_m2}m²</span>
              <span className="text-[9px] uppercase tracking-[2px] text-gray-500">Área Útil</span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COLUNA ESQUERDA (DESCRIÇÃO E DETALHES) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-16">
            
            {/* SOBRE O IMÓVEL */}
            <section>
              <h2 className="text-[#CBA153] text-2xl font-serif mb-6 border-b border-white/10 pb-4">Sobre o Imóvel</h2>
              <p className="text-[15px] text-gray-300 leading-loose whitespace-pre-line font-light">
                {property.description}
              </p>
            </section>

            {/* CARACTERÍSTICAS TÉCNICAS */}
            <section>
              <h2 className="text-[#CBA153] text-2xl font-serif mb-6 border-b border-white/10 pb-4">Ficha Técnica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Tipo</span>
                  <span className="text-gray-200 text-xs font-medium">{sp.tipo_imovel || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Área do Terreno</span>
                  <span className="text-gray-200 text-xs font-medium">{sp.area_terreno ? `${sp.area_terreno}m²` : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Ano Const. / Tempo</span>
                  <span className="text-gray-200 text-xs font-medium">{sp.tempo_construcao_anos ? `${sp.tempo_construcao_anos} anos` : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Banheiros Totais</span>
                  <span className="text-gray-200 text-xs font-medium">{sp.banheiros || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Estado Conser.</span>
                  <span className="text-gray-200 text-xs font-medium">{sp.conservacao || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Documentação</span>
                  <span className="text-gray-200 text-xs font-medium">{sp.documentacao || '-'}</span>
                </div>

                {/* Campos Administrativos Marcados Como Públicos */}
                {publicAdminFields.map((field, idx) => (
                  <div key={idx} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#CBA153]/70 text-xs">{field.name}</span>
                    <span className="text-gray-200 text-xs font-medium">{field.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* COMODIDADES */}
            {amenities.length > 0 && (
              <section>
                <h2 className="text-[#CBA153] text-2xl font-serif mb-6 border-b border-white/10 pb-4">Comodidades & Lazer</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#1A1A1A] p-4 rounded-sm border border-white/5">
                      <Check size={16} className="text-[#CBA153]" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* GALERIA */}
            {property.gallery && property.gallery.length > 0 && (
              <section>
                <h2 className="text-[#CBA153] text-2xl font-serif mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                  <ImageIcon size={24} /> Galeria de Fotos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.gallery.map((url, idx) => (
                    url ? (
                      <div key={idx} className="aspect-[4/3] bg-[#1A1A1A] overflow-hidden rounded-sm group relative cursor-pointer">
                        <img src={url} alt={`Foto ${idx+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                      </div>
                    ) : null
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* COLUNA DIREITA (CONTATO FIXO) */}
          <div className="col-span-1">
            <div className="sticky top-32 bg-[#1A1A1A] border border-[#CBA153]/30 p-8 rounded-xl flex flex-col items-center text-center shadow-2xl">
              <div className="w-24 h-24 rounded-full border-2 border-[#CBA153] overflow-hidden bg-[#121212] flex items-center justify-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Logo</span>
              </div>
              <h3 className="text-lg font-serif text-[#E0E0E0] mb-1">{property.seller_name}</h3>
              <p className="text-[#CBA153] text-[10px] uppercase tracking-[2px] mb-8">Anunciante Verificado</p>

              <div className="w-full flex flex-col gap-3">
                <a href={`https://wa.me/${property.seller_phone}?text=Ol%C3%A1,%20tenho%20interesse%20no%20im%C3%B3vel%20${property.title}`} 
                   className="w-full bg-[#CBA153] text-[#121212] font-bold text-xs tracking-widest uppercase py-4 rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2">
                  WhatsApp Direto
                </a>
                <a href={`tel:${property.seller_phone}`} 
                   className="w-full border border-white/20 text-[#E0E0E0] text-xs tracking-widest uppercase py-4 rounded-sm hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2">
                  Ligar Agora
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 w-full flex justify-center gap-6">
                <button className="text-gray-500 hover:text-[#CBA153] transition-colors flex flex-col items-center gap-2">
                  <Bookmark size={18} />
                  <span className="text-[8px] uppercase tracking-widest">Salvar</span>
                </button>
                <button className="text-gray-500 hover:text-[#CBA153] transition-colors flex flex-col items-center gap-2">
                  <Share2 size={18} />
                  <span className="text-[8px] uppercase tracking-widest">Enviar</span>
                </button>
                <button className="text-gray-500 hover:text-[#CBA153] transition-colors flex flex-col items-center gap-2">
                  <Globe size={18} />
                  <span className="text-[8px] uppercase tracking-widest">Site</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <footer className="mt-32 text-center py-10 text-[10px] uppercase tracking-[3px] text-gray-600 border-t border-white/5 bg-[#1A1A1A]">
        © 2026 - Imóvel Forte Exclusivity
      </footer>
    </div>
  );
}
