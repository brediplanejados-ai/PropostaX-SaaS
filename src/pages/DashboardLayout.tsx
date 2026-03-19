import { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Dashboard } from './Dashboard';
import { BudgetDetail } from './BudgetDetail';
import { FixedCosts } from './FixedCosts';
import { Materials } from './Materials';
import { NewClientModal } from '../components/NewClientModal';
import { BudgetList } from './BudgetList';
import { Settings } from './Settings';
import { Plus, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Material, FixedCost, CatalogMaterial, Budget, CompanyProfile } from '../types';
import { MOCK_MATERIALS, MOCK_BUDGET } from '../data';

type Tab = 'dashboard' | 'budgets' | 'materials' | 'settings' | 'fixed-costs';

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [budgets, setBudgets] = useState<Budget[]>([MOCK_BUDGET]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: 'PropostaX',
    budgetTerms: 'Este orçamento tem validade de 15 dias. O prazo de entrega é de 30 a 45 dias úteis após a aprovação do projeto e pagamento da entrada.',
    showDetails: true,
    cnpj: '00.000.000/0001-00',
    address: 'Rua das Madeiras, 123 - Marcenaria, SP',
    phone: '(11) 99999-9999',
    email: 'contato@propostax.com'
  });
  
  const currentBudget = budgets.find(b => b.id === selectedBudgetId);

  const [catalogMaterials, setCatalogMaterials] = useState<CatalogMaterial[]>(MOCK_MATERIALS);
  const [isDark, setIsDark] = useState(false);
  const [fixedCosts, setFixedCosts] = useState<{ operacional: FixedCost[], pessoal: FixedCost[] }>({
    operacional: [],
    pessoal: []
  });

  const handleAddBudget = (newBudget: Budget) => {
    setBudgets([newBudget, ...budgets]);
    setSelectedBudgetId(newBudget.id);
    setActiveTab('budgets');
  };

  const updateCurrentBudget = (updates: Partial<Budget>) => {
    if (!selectedBudgetId) return;
    setBudgets(budgets.map(b => b.id === selectedBudgetId ? { ...b, ...updates } : b));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            materials={budgets[0]?.materials || []} 
            fixedCosts={fixedCosts}
            onNavigateToFixedCosts={() => setActiveTab('fixed-costs')} 
            isDark={isDark}
          />
        );
      case 'budgets':
        if (selectedBudgetId && currentBudget) {
          return (
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedBudgetId(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <ChevronLeft size={18} />
                Voltar para Lista
              </button>
              <BudgetDetail 
                budget={currentBudget}
                onBudgetChange={updateCurrentBudget}
                catalogMaterials={catalogMaterials}
                isDark={isDark}
                onThemeToggle={() => setIsDark(!isDark)}
                companyProfile={companyProfile}
              />
            </div>
          );
        }
        return (
          <BudgetList 
            budgets={budgets}
            onSelectBudget={setSelectedBudgetId}
            onNewBudget={() => setIsNewClientModalOpen(true)}
            onDeleteBudget={(id) => setBudgets(budgets.filter(b => b.id !== id))}
            isDark={isDark}
          />
        );
      case 'fixed-costs':
        return (
          <FixedCosts 
            fixedCosts={fixedCosts}
            onFixedCostsChange={setFixedCosts}
            isDark={isDark}
          />
        );
      case 'materials':
        return (
          <Materials 
            isDark={isDark} 
            catalogMaterials={catalogMaterials}
            onCatalogChange={setCatalogMaterials}
          />
        );
      case 'settings':
        return (
          <Settings 
            isDark={isDark}
            profile={companyProfile}
            onProfileChange={setCompanyProfile}
          />
        );
      default:
        return (
          <Dashboard 
            materials={budgets[0]?.materials || []} 
            fixedCosts={fixedCosts}
            onNavigateToFixedCosts={() => setActiveTab('fixed-costs')} 
            isDark={isDark}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-surface text-on-surface'}`}>
      <Header 
        isDark={isDark} 
        onThemeToggle={() => setIsDark(!isDark)} 
        companyProfile={companyProfile}
      />
      
      <main className="pt-24 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Contextual FAB */}
      {activeTab === 'dashboard' && (
        <button 
          onClick={() => setIsNewClientModalOpen(true)}
          className="fixed right-6 bottom-24 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full ambient-shadow flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
        >
          <Plus size={24} />
        </button>
      )}

      <NewClientModal 
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onAdd={handleAddBudget}
        isDark={isDark}
      />

      <BottomNav 
        activeTab={activeTab === 'fixed-costs' ? 'dashboard' : activeTab} 
        onTabChange={(tab) => setActiveTab(tab as Tab)} 
      />
    </div>
  );
}
