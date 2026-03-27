'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Wrench, HardHat, Building, UserCheck } from 'lucide-react'

interface IBGEUF {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

export default function FilterBar() {
  const router = useRouter()

  // States for all filter inputs
  const [intent, setIntent] = useState('comprar');
  const [states, setStates] = useState<IBGEUF[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [bairro, setBairro] = useState('');
  const [status, setStatus] = useState('');
  const [showProfMenu, setShowProfMenu] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  // Fetch states from IBGE API
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setStates(data));
  }, []);

  // Fetch cities when a state is selected
  useEffect(() => {
    if (selectedState) {
      setIsCitiesLoading(true);
      setCities([]);
      setSelectedCity('');
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
        .then(res => res.json())
        .then(data => {
          setCities(data);
          setIsCitiesLoading(false);
        });
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (intent) params.set('intent', intent);
    if (bairro) params.set('bairro', bairro);
    if (selectedCity) params.set('cidade', selectedCity);
    if (selectedState) params.set('estado', selectedState);
    if (status) params.set('status', status);
    // O filtro de "profissionais" será tratado à parte, se necessário

    router.push(`/imoveis?${params.toString()}`);
  };
  
  const commonClass = "w-full bg-[#1A1A1A] border border-white/10 text-white text-xs py-3 px-4 rounded-sm outline-none transition-colors hover:bg-white/5 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
  const selectWrapperClass = "relative w-full"
  const selectIconClass = "absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none"
  const optionClass = "bg-[#1A1A1A] text-white"

  return (
    <div className="w-full bg-[#121212] border-b border-white/5 sticky top-[71px] z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-[5%] py-4 flex flex-wrap items-center justify-center gap-3">
        
        <div className="flex-[2_1_100px]">
          <div className={selectWrapperClass}>
            <select value={intent} onChange={(e) => setIntent(e.target.value)} className={commonClass + " appearance-none pr-10"}>
              <option className={optionClass} value="comprar">Comprar</option>
              <option className={optionClass} value="alugar">Alugar</option>
            </select>
            <ChevronDown className={selectIconClass} />
          </div>
        </div>
        
        <div className="flex-[1_1_60px]">
          <div className={selectWrapperClass}>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={commonClass + " appearance-none pr-10"}>
              <option className={optionClass} value="">UF</option>
              {states.map(uf => (
                <option className={optionClass} key={uf.id} value={uf.sigla}>{uf.sigla}</option>
              ))}
            </select>
            <ChevronDown className={selectIconClass} />
          </div>
        </div>
        
        <div className="flex-[3_1_150px]">
          <div className={selectWrapperClass}>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState || isCitiesLoading} className={commonClass + " appearance-none pr-10"}>
              <option className={optionClass} value="">{isCitiesLoading ? 'Carregando...' : 'Cidade'}</option>
              {cities.map(city => (
                <option className={optionClass} key={city.id} value={city.nome}>{city.nome}</option>
              ))}
            </select>
            <ChevronDown className={selectIconClass} />
          </div>
        </div>
        
        <div className="flex-[3_1_150px]">
           <input
            type="text"
            placeholder="Bairro..."
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className={commonClass}
          />
        </div>

        <div className="flex-[3_1_150px]">
          <div className={selectWrapperClass}>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={commonClass + " appearance-none pr-10"}>
              <option className={optionClass} value="">Status do Imóvel</option>
              <option className={optionClass} value="todos">Todos</option>
              <option className={optionClass} value="novo">Novo</option>
              <option className={optionClass} value="planta">Na Planta</option>
              <option className={optionClass} value="construcao">Em Construção</option>
            </select>
            <ChevronDown className={selectIconClass} />
          </div>
        </div>

        <div className="flex-[3_1_150px]">
           <div className="relative" onMouseEnter={() => setShowProfMenu(true)} onMouseLeave={() => setShowProfMenu(false)}>
            <button className={commonClass + " flex justify-between items-center"}>
              Profissionais
              <ChevronDown size={16} />
            </button>
            {showProfMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#1A1A1A] border border-white/10 rounded-sm shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
                 <button className="flex items-center gap-3 px-4 py-3 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left"><UserCheck size={16} /> Corretor de Imóveis</button>
                 <button className="flex items-center gap-3 px-4 py-3 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left"><Building size={16} /> Imobiliária</button>
                 <button className="flex items-center gap-3 px-4 py-3 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left"><HardHat size={16} /> Construtoras</button>
                 <div className="h-px bg-white/5 my-1 mx-2"></div>
                 <button className="flex items-center gap-3 px-4 py-3 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left"><Wrench size={16} /> Manutenção (Pintor, Geral...)</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-[0_0_auto]">
          <button onClick={handleSearch} className="bg-white text-[#121212] p-3 rounded-sm hover:bg-gray-200 transition-colors">
            <Search size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}
