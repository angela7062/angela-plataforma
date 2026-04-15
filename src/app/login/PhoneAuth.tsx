'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase' // CORRIGIDO: Usando seu client helper
import { useRouter } from 'next/navigation'

// Definição de tipos para clareza
type UIState = 'enter-phone' | 'enter-otp'

export default function PhoneAuth() {
  const supabase = createClient() // CORRIGIDO: Instanciando o client corretamente
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [uiState, setUiState] = useState<UIState>('enter-phone')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Envia o código OTP para o número de telefone fornecido.
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Lembre-se de incluir o código do país, ex: +55 para o Brasil
    const fullPhoneNumber = `+55${phone}`

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhoneNumber,
    })

    if (error) {
      console.error('Erro ao enviar OTP:', error)
      setError('Não foi possível enviar o código. Verifique o número e tente novamente.')
      setIsLoading(false)
    } else {
      // Sucesso! Muda a UI para o modo de inserção de código
      setUiState('enter-otp')
      setIsLoading(false)
    }
  }

  /**
   * Verifica o código OTP e o telefone para criar a sessão do usuário.
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const fullPhoneNumber = `+55${phone}`

    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhoneNumber,
      token: otp,
      type: 'sms', // Importante especificar o tipo
    })

    if (error) {
      console.error('Erro ao verificar OTP:', error)
      setError('Código inválido ou expirado. Tente novamente.')
      setIsLoading(false)
    } else {
      // Sucesso! Usuário está logado.
      // Supabase gerencia a sessão automaticamente.
      alert('Login realizado com sucesso!')
      router.refresh() // Atualiza a página para refletir o estado de login
      router.push('/admin') // Redireciona para o painel
    }
  }

  const inputClass = "w-full bg-[#121212] border border-[#CBA153]/10 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] outline-none transition-colors text-xs placeholder:text-gray-700"

  if (uiState === 'enter-otp') {
    return (
      <div className="w-full max-w-sm mx-auto mt-4">
        <p className="text-center text-gray-400 text-sm mb-4">Enviamos um código para o número {`+55${phone}`}.</p>
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="_ _ _ _ _ _"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`${inputClass} text-center tracking-[8px]`}
            required
          />
          <button type="submit" disabled={isLoading} className="bg-[#CBA153] text-[#121212] py-2.5 rounded-sm font-bold disabled:opacity-50">
            {isLoading ? 'Verificando...' : 'Verificar Código e Entrar'}
          </button>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">+55</span>
            <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Remove não-dígitos
                className={`${inputClass} pl-12`}
                required
            />
        </div>
        <button type="submit" disabled={isLoading} className="bg-[#CBA153] text-[#121212] py-2.5 rounded-sm font-bold disabled:opacity-50">
          {isLoading ? 'Enviando...' : 'Enviar Código de Acesso'}
        </button>
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </form>
    </div>
  )
}
