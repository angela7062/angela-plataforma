'use client'

import React from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PricingTable from '@/components/pricing/PricingTable'

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <div className="py-12 px-[5%] text-center border-b border-white/5">
          <h1 className="text-4xl md:text-5xl font-serif text-[#CBA153] mb-4">Nossa Tabela de Preços</h1>
          <p className="text-gray-500 uppercase tracking-[4px] text-xs">Exclusividade e Performance para seu Negócio</p>
        </div>
        <PricingTable />
      </main>
      <Footer />
    </div>
  )
}
