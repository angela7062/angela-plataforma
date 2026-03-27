'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { updateProperty, deleteProperty } from '../../actions'

interface PropertyFormProps {
  property: any
}

export default function EditPropertyClient({ property }: PropertyFormProps) {
  const sp = property.specs || {}
  const gal = property.gallery || []
  const adm = sp.admin_fields || []

  // Estre para cálculo de comissão
  const [salePrice, setSalePrice] = useState(property.price || 0)
  const [commissionPercent, setCommissionPercent] = useState(6) // Default 6%
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

  // Classes padrão para labels e inputs (Restaurando padrão minimalista de luxo)
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
        <h2 className="text-[#CBA153] text-4xl font-serif mb-2">Cadastrar imóvel</h2>
        <p className="text-gray-500 text-base mb-10">Atualize qualquer característica ou foto deste anúncio.</p>

        <form action={updateProperty} className="flex flex-col gap-8">
          <input type="hidden" name="id" value={property.id} />

          {/* 1. INFORMAÇÕES PRINCIPAIS */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">1. Informações Principais & Endereço</h3>
            
            <div className="flex flex-col gap-3">
              <label className={labelClass}>Título do Anúncio *</label>
              <input name="title" defaultValue={property.title} required className={inputClass} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Preço (R$) *</label>
                <input name="price" type="number" defaultValue={property.price} required className={inputClass} />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Cidade *</label>
                <input name="city" defaultValue={property.address_city} required className={inputClass} />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Estado (UF) *</label>
                <input name="state" defaultValue={property.address_state} required maxLength={2} className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className={labelClass}>Descrição Completa *</label>
              <textarea name="description" defaultValue={property.description} required rows={5} className={inputClass + " resize-none"} />
            </div>
          </section>

          {/* 2. ESTRUTURA E DIMENSÕES */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">2. Estrutura e Dimensões</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Tipo de Imóvel</label>
                <select name="tipo_imovel" defaultValue={sp.tipo_imovel || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Casa Padrão">Casa Padrão</option>
                  <option value="Casa Geminada">Casa Geminada</option>
                  <option value="Casa Sobreposta">Casa Sobreposta</option>
                  <option value="Sobrado">Sobrado</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Cobertura">Cobertura</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Área Útil (m²)</label>
                <input name="area_m2" type="number" defaultValue={sp.area_m2 || ''} className={inputClass} />
              </div>
              
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Área Terreno (m²)</label>
                <input name="area_terreno" type="number" defaultValue={sp.area_terreno || ''} className={inputClass} />
              </div>
              
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Tempo de Const. (Anos)</label>
                <input name="tempo_construcao_anos" type="number" defaultValue={sp.tempo_construcao_anos || ''} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dormitórios</label>
                <input name="dormitorios" type="number" defaultValue={sp.dormitorios || ''} className={inputClass + " text-center"} />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Suítes</label>
                <input name="suites" type="number" defaultValue={sp.suites || ''} className={inputClass + " text-center"} />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Banheiros Totais</label>
                <input name="banheiros" type="number" defaultValue={sp.banheiros || ''} className={inputClass + " text-center"} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Vagas Garagem</label>
                <input name="vagas" type="number" defaultValue={sp.vagas || ''} className={inputClass + " text-center"} />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Tipo da Vaga</label>
                <select name="tipo_vaga" defaultValue={sp.tipo_vaga || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Coberta">Coberta</option>
                  <option value="Descoberta">Descoberta</option>
                  <option value="Mista">Mista</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Condomínio ou Rua?</label>
                <select name="condominio_ou_rua" defaultValue={sp.condominio_ou_rua || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Via Pública">Via Pública</option>
                  <option value="Condomínio">Condomínio</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dep. Empregada?</label>
                <select name="dependencia_empregada" defaultValue={sp.dependencia_empregada ? 'true' : 'false'} className={selectClass}>
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </div>
            </div>

            {/* NOVOS CAMPOS ADICIONAIS DE LOCALIZAÇÃO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Bairro (Perfil)</label>
                <select name="tipo_bairro" defaultValue={sp.tipo_bairro || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Misto">Misto</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dist. Praia (m)</label>
                <input name="distancia_praia" type="number" defaultValue={sp.distancia_praia || ''} className={inputClass} placeholder="Ex: 500" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dist. Comércio (m)</label>
                <input name="distancia_comercio" type="number" defaultValue={sp.distancia_comercio || ''} className={inputClass} placeholder="Ex: 200" />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5">
              {[
                { name: 'tem_area_gourmet', label: 'Área Gourmet' },
                { name: 'tem_varanda', label: 'Varanda' },
                { name: 'tem_sacada', label: 'Sacada' },
                { name: 'tem_portao_automatico', label: 'Portão Automático' },
              ].map(item => (
                <label key={item.name} className="flex items-center gap-4 cursor-pointer p-4 border border-white/10 rounded-sm hover:border-[#CBA153]/50 transition-colors bg-[#1A1A1A]">
                  <input type="checkbox" name={item.name} value="true" defaultChecked={sp[item.name]} className="w-[16.5px] h-[16.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 3. CONDIÇÃO E DOCUMENTAÇÃO */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">3. Condição e Documentação</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>É Casa Nova?</label>
                <select name="casa_nova" defaultValue={sp.casa_nova ? 'true' : 'false'} className={selectClass}>
                  <option value="false">Não</option>
                  <option value="true">Sim, Nova/Planta</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Foi Reformada?</label>
                <select name="reformada" defaultValue={sp.reformada ? 'true' : 'false'} className={selectClass}>
                  <option value="false">Não</option>
                  <option value="true">Sim, Reformada</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Estado de Conserv.</label>
                <select name="conservacao" defaultValue={sp.conservacao || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Precário">Precário</option>
                  <option value="Mau Estado">Em mau estado</option>
                  <option value="Regular">Regular</option>
                  <option value="Bom">Bom estado</option>
                  <option value="Perfeito">Perfeito estado</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Mobiliada?</label>
                <select name="mobiliada" defaultValue={sp.mobiliada || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Não Mobiliada">Sem Mobília</option>
                  <option value="Mobiliada">Mobiliada (Completa)</option>
                  <option value="Semi-Mobiliada">Semi-Mobiliada (Planejados)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
              <label className={labelClass}>Documentação do Imóvel</label>
              <select name="documentacao" defaultValue={sp.documentacao || ''} className={selectClass}>
                <option value="">Selecione...</option>
                <option value="Escritura Registrada">Matrícula/Registro Definitivo</option>
                <option value="Escritura Não Registrada">Escritura de Compra e Venda</option>
                <option value="Contrato de Gaveta">Contrato de Compra e Venda (Gaveta)</option>
                <option value="Posse">Cessão de Direitos Possessórios</option>
              </select>
            </div>
          </section>

          {/* 4. LAZER & COMODIDADES */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">4. Lazer & Comodidades</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: 'tem_piscina', label: 'Piscina' },
                { name: 'tem_edicula', label: 'Edícula' },
                { name: 'tem_churrasqueira', label: 'Churrasqueira' },
                { name: 'tem_hidro', label: 'Hidromassagem' },
                { name: 'tem_ar', label: 'Ar Condicionado' }
              ].map(item => (
                <label key={item.name} className="flex flex-col items-center gap-3 cursor-pointer p-6 border border-white/10 rounded-sm hover:border-[#CBA153]/50 transition-colors bg-[#1A1A1A]">
                  <input type="checkbox" name={item.name} value="true" defaultChecked={sp[item.name]} className="w-[19.5px] h-[19.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 5. INFRAESTRUTURA DO CONDOMÍNIO */}
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
                { id: 'solarium', label: 'Solarium' },
                { id: 'redario', label: 'Redário' },
                { id: 'beach_tennis', label: 'Beach Tennis' },
                { id: 'horta', label: 'Horta' },
                { id: 'zen', label: 'Espaço Zen' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer p-4 border border-white/5 rounded-sm hover:border-[#CBA153]/30 transition-colors bg-[#1A1A1A]">
                  <input 
                    type="checkbox" 
                    name={`condo_${item.id}`} 
                    value="true" 
                    defaultChecked={sp.condo_specs?.[item.id]} 
                    className="w-[16.5px] h-[16.5px] accent-[#CBA153]" 
                  />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 6. GALERIA DE FOTOS */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-[#CBA153]/20 pb-3">
              <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">6. Galeria de Fotos (Máx 15)</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Apenas URLs (Fase Layout)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(15)].map((_, i) => (
                <div key={`photo_${i+1}`} className="flex flex-col gap-2">
                  <label className="text-gray-500 text-[10px] tracking-widest font-bold">FOTO {i+1} {i === 0 ? '(CAPA)' : ''}</label>
                  <input name={`photo_${i+1}`} defaultValue={gal[i] || ''} type="url" className={inputClass} placeholder="https://..." />
                </div>
              ))}
            </div>
          </section>

          {/* 7. INFORMAÇÕES RESTRITAS (ADMIN) */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-8 border-l-4 border-l-[#CBA153]">
            <div className="flex justify-between items-end border-b border-[#CBA153]/40 pb-3">
              <h3 className="text-[#CBA153] text-lg font-serif font-bold">7. Informações Restritas (Uso Interno)</h3>
              <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Invisível para Visitantes</p>
            </div>

            {/* 7.1 ENDEREÇO PRIVATIVO */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[#CBA153] text-[10px] uppercase tracking-[2px] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CBA153] rounded-full"></span> 7.1 Endereço Detalhado (Privado)
</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className={labelClass}>Rua / Logradouro</label>
                  <input type="text" className={inputClass} placeholder="Ex: Av. Alberto Santos Dumont" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Número</label>
                  <input type="text" className={inputClass} placeholder="123" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Condomínio / Edifício</label>
                  <input type="text" className={inputClass} placeholder="Nome do Condomínio" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Bloco</label>
                  <input type="text" className={inputClass} placeholder="B" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Apto / Casa nº</label>
                  <input type="text" className={inputClass} placeholder="42" />
                </div>
              </div>
            </div>

            {/* 7.2 DADOS DO PROPRIETÁRIO - AJUSTADO CONFORME SOLICITAÇÃO (Nome maior, Celular menor) */}
            <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
              <h4 className="text-[#CBA153] text-[10px] uppercase tracking-[2px] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CBA153] rounded-full"></span> 7.2 Proprietário
</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Nome Completo</label>
                  <input type="text" className={inputClass} placeholder="Nome do Dono" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Celular / WhatsApp</label>
                  <input type="text" className={inputClass} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <button type="button" className="opacity-70 cursor-not-allowed border border-[#25D366]/30 text-[#25D366] text-[9px] uppercase tracking-[2px] py-3 rounded-sm flex items-center justify-center gap-2 font-bold w-full">
                    <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
                    WhatsApp Direto
                  </button>
                </div>
              </div>
            </div>

            {/* 7.3 LOGÍSTICA DE CHAVES */}
            <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
              <h4 className="text-[#CBA153] text-[10px] uppercase tracking-[2px] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CBA153] rounded-full"></span> 7.3 Logística de Chaves
</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Onde estão as chaves?</label>
                  <select className={selectClass}>
                    <option value="No Imóvel">No Próprio Imóvel</option>
                    <option value="Na Imobiliária">Na Imobiliária</option>
                    <option value="Outro Endereço">Outro Endereço</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Endereço da Chave</label>
                  <input type="text" className={inputClass} placeholder="Rua, Número..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Responsável / Cargo</label>
                  <select className={selectClass}>
                    <option value="">Selecione...</option>
                    <option value="Proprietário">Proprietário</option>
                    <option value="Caseiro">Caseiro</option>
                    <option value="Jardineiro">Jardineiro</option>
                    <option value="Zelador/Portaria">Zelador / Portaria</option>
                    <option value="Faxineira">Faxineira</option>
                    <option value="Vizinho">Vizinho</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 7.4 FINANCEIRO & COMISSÃO - CÁLCULO AUTOMÁTICO IMPLEMENTADO */}
            <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
              <h4 className="text-[#CBA153] text-[10px] uppercase tracking-[2px] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CBA153] rounded-full"></span> 7.4 Valores & Comissões
</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Valor Real de Venda (R$)</label>
                  <input 
                    type="number" 
                    className={inputClass} 
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>% Corretagem</label>
                  <select 
                    className={selectClass}
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(parseInt(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(v => (
                       <option key={v} value={v}>{v}%</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <label className={labelClass}>Comissão Estimada (BRL)</label>
                  <div className="bg-white/5 border border-[#CBA153]/30 rounded-sm px-4 py-2 text-sm font-serif text-[#CBA153] shadow-md">
                    {formatCurrency(commissionValue)}
                  </div>
                </div>
              </div>
            </div>

            {/* 7.5 CAMPOS EXTRAS */}
            <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
              <h4 className="text-[#CBA153] text-[10px] uppercase tracking-[2px] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CBA153] rounded-full"></span> 7.5 Outras Notas Administrativas
</h4>
              <div className="flex flex-col gap-4">
                {[...Array(5)].map((_, i) => {
                  const adminField = adm[i] || { name: '', value: '', isPublic: false }
                  return (
                   <div key={`admin_${i+1}`} className="grid grid-cols-12 gap-4 items-center bg-[#1A1A1A] p-4 rounded-sm border border-white/10">
                     <div className="col-span-12 md:col-span-4">
                       <input name={`admin_field_name_${i+1}`} defaultValue={adminField.name} className={inputClass + " w-full font-bold"} placeholder="Nome do Campo..." />
                     </div>
                     <div className="col-span-12 md:col-span-5">
                       <input name={`admin_field_value_${i+1}`} defaultValue={adminField.value} className={inputClass + " w-full"} placeholder="Valor / Conteúdo..." />
                     </div>
                     <div className="col-span-12 md:col-span-3 flex justify-end">
                       <label className="flex items-center gap-3 cursor-pointer group">
                         <span className={labelClass}>Público?</span>
                         <input type="checkbox" name={`admin_field_public_${i+1}`} defaultChecked={adminField.isPublic} value="true" className="w-[16.5px] h-[16.5px] accent-[#CBA153]" />
                       </label>
                     </div>
                   </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="sticky bottom-6 mt-12 px-8 py-3 bg-[#1A1A1A] border-2 border-[#CBA153] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex justify-between items-center z-20 backdrop-blur-md">
            <p className="text-sm text-gray-400 font-medium tracking-wide italic">Reveja todas as informações restritas antes de salvar o banco.</p>
            <button type="submit" className="bg-[#CBA153] text-[#121212] px-16 py-2 rounded-sm font-bold uppercase tracking-[3px] hover:bg-white transition-all text-sm shadow-xl">
              Salvar Alterações
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
