'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UserGlobalIdentity() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, user_role')
          .eq('id', session.user.id)
          .single()
        setProfile(profileData)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, user_role')
            .eq('id', session.user.id)
            .single()
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return <div className="w-20 h-8 animate-pulse bg-white/5 rounded-sm" />
  if (!user) return null

  // Regra de Ouro: Capitalização Automática para Nomes
  const formatName = (name: string) => {
    if (!name) return ''
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Lógica de Exibição de Texto (Fallback)
  // Prioridade: full_name ou display_name > email da sessão
  const rawName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.display_name || user.user_metadata?.name
  const displayName = rawName ? formatName(rawName) : user.email || 'Usuário'
  
  const role = profile?.user_role || 'Comprador'

  // Cores Dinâmicas por Perfil
  const getNameColor = (role: string) => {
    switch (role) {
      case 'Vendedor':
      case 'Anunciante':
        return 'text-green-500'
      case 'Comprador':
        return 'text-blue-500'
      case 'Ambos':
        return 'text-white'
      default:
        return 'text-white'
    }
  }

  const firstLetter = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-5">
      {/* Avatar com Tooltip à esquerda do botão Sair */}
      <div 
        className="w-9 h-9 rounded-full border border-[#CBA153]/30 overflow-hidden bg-[#1A1A1A] flex items-center justify-center shrink-0 shadow-lg cursor-help group/avatar relative"
        title={`Logado como: ${user.email || displayName}`}
      >
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={displayName} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#CBA153]/10 text-[#CBA153] text-sm font-bold">
            {firstLetter}
          </div>
        )}
        
        {/* Tooltip Customizado (Opcional via CSS para melhor estética) */}
        <div className="absolute top-full mt-2 right-0 bg-[#1A1A1A] text-white text-[10px] px-2 py-1 rounded border border-white/10 opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all whitespace-nowrap z-[60]">
          Logado como: {user.email || displayName}
        </div>
      </div>

      {/* Botão SAIR à esquerda de Anunciar */}
      <button 
        onClick={handleSignOut}
        className="flex items-center gap-2 border border-[#CBA153] text-[#CBA153] hover:bg-[#CBA153] hover:text-[#121212] transition-all text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm"
      >
        <LogOut size={16} /> 
        <span>Sair</span>
      </button>
    </div>
  )
}
