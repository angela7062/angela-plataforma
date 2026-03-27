import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Home, LogOut } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar propriedades do usuário
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('seller_id', user.id)

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans">
      <header className="flex justify-between items-center px-[5%] py-6 bg-[#1A1A1A] border-b border-white/5">
        <div>
          <h1 className="text-[#CBA153] font-serif text-xl tracking-widest leading-none">Imóvel Forte</h1>
          <p className="text-[9px] uppercase tracking-[4px] text-gray-500 mt-1.5">Painel do Anunciante</p>
        </div>
        <div className="flex gap-4">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs uppercase tracking-widest">
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-[#CBA153] text-3xl font-serif">Meus Imóveis</h2>
            <p className="text-gray-500 text-sm mt-2">Gerencie seus anúncios e visualizar leads</p>
          </div>
          <Link href="/admin/novo" className="btn-luxury flex items-center gap-2">
            <Plus size={16} /> Novo Anúncio
          </Link>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div key={prop.id} className="luxury-card rounded-xl overflow-hidden group">
                <div className="h-48 bg-[#1A1A1A] relative">
                  {prop.main_image ? (
                    <img src={prop.main_image} alt={prop.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="text-gray-600" size={32} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-[#CBA153] text-lg font-serif mb-1 truncate">{prop.title}</h3>
                  <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest">{prop.address_city} - {prop.address_state}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price || 0)}
                    </span>
                    <Link href={`/admin/editar/${prop.id}`} className="text-[#CBA153] hover:underline uppercase text-[10px] tracking-widest">
                      Editar
                    </Link>
                  </div>
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
