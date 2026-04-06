import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, X } from 'lucide-react'
import Header from '@/components/layout/Header'
import PropertyStatusControls from '@/components/admin/PropertyStatusControls'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar propriedades do usuário para a lista
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-[#CBA153] text-3xl font-serif">Meus Imóveis</h2>
            <p className="text-gray-500 text-sm mt-2">Gerencie seus anúncios e visualizar leads</p>
          </div>

        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div key={prop.id} className="luxury-card rounded-xl overflow-hidden group h-[278px] flex flex-col">
                <div className="h-36 bg-[#1A1A1A] relative shrink-0">
                  {prop.main_image ? (
                    <img src={prop.main_image} alt={prop.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="text-gray-600" size={32} />
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label="Excluir imóvel"
                    title="Excluir imóvel"
                    className="absolute top-2 right-2 text-gray-400 hover:text-[#CBA153] hover:font-bold transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3 mb-0.5">
                    <h3 className="text-[#CBA153] text-[15px] font-serif truncate">{prop.title}</h3>
                    <div className="text-white text-base font-serif shrink-0 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price || 0)}
                    </div>
                  </div>
                  <p className="text-gray-400 text-[10px] mb-1 uppercase tracking-widest truncate">{prop.address_city} - {prop.address_state}</p>
                  <PropertyStatusControls propertyId={prop.id} initialStatus={prop.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="luxury-card p-12 text-center rounded-xl flex flex-col items-center justify-center">
            <Home className="text-gray-600 mb-4" size={48} />
            <h3 className="text-xl text-white font-serif mb-2">Nenhum imóvel cadastrado</h3>
            <p className="text-gray-500 text-sm mb-6">Você ainda não possui anúncios ativos.</p>
            <Link href="/admin/novo" className="btn-luxury">
              Criar meu primeiro anúncio
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
