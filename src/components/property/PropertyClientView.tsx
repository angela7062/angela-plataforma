'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BedDouble, Bath, Car, Maximize, ChevronLeft } from 'lucide-react'
import { FavoriteButton, ShareButton, StickyMobileBar } from '@/components/property/PropertyClientComponents'

// --- Componente de UI (Cliente) ---
const Feature = ({ icon, value, label, unit }: { icon: React.ReactNode, value?: string | number | null, label: string, unit?: string }) => {
  if (value === null || value === undefined) return null
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-[#B8860B]">{icon}</div>
      <p className="text-sm font-bold mt-1.5 text-ivory-white">{value}{unit || ''}</p>
      <p className="text-[10px] text-white/50 uppercase tracking-wider">{label}</p>
    </div>
  )
}

export default function PropertyClientView({ property, profile, cover }: { property: any, profile: any, cover?: string }) {
  
  const company_name = profile?.company_name ?? null;
  const is_professional = profile?.is_professional ?? false;
  const full_name = profile?.full_name ?? "Consultor Imobiliário";
  const avatar_url = profile?.avatar_url ?? '/avatar-placeholder.png';
  const whatsapp = profile?.whatsapp ?? null;

  let sloganTitle, sloganText;
  if (is_professional) {
      sloganTitle = 'Consultoria Especializada';
      sloganText = company_name 
        ? 'Este imóvel faz parte da curadoria de nossa imobiliária parceira. Excelência e segurança em negócios imobiliários.'
        : 'Atendimento especializado por um corretor parceiro. Compromisso com a transparência e agilidade na sua conquista.';
  } else {
      sloganTitle = 'Anúncio Direto';
      sloganText = 'Anúncio direto com o proprietário. Uma oportunidade de negociação transparente facilitada pela nossa plataforma.';
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'Valor sob consulta'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
  }

  return (
    <div className="bg-[#1A1A1A] text-[#FFFFF0] font-sans pb-20 lg:pb-0">
      <StickyMobileBar whatsappNumber={whatsapp} propertyTitle={property.title} />

      <header className="relative w-full h-[75vh]">
        <Link href="/" aria-label="Voltar" className="absolute top-6 left-6 z-30 flex items-center justify-center w-11 h-11 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300">
          <ChevronLeft size={22} />
        </Link>
        <FavoriteButton />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
           <span className="bg-black/50 backdrop-blur-sm text-[#B8860B] border border-[#B8860B] px-4 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-sm">
            Oportunidade Exclusiva
          </span>
        </div>

        <Image
          src={cover || (property.images && property.images[0]) || '/placeholder.jpg'}
          alt={`Fachada de ${property.title}`}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-screen-lg mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl font-light leading-tight">
              {property.title}
            </h1>
            <p className="font-serif text-2xl md:text-3xl text-[#B8860B] mt-2">
              {formatPrice(property.price)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10 md:gap-16">
          
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5">
                <h2 className="font-serif text-2xl">Detalhes do Imóvel</h2>
                <ShareButton propertyTitle={property.title} />
            </div>

            <div className="prose prose-invert max-w-none text-[#FFFFF0]/80 leading-relaxed text-sm text-justify">
              <p>{property.description || 'Descrição não disponível.'}</p>
            </div>

            <div className="grid grid-cols-4 gap-4 py-6 my-6 border-y border-white/10">
              <Feature icon={<BedDouble size={16}/>} value={(property.features as any)?.bedrooms} label="Dorms" />
              <Feature icon={<Bath size={16}/>} value={(property.features as any)?.suites} label="Suítes" />
              <Feature icon={<Car size={16}/>} value={(property.features as any)?.parking_spots} label="Vagas" />
              <Feature icon={<Maximize size={16}/>} value={(property.features as any)?.area} label="Área" unit="m²" />
            </div>
          </div>

          <aside>
            <div className="bg-[#222222]/50 border border-white/10 rounded-lg p-5 sticky top-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                        <div className="absolute inset-0.5 rounded-full border-2 border-[#B8860B]"></div>
                        <Image 
                            src={avatar_url} 
                            alt={full_name} 
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover p-1"
                        />
                    </div>
                    <div>
                    {company_name && <p className="font-serif text-sm uppercase tracking-wider text-white/70">{company_name}</p>}
                    <p className="font-semibold text-base text-white">{full_name}</p>
                    </div>
                </div>
              <h3 className="font-serif text-lg text-[#B8860B]">{sloganTitle}</h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">{sloganText}</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
