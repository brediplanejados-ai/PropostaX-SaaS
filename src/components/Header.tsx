import { Bell, Sun, Moon, LogOut, Crown } from 'lucide-react';
import { CompanyProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Header = ({ 
  isDark, 
  onThemeToggle,
  companyProfile
}: { 
  isDark: boolean, 
  onThemeToggle: () => void,
  companyProfile: CompanyProfile
}) => {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <header className={`fixed top-0 w-full z-50 glass-effect border-b ${isDark ? 'border-white/10' : 'border-surface-container-high'}`}>
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden ring-2 ring-outline-variant/20">
            <img 
              className="w-full h-full object-cover" 
              src={companyProfile.logo || "https://picsum.photos/seed/carpenter/100/100"} 
              alt="Profile"
              referrerPolicy="no-referrer"
            />
          </div>
            <h1 className={`flex flex-col gap-1 items-start justify-center`}>
              <span className={`font-headline font-bold text-xl tracking-tight leading-none ${isDark ? 'text-white' : 'text-primary'}`}>
                {companyProfile.name}
              </span>
              {profile && (
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
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
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 py-1.5 mr-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-amber-500/20 hover:scale-105 transition-transform"
              title="Acessar Modo Deus (Painel SaaS)"
            >
              <Crown size={14} />
              SaaS Admin
            </button>
          )}
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
