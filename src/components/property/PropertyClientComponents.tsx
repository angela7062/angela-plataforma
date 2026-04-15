'use client'

import { useState } from 'react'
import { Heart, Share2, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export const FavoriteButton = () => {
  const [isFavorite, setIsFavorite] = useState(false)
  return (
    <button 
      onClick={() => setIsFavorite(!isFavorite)}
      aria-label="Adicionar aos Favoritos" 
      className={`absolute top-6 right-6 z-30 flex items-center justify-center w-11 h-11 bg-black/40 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 ${isFavorite ? 'text-red-500' : 'text-white'}`}>
      <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  )
}

export const ShareButton = ({ propertyTitle }: { propertyTitle: string }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: propertyTitle,
        text: `Confira este imóvel incrível: ${propertyTitle}`,
        url: window.location.href,
      })
    }
  }

  return (
    <button onClick={handleShare} aria-label="Compartilhar" className="text-white/80 hover:text-white transition-colors">
      <Share2 size={20} />
    </button>
  )
}

export const StickyMobileBar = ({ whatsappNumber, propertyTitle }: { whatsappNumber: string | null, propertyTitle: string }) => {
  if (!whatsappNumber) return null;

  const message = `Olá, tenho interesse no imóvel "${propertyTitle}". Poderia me dar mais informações?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D] border-t border-white/10 p-3 flex items-center justify-center gap-4 z-50 lg:hidden">
      <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] text-white flex items-center justify-center gap-2.5 py-2.5 rounded-md font-semibold text-sm">
        <MessageCircle size={18} />
        <span>WhatsApp</span>
      </Link>
    </div>
  )
}
