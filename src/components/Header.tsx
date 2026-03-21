import { Bell, Sun, Moon, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CompanyProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Header = ({ 
  isDark, 
  onThemeToggle,
  companyProfile
}: { 
  isDark: boolean, 
  onThemeToggle: () => void,
  companyProfile: CompanyProfile
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 w-full z-50 glass-effect border-b ${isDark ? 'border-white/10' : 'border-surface-container-high'}`}>
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 min-w-[40px] rounded-full bg-primary-container overflow-hidden ring-2 ring-outline-variant/20">
            <img 
              className="w-full h-full object-cover" 
              src={companyProfile.logo || "https://picsum.photos/seed/carpenter/100/100"} 
              alt="Profile"
              referrerPolicy="no-referrer"
            />
          </div>
            <h1 className={`flex flex-col gap-1 items-start justify-center overflow-hidden`}>
              <span className={`font-headline font-bold text-lg sm:text-xl tracking-tight leading-none truncate w-full max-w-[140px] sm:max-w-[250px] md:max-w-[400px] ${isDark ? 'text-white' : 'text-primary'}`}>
                {companyProfile.name}
              </span>
              {profile && (
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap ${
                  profile.plano === 'free' ? 'bg-zinc-200 text-zinc-600' :
                  profile.plano === 'pro' ? 'bg-primary/20 text-primary' :
                  'bg-emerald-500/20 text-emerald-600'
                }`}>
                  PLANO {profile.plano}
                </span>
              )}
            </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center mr-4 gap-2">
            <button 
              onClick={() => navigate('/orcamentos')} 
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
              title="Novo Orçamento"
            >
               <Plus size={16} /> Novo Orçamento
            </button>
            <button 
              onClick={() => navigate('/clientes')} 
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
              title="Novo Cliente"
            >
               <Plus size={16} /> Novo Cliente
            </button>
          </div>
          <button 
            onClick={onThemeToggle}
            className={`p-2 rounded-xl transition-colors active:scale-95 ${isDark ? 'text-white hover:bg-white/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <button 
            onClick={async () => await supabase.auth.signOut()}
            className={`p-2 rounded-xl transition-colors active:scale-95 ${isDark ? 'text-error hover:bg-error/10' : 'text-error hover:bg-error/10'}`}
            title="Sair (Fazer Logout)"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
