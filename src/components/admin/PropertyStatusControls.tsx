'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Link2, QrCode, Edit, Send } from 'lucide-react'

type StatusValue = 'Ativo' | 'Inativo' | 'Vendido' | 'Alugado' | 'Arquivado'

function normalizeStatus(value: string | null): StatusValue {
  const normalized = (value ?? '').toLowerCase().trim()
  if (normalized === 'vendido') return 'Vendido'
  if (normalized === 'alugado') return 'Alugado'
  if (normalized === 'inativo' || normalized === 'pausado') return 'Inativo'
  if (normalized === 'arquivado') return 'Arquivado'
  return 'Ativo'
}

export default function PropertyStatusControls({
  propertyId,
  initialStatus,
}: {
  propertyId: string
  initialStatus: string | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [status, setStatus] = useState<StatusValue>(normalizeStatus(initialStatus))
  const [loadingStatus, setLoadingStatus] = useState<StatusValue | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const updateStatus = async (nextStatus: StatusValue) => {
    setLoadingStatus(nextStatus)
    setFeedback(null)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) {
      setFeedback('Sessão expirada. Faça login novamente.')
      setLoadingStatus(null)
      return
    }

    const finalStatus = status === nextStatus ? 'Ativo' : nextStatus

    const { error } = await supabase
      .from('properties')
      .update({ status: finalStatus.toLowerCase() })
      .eq('id', propertyId)
      .eq('seller_id', userId)

    if (!error) {
      setStatus(finalStatus)
      setFeedback('Status atualizado.')
      router.refresh()
    } else {
      console.error('Erro ao atualizar status do imóvel:', error)
      setFeedback(`Erro ao atualizar: ${error.message}`)
    }

    setLoadingStatus(null)
  }

  const baseButtonClass = 'text-[10px] text-gray-400 hover:text-[#CBA153] transition-colors uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed text-center select-none'
  const activeButtonClass = 'text-green-400 font-bold'

  return (
    <div className="mt-auto pt-2 border-t border-white/5">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* 1. Corrected Disabled Logic */}
          <button
            type="button"
            disabled={ (loadingStatus !== null && loadingStatus !== 'Vendido') || (status !== 'Ativo' && status !== 'Vendido') }
            onClick={() => updateStatus('Vendido')}
            className={`${baseButtonClass} min-w-[58px] ${status === 'Vendido' ? activeButtonClass : ''}`}
          >
            Vendido
          </button>
          <button
            type="button"
            disabled={ (loadingStatus !== null && loadingStatus !== 'Alugado') || (status !== 'Ativo' && status !== 'Alugado') }
            onClick={() => updateStatus('Alugado')}
            className={`${baseButtonClass} min-w-[58px] ${status === 'Alugado' ? activeButtonClass : ''}`}
          >
            Alugado
          </button>
          <button
            type="button"
            disabled={ (loadingStatus !== null && loadingStatus !== 'Inativo') || (status !== 'Ativo' && status !== 'Inativo') }
            onClick={() => updateStatus('Inativo')}
            className={`${baseButtonClass} min-w-[52px] ${status === 'Inativo' ? activeButtonClass : ''}`}
          >
            {status === 'Inativo' ? 'Pausado' : 'Pausar'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Compartilhar imóvel"
            title="Compartilhar Anúncio"
            className="text-gray-400 hover:text-[#CBA153] hover:font-bold transition-colors"
          >
            <Link2 size={13} />
          </button>
          <button
            type="button"
            aria-label="Landing page do imóvel"
            title="Compartilhar Landing Page"
            className="text-gray-400 hover:text-[#CBA153] hover:font-bold transition-colors"
          >
            <QrCode size={13} />
          </button>

          <button
            type="button"
            disabled={loadingStatus !== null}
            onClick={() => {
              if (status === 'Arquivado') {
                updateStatus('Ativo')
              } else {
                router.push(`/admin/editar/${propertyId}`)
              }
            }}
            title={status === 'Arquivado' ? "Publicar Anúncio" : "Editar Anúncio"}
            className={`text-[10px] uppercase tracking-widest font-bold text-center min-w-[48px] select-none flex items-center gap-1.5 transition-colors ${
              status === 'Arquivado'
                ? 'text-red-500 hover:text-red-400'
                : 'text-gray-400 hover:text-[#CBA153]'
            }`}
          >
            {status === 'Arquivado' ? <Send size={12} /> : <Edit size={12} />}
            {status === 'Arquivado' ? 'Anunciar' : 'Editar'}
          </button>
        </div>
      </div>
      {feedback && (
        <p className="mt-1 text-[9px] text-gray-500 uppercase tracking-wide text-center">{feedback}</p>
      )}
    </div>
  )
}
