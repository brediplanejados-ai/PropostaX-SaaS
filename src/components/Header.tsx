import { Bell, Sun, Moon } from 'lucide-react';
import { CompanyProfile } from '../types';

export const Header = ({ 
  isDark, 
  onThemeToggle,
  companyProfile
}: { 
  isDark: boolean, 
  onThemeToggle: () => void,
  companyProfile: CompanyProfile
}) => {
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
          <h1 className={`font-headline font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-primary'}`}>
            {companyProfile.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onThemeToggle}
            className={`p-2 rounded-xl transition-colors active:scale-95 ${isDark ? 'text-white hover:bg-white/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className={`p-2 rounded-xl transition-colors active:scale-95 ${isDark ? 'text-white hover:bg-white/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            <Bell size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
