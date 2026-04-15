'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { updatePropertyAndProfile } from './actions'
import { deleteProperty } from '../../actions'

interface PropertyFormProps {
  property: any
}

export default function EditPropertyClient({ property }: PropertyFormProps) {
  const sp = property.specs || {}
  const gal = property.gallery || []
  const adm = sp.admin_features || []
  const profile = property.profiles || {}

  // CORREÇÃO APLICADA AQUI: O seller_id foi removido do bind.
  const updateAction = updatePropertyAndProfile.bind(null, property.id)

  const [salePrice, setSalePrice] = useState(property.price || 0)
  const [commissionPercent, setCommissionPercent] = useState(6)
  const [commissionValue, setCommissionValue] = useState(0)

  useEffect(() => {
    setCommissionValue((salePrice * commissionPercent) / 100)
  }, [salePrice, commissionPercent])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  }

  const labelClass = "text-gray-400 text-[10px] tracking-widest uppercase font-semibold"
  const inputClass = "bg-[#121212] border border-[#CBA153]/10 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] outline-none transition-colors text-xs placeholder:text-gray-700"
  const selectClass = "bg-[#121212] border border-[#CBA153]/10 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] outline-none appearance-none transition-colors text-xs cursor-pointer"

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans pb-32">
      <header className="px-[5%] py-6 bg-[#1A1A1A] border-b border-white/5 sticky top-0 z-10 flex justify-between items-center">
        <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-[#CBA153] transition-colors text-sm uppercase tracking-widest w-fit">
          <ArrowLeft size={18} /> Voltar ao Painel
        </Link>
        <form action={deleteProperty}>
          <input type="hidden" name="id" value={property.id} />
          <button 
            type="submit" 
            className="text-red-500/80 hover:text-red-500 text-xs uppercase tracking-widest transition-colors font-medium border border-red-500/20 rounded-sm px-4 py-2 hover:bg-red-500/10"
          >
            Apagar Permanentemente
          </button>
        </form>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 text-sm">
        <h2 className="text-[#CBA153] text-4xl font-serif mb-2">Editar Imóvel</h2>
        <p className="text-gray-500 text-base mb-10">Atualize qualquer característica ou foto deste anúncio.</p>

        <form action={updateAction} className="flex flex-col gap-8">

          {/* NOVA SEÇÃO: FINALIDADE DO IMÓVEL */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">Finalidade do Anúncio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="purpose" className={labelClass}>
                  Finalidade (Negócio)
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  className={selectClass}
                  defaultValue={property.purpose || 'Selecione...'}
                >
                  <option value="Selecione...">Selecione...</option>
                  <option value="Vender">Vender</option>
                  <option value="Alugar">Alugar</option>
                  <option value="Temporada">Temporada</option>
                  <option value="Leilão">Leilão</option>
                </select>
              </div>
            </div>
          </section>

          {/* ... outras seções do formulário ... */}

          {/* 4. LAZER & COMODIDADES - CORRIGIDO */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">4. Lazer & Comodidades</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'tem_piscina', label: 'Piscina' },
                { name: 'tem_edicula', label: 'Edícula' },
                { name: 'tem_churrasqueira', label: 'Churrasqueira' },
                { name: 'tem_hidro', label: 'Hidromassagem' },
                { name: 'tem_ar', label: 'Ar Condicionado' },
                { name: 'tem_area_gourmet', label: 'ÁREA GOURMET' },
                { name: 'tem_varanda', label: 'VARANDA' },
                { name: 'tem_sacada', label: 'SACADA' }
              ].map((item, idx) => (
                <label key={`${item.name}_${idx}`} className="flex flex-col items-center gap-3 cursor-pointer p-6 border border-white/10 rounded-sm hover:border-[#CBA153]/50 transition-colors bg-[#1A1A1A]">
                  {/* CAMPO OCULTO PARA GARANTIR O ENVIO DO VALOR 'false' */}
                  <input type="hidden" name={item.name} value="false" />
                  <input type="checkbox" name={item.name} value="true" defaultChecked={sp[item.name]} className="w-[19.5px] h-[19.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 5. INFRAESTRUTURA DO CONDOMÍNIO - CORRIGIDO */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">5. Infraestrutura do Condomínio</h3>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Selecione os itens disponíveis no prédio ou condomínio</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'piscina', label: 'Piscina' },
                { id: 'churrasqueira', label: 'Churrasqueira' },
                { id: 'salao_festas', label: 'Salão de Festas' },
                { id: 'academia', label: 'Academia' },
                { id: 'playground', label: 'Playground' },
                { id: 'quadra', label: 'Quadra Poliesportiva' },
                { id: 'brinquedoteca', label: 'Brinquedoteca' },
                { id: 'jogos', label: 'Salão de Jogos' },
                { id: 'gourmet', label: 'Espaço Gourmet' },
                { id: 'sauna', label: 'Sauna' },
                { id: 'pet_place', label: 'Pet Place' },
                { id: 'caminhada', label: 'Pista de Caminhada' },
                { id: 'coworking', label: 'Coworking' },
                { id: 'bicicletario', label: 'Bicicletário' },
                { id: 'mercado', label: 'Mini Mercado' },
                { id: 'portaria_24h', label: 'PORTARIA 24H' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer p-4 border border-white/5 rounded-sm hover:border-[#CBA153]/30 transition-colors bg-[#1A1A1A]">
                  {/* CAMPO OCULTO PARA GARANTIR O ENVIO DO VALOR 'false' */}
                  <input type="hidden" name={`condo_${item.id}`} value="false" />
                  <input 
                    type="checkbox" 
                    name={`condo_${item.id}`} 
                    value="true" 
                    defaultChecked={sp.condo_specs?.[`condo_${item.id}`]} 
                    className="w-[16.5px] h-[16.5px] accent-[#CBA153]" 
                  />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* ... restante do formulário ... */}

          <div className="mt-12 px-8 py-3 bg-[#1A1A1A] border-2 border-[#CBA153] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex justify-between items-center backdrop-blur-md">
            <p className="text-sm text-gray-400 font-medium tracking-wide italic">As alterações no perfil e no imóvel serão salvas atomicamente.</p>
            <button type="submit" className="bg-[#CBA153] text-[#121212] px-16 py-2 rounded-sm font-bold uppercase tracking-[3px] hover:bg-white transition-all text-sm shadow-xl">
              Salvar Alterações
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
