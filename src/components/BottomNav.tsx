import React from 'react';
import { LayoutDashboard, FileText, Package, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200",
      active 
        ? "bg-primary text-white rounded-xl scale-100" 
        : "text-on-surface-variant hover:text-primary scale-90"
    )}
  >
    <Icon size={20} className={cn("mb-0.5", active && "fill-current")} />
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-surface-container-high rounded-t-3xl ambient-shadow px-4 pb-6 pt-3 flex justify-around items-center max-w-7xl mx-auto left-1/2 -translate-x-1/2">
      <NavItem 
        icon={LayoutDashboard} 
        label="Dashboard" 
        active={activeTab === 'dashboard'} 
        onClick={() => onTabChange('dashboard')}
      />
      <NavItem 
        icon={FileText} 
        label="Orçamentos" 
        active={activeTab === 'budgets'} 
        onClick={() => onTabChange('budgets')}
      />
      <NavItem 
        icon={Package} 
        label="Materiais" 
        active={activeTab === 'materials'} 
        onClick={() => onTabChange('materials')}
      />
      <NavItem 
        icon={Settings} 
        label="Ajustes" 
        active={activeTab === 'settings'} 
        onClick={() => onTabChange('settings')}
      />
    </nav>
  );
};
