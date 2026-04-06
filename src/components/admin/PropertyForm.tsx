'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ImagePlus, X, Trash2, Loader2, Check } from 'lucide-react'
import { createProperty, updateProperty, deleteProperty } from '@/app/admin/actions'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import Cropper from 'react-easy-crop'
import Header from '@/components/layout/Header'

// Constantes de endereço do anunciante removidas conforme pedido.

interface PropertyFormProps {
  property?: any
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const isEdit = !!property
  const sp = property?.features || {}
  const gal = property?.gallery || []
  const adm = property?.features || {}

  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Timer para limpar a mensagem de sucesso após 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handlers para Sincronização de Autofill
  const handleAutoFill = useCallback((e: React.AnimationEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (e.animationName === 'onAutoFillStart') {
      const fieldName = e.currentTarget.name;
      
      // 1. Limpar erro visual se o campo foi preenchido
      setErrors((prev: any) => {
        if (!prev[fieldName]) return prev;
        const newErrs = { ...prev };
        delete newErrs[fieldName];
        return newErrs;
      });

      // 2. Sincronizar estados específicos se necessário
      if (fieldName === 'announcer_type') {
        setAnnouncerType(e.currentTarget.value);
      }
    }
  }, []);

  // === Galeria de Fotos ===
  const MAX_PHOTOS = 21
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string; uploading: boolean }[]>(
    gal.map((url: string, i: number) => ({ id: `existing_${i}`, url, uploading: false }))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const propertyIdRef = useRef<string>(property?.id || `new_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)

  const handleSelectImages = () => fileInputRef.current?.click()

  const compressAndUpload = useCallback(async (file: File, slotId: string) => {
    try {
      // 1) Comprimir a imagem no navegador (max 1MB, max 1920px)
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
      })

      // 2) Upload para Supabase Storage
      const supabase = createClient()
      const ext = 'webp'
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/\.[^.]+$/, '')
      const filePath = `imoveis/${propertyIdRef.current}/${safeName}_${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('properties')
        .upload(filePath, compressed, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false,
        })

      if (error) throw error

      // 3) Obter URL pública
      const { data: urlData } = supabase.storage
        .from('properties')
        .getPublicUrl(data.path)

      // 4) Atualizar o slot com a URL final
      setGalleryImages(prev =>
        prev.map(img =>
          img.id === slotId
            ? { ...img, url: urlData.publicUrl, uploading: false }
            : img
        )
      )
    } catch (err) {
      console.error('Erro ao comprimir/subir imagem:', err)
      // Remove o slot que falhou
      setGalleryImages(prev => prev.filter(img => img.id !== slotId))
    }
  }, [])

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const slotsAvailable = MAX_PHOTOS - galleryImages.length
    const filesToAdd = files.slice(0, slotsAvailable)

    // Criar slots com preview local + estado de loading
    const newSlots = filesToAdd.map((file, i) => {
      const id = `upload_${Date.now()}_${i}`
      return { id, url: URL.createObjectURL(file), uploading: true, file }
    })

    setGalleryImages(prev => [...prev, ...newSlots.map(({ file, ...rest }) => rest)])

    // Iniciar compressão e upload em paralelo para cada arquivo
    newSlots.forEach(slot => {
      compressAndUpload(slot.file, slot.id)
    })

    e.target.value = ''
  }

  const handleRemoveImage = async (id: string) => {
    const img = galleryImages.find(i => i.id === id)
    // Tentar remover do Storage se for URL do Supabase
    if (img && img.url.includes('supabase')) {
      try {
        const supabase = createClient()
        const urlParts = img.url.split('/storage/v1/object/public/properties/')
        if (urlParts[1]) {
          await supabase.storage.from('properties').remove([urlParts[1]])
        }
      } catch (err) {
        console.error('Erro ao remover do storage:', err)
      }
    }
    setGalleryImages(prev => prev.filter(i => i.id !== id))
  }

  const handleRemoveAll = async () => {
    // Remover todas do Storage
    const supabaseUrls = galleryImages.filter(img => img.url.includes('supabase'))
    if (supabaseUrls.length > 0) {
      try {
        const supabase = createClient()
        const paths = supabaseUrls
          .map(img => {
            const parts = img.url.split('/storage/v1/object/public/properties/')
            return parts[1] || ''
          })
          .filter(Boolean)
        if (paths.length > 0) {
          await supabase.storage.from('properties').remove(paths)
        }
      } catch (err) {
        console.error('Erro ao limpar storage:', err)
      }
    }
    setGalleryImages([])
  }

  const [announcerType, setAnnouncerType] = useState(adm.announcer_type || '')
  const [announcerPhoto, setAnnouncerPhoto] = useState<string | null>(adm.announcer_photo || null)
  
  // Categorias e Subcategorias sincronizadas com o menu
  const [category, setCategory] = useState(property?.category || '')
  const [subcategory, setSubcategory] = useState(property?.subcategory || '')

  const subcategoriesByCategory: Record<string, string[]> = {
    'Casas': [
      'CASA TÉRREA', 
      'TÉRREA GEMINADA', 
      'TÉRREA EM CONDOMÍNIO', 
      'SOBRADO', 
      'SOBRADO GEMINADO', 
      'SOBRADO EM CONDOMÍNIO', 
      'CASA SOBREPOSTA', 
      'SOBREPOSTA EM CONDOMÍNIO'
    ],
    'Apartamentos': ['EM GERAL', 'KITNETS / FLATS / STUDIOS', 'COBERTURA DUPLEX', 'NA PLANTA'],
    'Rurais & Lotes': ['SÍTIOS E CHÁCARAS', 'LOTES E TERRENOS', 'FAZENDAS'],
    'Comercial': ['SALAS COMERCIAIS', 'PRÉDIOS INTEIROS', 'GALPÕES', 'LOJAS'],
    'Lançamentos': ['NA PLANTA', 'EM OBRAS', 'PRONTO PARA MORAR', 'OPORTUNIDADES']
  }

  const [isPhotoUploading, setIsPhotoUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // States for Avatar Crop
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropping, setIsCropping] = useState(false)

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleAvatarSelect = () => avatarInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Otimização: Usar createObjectURL em vez de readAsDataURL para carregamento instantâneo
      const objectUrl = URL.createObjectURL(file)
      setImageToCrop(objectUrl)
      setIsCropping(true)
    }
  }

  const handleCancelCrop = () => {
    if (imageToCrop) URL.revokeObjectURL(imageToCrop) // Limpeza de memória
    setImageToCrop(null)
    setIsCropping(false)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  const handleSaveCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    setIsPhotoUploading(true)
    setIsCropping(false)
    
    try {
      const image = new Image()
      
      // Carregamento da imagem com Promessa para garantir que está pronta para o Canvas
      const loadPromise = new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = (err) => {
          console.error('Erro ao carregar imagem para o Canvas:', err)
          reject(new Error('Erro ao carregar arquivo de imagem'))
        }
      })
      
      // Importante: Setar src APÓS definir os handlers de onload/onerror
      image.src = imageToCrop
      await loadPromise

      const canvas = document.createElement('canvas')
      // Forçamos o redimensionamento final no próprio Canvas (800x800)
      canvas.width = 800
      canvas.height = 800
      const ctx = canvas.getContext('2d')

      if (!ctx) throw new Error('Falha ao obter contexto 2D')

      // Aplicar o corte baseado nos pixels selecionados e redimensionar para 800x800
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        800,
        800
      )

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.85))
      if (!blob) throw new Error('Falha ao gerar arquivo de imagem (Blob)')

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado no sistema')

      // Caminho fixo: identidade/[user_id]/perfil.webp
      const filePath = `identidade/${user.id}/perfil.webp`

      // Upload com upsert (substituição)
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/webp',
          cacheControl: '0', // Sem cache para atualização imediata
          upsert: true,
        })

      if (uploadError) {
        console.error('Erro no upload para o Storage:', uploadError)
        throw new Error('Erro ao salvar no servidor de arquivos')
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
      
      // Cache-buster robusto para forçar o navegador a recarregar
      const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`
      
      setAnnouncerPhoto(publicUrl)

      // Atualiza o perfil no banco de dados
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (profileError) console.error('Erro ao atualizar banco de perfis:', profileError)

      // Notificar o sistema que o perfil mudou (atualiza o Header)
      router.refresh()

    } catch (err: any) {
      console.error('Erro Crítico:', err)
      alert(`Erro: ${err.message || 'Falha ao processar imagem'}. Tente um arquivo diferente.`)
    } finally {
      setIsPhotoUploading(false)
      // Liberar memória do objeto temporário
      if (imageToCrop && imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop)
      }
      setImageToCrop(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }
  
  // Lógica de Estados e Cidades
  const states = [
    'SP', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SE', 'TO'
  ]
  
  const [selectedState, setSelectedState] = useState(property?.address_state || 'SP')
  const [citySearch, setCitySearch] = useState(property?.address_city || '')
  
  // Novos estados para endereço detalhado
  const [cep, setCep] = useState(property?.specs?.cep || '')
  const [street, setStreet] = useState(property?.specs?.street || '')
  const [neighborhood, setBairro] = useState(property?.specs?.neighborhood || '')

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 8) value = value.slice(0, 8)
    
    // Aplica máscara 00000-000
    const masked = value.replace(/^(\d{5})(\d{3}).*/, '$1-$2')
    setCep(masked)

    if (value.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setStreet(data.logradouro)
          setBairro(data.bairro)
          setCitySearch(data.localidade)
          setSelectedState(data.uf)
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  // Base de cidades robusta: 100% de SP + ~20% das mais populosas dos demais estados (IBGE 2025)
  const citiesByState: Record<string, string[]> = {
    'SP': [
      'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'São José dos Campos', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 
      'São José do Rio Preto', 'Mogi das Cruzes', 'Santos', 'Diadema', 'Jundiaí', 'Piracicaba', 'Carapicuíba', 'Bauru', 'Itaquaquecetuba', 'São Vicente', 
      'Franca', 'Praia Grande', 'Guarujá', 'Taubaté', 'Limeira', 'Suzano', 'Sumaré', 'Cotia', 'Taboão da Serra', 'Barueri', 'Embu das Artes', 'Indaiatuba', 
      'São Carlos', 'Itu', 'Americana', 'Jacareí', 'Marília', 'Araraquara', 'Hortolândia', 'Presidente Prudente', 'Araçatuba', 'Rio Claro', 'Santa Bárbara d\'Oeste', 
      'Ferraz de Vasconcelos', 'Francisco Morato', 'Itapevi', 'Bragança Paulista', 'Pindamonhangaba', 'São Caetano do Sul', 'Atibaia', 'Poá', 'Salto', 'Valinhos',
      'Jandira', 'Sertãozinho', 'Ribeirão Pires', 'Catanduva', 'Votorantim', 'Barretos', 'Várzea Paulista', 'Guaratinguetá', 'Tatuí', 'Caraguatatuba', 'Birigui',
      'Itatiba', 'Araras', 'Ourinhos', 'Paulínia', 'Assis', 'Leme', 'Mogi Guaçu', 'São João da Boa Vista', 'Caieiras', 'Avaré', 'Mairiporã', 'Lorena', 'Botucatu',
      'Ubatuba', 'Mogi Mirim', 'Votuporanga', 'Arujá', 'São Sebastião', 'Matão', 'Bebedouro', 'Jaboticabal', 'Pirassununga', 'Lins', 'Franco da Rocha', 'Cruzeiro',
      'Vinhedo', 'Cajamar', 'Fernandópolis', 'Peruíbe', 'Lençóis Paulista', 'São Roque', 'Mongaguá', 'São José do Rio Pardo', 'Boituva', 'Ibitinga', 'Batatais',
      'Santa Isabel', 'Mirassol', 'Promissão', 'Monte Alto', 'Andradina', 'Registro', 'Olímpia', 'Capivari', 'Porto Ferreira', 'São Pedro', 'Agudos', 'Bariri'
    ],
    'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda', 'Macaé', 'Cabo Frio', 'Angra dos Reis', 'Nova Friburgo', 'Barra Mansa', 'Teresópolis', 'Mesquita', 'Nilópolis', 'Rio das Ostras', 'Araruama', 'Itaboraí', 'Magé', 'Resende'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Poços de Caldas', 'Santa Luzia', 'Ibirité', 'Passos', 'Varginha', 'Patos de Minas', 'Pouso Alegre', 'Teófilo Otoni', 'Barbacena', 'Sabará', 'Conselheiro Lafaiete', 'Itabira', 'Araguari'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Alagoinhas', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso', 'Barreiras', 'Eunápolis', 'Santo Antônio de Jesus', 'Valença', 'Candeias', 'Guanambi'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Araucária', 'Toledo', 'Apucarana', 'Pinhais', 'Campo Largo', 'Arapongas', 'Almirante Tamandaré', 'Umuarama', 'Piraquara', 'Cambé', 'Fazenda Rio Grande', 'Sarandi'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'Passo Fundo', 'Rio Grande', 'Alvorada', 'São Leopoldo', 'Erechim', 'Sapucaia do Sul', 'Santa Cruz do Sul', 'Cachoeirinha', 'Bento Gonçalves', 'Bagé', 'Uruguaiana', 'Ijuí', 'Guaíba', 'Lajeado'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão', 'Igarassu', 'São Lourenço da Mata', 'Santa Cruz do Capibaribe', 'Abreu e Lima', 'Ipojuca', 'Araripina', 'Serra Talhada'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá', 'Pacatuba', 'Aquiraz', 'Quixeramobim', 'Canindé', 'Tianguá', 'Russas', 'Crateús'],
    'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança', 'São Félix do Xingu', 'Barcarena', 'Altamira', 'Tucuruí', 'Paragominas', 'Tailândia', 'Breves', 'Itaituba'],
    'SC': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Itajaí', 'Chapecó', 'Palhoça', 'Criciúma', 'Jaraguá do Sul', 'Lages', 'Brusque', 'Balneário Camboriú', 'Tubarão', 'Camboriú', 'Navegantes', 'São Bento do Sul', 'Caçador', 'Concórdia'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Senador Canedo', 'Itumbiara', 'Catalão', 'Jataí', 'Formosa', 'Planaltina', 'Caldas Novas', 'Novo Gama'],
    'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês', 'Barra do Corda', 'Pinheiro', 'Chapadinha', 'Buriticupu', 'Grajaú'],
    'DF': ['Brasília', 'Ceilândia', 'Samambaia', 'Taguatinga', 'Plano Piloto', 'Planaltina', 'Águas Claras', 'Recanto das Emas', 'Gama', 'Guará', 'Santa Maria', 'Sobradinho', 'São Sebastião', 'Vicente Pires', 'Itapoã'],
    'ES': ['Serra', 'Vila Velha', 'Cariacica', 'Vitória', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz', 'Viana', 'Linhares', 'Nova Venécia', 'Vila Valério'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cabedelo', 'Guarabira', 'Cajazeiras', 'Sapé', 'Queimadas'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'São José de Mipibu'],
    'AL': ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares', 'Penedo', 'São Miguel dos Campos', 'Coruripe', 'Marechal Deodoro'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'Altos', 'Esperantina'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Sorriso', 'Tangará da Serra', 'Cáceres', 'Primavera do Leste', 'Lucas do Rio Verde', 'Nova Mutum'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina', 'Sidrolândia', 'Aquidauana'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Tabatinga', 'Maués', 'Humaitá', 'Iranduba'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Jaru', 'Guajará-Mirim'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins'],
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Porto Grande'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Pacaraima']
  }

  const capitalsByState: Record<string, string> = {
    'AC': 'Rio Branco', 'AL': 'Maceió', 'AP': 'Macapá', 'AM': 'Manaus', 'BA': 'Salvador', 'CE': 'Fortaleza', 'DF': 'Brasília', 'ES': 'Vitória', 'GO': 'Goiânia', 'MA': 'São Luís', 'MT': 'Cuiabá', 'MS': 'Campo Grande', 'MG': 'Belo Horizonte', 'PA': 'Belém', 'PB': 'João Pessoa', 'PR': 'Curitiba', 'PE': 'Recife', 'PI': 'Teresina', 'RJ': 'Rio de Janeiro', 'RN': 'Natal', 'RS': 'Porto Alegre', 'RO': 'Porto Velho', 'RR': 'Boa Vista', 'SC': 'Florianópolis', 'SP': 'São Paulo', 'SE': 'Aracaju', 'TO': 'Palmas'
  }

  const getSortedCities = (state: string) => {
    const cities = citiesByState[state] || []
    const capital = capitalsByState[state]
    
    // Filtra a capital para garantir que ela não apareça duas vezes
    const otherCities = cities.filter(c => c !== capital).sort((a, b) => a.localeCompare(b, 'pt-BR'))
    
    // Retorna a capital no topo se existir, seguida das outras em ordem alfabética
    return capital ? [capital, ...otherCities] : otherCities
  }

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    creci: '',
    company: '',
    photo: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const pData = {
          name: prof?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          whatsapp: prof?.whatsapp || '',
          creci: prof?.creci || '',
          company: prof?.company || '',
          photo: prof?.avatar_url || ''
        }
        setProfileData(pData)
        
        if (!isEdit && !announcerPhoto && pData.photo) {
          setAnnouncerPhoto(pData.photo)
        }
      }
    }
    loadProfile()
  }, [isEdit])

  const handleRemoveAvatar = () => {
    setAnnouncerPhoto(null)
  }

  const labelClass = "text-gray-400 text-[10px] tracking-widest uppercase font-semibold"
  const inputClass = "bg-[#121212] border border-[#CBA153]/10 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] outline-none transition-colors text-xs placeholder:text-gray-700"
  const selectClass = "bg-[#121212] border border-[#CBA153]/10 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] outline-none appearance-none transition-colors text-xs cursor-pointer"
  const errorClass = 'bg-yellow-500/10 border-yellow-500'

  const pageTitle = isEdit ? "Cadastrar e Editar imóvel" : "Cadastrar imóvel"

  const handleValidateAndSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage(null)
    const formData = new FormData(event.currentTarget)
    const newErrors: any = {}

    // Validações básicas e Section 1 & 2
    if (!formData.get('title')) newErrors.title = true
    if (!formData.get('price')) newErrors.price = true
    if (!formData.get('intent')) newErrors.intent = true
    if (!formData.get('condition')) newErrors.condition = true
    if (!formData.get('category')) newErrors.category = true
    if (!formData.get('subcategory')) newErrors.subcategory = true
    if (!formData.get('city')) newErrors.city = true
    if (!formData.get('state')) newErrors.state = true
    if (!formData.get('description')) newErrors.description = true
    
    // Validações Seção 7.4 (Identificação do Anunciante)
    if (!formData.get('announcer_name')) newErrors.announcer_name = true
    if (!formData.get('announcer_whatsapp')) newErrors.announcer_whatsapp = true
    if (!formData.get('announcer_email')) newErrors.announcer_email = true
    if (!formData.get('announcer_type')) newErrors.announcer_type = true
    if (!formData.get('intent')) newErrors.intent = true
    if (formData.get('announcer_type') === 'Profissional' && !formData.get('announcer_creci')) {
      newErrors.announcer_creci = true
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        let result: any
        if (isEdit) {
          result = await updateProperty(formData)
        } else {
          result = await createProperty(formData)
        }

        if (result?.success) {
          setSuccessMessage(isEdit ? "Imóvel atualizado com sucesso!" : "Imóvel Salvo com Sucesso!  Pronto para Cadastrar Novo Imóvel.")
          
          if (!isEdit) {
             // Limpar completamente todos os campos (7.1 a 7.4)
             formRef.current?.reset()
             setGalleryImages([])
             setAnnouncerPhoto(null)
             setAnnouncerType('')
          }
          
          // Reposicionar o cursor do navegador para o topo
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else if (result?.error) {
          alert(result.error)
        }
      } catch (err) {
        console.error('Erro ao salvar:', err)
        alert('Ocorreu um erro inesperado ao salvar.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setIsSubmitting(false)
      const firstErrorKey = Object.keys(newErrors)[0]
      const errorElement = formRef.current?.querySelector(`[name="${firstErrorKey}"]`)
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans pb-32">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12 text-sm">
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-[#CBA153] transition-colors text-xs uppercase tracking-widest w-fit">
            <ArrowLeft size={16} /> Voltar ao Painel
          </Link>
          {isEdit && (
            <form action={deleteProperty}>
              <input type="hidden" name="id" value={property.id} />
              <button type="submit" className="text-red-500/80 hover:text-red-500 text-xs uppercase tracking-widest transition-colors font-medium border border-red-500/20 rounded-sm px-4 py-2 hover:bg-red-500/10">
                Apagar Permanentemente
              </button>
            </form>
          )}
        </div>
        {successMessage && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-4 duration-500 flex items-center justify-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
             {successMessage}
          </div>
        )}
        <h2 className="text-[#CBA153] text-4xl font-serif mb-2">{pageTitle}</h2>
        <p className="text-gray-500 text-base mb-10">
          {isEdit ? "Atualize as características deste anúncio." : "Cadastre um novo imóvel para sua vitrine."}
        </p>

        <form ref={formRef} onSubmit={handleValidateAndSubmit} className="flex flex-col gap-8">
          {isEdit && <input type="hidden" name="id" value={property.id} />}

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">1. Informações Principais & Endereço</h3>
            <div className="flex flex-col gap-3">
              <label className={labelClass}>Título do Anúncio *</label>
              <input 
                name="title" 
                defaultValue={property?.title} 
                className={`${inputClass} ${errors.title ? errorClass : ''}`} 
                placeholder="Ex: Mansão Suspensa no Jardim Oceânico" 
                onAnimationStart={handleAutoFill}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Preço Sugerido (R$) *</label>
                 <input 
                  name="price" 
                  type="number" 
                  defaultValue={property?.price} 
                  className={`${inputClass} ${errors.price ? errorClass : ''}`} 
                  placeholder="0" 
                  onAnimationStart={handleAutoFill}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Finalidade (Negócio) *</label>
                <select 
                  name="intent" 
                  defaultValue={property?.intent || property?.specs?.intent || ''} 
                  className={`${selectClass} ${errors.intent ? errorClass : ''}`}
                >
                  <option value="">Selecione...</option>
                  <option value="Vender">Vender</option>
                  <option value="Alugar">Alugar</option>
                  <option value="Temporada">Temporada</option>
                  <option value="Leilão">Leilão</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Categoria *</label>
                <select 
                  name="category" 
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setSubcategory('') // Reset subcategory when category changes
                  }}
                  className={`${selectClass} ${errors.category ? errorClass : ''}`}
                >
                  <option value="">Selecione...</option>
                  {Object.keys(subcategoriesByCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Subcategoria *</label>
                <select 
                  name="subcategory" 
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!category}
                  className={`${selectClass} ${errors.subcategory ? errorClass : ''} disabled:opacity-50`}
                >
                  <option value="">Selecione...</option>
                  {category && subcategoriesByCategory[category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Estado (UF) *</label>
                <select 
                  name="state" 
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value)
                    setCitySearch('') // Limpa cidade ao trocar estado
                  }}
                  className={`${selectClass} ${errors.state ? errorClass : ''}`}
                >
                  {states.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Cidade *</label>
                <div className="relative">
                  <input 
                    name="city" 
                    list="cities-list"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className={`${inputClass} w-full ${errors.city ? errorClass : ''}`} 
                    placeholder="Digite ou selecione a cidade" 
                    onAnimationStart={handleAutoFill}
                  />
                  <datalist id="cities-list">
                    {getSortedCities(selectedState).map(city => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Logradouro</label>
                <select name="logradouro_tipo" defaultValue={sp.logradouro_tipo || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Alameda">Alameda</option>
                  <option value="Avenida">Avenida</option>
                  <option value="Balneário">Balneário</option>
                  <option value="Estrada">Estrada</option>
                  <option value="Fazenda">Fazenda</option>
                  <option value="Ladeira">Ladeira</option>
                  <option value="Loteamento">Loteamento</option>
                  <option value="Rodovia">Rodovia</option>
                  <option value="Rua">Rua</option>
                  <option value="Travessa">Travessa</option>
                  <option value="Viela">Viela</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>NOME DA RUA</label>
                <input 
                  name="street_name" 
                  type="text" 
                  defaultValue={sp.street_name || ''} 
                  className={inputClass} 
                  placeholder="Ex: Av. Brasil" 
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>NÚMERO</label>
                <input 
                  name="street_number" 
                  type="text" 
                  defaultValue={sp.street_number || ''} 
                  className={inputClass} 
                  placeholder="Ex: 123" 
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>CONDOMÍNIO</label>
                <input 
                  name="condo_name" 
                  type="text" 
                  defaultValue={sp.condo_name || ''} 
                  className={inputClass} 
                  placeholder="Nome do Condomínio" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className={labelClass}>Descrição Completa *</label>
              <textarea 
                name="description" 
                defaultValue={property?.description} 
                rows={5} 
                className={`${inputClass} ${errors.description ? errorClass : ''} resize-none`} 
                placeholder="Descreva os diferenciais deste imóvel..." 
                onAnimationStart={handleAutoFill}
              />
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">2. Estrutura e Dimensões</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Condição *</label>
                <select 
                  name="condition" 
                  defaultValue={property?.condition || (sp.casa_nova === true ? 'Novo' : (sp.casa_nova === false ? 'Usado' : ''))} 
                  className={`${selectClass} ${errors.condition ? errorClass : ''}`}
                >
                  <option value="">Selecione...</option>
                  <option value="Novo">Novo</option>
                  <option value="Usado">Usado</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Área Útil (m²)</label>
                <input name="area_m2" type="number" defaultValue={sp.area_m2 || '35'} className={inputClass} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Área Terreno (m²)</label>
                <input name="area_terreno" type="number" defaultValue={sp.area_terreno || '125'} className={inputClass} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Tempo de Const. (Anos)</label>
                <input name="tempo_construcao_anos" type="number" defaultValue={sp.tempo_construcao_anos || '1'} className={inputClass} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dormitórios</label>
                <input name="dormitorios" type="number" defaultValue={sp.dormitorios || '1'} className={inputClass + " text-center"} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Suítes</label>
                <input name="suites" type="number" defaultValue={sp.suites || '1'} className={inputClass + " text-center"} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Banheiros Totais</label>
                <input name="banheiros" type="number" defaultValue={sp.banheiros || '1'} className={inputClass + " text-center"} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Vagas Garagem</label>
                <input name="vagas" type="number" defaultValue={sp.vagas || '1'} className={inputClass + " text-center"} placeholder="0" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Tipo da Vaga</label>
                <select name="tipo_vaga" defaultValue={sp.tipo_vaga || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Coberta">Coberta</option>
                  <option value="Descoberta">Descoberta</option>
                  <option value="Mista">Mista</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dep. Empregada?</label>
                <select name="dependencia_empregada" defaultValue={sp.dependencia_empregada ? 'true' : 'false'} className={selectClass}>
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Bairro (Perfil)</label>
                <select name="tipo_bairro" defaultValue={sp.tipo_bairro || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Misto">Misto</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dist. Praia (m)</label>
                <input name="distancia_praia" type="number" defaultValue={sp.distancia_praia || '1'} className={inputClass} placeholder="Ex: 500" />
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Dist. Comércio (m)</label>
                <input name="distancia_comercio" type="number" defaultValue={sp.distancia_comercio || '1'} className={inputClass} placeholder="Ex: 200" />
              </div>
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">3. Condição e Documentação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <label className={labelClass}>REFORMADA RECENTEMENTE?</label>
                <select name="reformada" defaultValue={sp.reformada ? 'true' : 'false'} className={selectClass}>
                  <option value="false">Não</option>
                  <option value="true">Sim, Reformada</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Estado de Conserv.</label>
                <select name="conservacao" defaultValue={sp.conservacao || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Precário">Precário</option>
                  <option value="Mau Estado">Em mau estado</option>
                  <option value="Regular">Regular</option>
                  <option value="Bom">Bom estado</option>
                  <option value="Perfeito">Perfeito estado</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Mobiliada?</label>
                <select name="mobiliada" defaultValue={sp.mobiliada || ''} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="Não Mobiliada">Sem Mobília</option>
                  <option value="Mobiliada">Mobiliada (Completa)</option>
                  <option value="Semi-Mobiliada">Semi-Mobiliada (Planejados)</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
              <label className={labelClass}>Documentação do Imóvel</label>
              <select name="documentacao" defaultValue={sp.documentacao || ''} className={selectClass}>
                <option value="">Selecione...</option>
                <option value="Escritura Registrada">Matrícula/Registro Definitivo</option>
                <option value="Escritura Não Registrada">Escritura de Compra e Venda</option>
                <option value="Contrato de Gaveta">Contrato de Compra e Venda (Gaveta)</option>
                <option value="Posse">Cessão de Direitos Possessórios</option>
              </select>
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">4. Lazer & Comodidades</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'tem_piscina', label: 'Piscina' },
                { name: 'tem_edicula', label: 'Edícula' },
                { name: 'tem_churrasqueira', label: 'Churrasqueira' },
                { name: 'tem_hidro', label: 'Hidromassagem' },
                { name: 'tem_ar', label: 'Ar Condicionado' },
                { name: 'tem_area_gourmet', label: 'ÁREA GOURMET' },
                { name: 'tem_varanda', label: 'VARANDA' },
                { name: 'tem_sacada', label: 'SACADA' }
              ].map((item, idx) => (
                <label key={`${item.name}_${idx}`} className="flex flex-col items-center gap-3 cursor-pointer p-6 border border-white/10 rounded-sm hover:border-[#CBA153]/50 transition-colors bg-[#1A1A1A]">
                  <input type="checkbox" name={item.name} value="true" defaultChecked={sp[item.name]} className="w-[19.5px] h-[19.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">5. Infraestrutura do Condomínio</h3>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Selecione os itens disponíveis</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'piscina', label: 'Piscina' },
                { id: 'churrasqueira', label: 'Churrasqueira' },
                { id: 'salao_festas', label: 'Salão de Festas' },
                { id: 'academia', label: 'Academia' },
                { id: 'playground', label: 'Playground' },
                { id: 'quadra', label: 'Quadra Poliesportiva' },
                { id: 'brinquedoteca', label: 'Brinquedoteca' },
                { id: 'jogos', label: 'Salão de Jogos' },
                { id: 'gourmet', label: 'Espaço Gourmet' },
                { id: 'sauna', label: 'Sauna' },
                { id: 'pet_place', label: 'Pet Place' },
                { id: 'caminhada', label: 'Pista de Caminhada' },
                { id: 'coworking', label: 'Coworking' },
                { id: 'bicicletario', label: 'Bicicletário' },
                { id: 'mercado', label: 'Mini Mercado' },
                { id: 'portaria_24h', label: 'PORTARIA 24H' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer p-4 border border-white/5 rounded-sm hover:border-[#CBA153]/30 transition-colors bg-[#1A1A1A]">
                  <input type="checkbox" name={`condo_${item.id}`} value="true" defaultChecked={sp.condo_specs?.[item.id]} className="w-[16.5px] h-[16.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 6. SEGURANÇA */}
          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <h3 className="text-[#CBA153] text-lg font-serif border-b border-[#CBA153]/20 pb-3">6. Segurança</h3>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Selecione os itens disponíveis</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'alarme', label: 'ALARME' },
                { id: 'cerca_eletrica', label: 'CERCA ELÉTRICA' },
                { id: 'camera', label: 'CAMERA' },
                { id: 'portao_automatico', label: 'PORTÃO AUTOMÁTICO' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer p-4 border border-white/5 rounded-sm hover:border-[#CBA153]/30 transition-colors bg-[#1A1A1A]">
                  <input type="checkbox" name={`seg_${item.id}`} value="true" defaultChecked={sp.seguranca_specs?.[item.id]} className="w-[16.5px] h-[16.5px] accent-[#CBA153]" />
                  <span className={labelClass}>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-[#CBA153]/20 pb-3">
              <h3 className="text-[#CBA153] text-lg font-serif">7. Galeria de Fotos ({galleryImages.length}/{MAX_PHOTOS})</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRemoveAll}
                  disabled={galleryImages.length === 0}
                  className="flex items-center gap-2 text-red-400/80 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 rounded-sm px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Trash2 size={14} />
                  Remover Todas
                </button>
                <button
                  type="button"
                  onClick={handleSelectImages}
                  disabled={galleryImages.length >= MAX_PHOTOS}
                  className="flex items-center gap-2 bg-[#CBA153] text-[#121212] rounded-sm px-5 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all shadow-lg disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ImagePlus size={14} />
                  Selecionar Imagens
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Hidden inputs to send gallery URLs with form */}
            {galleryImages.map((img, i) => (
              <input key={img.id} type="hidden" name={`photo_${i + 1}`} value={img.url} />
            ))}

            <div className="grid grid-cols-3 gap-3">
              {[...Array(MAX_PHOTOS)].map((_, i) => {
                const image = galleryImages[i]
                return (
                  <div
                    key={`slot_${i}`}
                    className="relative group rounded-lg overflow-hidden border border-white/5 hover:border-[#CBA153]/30 transition-all"
                    style={{ aspectRatio: '16 / 9' }}
                  >
                    {image ? (
                      <>
                        <img
                          src={image.url}
                          alt={`Foto ${i + 1}`}
                          className={`w-full h-full object-cover transition-opacity ${image.uploading ? 'opacity-40' : 'opacity-100'}`}
                        />
                        {/* Spinner de upload */}
                        {image.uploading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                            <Loader2 size={24} className="text-[#CBA153] animate-spin" />
                            <span className="text-[9px] text-[#CBA153] uppercase tracking-widest font-bold mt-1">Otimizando...</span>
                          </div>
                        )}
                        {/* Botão remover (só aparece se não está em upload) */}
                        {!image.uploading && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.id)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={13} className="text-white" />
                          </button>
                        )}
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-[#CBA153] text-[#121212] text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-sm shadow">
                            Capa
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-[#1A1A1A] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#1E1E1E] transition-colors" onClick={handleSelectImages}>
                        <ImagePlus size={20} className="text-gray-700" />
                        <span className="text-gray-700 text-[9px] uppercase tracking-widest font-bold">{i + 1}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="luxury-card p-8 rounded-xl flex flex-col gap-8 border-l-4 border-l-[#CBA153]">
            <div className="flex justify-between items-end border-b border-[#CBA153]/40 pb-3">
              <h3 className="text-[#CBA153] text-lg font-serif font-bold">8. Informações Restritas (Uso Interno)</h3>
              <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Invisível para Visitantes</p>
            </div>

            <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
              <h4 className="text-[#CBA153] text-[10px] uppercase tracking-[2px] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CBA153] rounded-full"></span> 7.4. Identificação do anunciante
              </h4>

              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start pt-2">
                {/* Interface de Foto (Avatar) */}
                <div className="flex flex-col items-center gap-4">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input type="hidden" name="announcer_photo" value={announcerPhoto || ''} />
                  
                  <div 
                    onClick={handleAvatarSelect}
                    className="relative w-[150px] h-[150px] rounded-full binary-photo-circle cursor-pointer group"
                    style={{ 
                      border: '1px solid #CBA153',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#1A1A1A'
                    }}
                  >
                    {announcerPhoto ? (
                      <>
                        <img src={announcerPhoto} alt="Avatar" className="w-full h-full object-cover" />
                        {isPhotoUploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="text-[#CBA153] animate-spin" size={24} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-[10px] text-white uppercase tracking-widest font-bold">Trocar Imagem</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center gap-2">
                        {isPhotoUploading ? (
                          <Loader2 className="text-[#CBA153] animate-spin" size={24} />
                        ) : (
                          <>
                            <ImagePlus className="text-[#CBA153]/40" size={32} />
                            <p className="text-[9px] text-[#CBA153]/60 uppercase tracking-widest leading-relaxed">
                              click para inserir imagem
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[#CBA153] text-[7.5px] tracking-widest font-medium text-center leading-relaxed">
                    Opcional.<br />
                    Foto do rosto ou<br />
                    logo da empresa
                  </p>

                  {announcerPhoto && !isPhotoUploading && (
                    <button 
                      type="button" 
                      onClick={handleRemoveAvatar}
                      className="text-red-500/70 hover:text-red-500 text-[9px] uppercase tracking-widest font-bold transition-colors"
                    >
                      Apagar Imagem
                    </button>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 w-full">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Nome do anunciante *</label>
                    <input 
                      type="text" 
                      name="announcer_name" 
                      defaultValue={adm.announcer_name || profileData.name} 
                      key={profileData.name}
                       className={`${inputClass} ${errors.announcer_name ? errorClass : ''}`} 
                      onAnimationStart={handleAutoFill}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>E-mail *</label>
                    <input 
                      type="email" 
                      name="announcer_email" 
                      defaultValue={adm.announcer_email || profileData.email} 
                      key={profileData.email}
                       className={`${inputClass} ${errors.announcer_email ? errorClass : ''}`} 
                      onAnimationStart={handleAutoFill}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Telefone WhatsApp *</label>
                    <input 
                      type="text" 
                      name="announcer_whatsapp" 
                      defaultValue={adm.announcer_whatsapp || profileData.whatsapp} 
                      key={profileData.whatsapp}
                      placeholder="(XX) XXXXX-XXXX" 
                       className={`${inputClass} ${errors.announcer_whatsapp ? errorClass : ''}`} 
                      onAnimationStart={handleAutoFill}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Você é... *</label>
                    <select 
                      name="announcer_type" 
                      value={announcerType} 
                       onChange={(e) => setAnnouncerType(e.target.value)}
                      onAnimationStart={handleAutoFill}
                      className={`${selectClass} ${errors.announcer_type ? errorClass : ''}`}
                    >
                      <option value="">Selecione...</option>
                      <option value="Particular">Particular</option>
                      <option value="Profissional">Profissional / Corretor(a)</option>
                    </select>
                  </div>
                  
                  {announcerType === 'Profissional' && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <label className={labelClass}>Número do CRECI *</label>
                      <input 
                        type="text" 
                        name="announcer_creci" 
                        defaultValue={adm.announcer_creci || profileData.creci} 
                        key={profileData.creci}
                         className={`${inputClass} ${errors.announcer_creci ? errorClass : ''}`} 
                        onAnimationStart={handleAutoFill}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Nome da Empresa (Opcional)</label>
                    <input 
                      type="text" 
                      name="announcer_company" 
                      defaultValue={adm.announcer_company || profileData.company} 
                      key={profileData.company}
                      className={inputClass} 
                      onAnimationStart={handleAutoFill}
                    />
                  </div>
                </div>
              </div>
            </div>

          </section>

          <div className="mt-12 px-8 py-3 bg-[#1A1A1A] border-2 border-[#CBA153] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex justify-between items-center backdrop-blur-md">
            <p className="text-sm text-gray-400 font-medium tracking-wide italic">
              Certifique-se de que todos os dados obrigatórios foram preenchidos.
            </p>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#CBA153] text-[#121212] px-16 py-2 rounded-sm font-bold uppercase tracking-[3px] hover:bg-white transition-all text-sm shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {isEdit ? "Salvar Alterações" : "Salvar Novo Imóvel"}
            </button>
          </div>
        </form>
      </main>

      {/* Modal de Crop para Avatar */}
      {isCropping && imageToCrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-[#CBA153]/30 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#CBA153]/20 flex justify-between items-center">
              <h3 className="text-[#CBA153] text-sm uppercase tracking-widest font-bold">Ajustar Imagem</h3>
              <button onClick={handleCancelCrop} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative h-[400px] bg-black">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#CBA153]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  className="flex-1 px-6 py-3 border border-white/10 rounded-sm text-gray-400 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCroppedImage}
                  className="flex-1 px-6 py-3 bg-[#CBA153] text-[#121212] rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Confirmar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
