'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { User, PlusCircle, Search, ChevronDown, SlidersHorizontal, X, Wrench, HardHat, Building, UserCheck } from 'lucide-react'
import UserGlobalIdentity from './UserGlobalIdentity'
import { createClient } from '@/lib/supabase'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isDetailsVisible, setIsDetailsVisible] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleClearAndNavigate = (newIntent: string) => {
    setSearch('');
    setFilters({
      dormitorios: '',
      suites: '',
      banheiros: '',
      vagas: '',
      minPrice: '',
      maxPrice: '',
      tipos: [],
      localizacao: [],
      diferenciais: []
    });
    setIntent(newIntent);
    setActiveMenu(null);
    setIsDetailsVisible(false);
    router.push(`/imoveis?intent=${newIntent}`);
  }

  const handleClearAllFilters = () => {
    setSearch('');
    setFilters({
      dormitorios: '',
      suites: '',
      banheiros: '',
      vagas: '',
      minPrice: '',
      maxPrice: '',
      tipos: [],
      localizacao: [],
      diferenciais: []
    });
    setIntent('');
    setActiveMenu(null);
    setIsDetailsVisible(false);
    router.push('/imoveis');
  };

  // Estados dos Filtros
  const [intent, setIntent] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    dormitorios: '',
    suites: '',
    banheiros: '',
    vagas: '',
    minPrice: '',
    maxPrice: '',
    tipos: [] as string[],
    localizacao: [] as string[],
    diferenciais: [] as string[]
  })

  // Alternar checkbox
  const toggleSelection = (category: 'tipos' | 'localizacao' | 'diferenciais', value: string) => {
    setFilters(prev => {
      const current = prev[category]
      const next = current.includes(value) 
        ? current.filter((i: string) => i !== value) 
        : [...current, value]
      return { ...prev, [category]: next }
    })
  }

  const handleApply = (newIntent?: string, newSearch?: string) => {
    const params = new URLSearchParams()
    const finalIntent = newIntent !== undefined ? newIntent : intent;
    if (finalIntent) {
        params.set('intent', finalIntent)
    }

    const searchQuery = newSearch !== undefined ? newSearch : search
    if (searchQuery) params.set('q', searchQuery)
    
    if (filters.dormitorios) params.set('dormitorios', filters.dormitorios)
    if (filters.suites) params.set('suites', filters.suites)
    if (filters.banheiros) params.set('banheiros', filters.banheiros)
    if (filters.vagas) params.set('vagas', filters.vagas)
    if (filters.minPrice) params.set('min_price', filters.minPrice)
    if (filters.maxPrice) params.set('max_price', filters.maxPrice)
    
    filters.tipos.forEach((t: string) => params.append('tipo', t))
    filters.localizacao.forEach((l: string) => params.append('loc', l))
    filters.diferenciais.forEach((d: string) => params.append('feat', d))

    router.push(`/imoveis?${params.toString()}`)
    setIsDetailsVisible(false)
  }

  const labelClass = "text-[12px] text-[#CBA153] font-serif uppercase font-bold tracking-wider mb-6 border-b border-gray-100 pb-2 block"
  
  const filterBtnClass = (active: boolean) => `
    flex-1 h-[26px] text-[10px] font-bold rounded-sm transition-all border 
    ${active 
      ? 'bg-[#CBA153] text-white border-[#CBA153] shadow-[0_4px_12px_rgba(203,161,83,0.3)]' 
      : 'bg-white border-gray-200 text-[#2D2D2D] hover:border-[#CBA153] hover:text-[#CBA153]'}
  `

  const filterTagClass = (active: boolean) => `
    px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all border text-center
    ${active 
      ? 'bg-[#CBA153] text-white border-[#CBA153]' 
      : 'bg-white border-gray-200 text-[#2D2D2D] hover:border-[#CBA153] hover:text-[#CBA153]'}
  `

  return (
    <header className="relative w-full z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5 transition-all">
      {/* Linha Superior: Logo, Entrar, Anunciar */}
      <div className="px-[5%] py-4 flex justify-between items-center">
        <Link href="/" className="flex flex-col">
          <h1 className="text-[#CBA153] font-serif text-2xl tracking-widest leading-none">Imóvel Forte</h1>
          <p className="text-[8px] uppercase tracking-[4px] text-gray-500 mt-1">Portal Premium</p>
        </Link>
        
        <div className="flex items-center gap-5">
          {!user ? (
            <>
              <Link 
                href="/login?mode=comprar" 
                className="flex items-center gap-2 border border-[#CBA153] text-[#CBA153] hover:bg-[#CBA153] hover:text-[#121212] transition-colors text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm"
              >
                <User size={16} />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
              <Link 
                href="/login?mode=anunciar&redirect=/admin/novo" 
                className="flex items-center gap-2 bg-[#CBA153] text-[#121212] border border-[#CBA153] px-5 py-2.5 rounded-sm hover:bg-[#121212] hover:text-[#CBA153] transition-all text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Anunciar</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-5">
              <UserGlobalIdentity />
              <Link 
                href="/admin/novo" 
                className="flex items-center gap-2 bg-[#CBA153] text-[#121212] border border-[#CBA153] px-5 py-2.5 rounded-sm hover:bg-[#121212] hover:text-[#CBA153] transition-all text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Anunciar</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Linha Inferior: Navegação com Mega Menu */}
      {!isAdminPage && (
        <div className="hidden md:block border-t border-white/5 px-[5%] py-3">
          <nav className="flex justify-between items-center">
            {/* Lado Esquerdo */}
            <div className="flex items-center gap-8">
              {/* ITEM: COMPRAR */}
              <div 
                className="relative group py-2"
                onMouseEnter={() => setActiveMenu('Vender')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  href="/imoveis?intent=Vender" 
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1 ${activeMenu === 'Vender' ? 'text-[#CBA153]' : 'text-gray-400 hover:text-[#CBA153]'}`}
                >
                  Comprar
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'Vender' ? 'rotate-180' : ''}`} />
                </Link>

                {/* Mega Menu COMPRAR (6 colunas) */}
                <div className={`absolute top-full left-[-20%] w-[90vw] max-w-[1400px] z-[100] transition-all duration-300 ${activeMenu === 'Vender' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="h-4 w-full" />
                  <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden text-[#121212] p-8 grid grid-cols-6 gap-6 border-t-2 border-[#CBA153]">
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Casas</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=CASA+TÉRREA" className="hover:text-[#CBA153] transition-colors">Casa Térrea</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=TÉRREA+GEMINADA" className="hover:text-[#CBA153] transition-colors">Térrea Geminada</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=TÉRREA+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Térrea em Condomínio</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=SOBRADO" className="hover:text-[#CBA153] transition-colors">Sobrado</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=SOBRADO+GEMINADO" className="hover:text-[#CBA153] transition-colors">Sobrado Geminado</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=SOBRADO+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Sobrado em Condomínio</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=CASA+SOBREPOSTA" className="hover:text-[#CBA153] transition-colors">Casa Sobreposta</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Casas&subcategory=SOBREPOSTA+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Sobreposta em Condomínio</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Apartamentos</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Apartamentos&subcategory=EM+GERAL" className="hover:text-[#CBA153] transition-colors">Em Geral</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Apartamentos&subcategory=KITNETS+/+FLATS+/+STUDIOS" className="hover:text-[#CBA153] transition-colors">Kitnets / Flats / Studios</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Apartamentos&subcategory=COBERTURA+DUPLEX" className="hover:text-[#CBA153] transition-colors">Cobertura Duplex</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Apartamentos&subcategory=NA+PLANTA" className="hover:text-[#CBA153] transition-colors">Na Planta</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Rurais & Lotes</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Rurais+%26+Lotes&subcategory=SÍTIOS+E+CHÁCARAS" className="hover:text-[#CBA153] transition-colors">Sítios e Chácaras</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Rurais+%26+Lotes&subcategory=LOTES+E+TERRENOS" className="hover:text-[#CBA153] transition-colors">Lotes e Terrenos</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Rurais+%26+Lotes&subcategory=FAZENDAS" className="hover:text-[#CBA153] transition-colors">Fazendas</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Comercial</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Comercial&subcategory=SALAS+COMERCIAIS" className="hover:text-[#CBA153] transition-colors">Salas Comerciais</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Comercial&subcategory=PRÉDIOS+INTEIROS" className="hover:text-[#CBA153] transition-colors">Prédios Inteiros</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Comercial&subcategory=GALPÕES" className="hover:text-[#CBA153] transition-colors">Galpões</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Comercial&subcategory=LOJAS" className="hover:text-[#CBA153] transition-colors">Lojas</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Lançamentos</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Lançamentos&subcategory=NA+PLANTA" className="hover:text-[#CBA153] transition-colors">Na Planta</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Lançamentos&subcategory=EM+OBRAS" className="hover:text-[#CBA153] transition-colors">Em Obras</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Lançamentos&subcategory=PRONTO+PARA+MORAR" className="hover:text-[#CBA153] transition-colors">Pronto para Morar</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Vender&category=Lançamentos&subcategory=OPORTUNIDADES" className="hover:text-[#CBA153] transition-colors">Oportunidades</Link></li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-sm flex flex-col justify-center items-center text-center">
                      <p className="font-serif text-[#121212] text-xs leading-relaxed mb-4 italic">"Encontre o lar dos seus sonhos em nossa curadoria exclusiva."</p>
                      <button 
                        onClick={() => handleClearAndNavigate('Vender')} 
                        className="w-full bg-[#CBA153] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-sm hover:bg-[#121212] transition-colors"
                      >
                        Ver Todos
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEM: ALUGAR */}
              <div 
                className="relative group py-2"
                onMouseEnter={() => setActiveMenu('Alugar')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  href="/imoveis?intent=Alugar" 
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1 ${activeMenu === 'Alugar' ? 'text-[#CBA153]' : 'text-gray-400 hover:text-[#CBA153]'}`}
                >
                  Alugar
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'Alugar' ? 'rotate-180' : ''}`} />
                </Link>

                {/* Mega Menu ALUGAR (5 colunas) */}
                <div className={`absolute top-full left-[-50%] w-[80vw] max-w-[1200px] z-[100] transition-all duration-300 ${activeMenu === 'Alugar' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="h-4 w-full" />
                  <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden text-[#121212] p-8 grid grid-cols-5 gap-6 border-t-2 border-[#CBA153]">
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Casas</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=CASA+TÉRREA" className="hover:text-[#CBA153] transition-colors">Casa Térrea</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=TÉRREA+GEMINADA" className="hover:text-[#CBA153] transition-colors">Térrea Geminada</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=TÉRREA+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Térrea em Condomínio</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=SOBRADO" className="hover:text-[#CBA153] transition-colors">Sobrado</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=SOBRADO+GEMINADO" className="hover:text-[#CBA153] transition-colors">Sobrado Geminado</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=SOBRADO+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Sobrado em Condomínio</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=CASA+SOBREPOSTA" className="hover:text-[#CBA153] transition-colors">Casa Sobreposta</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Casas&subcategory=SOBREPOSTA+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Sobreposta em Condomínio</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Apartamentos</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Apartamentos&subcategory=EM+GERAL" className="hover:text-[#CBA153] transition-colors">Em Geral</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Apartamentos&subcategory=KITNETS+/+FLATS+/+STUDIOS" className="hover:text-[#CBA153] transition-colors">Kitnets / Flats / Studios</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Apartamentos&subcategory=COBERTURA+DUPLEX" className="hover:text-[#CBA153] transition-colors">Cobertura Duplex</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Rurais & Lotes</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Rurais+%26+Lotes&subcategory=SÍTIOS+E+CHÁCARAS" className="hover:text-[#CBA153] transition-colors">Sítios e Chácaras</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Rurais+%26+Lotes&subcategory=LOTES+E+TERRENOS" className="hover:text-[#CBA153] transition-colors">Lotes e Terrenos</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Rurais+%26+Lotes&subcategory=FAZENDAS" className="hover:text-[#CBA153] transition-colors">Fazendas</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Comercial</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Comercial&subcategory=SALAS+COMERCIAIS" className="hover:text-[#CBA153] transition-colors">Salas Comerciais</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Comercial&subcategory=PRÉDIOS+INTEIROS" className="hover:text-[#CBA153] transition-colors">Prédios Inteiros</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Comercial&subcategory=GALPÕES" className="hover:text-[#CBA153] transition-colors">Galpões</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Alugar&category=Comercial&subcategory=LOJAS" className="hover:text-[#CBA153] transition-colors">Lojas</Link></li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-sm flex flex-col justify-center items-center text-center">
                      <p className="font-serif text-[#121212] text-xs leading-relaxed mb-4 italic">"Imóveis prontos para morar ou começar seu negócio."</p>
                      <button 
                        onClick={() => handleClearAndNavigate('Alugar')} 
                        className="w-full bg-[#CBA153] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-sm hover:bg-[#121212] transition-colors"
                      >
                        Ver Todos
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEM: TEMPORADA */}
              <div 
                className="relative group py-2"
                onMouseEnter={() => setActiveMenu('Temporada')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  href="/imoveis?intent=Temporada" 
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1 ${activeMenu === 'Temporada' ? 'text-[#CBA153]' : 'text-gray-400 hover:text-[#CBA153]'}`}
                >
                  Temporada
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'Temporada' ? 'rotate-180' : ''}`} />
                </Link>

                {/* Mega Menu TEMPORADA (4 colunas) */}
                <div className={`absolute top-full left-[-70%] w-[70vw] max-w-[1000px] z-[100] transition-all duration-300 ${activeMenu === 'Temporada' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="h-4 w-full" />
                  <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden text-[#121212] p-8 grid grid-cols-4 gap-6 border-t-2 border-[#CBA153]">
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Casas</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=CASA+TÉRREA" className="hover:text-[#CBA153] transition-colors">Casa Térrea</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=TÉRREA+GEMINADA" className="hover:text-[#CBA153] transition-colors">Térrea Geminada</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=TÉRREA+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Térrea em Condomínio</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=SOBRADO" className="hover:text-[#CBA153] transition-colors">Sobrado</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=SOBRADO+GEMINADO" className="hover:text-[#CBA153] transition-colors">Sobrado Geminado</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=SOBRADO+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Sobrado em Condomínio</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=CASA+SOBREPOSTA" className="hover:text-[#CBA153] transition-colors">Casa Sobreposta</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Casas&subcategory=SOBREPOSTA+EM+CONDOMÍNIO" className="hover:text-[#CBA153] transition-colors">Sobreposta em Condomínio</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Apartamentos</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Apartamentos&subcategory=EM+GERAL" className="hover:text-[#CBA153] transition-colors">Em Geral</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Apartamentos&subcategory=KITNETS+/+FLATS+/+STUDIOS" className="hover:text-[#CBA153] transition-colors">Kitnets / Flats / Studios</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Apartamentos&subcategory=COBERTURA+DUPLEX" className="hover:text-[#CBA153] transition-colors">Cobertura Duplex</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Rurais</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/imoveis?intent=Temporada&category=Rurais+%26+Lotes&subcategory=SÍTIOS+E+CHÁCARAS" className="hover:text-[#CBA153] transition-colors">Sítios e Chácaras</Link></li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-sm flex flex-col justify-center items-center text-center">
                      <p className="font-serif text-[#121212] text-xs leading-relaxed mb-4 italic">"Os melhores imóveis para o seu descanso e lazer."</p>
                      <button 
                        onClick={() => handleClearAndNavigate('Temporada')} 
                        className="w-full bg-[#CBA153] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-sm hover:bg-[#121212] transition-colors"
                      >
                        Ver Todos
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Lado Direito */}
            <div className="flex items-center gap-8">
              <div 
                className="relative group py-2"
                onMouseEnter={() => setActiveMenu('profissionais')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  href="/profissionais" 
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1 ${activeMenu === 'profissionais' ? 'text-[#CBA153]' : 'text-gray-400 hover:text-[#CBA153]'}`}
                >
                  Agentes/Profissionais
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'profissionais' ? 'rotate-180' : ''}`} />
                </Link>

                {/* Mega Menu PROFISSIONAIS (4 colunas) - Alinhado à Direita */}
                <div className={`absolute top-full right-0 w-[60vw] max-w-[800px] z-[100] transition-all duration-300 ${activeMenu === 'profissionais' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="h-4 w-full" />
                  <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden text-[#121212] p-8 grid grid-cols-4 gap-6 border-t-2 border-[#CBA153]">
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Vendas</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=corretores" className="hover:text-[#CBA153] transition-colors">Corretores de Imóveis</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=imobiliarias" className="hover:text-[#CBA153] transition-colors">Imobiliárias Cadastradas</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=agencias" className="hover:text-[#CBA153] transition-colors">Agências</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Projetos</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=arquitetos" className="hover:text-[#CBA153] transition-colors">Arquitetos</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=engenheiros" className="hover:text-[#CBA153] transition-colors">Engenheiros</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Construção</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=construtores" className="hover:text-[#CBA153] transition-colors">Construtores</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-[#CBA153] text-[13px] font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Manutenção</h4>
                      <ul className="space-y-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=pedreiros" className="hover:text-[#CBA153] transition-colors">Pedreiros</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=pintores" className="hover:text-[#CBA153] transition-colors">Pintores</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=encanadores" className="hover:text-[#CBA153] transition-colors">Encanadores</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=eletricistas" className="hover:text-[#CBA153] transition-colors">Eletricistas</Link></li>
                        <li><Link onClick={() => setActiveMenu(null)} href="/profissionais?categoria=manutencao" className="hover:text-[#CBA153] transition-colors">Todos</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Linha 2: Barra de Filtros Integrada */}
      {!isAdminPage && (
        <div className="hidden md:block border-t border-white/5 px-[5%] py-4 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            
            {/* Seletor de Finalidade (Alinhado com COMPRAR) */}
            <div className="relative min-w-[140px]">
              <select 
                value={intent} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'limpar') {
                    handleClearAllFilters();
                  } else {
                    setIntent(val);
                    handleApply(val);
                  }
                }} 
                className="w-full bg-transparent text-[#CBA153] text-[11px] font-bold tracking-widest h-10 px-4 rounded-sm outline-none cursor-pointer appearance-none pr-10 border border-white/5"
              >
                <option value="">Escolha</option>
                <option value="Vender">Comprar</option>
                <option value="Alugar">Alugar</option>
                <option value="Temporada">Temporada</option>
                <option value="Leilão">Leilão</option>
                <option value="limpar">Limpar Filtro</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBA153] pointer-events-none" />
            </div>

            {/* Campo de Busca Unificado */}
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Busque por Estado, Cidade ou Bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApply();
                  }
                }}
                className="w-full bg-white/[0.03] border border-white/10 text-white text-sm h-12 px-5 rounded-sm outline-none focus:border-[#CBA153]/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-600 font-light"
              />
              <button 
                onClick={() => handleApply()}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#CBA153] transition-colors"
              >
                <Search size={16} />
              </button>
            </div>

            {/* Gatilho Mais Detalhes (Hover) */}
            <div 
              className="relative"
              onMouseEnter={() => setIsDetailsVisible(true)}
              onMouseLeave={() => setIsDetailsVisible(false)}
            >
              <button 
                className={`flex items-center gap-2 h-12 px-6 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all border ${isDetailsVisible ? 'bg-[#CBA153] border-[#CBA153] text-black' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}
              >
                <SlidersHorizontal size={14} />
                Mais Detalhes
              </button>

              {/* Menu Detalhes (Hover) */}
              <div className={`absolute top-full right-0 w-[920px] z-[100] transition-all duration-300 ${isDetailsVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                <div className="h-4 w-full" />
                <div className="bg-[#f8f7f2] shadow-[0_30px_60px_rgba(0,0,0,0.25)] rounded-sm p-12 text-[#121212] border-t-2 border-[#CBA153]">
                  <div className="grid grid-cols-4 gap-12 text-left">
                    {/* Coluna 1: Investimento */}
                    <div>
                      <span className={labelClass}>Investimento</span>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-[#CBA153] font-bold">R$</span>
                            <input 
                              type="number" 
                              placeholder="Valor Mínimo" 
                              value={filters.minPrice}
                              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                              className="w-full bg-white border border-gray-200 pl-12 pr-4 py-3.5 text-[12px] rounded-sm outline-none text-[#121212] focus:border-[#CBA153] transition-all placeholder:text-gray-300" 
                            />
                          </div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-[#CBA153] font-bold">R$</span>
                            <input 
                              type="number" 
                              placeholder="Valor Máximo" 
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                              className="w-full bg-white border border-gray-200 pl-12 pr-4 py-3.5 text-[12px] rounded-sm outline-none text-[#121212] focus:border-[#CBA153] transition-all placeholder:text-gray-300" 
                            />
                          </div>
                        </div>
                        <div className="p-5 bg-[#e8e6df] rounded-sm shadow-inner">
                          <p className="text-[13.5px] text-[#2D2D2D] leading-relaxed font-semibold italic">
                            "Filtre por faixa de preço para encontrar as melhores oportunidades dentro do seu orçamento."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Estrutura */}
                    <div>
                      <span className={labelClass}>Estrutura</span>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] text-[#2D2D2D] uppercase tracking-[0.2em] mb-3 font-bold">Dormitórios</p>
                          <div className="grid grid-cols-3 gap-2">
                            {['1+', '2+', '3+', '4+', '5+', '6+'].map(num => (
                              <button 
                                key={num} 
                                onClick={() => setFilters({...filters, dormitorios: filters.dormitorios === num ? '' : num})}
                                className={filterBtnClass(filters.dormitorios === num)}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#2D2D2D] uppercase tracking-[0.2em] mb-3 font-bold">Suítes</p>
                          <div className="grid grid-cols-3 gap-2">
                            {['1+', '2+', '3+', '4+', '5+', '6+'].map(num => (
                              <button 
                                key={num} 
                                onClick={() => setFilters({...filters, suites: filters.suites === num ? '' : num})}
                                className={filterBtnClass(filters.suites === num)}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#2D2D2D] uppercase tracking-[0.2em] mb-3 font-bold">Banheiros</p>
                          <div className="grid grid-cols-3 gap-2">
                            {['1+', '2+', '3+', '4+', '5+', '6+'].map(num => (
                              <button 
                                key={num} 
                                onClick={() => setFilters({...filters, banheiros: filters.banheiros === num ? '' : num})}
                                className={filterBtnClass(filters.banheiros === num)}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#2D2D2D] uppercase tracking-[0.2em] mb-3 font-bold">Vagas de Garagem</p>
                          <div className="grid grid-cols-3 gap-2">
                            {['1+', '2+', '3+', '4+', '5+', '6+'].map(num => (
                              <button 
                                key={num} 
                                onClick={() => setFilters({...filters, vagas: filters.vagas === num ? '' : num})}
                                className={filterBtnClass(filters.vagas === num)}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 3: Localização e Tipo */}
                    <div>
                      <span className={labelClass}>Localização e Tipo</span>
                      <div className="flex flex-col gap-6">
                        <div>
                          <p className="text-[9px] text-[#2D2D2D] uppercase tracking-[0.2em] mb-4 font-bold">Tipo de Imóvel</p>
                          <div className="grid grid-cols-1 gap-2">
                            {['Casa', 'Apartamento', 'Rural', 'Comercial'].map(tipo => (
                              <button 
                                key={tipo}
                                onClick={() => toggleSelection('tipos', tipo)}
                                className={filterTagClass(filters.tipos.includes(tipo))}
                              >
                                {tipo}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#2D2D2D] uppercase tracking-[0.2em] mb-4 font-bold">Localização</p>
                          <div className="grid grid-cols-1 gap-2">
                            {['Em Condomínio', 'Em Via Pública'].map(loc => (
                              <button 
                                key={loc}
                                onClick={() => toggleSelection('localizacao', loc)}
                                className={filterTagClass(filters.localizacao.includes(loc))}
                              >
                                {loc}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 4: Lazer e Extras */}
                    <div>
                      <span className={labelClass}>Lazer e Extras</span>
                      <div className="grid grid-cols-1 gap-2">
                        {['Piscina', 'Churrasqueira', 'Área Gourmet', 'Edícula', 'Hidromassagem', 'Varanda'].map(feat => (
                          <button 
                            key={feat}
                            onClick={() => toggleSelection('diferenciais', feat)}
                            className={filterTagClass(filters.diferenciais.includes(feat))}
                          >
                            {feat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botão Aplicar */}
                  <div className="mt-10 pt-8 border-t border-gray-200 flex justify-end items-center gap-6">
                    <p className="text-[9px] text-[#2D2D2D] uppercase tracking-widest font-medium italic">Selecione as opções desejadas para filtrar</p>
                    <button 
                      onClick={handleApply}
                      className="bg-[#CBA153] hover:bg-[#121212] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-12 py-4 rounded-sm transition-all shadow-lg active:scale-95"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versão Mobile Simplificada da Navegação (Ocultando Mega Menu complexo) */}
      {!isAdminPage && (
        <div className="md:hidden border-t border-white/5 flex overflow-x-auto py-3 px-4 gap-6 no-scrollbar">
          <Link href="/imoveis?intent=Vender" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Comprar</Link>
          <Link href="/imoveis?intent=Alugar" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Alugar</Link>
          <Link href="/imoveis?intent=Temporada" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Temporada</Link>
          <Link href="/profissionais" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Profissionais</Link>
          <button className="text-gray-400 ml-auto"><Search size={16} /></button>
        </div>
      )}
    </header>
  )
}
