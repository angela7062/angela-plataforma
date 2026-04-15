'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const formatCurrency = (value: number) => {
  if (!value) return 'Consulte';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function ImageCarousel({
  property,
  onClose,
}: {
  property: any;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine main_image with gallery_urls, ensuring no duplicates and filtering out empty values
  const images = Array.from(new Set([property.main_image, ...(property.gallery_urls || [])])).filter(Boolean);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowRight') {
        goToNext();
      }
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!property) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[100] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-opacity duration-300 animate-fade-in-fast">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-[110]"
        aria-label="Fechar galeria"
      >
        <X size={40} />
      </button>

      {/* Image Container */}
      <div className="relative w-full h-[65vh] sm:h-[70vh] md:h-[75vh] max-w-6xl flex items-center justify-center">
        {/* Main Image */}
        <div className="relative w-full h-full aspect-video bg-black/20 flex items-center justify-center rounded-lg overflow-hidden shadow-2xl shadow-black/50">
           {images.length > 0 ? (
             <img
               key={images[currentIndex]} // Key helps React to re-render and trigger animation
               src={images[currentIndex]}
               alt={`Imagem ${currentIndex + 1} de ${property.title}`}
               className="object-contain w-full h-full animate-fade-in"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
                <p className="text-gray-500">Nenhuma imagem disponível.</p>
             </div>
           )}
        </div>

        {/* Prev/Next Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 bg-white/5 p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 focus:outline-none shadow-lg"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 bg-white/5 p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 focus:outline-none shadow-lg"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
      
      {/* Bottom Info Bar */}
      <div className="w-full max-w-6xl mt-4 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-transparent text-white">
        <div className="text-center sm:text-left">
          <h2 className="text-lg lg:text-xl font-serif text-white leading-tight line-clamp-1">
            {property.title}
          </h2>
          <p className="text-base lg:text-lg font-semibold text-[#CBA153] mt-1">
            {formatCurrency(property.price)}
          </p>
        </div>
        <Link href={`/imovel/${property.slug}`} passHref>
          <div onClick={onClose} className="bg-[#CBA153] text-center text-[#121212] font-bold uppercase tracking-widest text-xs sm:text-sm px-8 py-4 rounded-sm hover:bg-white transition-colors duration-300 shadow-lg shadow-[#CBA153]/20 cursor-pointer">
            Visitar Anúncio
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0.5; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }

        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
