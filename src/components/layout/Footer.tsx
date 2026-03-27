import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-white/5 py-12 px-[5%] mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
        <h2 className="text-[#CBA153] font-serif text-xl tracking-widest opacity-80">Imóvel Forte</h2>
        
        <p className="text-gray-500 text-[10px] leading-relaxed max-w-4xl text-justify md:text-center">
          A Imóvel Forte atua exclusivamente como um portal de divulgação imobiliária, conectando potenciais compradores a proprietários, corretores e construtoras. 
          Não nos responsabilizamos pela veracidade, integridade ou atualização das informações fornecidas nos anúncios, tampouco por imagens que tenham sido 
          editadas, tratadas ou que não reflitam o estado atual e exato da propriedade. Toda a negociação, vistoria documental e física do imóvel é de inteira 
          responsabilidade das partes envolvidas. Defendemos a transparência e possuímos uma política de vigilância contínua para manter a qualidade de nossa vitrine.
        </p>

        <p className="text-gray-500 text-[10px] uppercase tracking-[2px]">
          Identificou alguma irregularidade? Denuncie de forma anônima e segura enviando um e-mail para:{' '}
          <a href="mailto:mfreita_86@hotmail.com" className="text-[#CBA153] hover:text-white transition-colors underline decoration-white/20 underline-offset-4">
            mfreita_86@hotmail.com
          </a>
        </p>

        <div className="w-full h-px bg-white/5 mt-4"></div>

        <p className="text-gray-600 text-[9px] uppercase tracking-[3px] mt-2">
          © {new Date().getFullYear()} Imóvel Forte Exclusivity. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
