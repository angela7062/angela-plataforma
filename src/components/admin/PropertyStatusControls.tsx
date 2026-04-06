'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Link2, QrCode } from 'lucide-react'

type StatusValue = 'Ativo' | 'Inativo' | 'Vendido' | 'Alugado'

function normalizeStatus(value: string | null): StatusValue {
  const normalized = (value ?? '').toLowerCase().trim()
  if (normalized === 'vendido') return 'Vendido'
  if (normalized === 'alugado') return 'Alugado'
  if (normalized === 'inativo' || normalized === 'pausado') return 'Inativo'
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

    const { error } = await supabase
      .from('properties')
      .update({ status: nextStatus })
      .eq('id', propertyId)
      .eq('seller_id', userId)

    if (!error) {
      setStatus(nextStatus)
      setFeedback('Status atualizado.')
      router.refresh()
    } else {
      console.error('Erro ao atualizar status do imóvel:', error)
      setFeedback(`Erro ao atualizar: ${error.message}`)
    }

    setLoadingStatus(null)
  }

  const togglePauseStatus = async () => {
    const nextStatus: StatusValue = status === 'Inativo' ? 'Ativo' : 'Inativo'
    await updateStatus(nextStatus)
  }

  const baseButtonClass = 'text-[10px] text-gray-400 hover:text-[#CBA153] transition-colors uppercase tracking-widest disabled:opacity-50 text-center select-none'

  return (
    <div className="mt-4">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loadingStatus !== null}
            onDoubleClick={() => updateStatus('Vendido')}
            className={`${baseButtonClass} min-w-[58px] ${status === 'Vendido' ? 'text-green-500 font-bold' : ''}`}
          >
            Vendido
          </button>
          <button
            type="button"
            disabled={loadingStatus !== null}
            onDoubleClick={() => updateStatus('Alugado')}
            className={`${baseButtonClass} min-w-[58px] ${status === 'Alugado' ? 'text-green-500 font-bold' : ''}`}
          >
            Alugado
          </button>
          <button
            type="button"
            disabled={loadingStatus !== null}
            onDoubleClick={togglePauseStatus}
            className={`${baseButtonClass} min-w-[52px] ${status === 'Inativo' ? 'text-green-500 font-bold' : ''}`}
          >
            {status === 'Inativo' ? 'Pausado' : 'Pausar'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Compartilhar imóvel"
            title="Compartlhar Anúncio"
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
            onDoubleClick={() => router.push(`/admin/editar/${propertyId}`)}
            title="Editar Anúncio"
            className="text-[10px] text-gray-400 hover:text-[#CBA153] hover:font-bold transition-colors uppercase tracking-widest font-bold text-center min-w-[48px] select-none"
          >
            Editar
          </button>
        </div>
      </div>
      {feedback && (
        <p className="mt-1 text-[9px] text-gray-500 uppercase tracking-wide">{feedback}</p>
      )}
    </div>
  )
}
