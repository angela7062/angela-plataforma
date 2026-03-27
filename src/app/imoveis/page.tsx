'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'

// Componente para "ler" os parâmetros da URL e exibi-los.
// Isso é um passo intermediário para confirmar que os filtros estão sendo recebidos.
function SearchResults() {
  const searchParams = useSearchParams()

  const intent = searchParams.get('intent')
  const bairro = searchParams.get('bairro')
  const cidade = searchParams.get('cidade')
  const estado = searchParams.get('estado')
  const status = searchParams.get('status')

  return (
    <div className="w-full max-w-7xl mx-auto px-[5%] py-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Resultados da Busca</h1>
      
      <div className="bg-[#1A1A1A] border border-white/10 rounded-md p-6 text-sm flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#CBA153]">Filtros Aplicados:</h2>
        {intent && <p><span className="font-semibold">Intenção:</span> {intent}</p>}
        {bairro && <p><span className="font-semibold">Bairro:</span> {bairro}</p>}
        {cidade && <p><span className="font-semibold">Cidade:</span> {cidade}</p>}
        {estado && <p><span className="font-semibold">Estado:</span> {estado}</p>}
        {status && <p><span className="font-semibold">Status:</span> {status}</p>}
        {!intent && !bairro && !cidade && !estado && !status && <p>Nenhum filtro aplicado.</p>}
      </div>

      {/* Aqui é onde os resultados da busca do Supabase serão exibidos no futuro. */}
      <div className="mt-8">
        <p>Em breve, os imóveis filtrados aparecerão aqui.</p>
      </div>

    </div>
  )
}

// A página principal que renderiza o componente de resultados.
export default function ImoveisPage() {
  return <SearchResults />
}
