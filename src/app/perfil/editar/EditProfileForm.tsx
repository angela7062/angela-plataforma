'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserProfileRpcAction } from './actions';
import { type Profile, type UserCategory } from '@/types/database';
import { createClient } from '@/lib/supabase';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Interface for profile with details
interface ProfileWithDetails extends Profile {
  email?: string | null; // Added email to the interface
  category?: UserCategory | null;
  company_name?: string | null;
  professional_license?: string | null;
}

interface EditProfileFormProps {
  profile: ProfileWithDetails | null;
}

function FormStatus({ type, message }: { type: 'error' | 'success', message: string }) {
    const baseClasses = "p-4 mt-4 text-sm rounded-md";
    const typeClasses = type === 'error' 
        ? "bg-red-900/50 text-red-300 border border-red-800"
        : "bg-green-900/50 text-green-300 border border-green-800";
    return <div role="alert" className={`${baseClasses} ${typeClasses}`}>{message}</div>
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const supabase = createClient();

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    email: profile?.email || '',
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    category: profile?.category || '',
    company_name: profile?.company_name || '',
    professional_license: profile?.professional_license || '',
  });

  const userCategories: UserCategory[] = [
    'Vendedor Particular', 'Corretor', 'Prestador de Serviço de Manutenção',
    'Engenheiro', 'Arquiteto', 'Construtor', 'Quero Comprar', 'Quero Alugar'
  ];

  const getProfessionalLicenseConfig = (category: string | null) => {
    if (category === 'Corretor') return { label: 'CRECI', placeholder: 'Seu número do CRECI' };
    if (['Engenheiro', 'Arquiteto', 'Construtor', 'Prestador de Serviço de Manutenção'].includes(category || '')) {
      return { label: 'CREA', placeholder: 'Seu número do CREA' };
    }
    return null;
  };

  const professionalLicenseConfig = getProfessionalLicenseConfig(formData.category);
  const showCompanyField = formData.category && !['Vendedor Particular', 'Quero Comprar', 'Quero Alugar'].includes(formData.category);

  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || '',
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        category: profile.category || '',
        company_name: profile.company_name || '',
        professional_license: profile.professional_license || '',
      });
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  useEffect(() => {
    if (!showCompanyField) setFormData(prev => ({ ...prev, company_name: '' }));
    if (!professionalLicenseConfig) setFormData(prev => ({ ...prev, professional_license: '' }));
  }, [formData.category, showCompanyField, professionalLicenseConfig]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      router.back();
    }
    return () => clearTimeout(timer);
  }, [countdown, router]);

  useEffect(() => { if (status) { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      let maskedValue = value.replace(/\D/g, '');
      if (maskedValue.length > 11) maskedValue = maskedValue.substring(0, 11);
      maskedValue = maskedValue.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      maskedValue = maskedValue.replace(/^(\d{2})(\d{1,5})$/, '($1) $2');
      setFormData(prev => ({ ...prev, [name]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    setStatus(null);

    const emailHasChanged = formData.email && formData.email !== profile.email;
    let successMessage = '';

    try {
      const profileUpdateResult = await updateUserProfileRpcAction({
        full_name: formData.full_name,
        whatsapp: formData.phone.replace(/\D/g, ''),
        p_category: formData.category as UserCategory,
        p_company_name: formData.company_name,
        p_professional_license: formData.professional_license,
      });

      if (!profileUpdateResult.success) throw new Error(profileUpdateResult.message);
      successMessage = 'Perfil atualizado com sucesso.';

      if (emailHasChanged) {
        const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
        if (emailError) throw emailError;
        successMessage += ' Um link de confirmação foi enviado para o seu novo e antigo endereço de e-mail.';
      }

      setStatus({ type: 'success', message: successMessage });
      router.refresh();
      setCountdown(8);

    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || "Ocorreu um erro inesperado." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) { const reader = new FileReader(); reader.addEventListener('load', () => setImageToCrop(reader.result as string)); reader.readAsDataURL(e.target.files[0]); } };
  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => { const canvas = document.createElement('canvas'); const scaleX = image.naturalWidth / image.width; const scaleY = image.naturalHeight / image.height; canvas.width = crop.width; canvas.height = crop.height; const ctx = canvas.getContext('2d')!; ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height); return new Promise((resolve, reject) => { canvas.toBlob(blob => { if (!blob) { reject(new Error('Canvas is empty')); return; } resolve(blob); }, 'image/jpeg'); }); };
  const handleAvatarUpload = async () => { if (!imgRef.current || !crop || !crop.width || !crop.height || !profile) return; setIsUploading(true); try { const croppedBlob = await getCroppedImg(imgRef.current, crop); const fileName = `${profile.id}-${Date.now()}.jpg`; const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, croppedBlob, { upsert: true }); if (uploadError) throw uploadError; const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName); await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id); setAvatarUrl(publicUrl); setImageToCrop(null); router.refresh(); } catch (err: any) { setStatus({ type: 'error', message: `Erro: ${err.message || 'Falha ao processar imagem'}` }); } finally { setIsUploading(false); } };
  const handleAvatarDelete = async () => { if (!window.confirm("Tem certeza que deseja apagar seu avatar?") || !profile) return; setIsUploading(true); try { await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id); setAvatarUrl(null); router.refresh(); } catch (err: any) { setStatus({ type: 'error', message: `Erro ao apagar avatar: ${err.message}` }); } finally { setIsUploading(false); } };

  const labelClass = "text-gray-400 text-[10px] tracking-widest uppercase";
  const inputClass = "bg-[#1C1C1C] border border-[#CBA153]/20 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-sm w-full";
  const selectClass = `${inputClass} appearance-none`;

  return (
      <div>
        <form onSubmit={handleSubmit} className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#1C1C1C] border border-[#CBA153]/20 flex items-center justify-center overflow-hidden cursor-pointer group relative" style={{ width: '96px', height: '96px'}} onClick={() => !profile ? () => {} : avatarInputRef.current?.click()}>
                  {avatarUrl ? (<><img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs text-center">Trocar Foto</span></div></>) : (<span className="text-gray-400 text-sm text-center leading-tight">Carregar<br />Avatar</span>)}
              </div>
              <div className="flex gap-4 items-center">
                  <input type="file" ref={avatarInputRef} onChange={onSelectFile} accept="image/*" className="hidden" disabled={!profile} />
                  {!avatarUrl && (<button type="button" onClick={() => avatarInputRef.current?.click()} className="text-sm text-[#CBA153] hover:text-white" disabled={!profile}>Carregar Imagem</button>)}
                  {avatarUrl && (<button type="button" onClick={handleAvatarDelete} className="text-sm text-red-500 hover:text-red-400" disabled={isUploading || !profile}>Apagar Avatar</button>)}
              </div>
            </div>
            
            <div className="flex gap-4">
                <div className="w-1/2 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <label htmlFor="email" className={labelClass}>Email</label>
                        <span className="text-[#CBA153] text-xs mt-0.5">*</span>
                    </div>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="seu@email.com" disabled={!profile || isSubmitting} aria-describedby="email-description" />
                    <p id="email-description" className="text-xs text-gray-500 mt-1">
                        * Alterar o e-mail requer confirmação no endereço antigo e no novo.
                    </p>
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                    <label htmlFor="full_name" className={labelClass}>Nome Completo</label>
                    <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} className={inputClass} placeholder="Seu nome como aparecerá publicamente" disabled={!profile || isSubmitting} />
                </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-[30%] flex flex-col gap-2">
                  <label htmlFor="phone" className={labelClass}>Telefone / WhatsApp</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="(99) 99999-9999" maxLength={15} disabled={!profile || isSubmitting} />
              </div>
              <div className="w-[70%] flex flex-col gap-2">
                <label htmlFor="category" className={labelClass}>Você é?</label>
                <select id="category" name="category" value={formData.category || ''} onChange={handleInputChange} className={selectClass} disabled={!profile || isSubmitting}>
                  <option value="" disabled>Selecione uma categoria...</option>
                  {userCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>

            {showCompanyField && (
              <div className="flex w-full gap-6 animate-in fade-in">
                {professionalLicenseConfig && (
                  <div className="flex flex-col gap-2 w-[30%]">
                    <label htmlFor="professional_license" className={labelClass}>{professionalLicenseConfig.label}</label>
                    <input type="text" id="professional_license" name="professional_license" value={formData.professional_license} onChange={handleInputChange} className={inputClass} placeholder={professionalLicenseConfig.placeholder} disabled={!profile || isSubmitting} />
                  </div>
                )}
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="company_name" className={labelClass}>Nome da Empresa/Imobiliária</label>
                  <input type="text" id="company_name" name="company_name" value={formData.company_name || ''} onChange={handleInputChange} className={inputClass} placeholder="Ex: Imobiliária Imperial" disabled={!profile || isSubmitting} />
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-700/50 pt-6 flex justify-end items-center gap-4 mt-4">
                <button type="button" onClick={() => router.back()} className="text-gray-400 text-sm hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={!profile || isSubmitting || isUploading} className="bg-[#CBA153] text-[#121212] py-2.5 px-6 rounded-sm font-bold disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            {status && <FormStatus type={status.type} message={status.message} />}
        </form>

         {imageToCrop && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-[#1C1C1C] p-6 rounded-lg max-w-lg w-full"><p className="text-white mb-4">Ajuste sua imagem</p><ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} circularCrop><img ref={imgRef} src={imageToCrop} alt="Recortar" style={{ maxHeight: '70vh' }} /></ReactCrop><div className="flex justify-end gap-4 mt-4"><button onClick={() => setImageToCrop(null)} className="text-gray-400">Cancelar</button><button onClick={handleAvatarUpload} disabled={isUploading} className="bg-[#CBA153] text-[#121212] py-2 px-4 rounded-sm font-bold disabled:opacity-50">{isUploading ? 'Enviando...' : 'Salvar Avatar'}</button></div></div></div>)}
      </div>
  );
}
