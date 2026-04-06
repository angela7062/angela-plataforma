'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Header from '@/components/layout/Header'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string, redirect?: string, mode?: 'comprar' | 'anunciar' }
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState(searchParams?.message || '')

  const formatPascalCase = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatCelular = (value: string) => {
    let v = value.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`
    return v
  }

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCelular(formatCelular(e.target.value))
  }

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setAuthMessage('')

    if (!isSignUp) {
      // Login Mode (Hybrid: Email or Phone)
      const identifier = email.trim()
      const isPhone = /^\(\d{2}\)\s\d{5}-\d{4}$/.test(identifier) || /^\d{10,11}$/.test(identifier.replace(/\D/g, ''))
      
      let loginParams: any = { password }
      if (isPhone) {
        // Formatar para padrão E.164 se for telefone
        const cleanPhone = identifier.replace(/\D/g, '')
        loginParams.phone = `+55${cleanPhone}`
      } else {
        loginParams.email = identifier
      }

      const { error } = await supabase.auth.signInWithPassword(loginParams)

      if (error) {
        setAuthMessage(error.message === 'Invalid login credentials' ? 'Credenciais Inválidas' : error.message)
        setLoading(false)
      } else {
        const target = searchParams?.redirect || '/imoveis'
        router.push(target)
        router.refresh()
      }
    } else {
      // Signup Mode
      if (!fullName.trim() || !email.trim() || !celular.trim() || !password.trim()) {
        setAuthMessage('Todos os campos são obrigatórios para o cadastro.')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setAuthMessage('As senhas não coincidem.')
        setLoading(false)
        return
      }

      if (celular.length < 15) {
        setAuthMessage('Por favor, preencha o celular completo: (99) 99999-9999')
        setLoading(false)
        return
      }

      const cleanPhone = celular.replace(/\D/g, '')
      const formattedName = formatPascalCase(fullName)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: formattedName,
            phone_number: celular 
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setAuthMessage(error.message)
        setLoading(false)
      } else {
        // Todo usuário que finalizar o cadastro por este caminho deve ser registrado como comprador
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: formattedName,
            phone_number: celular,
            user_role: 'Comprador'
          })
        }
        setAuthMessage('Verifique seu e-mail para confirmar o cadastro.')
        setLoading(false)
      }
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const cleanPhone = celular.replace(/\D/g, '')
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+55${cleanPhone}`,
      token: otpCode,
      type: 'sms'
    })

    if (error) {
      setAuthMessage(`Erro na verificação: ${error.message}`)
      setLoading(false)
    } else {
      if (data.user) {
        // Atribuir user_role com base na intenção (parâmetro mode) ou padrão Comprador
        const role = searchParams?.mode === 'anunciar' ? 'Vendedor' : 'Comprador'
        
        // Criar perfil e definir role
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName ? formatPascalCase(fullName) : null,
          phone_number: celular,
          user_role: role
        })
      }
      setAuthMessage('Conta verificada com sucesso!')
      
      // Redirecionamento dinâmico
      const defaultTarget = searchParams?.mode === 'anunciar' ? '/admin/novo' : '/'
      const target = searchParams?.redirect || defaultTarget
      
      router.push(target)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md luxury-card p-10 rounded-xl relative">
          <h1 className="text-[#CBA153] font-serif text-3xl mb-1 tracking-tighter">
            {showOtp ? 'Verificar Celular' : 'Imóvel Forte'}
          </h1>
          <p className="text-gray-400 text-sm mb-8">Seja Bem Vindo</p>

          {!showOtp ? (
            <form onSubmit={handleAuth} className="flex flex-col gap-5 w-full text-left">
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-[10px] tracking-widest uppercase" htmlFor="fullName">
                    Nome Completo
                  </label>
                  <input
                    className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-sm"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu Nome Completo"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-[10px] tracking-widest uppercase" htmlFor="email">
                  {isSignUp ? 'Email' : 'E-mail ou Celular'}
                </label>
                <input
                  className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-sm"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value
                    // Lógica de Identificação Inteligente:
                    // Se contiver qualquer letra ou @, tratamos como e-mail (sem máscara).
                    // Se contiver apenas números (e possivelmente caracteres de máscara), tratamos como celular.
                    const cleanVal = val.replace(/\D/g, '')
                    const hasLetters = /[a-zA-Z]/.test(val)
                    const hasAt = val.includes('@')

                    if (!isSignUp && !hasLetters && !hasAt && cleanVal.length > 0 && cleanVal.length <= 11) {
                      setEmail(formatCelular(val))
                    } else {
                      setEmail(val)
                    }
                  }}
                  placeholder={isSignUp ? "seu@email.com" : "(99) 99999-9999 ou e-mail"}
                  required
                />
              </div>

              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-[10px] tracking-widest uppercase" htmlFor="celular">
                    Celular
                  </label>
                  <input
                    className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-sm"
                    id="celular"
                    name="celular"
                    value={celular}
                    onChange={handleCelularChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-[10px] tracking-widest uppercase" htmlFor="password">
                  Senha
                </label>
                <input
                  className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-sm"
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-[10px] tracking-widest uppercase" htmlFor="confirmPassword">
                    Confirmar Senha
                  </label>
                  <input
                    className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-sm"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-4 mt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-luxury w-full disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? 'Processando...' : (isSignUp ? 'Cadastrar Agora' : 'Entrar')}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setAuthMessage('')
                    setEmail('')
                    setCelular('')
                    setConfirmPassword('')
                    setFullName('')
                  }}
                  className="text-gray-500 text-xs uppercase tracking-widest hover:text-[#CBA153] transition-colors"
                >
                  {isSignUp ? 'Já tenho conta / Fazer Login' : 'Não tem uma conta? Cadastre-se aqui'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 w-full text-left">
              <p className="text-gray-400 text-sm text-center mb-4">
                Insira o código de 6 dígitos enviado para <br/>
                <span className="text-[#CBA153] font-bold">{celular}</span>
              </p>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs tracking-widest uppercase text-center" htmlFor="otp">
                  Código de Verificação
                </label>
                <input
                  className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-4 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-center text-2xl tracking-[1em] font-mono"
                  id="otp"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="btn-luxury w-full disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? 'Verificando...' : 'Confirmar e Acessar'}
              </button>

              <button 
                type="button"
                onClick={() => setShowOtp(false)}
                className="text-gray-500 text-xs uppercase tracking-widest hover:text-[#CBA153] transition-colors text-center"
              >
                Voltar
              </button>
            </form>
          )}

          {authMessage && (
            <p className="mt-4 p-4 bg-black/50 text-[#CBA153] text-center text-sm border border-[#CBA153]/20 rounded-sm italic">
              {authMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
