import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Building2, Upload, Trash2, Save, CheckCircle2, FileText, Layout } from 'lucide-react';
import { CompanyProfile } from '../types';
import { cn } from '../lib/utils';

interface SettingsProps {
  isDark: boolean;
  profile: CompanyProfile;
  onProfileChange: (profile: CompanyProfile) => void;
}

export const Settings = ({ isDark, profile, onProfileChange }: SettingsProps) => {
  const [tempProfile, setTempProfile] = useState<CompanyProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onProfileChange(tempProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const removeLogo = () => {
    setTempProfile({ ...tempProfile, logo: undefined });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div>
        <h2 className={cn(
          "text-3xl font-extrabold tracking-tight",
          isDark ? "text-white" : "text-on-surface"
        )}>Configurações</h2>
        <p className={cn(
          "font-medium",
          isDark ? "text-white/60" : "text-on-surface-variant"
        )}>Personalize sua conta e perfil da empresa</p>
      </div>

      <section className={cn(
        "p-8 rounded-3xl border ambient-shadow space-y-8",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <h3 className={cn(
            "text-xl font-bold tracking-tight",
            isDark ? "text-white" : "text-on-surface"
          )}>Perfil da Empresa</h3>
        </div>

        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <label className={cn(
              "text-[10px] font-bold uppercase tracking-widest ml-1",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )}>Logotipo da Empresa</label>
            
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative group",
                isDark ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"
              )}>
                {tempProfile.logo ? (
                  <>
                    <img 
                      src={tempProfile.logo} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={removeLogo}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <Upload size={24} className="mx-auto mb-1 opacity-40" />
                    <span className="text-[10px] font-bold opacity-40">SUBIR LOGO</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <Upload size={16} />
                  Escolher Imagem
                </button>
                <p className={cn(
                  "text-[10px] font-medium",
                  isDark ? "text-white/40" : "text-zinc-400"
                )}>Recomendado: PNG ou JPG, 512x512px</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className={cn(
              "text-[10px] font-bold uppercase tracking-widest ml-1",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )}>Nome da Empresa</label>
            <input 
              type="text"
              value={tempProfile.name}
              onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
              placeholder="Ex: Marcenaria Digital"
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all",
                isDark 
                  ? "bg-zinc-800 border-zinc-700 text-white focus:ring-1 ring-primary" 
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-1 ring-primary border"
              )}
            />
          </div>
        </div>
      </section>

      <section className={cn(
        "p-8 rounded-3xl border ambient-shadow space-y-8",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText size={20} />
          </div>
          <h3 className={cn(
            "text-xl font-bold tracking-tight",
            isDark ? "text-white" : "text-on-surface"
          )}>Configurações do Orçamento</h3>
        </div>

        <div className="space-y-6">
          {/* Budget Terms */}
          <div className="space-y-2">
            <label className={cn(
              "text-[10px] font-bold uppercase tracking-widest ml-1",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )}>Orçamento por Escrito (Termos e Condições)</label>
            <textarea 
              value={tempProfile.budgetTerms}
              onChange={(e) => setTempProfile({ ...tempProfile, budgetTerms: e.target.value })}
              placeholder="Ex: Validade do orçamento, prazos de entrega, condições de pagamento..."
              rows={4}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none",
                isDark 
                  ? "bg-zinc-800 border-zinc-700 text-white focus:ring-1 ring-primary" 
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-1 ring-primary border"
              )}
            />
          </div>

          {/* Show Details Toggle */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-2xl",
            isDark ? "bg-white/5" : "bg-zinc-50"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Layout size={16} />
              </div>
              <div>
                <p className={cn(
                  "text-sm font-bold",
                  isDark ? "text-white" : "text-zinc-900"
                )}>Mostrar Detalhamentos</p>
                <p className={cn(
                  "text-[10px] font-medium",
                  isDark ? "text-white/40" : "text-zinc-400"
                )}>Exibir lista de materiais no arquivo final</p>
              </div>
            </div>
            <button
              onClick={() => setTempProfile({ ...tempProfile, showDetails: !tempProfile.showDetails })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                tempProfile.showDetails ? "bg-primary" : "bg-zinc-300"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                tempProfile.showDetails ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>
      </section>

      <div className="pt-4">
        <button 
          onClick={handleSave}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ambient-shadow",
            isSaved 
              ? "bg-emerald-500 text-white" 
              : "bg-primary text-white hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {isSaved ? (
            <>
              <CheckCircle2 size={18} />
              Salvo com Sucesso
            </>
          ) : (
            <>
              <Save size={18} />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
