'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface Plano {
  nome: string;
  periodo: string;
  preco: string;
  valor: number;
  destaque?: boolean;
  imagem: string;
  beneficios: string[];
}

const planos: Plano[] = [
  {
    nome: 'Prata',
    periodo: '90 dias',
    preco: 'R$ 119,90',
    valor: 119.90,
    destaque: true,
    imagem: '/images/pricing/prata.png',
    beneficios: [
      'Alcance Estratégico',
      'Vitrine de Destaque',
      'Suporte Prioritário',
      'Relatórios Mensais'
    ]
  },
  {
    nome: 'Bronze',
    periodo: '30 dias',
    preco: 'R$ 49,90',
    valor: 49.90,
    imagem: '/images/pricing/bronze.png',
    beneficios: [
      'Exposição Essencial',
      'Cadastro Simples',
      'Suporte via Email'
    ]
  },
  {
    nome: 'Ouro',
    periodo: '180 dias',
    preco: 'R$ 199,90',
    valor: 199.90,
    imagem: '/images/pricing/ouro.png',
    beneficios: [
      'Consolidação de Marca',
      'Autoridade de Mercado',
      'Destaque em Buscas',
      'Análise de Concorrência'
    ]
  },
  {
    nome: 'Diamante',
    periodo: '360 dias',
    preco: 'R$ 399,90',
    valor: 399.90,
    imagem: '/images/pricing/diamante.png',
    beneficios: [
      'Gestão de Portfólio (50 anúncios)',
      'Exclusividade Premium',
      'Gerente de Conta Dedicado',
      'Selo de Verificação Diamante',
      'Exportação de Dados'
    ]
  }
];

export default function PricingTable() {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleCheckout = async (plano: string, preco: number) => {
    setLoading(plano);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano, preco }),
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Falha ao gerar link');
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao processar checkout.");
    } finally {
      setLoading(null);
    }
  };

  // Para mobile, queremos o Prata (destaque) primeiro
  const planosMobile = [...planos].sort((a, b) => (a.destaque ? -1 : 1));

  return (
    <section className="py-20 bg-[#121212] px-[5%]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-[#CBA153] mb-4">Escolha seu Plano Premium</h2>
          <p className="text-gray-500 uppercase tracking-[4px] text-xs">Exclusividade e Performance para seu Negócio</p>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {planos.map((plano) => (
            <PriceCard key={plano.nome} plano={plano} onCheckout={handleCheckout} loading={loading} />
          ))}
        </div>

        {/* Tablet View */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-8">
          {planos.map((plano) => (
            <PriceCard key={plano.nome} plano={plano} onCheckout={handleCheckout} loading={loading} />
          ))}
        </div>

        {/* Mobile View (Prata primeiro) */}
        <div className="md:hidden flex flex-col gap-8">
          {planosMobile.map((plano) => (
            <PriceCard key={plano.nome} plano={plano} onCheckout={handleCheckout} loading={loading} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PriceCard({ plano, onCheckout, loading }: { plano: Plano; onCheckout: (plano: string, preco: number) => void; loading: string | null }) {
  const isThisLoading = loading === plano.nome;
  return (
    <div className={`relative bg-[#1a1a1a] border ${plano.destaque ? 'border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105' : 'border-white/5'} p-8 rounded-sm transition-all hover:border-[#d4af37]/50 flex flex-col h-full`}>
      
      {/* Selo Mais Popular */}
      {plano.destaque && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#d4af37] text-[#1a1a1a] text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
          Mais Popular
        </div>
      )}

      {/* Ícone fotorrealista */}
      <div className="absolute top-4 right-4 w-12 h-12">
        <img 
          src={plano.imagem} 
          alt={plano.nome} 
          className="w-full h-full object-contain filter drop-shadow-lg"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-serif text-[#f5f5f5] mb-1">{plano.nome}</h3>
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">{plano.periodo}</p>
        <div className="text-3xl font-serif text-[#d4af37]">{plano.preco}</div>
      </div>

      <ul className="space-y-4 mb-10 flex-1">
        {plano.beneficios.map((beneficio, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check size={16} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-400 leading-tight">{beneficio}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={() => onCheckout(plano.nome, plano.valor)}
        disabled={loading !== null}
        className={`w-full py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg ${isThisLoading ? 'opacity-70 cursor-not-allowed' : ''} ${plano.destaque ? 'bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c49f30]' : 'bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1a1a1a]'}`}
      >
        {isThisLoading ? 'Aguarde...' : 'Selecionar Plano'}
      </button>
    </div>
  )
}
