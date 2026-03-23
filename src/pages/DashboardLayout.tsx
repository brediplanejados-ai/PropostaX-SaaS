import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Material, FixedCost, CatalogMaterial, Budget, CompanyProfile } from '../types';
import { MOCK_MATERIALS, MOCK_BUDGET } from '../data';

type Tab = 'dashboard' | 'budgets' | 'settings' | 'fixed-costs';

export function DashboardLayout() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [budgets, setBudgets] = useState<Budget[]>([]);
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
  const [fixedCosts, setFixedCosts] = useState<{ operacional: FixedCost[], pessoal: FixedCost[] }>({
    operacional: [],
    pessoal: []
  });

  // Sync activeTab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/budgets') setActiveTab('budgets');
    else if (path === '/settings') setActiveTab('settings');
    else if (path === '/fixed-costs') setActiveTab('fixed-costs');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      supabase.from('orcamentos')
        .select('*')
        .order('data_criacao', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setBudgets(data.map(row => row.dados_json as Budget));
          }
        });

      supabase.from('configuracoes')
        .select('*')
        .eq('tenant_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.perfil_empresa) setCompanyProfile(data.perfil_empresa);
            if (data.catalogo_materiais) setCatalogMaterials(data.catalogo_materiais);
            if (data.custos_fixos) setFixedCosts(data.custos_fixos);
          } else {
            supabase.from('configuracoes').upsert({
              tenant_id: user.id,
              perfil_empresa: companyProfile,
              catalogo_materiais: catalogMaterials,
              custos_fixos: fixedCosts
            }).then();
          }
        });
    }
  }, [user]);


  const handleProfileChange = async (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    if (!user) return;
    await supabase.from('configuracoes').update({ perfil_empresa: profile }).eq('tenant_id', user.id);
  };

  const handleCatalogChange = async (catalog: CatalogMaterial[]) => {
    setCatalogMaterials(catalog);
    if (!user) return;
    await supabase.from('configuracoes').update({ catalogo_materiais: catalog }).eq('tenant_id', user.id);
  };

  const handleFixedCostsChange = async (costs: { operacional: FixedCost[], pessoal: FixedCost[] }) => {
    setFixedCosts(costs);
    if (!user) return;
    await supabase.from('configuracoes').update({ custos_fixos: costs }).eq('tenant_id', user.id);
  };

  const handleAddBudget = async (newBudget: Budget) => {
    if (!user) return;
    
    // Optimistic UI
    setBudgets([newBudget, ...budgets]);
    setSelectedBudgetId(newBudget.id);
    setActiveTab('budgets');
    
    const { error } = await supabase.from('orcamentos').insert({
      id: newBudget.id,
      tenant_id: user.id,
      titulo: newBudget.title,
      ambiente: newBudget.environment,
      descricao: '',
      valor_total: 0,
      dados_json: newBudget
    });

    if (error) {
      console.error(error);
    }
  };

  const updateCurrentBudget = async (updates: Partial<Budget>) => {
    if (!selectedBudgetId) return;
    const oldBudget = budgets.find(b => b.id === selectedBudgetId);
    if (!oldBudget) return;
    
    const updatedBudget = { ...oldBudget, ...updates };
    setBudgets(budgets.map(b => b.id === selectedBudgetId ? updatedBudget : b));
    
    const { error } = await supabase.from('orcamentos').update({
      titulo: updatedBudget.title,
      ambiente: updatedBudget.environment,
      valor_total: updatedBudget.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0) * (1 + (updatedBudget.margin / 100)),
      dados_json: updatedBudget
    }).eq('id', selectedBudgetId);

    if (error) {
       console.error(error);
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            budgets={budgets} 
            companyProfile={companyProfile}
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
                onThemeToggle={toggleTheme}
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
            onDeleteBudget={async (id) => {
              setBudgets(budgets.filter(b => b.id !== id));
              await supabase.from('orcamentos').delete().eq('id', id);
            }}
            isDark={isDark}
          />
        );
      case 'fixed-costs':
        return (
          <FixedCosts 
            fixedCosts={fixedCosts}
            onFixedCostsChange={handleFixedCostsChange}
            isDark={isDark}
          />
        );
      case 'settings':
        return (
          <Settings 
            isDark={isDark}
            profile={companyProfile}
            onProfileChange={handleProfileChange}
            catalogMaterials={catalogMaterials}
            onCatalogChange={handleCatalogChange}
          />
        );
      default:
        return (
          <Dashboard 
            budgets={budgets} 
            companyProfile={companyProfile}
            fixedCosts={fixedCosts}
            onNavigateToFixedCosts={() => setActiveTab('fixed-costs')} 
            isDark={isDark}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen pb-24 sm:pb-32 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-surface text-on-surface'}`}>
      <Header 
        isDark={isDark} 
        onThemeToggle={toggleTheme} 
        companyProfile={companyProfile}
      />
      
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
          className="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full ambient-shadow flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
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
