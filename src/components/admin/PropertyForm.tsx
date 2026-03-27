'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createProperty, updateProperty, deleteProperty } from '@/app/admin/actions'

const brazilianStates = ['SP', 'RJ', 'MG', 'BA', 'SC', 'RS', 'PR', 'ES', 'GO', 'PE', 'CE', 'DF', 'AM', 'MT', 'MS', 'PA', 'PB', 'PI', 'RN', 'AL', 'SE', 'TO', 'RO', 'AC', 'AP', 'RR'];
const citiesByState: { [key: string]: string[] } = {
  SP: ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Sorocaba', 'Ribeirão Preto'],
  RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Campos dos Goytacazes'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros'],
};

interface PropertyFormProps {
  property?: any
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const isEdit = !!property
  const sp = property?.specs || {}
  const gal = property?.gallery || []
  const adm = property?.specs || {}

  const [errors, setErrors] = useState<any>({})
  const formRef = useRef<HTMLFormElement>(null)

  const [announcerAddressType, setAnnouncerAddressType] = useState(adm.announcer_address_type || '')
  const [announcerState, setAnnouncerState] = useState(adm.announcer_address_state || 'SP')
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    setCities(citiesByState[announcerState] || [])
  }, [announcerState])

  const labelClass = "text-gray-400 text-[10px] tracking-widest uppercase font-semibold"
  const inputClass = "bg-[#121212] border border-[#CBA153]/10 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] outline-none transition-colors text-xs placeholder:text-gray-700"
  const selectClass = "bg-[#121212] border border-[#CBA153]/10 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] outline-none appearance-none transition-colors text-xs cursor-pointer"
  const errorClass = 'bg-yellow-500/10 border-yellow-500'

  const pageTitle = isEdit ? "Cadastrar e Editar imóvel" : "Cadastrar imóvel"

  const handleValidateAndSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newErrors: any = {}

    if (!formData.get('title')) newErrors.title = true
    if (!formData.get('price')) newErrors.price = true
    if (!formData.get('city')) newErrors.city = true
    if (!formData.get('state')) newErrors.state = true
    if (!formData.get('description')) newErrors.description = true
    if (!formData.get('announcer_name')) newErrors.announcer_name = true
    if (!formData.get('announcer_whatsapp')) newErrors.announcer_whatsapp = true
    if (!formData.get('announcer_type')) newErrors.announcer_type = true
    const addressType = formData.get('announcer_address_type')
    if (!addressType) newErrors.announcer_address_type = true
    if (!formData.get('announcer_address_street')) newErrors.announcer_address_street = true
    if (!formData.get('announcer_address_number')) newErrors.announcer_address_number = true
    if (!formData.get('announcer_address_neighborhood')) newErrors.announcer_address_neighborhood = true
    if (!formData.get('announcer_address_city')) newErrors.announcer_address_city = true
    if (!formData.get('announcer_address_state')) newErrors.announcer_address_state = true
    if (!formData.get('announcer_address_cep')) newErrors.announcer_address_cep = true
    if (addressType === 'Apartamento') {
      if (!formData.get('announcer_address_block')) newErrors.announcer_address_block = true
      if (!formData.get('announcer_address_apt')) newErrors.announcer_address_apt = true
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      if (isEdit) {
        await updateProperty(formData)
      } else {
        await createProperty(formData)
      }
    } else {
      const firstErrorKey = Object.keys(newErrors)[0]
      const errorElement = formRef.current?.querySelector(`[name="${firstErrorKey}"]`)
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans pb-32">
      <header className="px-[5%] py-6 bg-[#1A1A1A] border-b border-white/5 sticky top-0 z-10 flex justify-between items-center">
        <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-[#CBA153] transition-colors text-sm uppercase tracking-widest w-fit">
          <ArrowLeft size={18} /> Voltar ao Painel
        </Link>
        {isEdit && (
          <form action={deleteProperty}>
            <input type="hidden" name="id" value={property.id} />
            <button type="submit" className="text-red-500/80 hover:text-red-500 text-xs uppercase tracking-widest transition-colors font-medium border border-red-500/20 rounded-sm px-4 py-2 hover:bg-red-500/10">
              Apagar Permanentemente
            </button>
          </form>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 text-sm">
        <h2 className="text-[#CBA153] text-4xl font-serif mb-2">{pageTitle}</h2>
        <p className="text-gray-500 text-base mb-10">
          {isEdit ? "Atualize as características deste anúncio." : "Cadastre um novo imóvel para sua vitrine."}
        </p>

        <form ref={formRef} onSubmit={handleValidateAndSubmit} className="flex flex-col gap-8">
          {isEdit && <input type="hidden" name="id" value={property.id} />}

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">1. Informações Principais & Endereço</h3>
            <div className="flex flex-col gap-3">
              <label className={labelClass}>Título do Anúncio *</label>
              <input name="title" defaultValue={property?.title} className={`${inputClass} ${errors.title ? errorClass : ''}`} placeholder="Ex: Mansão Suspensa no Jardim Oceânico" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Preço Sugerido (R$) *</label>
                <input name="price" type="number" defaultValue={property?.price} className={`${inputClass} ${errors.price ? errorClass : ''}`} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Cidade *</label>
                <input name="city" defaultValue={property?.address_city} className={`${inputClass} ${errors.city ? errorClass : ''}`} placeholder="Ex: Rio de Janeiro" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Estado (UF) *</label>
                <input name="state" defaultValue={property?.address_state} maxLength={2} className={`${inputClass} ${errors.state ? errorClass : ''}`} placeholder="RJ" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className={labelClass}>Descrição Completa *</label>
              <textarea name="description" defaultValue={property?.description} rows={5} className={`${inputClass} ${errors.description ? errorClass : ''} resize-none`} placeholder="Descreva os diferenciais deste imóvel..." />
            </div>
          </section>

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
                <input name="area_m2" type="number" defaultValue={sp.area_m2 || ''} className={inputClass} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Área Terreno (m²)</label>
                <input name="area_terreno" type="number" defaultValue={sp.area_terreno || ''} className={inputClass} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Tempo de Const. (Anos)</label>
                <input name="tempo_construcao_anos" type="number" defaultValue={sp.tempo_construcao_anos || ''} className={inputClass} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dormitórios</label>
                <input name="dormitorios" type="number" defaultValue={sp.dormitorios || ''} className={inputClass + " text-center"} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Suítes</label>
                <input name="suites" type="number" defaultValue={sp.suites || ''} className={inputClass + " text-center"} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Banheiros Totais</label>
                <input name="banheiros" type="number" defaultValue={sp.banheiros || ''} className={inputClass + " text-center"} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Vagas Garagem</label>
                <input name="vagas" type="number" defaultValue={sp.vagas || ''} className={inputClass + " text-center"} placeholder="0" />
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

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">4. Lazer & Comodidades</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: 'tem_piscina', label: 'Piscina' },
                { name: 'tem_edicula', label: 'Edícula' },
                { name: 'tem_churrasqueira', label: 'Churrasqueira' },
                { name: 'tem_hidro', label: 'Hidromassagem' },
                { name: 'tem_ar', label: 'Ar Condicionado' }
              ].map((item, idx) => (
                <label key={`${item.name}_${idx}`} className="flex flex-col items-center gap-3 cursor-pointer p-6 border border-white/10 rounded-sm hover:border-[#CBA153]/50 transition-colors bg-[#1A1A1A]">
                  <input type="checkbox" name={item.name} value="true" defaultChecked={sp[item.name]} className="w-[19.5px] h-[19.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">5. Infraestrutura do Condomínio</h3>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Selecione os itens disponíveis</p>
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
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer p-4 border border-white/5 rounded-sm hover:border-[#CBA153]/30 transition-colors bg-[#1A1A1A]">
                  <input type="checkbox" name={`condo_${item.id}`} value="true" defaultChecked={sp.condo_specs?.[item.id]} className="w-[16.5px] h-[16.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-[#CBA153]/20 pb-3">
              <h3 className="text-[#CBA153] text-lg font-serif">6. Galeria de Fotos (Máx 15)</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Apenas URLs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(15)].map((_, i) => (
                <div key={`photo_${i + 1}`} className="flex flex-col gap-2">
                  <label className="text-gray-500 text-[10px] tracking-widest font-bold">FOTO {i + 1} {i === 0 ? '(CAPA)' : ''}</label>
                  <input name={`photo_${i + 1}`} defaultValue={gal[i] || ''} type="url" className={inputClass} placeholder="https://..." />
                </div>
              ))}
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-8 border-l-4 border-l-[#CBA153]">
            <div className="flex justify-between items-end border-b border-[#CBA153]/40 pb-3">
              <h3 className="text-[#CBA153] text-lg font-serif font-bold">7. Informações Restritas (Uso Interno)</h3>
              <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Invisível para Visitantes</p>
            </div>

            <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
              <h4 className="text-[#CBA153] text-[10px] uppercase tracking-[2px] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CBA153] rounded-full"></span> 7.4. Identificação do anunciante
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Nome do anunciante *</label>
                  <input type="text" name="announcer_name" defaultValue={adm.announcer_name || ''} className={`${inputClass} ${errors.announcer_name ? errorClass : ''}`} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Telefone WhatsApp *</label>
                  <input type="text" name="announcer_whatsapp" defaultValue={adm.announcer_whatsapp || ''} placeholder="(XX) XXXXX-XXXX" className={`${inputClass} ${errors.announcer_whatsapp ? errorClass : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                  <div className="sm:col-span-1 flex flex-col gap-2">
                      <label className={labelClass}>Tipo de imóvel *</label>
                      <select name="announcer_address_type" value={announcerAddressType} onChange={e => setAnnouncerAddressType(e.target.value)} className={`${selectClass} ${errors.announcer_address_type ? errorClass : ''}`}>
                          <option value="">Selecione...</option>
                          <option value="Apartamento">Apartamento</option>
                          <option value="Casa">Casa</option>
                          <option value="Outro">Outro</option>
                      </select>
                  </div>
                   <div className="sm:col-span-2 flex flex-col gap-2">
                      <label className={labelClass}>Rua / Av. *</label>
                      <input type="text" name="announcer_address_street" defaultValue={adm.announcer_address_street || ''} className={`${inputClass} ${errors.announcer_address_street ? errorClass : ''}`} />
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                   <div className="flex flex-col gap-2">
                      <label className={labelClass}>Número *</label>
                      <input type="text" name="announcer_address_number" defaultValue={adm.announcer_address_number || ''} className={`${inputClass} ${errors.announcer_address_number ? errorClass : ''}`} />
                  </div>
                  <div className="flex flex-col gap-2">
                      <label className={labelClass}>Bloco {announcerAddressType !== 'Apartamento' && '(Opcional)'}</label>
                      <input type="text" name="announcer_address_block" defaultValue={adm.announcer_address_block || ''} className={`${inputClass} ${errors.announcer_address_block ? errorClass : ''}`} />
                  </div>
                   <div className="flex flex-col gap-2">
                      <label className={labelClass}>Apart. {announcerAddressType !== 'Apartamento' && '(Opcional)'}</label>
                      <input type="text" name="announcer_address_apt" defaultValue={adm.announcer_address_apt || ''} className={`${inputClass} ${errors.announcer_address_apt ? errorClass : ''}`} />
                  </div>
                  <div className="flex flex-col gap-2">
                      <label className={labelClass}>Bairro *</label>
                      <input type="text" name="announcer_address_neighborhood" defaultValue={adm.announcer_address_neighborhood || ''} className={`${inputClass} ${errors.announcer_address_neighborhood ? errorClass : ''}`} />
                  </div>
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                      <label className={labelClass}>Estado *</label>
                      <select name="announcer_address_state" value={announcerState} onChange={e => setAnnouncerState(e.target.value)} className={`${selectClass} ${errors.announcer_address_state ? errorClass : ''}`}>
                          {brazilianStates.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                  </div>
                  <div className="flex flex-col gap-2">
                      <label className={labelClass}>Cidade *</label>
                      <select name="announcer_address_city" defaultValue={adm.announcer_address_city || ''} className={`${selectClass} ${errors.announcer_address_city ? errorClass : ''}`}>
                           <option value="">Selecione a cidade...</option>
                          {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                  </div>
                  <div className="flex flex-col gap-2">
                      <label className={labelClass}>CEP *</label>
                      <input type="text" name="announcer_address_cep" defaultValue={adm.announcer_address_cep || ''} className={`${inputClass} ${errors.announcer_address_cep ? errorClass : ''}`} />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Email (Opcional)</label>
                  <input type="email" name="announcer_email" defaultValue={adm.announcer_email || ''} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Você é... *</label>
                  <select name="announcer_type" defaultValue={adm.announcer_type || ''} className={`${selectClass} ${errors.announcer_type ? errorClass : ''}`}>
                    <option value="">Selecione...</option>
                    <option value="Particular">Particular</option>
                    <option value="Profissional">Profissional / Corretor(a)</option>
                  </select>
                </div>
              </div>
            </div>

          </section>

          <div className="sticky bottom-6 mt-12 px-8 py-3 bg-[#1A1A1A] border-2 border-[#CBA153] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex justify-between items-center z-20 backdrop-blur-md">
            <p className="text-sm text-gray-400 font-medium tracking-wide italic">
              Certifique-se de que todos os dados obrigatórios foram preenchidos.
            </p>
            <button type="submit" className="bg-[#CBA153] text-[#121212] px-16 py-2 rounded-sm font-bold uppercase tracking-[3px] hover:bg-white transition-all text-sm shadow-xl">
              {isEdit ? "Salvar Alterações" : "Salvar Novo Imóvel"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
