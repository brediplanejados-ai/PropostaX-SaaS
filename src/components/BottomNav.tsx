import React from 'react';
import { LayoutDashboard, FileText, Package, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface NavItemProps {
  icon: React.ElementType | React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick, id }: NavItemProps & { id?: string }) => {
  const isDashboard = id === 'dashboard';

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center px-2 py-1.5 transition-all duration-200 min-w-[64px]",
        active
          ? isDashboard
            ? "bg-primary text-white rounded-full p-3 -translate-y-4 shadow-lg shadow-primary/30 scale-110"
            : "text-primary scale-100"
          : "text-on-surface-variant hover:text-primary scale-90"
      )}
    >
      {React.isValidElement(Icon) ? (
        <div className={cn("mb-0.5 flex w-5 h-5 items-center justify-center", active ? "[&>svg]:stroke-current" : "")}>
          {Icon}
        </div>
      ) : (
        // @ts-ignore
        <Icon size={isDashboard && active ? 24 : 20} className={cn(isDashboard && active ? "mb-0" : "mb-0.5", active && "fill-current")} />
      )}
      {!(isDashboard && active) && (
        <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-center leading-none">{label}</span>
      )}
    </button>
  );
};

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDark: boolean;
}

export const BottomNav = ({ activeTab, onTabChange, isDark }: BottomNavProps) => {
  const navigate = useNavigate();

  const MENU_ITEMS: Array<{ id: string; label: string; icon: any; path?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budgets', label: 'Orçamentos', icon: FileText },
    { id: 'materials', label: 'Materiais', icon: Package },
    { id: 'settings', label: 'Ajustes', icon: Settings }
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 w-full z-50 rounded-t-3xl px-2 pb-6 pt-3 flex justify-evenly items-center max-w-7xl mx-auto left-1/2 -translate-x-1/2",
      isDark 
        ? "bg-[#121214]/80 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_30px_rgb(0,0,0,0.5)]" 
        : "bg-white border-t border-surface-container-high ambient-shadow"
    )}>
      {MENU_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          id={item.id}
          icon={item.icon}
          label={item.label}
          active={activeTab === item.id || window.location.pathname === item.path}
          onClick={() => {
            if (item.path) {
              navigate(item.path);
            } else {
              onTabChange(item.id);
            }
          }}
        />
      ))}
    </nav>
  );
};
