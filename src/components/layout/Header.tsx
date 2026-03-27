import React from 'react'
import Link from 'next/link'
import { UserPlus, PlusCircle } from 'lucide-react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-[5%] py-4 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center transition-all">
      <Link href="/" className="flex flex-col">
        <h1 className="text-[#CBA153] font-serif text-2xl tracking-widest leading-none">Imóvel Forte</h1>
        <p className="text-[8px] uppercase tracking-[4px] text-gray-500 mt-1">Portal Premium</p>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link 
          href="/register" 
          className="flex items-center gap-2 border border-[#CBA153] text-[#CBA153] hover:bg-[#CBA153] hover:text-[#121212] transition-colors text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Criar Conta</span>
        </Link>
        <Link 
          href="/admin/novo" 
          className="flex items-center gap-2 bg-[#CBA153] text-[#121212] border border-[#CBA153] px-5 py-2.5 rounded-sm hover:bg-[#121212] hover:text-[#CBA153] transition-all text-xs font-bold uppercase tracking-widest"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Anunciar</span>
        </Link>
      </div>
    </header>
  )
}
