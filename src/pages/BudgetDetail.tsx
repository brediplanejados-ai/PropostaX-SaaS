import { useState, useMemo, useRef } from 'react';
import { ChevronRight, Package, Wrench, BarChart3, FileText, Search, Plus, Trash2, Edit3, Sun, Moon, User, Phone, MapPin, Home, Download, FileImage, Sparkles, Send, Loader2, FileSignature, Gavel, X, Image } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MOCK_MATERIALS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Material, CatalogMaterial, Budget, CompanyProfile } from '../types';
import { generateBudgetWithAI, generateContractWithAI } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

export const BudgetDetail = ({ 
  budget,
  onBudgetChange,
  catalogMaterials,
  isDark,
  onThemeToggle,
  companyProfile
}: { 
  budget: Budget,
  onBudgetChange: (budget: Partial<Budget>) => void,
  catalogMaterials: CatalogMaterial[],
  isDark: boolean,
  onThemeToggle: () => void,
  companyProfile: CompanyProfile
}) => {
  const { materials, labor, margin, title, clientName, clientPhone, clientAddress, environment, ref } = budget;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [contractText, setContractText] = useState('');
  const [isContractLoading, setIsContractLoading] = useState(false);
  const budgetRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);
  
  // New material form state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newItem, setNewItem] = useState({
    description: '',
    spec: '',
    qty: 1,
    unitPrice: 0,
    unit: 'Unid',
    laborCost: 0,
    laborDescription: ''
  });

  // New labor form state
  const [isAddingLabor, setIsAddingLabor] = useState(false);
  const [newLabor, setNewLabor] = useState({
    role: '',
    description: '',
    value: 0
  });

  const handleExport = async (format: 'pdf' | 'png') => {
    if (!budgetRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(budgetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0a0a0a' : '#ffffff'
      });
      
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `Orcamento_${clientName}_${environment}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Orcamento_${clientName}_${environment}.pdf`);
      }
    } catch (error) {
      console.error('Error generating budget:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportDetails = async () => {
    const element = document.getElementById('cutting-plan-export');
    if (!element) return;
    
    setIsGenerating(true);
    element.classList.remove('hidden');
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0a0a0a' : '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Plano-Corte-${ref}-${clientName}.pdf`);
    } catch (error) {
      console.error('Export details failed:', error);
    } finally {
      element.classList.add('hidden');
      setIsGenerating(false);
    }
  };

  const handleExportProposal = async () => {
    if (!proposalRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(proposalRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Proposta_Orcamento_${clientName}_${environment}.pdf`);
    } catch (error) {
      console.error('Export proposal failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateContract = async () => {
    setShowContractModal(true);
    setIsContractLoading(true);
    try {
      const text = await generateContractWithAI(budget, companyProfile, finalPrice);
      setContractText(text);
    } catch (error) {
      console.error('Failed to generate contract:', error);
    } finally {
      setIsContractLoading(false);
    }
  };

  const handleExportContract = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (2 * margin);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    const splitText = pdf.splitTextToSize(contractText.replace(/[#*]/g, ''), contentWidth);
    let y = 35;
    
    splitText.forEach((line: string) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += 6;
    });
    
    pdf.save(`Contrato-${ref}-${clientName}.pdf`);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      const generatedData = await generateBudgetWithAI(aiPrompt, budget);
      onBudgetChange(generatedData);
      setShowAiModal(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating budget with AI:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Olá ${clientName}! Segue o orçamento para o ambiente ${environment}.\nValor Total: R$ ${finalPrice.toFixed(2)}\n\nRef: ${ref}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodedText}`, '_blank');
  };
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return catalogMaterials.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, catalogMaterials]);

  const handleAddMaterial = () => {
    if (!newItem.description) return;
    onBudgetChange({ materials: [...materials, { ...newItem }] });
    setNewItem({ 
      description: '', 
      spec: '', 
      qty: 1, 
      unitPrice: 0, 
      unit: 'Unid',
      laborCost: 0,
      laborDescription: ''
    });
    setSearchQuery('');
  };

  const handleRemoveMaterial = (index: number) => {
    onBudgetChange({ materials: materials.filter((_, i) => i !== index) });
  };

  const updateMaterial = (index: number, updates: Partial<Material>) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], ...updates };
    onBudgetChange({ materials: newMaterials });
  };

  const handleAddLabor = () => {
    if (!newLabor.role) return;
    onBudgetChange({ labor: [...labor, { ...newLabor }] });
    setNewLabor({ role: '', description: '', value: 0 });
    setIsAddingLabor(false);
  };

  const handleRemoveLabor = (index: number) => {
    onBudgetChange({ labor: labor.filter((_, i) => i !== index) });
  };

  const updateLabor = (index: number, updates: Partial<{ role: string; description: string; value: number }>) => {
    const newLabor = [...labor];
    newLabor[index] = { ...newLabor[index], ...updates };
    onBudgetChange({ labor: newLabor });
  };

  const pureMaterialCosts = useMemo(() => 
    materials.reduce((acc, m) => acc + (m.qty * m.unitPrice), 0)
  , [materials]);

  const itemLaborCosts = useMemo(() => 
    materials.reduce((acc, m) => acc + (m.laborCost || 0), 0)
  , [materials]);

  const directLaborCosts = useMemo(() => 
    labor.reduce((acc, l) => acc + l.value, 0)
  , [labor]);

  const totalLaborCosts = itemLaborCosts + directLaborCosts;
  const totalCosts = pureMaterialCosts + totalLaborCosts;
  
  // Local state for cost and price to allow manual overrides
  const [manualCost, setManualCost] = useState<number | null>(null);
  const [manualPrice, setManualPrice] = useState<number | null>(null);

  const currentCost = manualCost !== null ? manualCost : totalCosts;
  
  // New calculation logic: Margin applied only to pure material costs
  // Price = (MaterialCost / (1 - Margin)) + LaborCost
  const autoFinalPrice = pureMaterialCosts > 0 
    ? (pureMaterialCosts / (1 - margin)) + totalLaborCosts 
    : totalLaborCosts;

  const finalPrice = manualPrice !== null ? manualPrice : autoFinalPrice;

  const handleCostChange = (value: number) => {
    setManualCost(value);
    // When total cost is manually changed, we maintain the current margin logic if possible
    // but it's tricky since we don't know the material/labor split of the manual value.
    // For simplicity, we'll just update the price using the standard margin on the whole value
    setManualPrice(value / (1 - margin));
  };

  const handleFinalPriceChange = (value: number) => {
    setManualPrice(value);
    if (pureMaterialCosts === 0) return;
    
    // Reverse calculation for margin when applied only to materials:
    // Margin = 1 - (MaterialCost / (Price - LaborCost))
    const priceForMaterials = value - totalLaborCosts;
    if (priceForMaterials <= 0) {
      onBudgetChange({ margin: 0 });
    } else {
      const newMargin = 1 - (pureMaterialCosts / priceForMaterials);
      onBudgetChange({ margin: Math.max(0, Math.min(0.99, newMargin)) });
    }
  };

  const handleMarginChange = (newMargin: number) => {
    onBudgetChange({ margin: newMargin });
    // Reset manual price to use the new automatic calculation
    setManualPrice(null);
  };

  return (
    <div className="relative">
      {/* Export Buttons */}
      <div className="fixed bottom-32 right-8 flex flex-col gap-3 z-50">
        <button
          onClick={() => setShowAiModal(true)}
          className={cn(
            "p-4 rounded-2xl bg-amber-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2",
            isAiLoading && "opacity-50 cursor-not-allowed"
          )}
          title="Gerar com IA"
        >
          <Sparkles size={24} />
          <span className="font-bold text-xs uppercase tracking-widest">IA</span>
        </button>
        <button
          onClick={handleShareWhatsApp}
          className="p-4 rounded-2xl bg-emerald-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
          title="Compartilhar no WhatsApp"
        >
          <Send size={24} />
          <span className="font-bold text-xs uppercase tracking-widest">ZAP</span>
        </button>
        <button
          onClick={handleGenerateContract}
          className="p-4 rounded-2xl bg-indigo-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
          title="Gerar Contrato"
        >
          <FileSignature size={24} />
          <span className="font-bold text-xs uppercase tracking-widest">CONTRATO</span>
        </button>
        <button
          onClick={() => setShowProposalModal(true)}
          className="p-4 rounded-2xl bg-primary text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
          title="Gerar Proposta de Orçamento"
        >
          <FileText size={24} />
          <span className="font-bold text-xs uppercase tracking-widest">ORÇAMENTO</span>
        </button>
      </div>

      <motion.div 
        ref={budgetRef}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "space-y-10 p-8 rounded-[40px]",
          isDark ? "bg-[#0a0a0a]" : "bg-white"
        )}
      >
        {/* Company Header for Export */}
        <div className="flex items-center justify-between border-b border-zinc-200/10 pb-8 mb-8">
          <div className="flex items-center gap-4">
            {companyProfile.logo && (
              <img src={companyProfile.logo} alt="Logo" className="w-16 h-16 object-contain" />
            )}
            <div>
              <h1 className={cn(
                "text-2xl font-black tracking-tighter uppercase",
                isDark ? "text-white" : "text-zinc-900"
              )}>{companyProfile.name}</h1>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest opacity-50",
                isDark ? "text-white" : "text-zinc-500"
              )}>Orçamento Profissional</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-primary">REF: {ref}</p>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-widest opacity-50",
              isDark ? "text-white" : "text-zinc-500"
            )}>{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <nav className={`flex items-center gap-2 text-sm mb-4 ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>
            <span>Orçamentos</span>
            <ChevronRight size={14} />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-on-surface'}`}>Detalhamento Técnico</span>
          </nav>
          
          <div className="flex flex-col gap-2 group">
            {isEditingClient ? (
              <div data-html2canvas-ignore className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Nome do Cliente</label>
                    <input
                      autoFocus
                      type="text"
                      value={clientName}
                      onChange={(e) => onBudgetChange({ clientName: e.target.value })}
                      className={`text-2xl font-bold bg-transparent border-b-2 border-primary outline-none w-full ${isDark ? 'text-white' : 'text-on-surface'}`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Ambiente</label>
                    <input
                      type="text"
                      value={environment}
                      onChange={(e) => onBudgetChange({ environment: e.target.value })}
                      className={`text-2xl font-bold bg-transparent border-b-2 border-primary outline-none w-full ${isDark ? 'text-white' : 'text-on-surface'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Celular</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => onBudgetChange({ clientPhone: e.target.value })}
                      className={`text-sm bg-transparent border-b border-primary/30 outline-none w-full ${isDark ? 'text-white' : 'text-on-surface'}`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Endereço</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => onBudgetChange({ clientAddress: e.target.value })}
                      className={`text-sm bg-transparent border-b border-primary/30 outline-none w-full ${isDark ? 'text-white' : 'text-on-surface'}`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsEditingClient(false)}
                    className="px-4 py-1 bg-primary text-white text-xs font-bold rounded-lg"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingClient(true)}
                className="cursor-pointer hover:bg-primary/5 p-2 -ml-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h2 className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-on-surface'}`}>
                    {clientName}
                  </h2>
                  <Edit3 size={20} className="opacity-0 group-hover:opacity-50 text-primary" />
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-primary' : 'text-primary'}`}>
                  {environment}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>
                    <FileText size={14} /> {title}
                  </p>
                  <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>
                    Ref: {ref}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-2xl">
            <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-white/5' : 'bg-surface-container-low'}`}>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Phone size={16} />
              </div>
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-on-surface-variant'}`}>Celular</p>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-on-surface'}`}>{clientPhone}</p>
              </div>
            </div>
            <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-white/5' : 'bg-surface-container-low'}`}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <MapPin size={16} />
              </div>
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-on-surface-variant'}`}>Endereço</p>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-on-surface'}`}>{clientAddress}</p>
              </div>
            </div>
          </div>
          
          <p className={`mt-4 font-medium ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Ref: {ref}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            data-html2canvas-ignore
            onClick={onThemeToggle}
            className={`p-3 rounded-2xl transition-colors active:scale-95 ambient-shadow ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {isDark ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          
          <div className="flex gap-4">
            <div className={`p-4 rounded-2xl border-l-4 min-w-[180px] ambient-shadow ${isDark ? 'bg-white/5 border-white/20' : 'bg-surface-container-low border-outline-variant'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>VALOR DE CUSTO</p>
              <div className={`flex items-center text-2xl font-extrabold tracking-tighter ${isDark ? 'text-white' : 'text-on-surface'}`}>
                <span className="mr-1">R$</span>
                <input 
                  type="number"
                  value={currentCost.toFixed(2)}
                  onChange={(e) => handleCostChange(Number(e.target.value))}
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border-l-4 min-w-[220px] ambient-shadow ${isDark ? 'bg-tertiary-container/10 border-tertiary-fixed-dim' : 'bg-tertiary-container/5 border-on-tertiary-container'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>VALOR A SER COBRADO</p>
              <div className={`flex items-center text-3xl font-extrabold tracking-tighter ${isDark ? 'text-tertiary-fixed-dim' : 'text-on-tertiary-container'}`}>
                <span className="mr-1">R$</span>
                <input 
                  type="number"
                  value={finalPrice.toFixed(2)}
                  onChange={(e) => handleFinalPriceChange(Number(e.target.value))}
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Materials Table */}
          {companyProfile.showDetails && (
            <section className={`rounded-2xl p-6 ${isDark ? 'bg-white/5' : 'bg-surface-container-low'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white">
                    <Package size={20} />
                  </div>
                  <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-on-surface'}`}>Tabela de Materiais</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/10 text-white/60' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {materials.length} ITENS
                </span>
              </div>

              {/* Add Material Search/Input */}
              <div data-html2canvas-ignore className={`mb-6 p-4 rounded-xl border space-y-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-surface-container-lowest border-outline-variant/20'}`}>
                <div className="relative">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-surface-container-low'}`}>
                    <Search size={18} className={isDark ? 'text-white/40' : 'text-on-surface-variant'} />
                    <input
                      type="text"
                      placeholder="Pesquisar material no catálogo..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </div>
                  
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className={`absolute top-full left-0 w-full mt-1 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto border ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-outline-variant/20'}`}>
                      {filteredSuggestions.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setNewItem({
                              description: m.name,
                              spec: m.category,
                              qty: m.qty || 1,
                              unitPrice: m.price,
                              unit: m.unit,
                              laborCost: 0,
                              laborDescription: ''
                            });
                            setSearchQuery(m.name);
                            setShowSuggestions(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-surface-container-low'}`}
                        >
                          <span className={isDark ? 'text-white' : 'text-on-surface'}>{m.name}</span>
                          <span className="text-xs font-bold text-primary">R$ {m.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Descrição Manual</label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                      placeholder="Nome do material"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Unidade</label>
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                    >
                      {['Chapa', 'Rolo', 'Unid', 'Par', 'Cento', 'Metro', 'Kg'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Qtd</label>
                    <input
                      type="number"
                      value={newItem.qty}
                      onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Unitário</label>
                    <input
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <button
                      onClick={handleAddMaterial}
                      disabled={!newItem.description}
                      className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                      <Plus size={18} />
                      Adicionar
                    </button>
                  </div>
                  
                  {/* Labor Fields */}
                  <div className="col-span-8">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Descrição da Mão de Obra</label>
                    <input
                      type="text"
                      value={newItem.laborDescription}
                      onChange={(e) => setNewItem({ ...newItem, laborDescription: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                      placeholder="Ex: Corte e colagem de fita"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Valor Mão de Obra (R$)</label>
                    <input
                      type="number"
                      value={newItem.laborCost}
                      onChange={(e) => setNewItem({ ...newItem, laborCost: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className={`grid grid-cols-12 px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-t-xl ${isDark ? 'bg-white/5 text-white/60' : 'bg-surface-container-high/30 text-on-surface-variant'}`}>
                  <div className="col-span-3">Descrição</div>
                  <div className="col-span-1 text-center">Qtd</div>
                  <div className="col-span-1 text-right">Unitário</div>
                  <div className="col-span-2 text-right">Mão de Obra (R$)</div>
                  <div className="col-span-2 text-left pl-4">Serviço</div>
                  <div className="col-span-2 text-right">Total Item</div>
                  <div className="col-span-1 text-right"></div>
                </div>
                {materials.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`grid grid-cols-12 px-4 py-3 items-center transition-colors first:border-t-0 border-t group relative ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-surface-container-lowest hover:bg-white border-surface-container-high/20'}`}
                  >
                    <div className="col-span-3 flex flex-col">
                      <span className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-on-surface'}`}>{item.description}</span>
                      <span className={`text-[10px] font-medium truncate ${isDark ? 'text-white/40' : 'text-on-surface-variant'}`}>{item.spec} {item.unit ? `(${item.unit})` : ''}</span>
                    </div>
                    <div className="col-span-1 px-1">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateMaterial(idx, { qty: Number(e.target.value) })}
                        className={`w-full bg-transparent text-center font-bold text-sm outline-none focus:ring-1 ring-primary rounded ${isDark ? 'text-white' : 'text-on-surface'}`}
                      />
                    </div>
                    <div className="col-span-1 px-1">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateMaterial(idx, { unitPrice: Number(e.target.value) })}
                        className={`w-full bg-transparent text-right text-xs font-medium outline-none focus:ring-1 ring-primary rounded ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}
                      />
                    </div>
                    <div className="col-span-2 px-2">
                      <input
                        type="number"
                        value={item.laborCost || 0}
                        onChange={(e) => updateMaterial(idx, { laborCost: Number(e.target.value) })}
                        className={`w-full bg-transparent text-right font-bold text-sm outline-none focus:ring-1 ring-primary rounded text-primary`}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="col-span-2 px-2">
                      <input
                        type="text"
                        value={item.laborDescription || ''}
                        onChange={(e) => updateMaterial(idx, { laborDescription: e.target.value })}
                        className={`w-full bg-transparent text-left text-[10px] font-medium outline-none focus:ring-1 ring-primary rounded ${isDark ? 'text-white/40' : 'text-on-surface-variant'}`}
                        placeholder="Descreva o serviço..."
                      />
                    </div>
                    <div className={`col-span-2 text-right font-extrabold text-sm ${isDark ? 'text-white/80' : 'text-on-surface'}`}>
                      R$ {((item.qty * item.unitPrice) + (item.laborCost || 0)).toFixed(2).replace('.', ',')}
                    </div>
                    <div className="col-span-1 text-right">
                      <button 
                        data-html2canvas-ignore
                        onClick={() => handleRemoveMaterial(idx)}
                        className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-error/10 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Labor Section */}
          {companyProfile.showDetails && (
            <section className={`rounded-2xl p-6 ${isDark ? 'bg-white/5' : 'bg-surface-container-low'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white">
                    <Wrench size={20} />
                  </div>
                  <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-on-surface'}`}>Mão de Obra Direta</h3>
                </div>
                <button 
                  data-html2canvas-ignore
                  onClick={() => setIsAddingLabor(!isAddingLabor)}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-primary text-white hover:bg-primary/90'}`}
                >
                  <Plus size={20} />
                </button>
              </div>

              {isAddingLabor && (
                <div data-html2canvas-ignore className={`mb-6 p-4 rounded-xl border grid grid-cols-12 gap-4 items-end ${isDark ? 'bg-white/5 border-white/10' : 'bg-surface-container-lowest border-outline-variant/20'}`}>
                  <div className="col-span-4">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Função</label>
                    <input
                      type="text"
                      value={newLabor.role}
                      onChange={(e) => setNewLabor({ ...newLabor, role: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                      placeholder="Ex: Marceneiro"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Descrição</label>
                    <input
                      type="text"
                      value={newLabor.description}
                      onChange={(e) => setNewLabor({ ...newLabor, description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                      placeholder="Ex: Produção e Montagem"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Valor (R$)</label>
                    <input
                      type="number"
                      value={newLabor.value}
                      onChange={(e) => setNewLabor({ ...newLabor, value: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-primary ${isDark ? 'bg-white/5 text-white' : 'bg-surface-container-low text-on-surface'}`}
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={handleAddLabor}
                      disabled={!newLabor.role}
                      className="w-full h-[38px] bg-primary text-white rounded-lg flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labor.map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-xl flex justify-between items-center ambient-shadow group relative ${isDark ? 'bg-white/5' : 'bg-surface-container-lowest'}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-primary ${isDark ? 'bg-white/10' : 'bg-surface-container-high'}`}>
                        <span className="text-lg font-bold">{item.role[0]}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => updateLabor(idx, { role: e.target.value })}
                          className={`font-bold text-sm bg-transparent outline-none w-full focus:ring-1 ring-primary rounded px-1 ${isDark ? 'text-white' : 'text-on-surface'}`}
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLabor(idx, { description: e.target.value })}
                          className={`text-[10px] font-medium bg-transparent outline-none w-full focus:ring-1 ring-primary rounded px-1 ${isDark ? 'text-white/40' : 'text-on-surface-variant'}`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => updateLabor(idx, { value: Number(e.target.value) })}
                          className="font-extrabold text-primary bg-transparent outline-none w-24 text-right focus:ring-1 ring-primary rounded px-1"
                        />
                      </div>
                      <button 
                        data-html2canvas-ignore
                        onClick={() => handleRemoveLabor(idx)}
                        className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-error/10 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {/* Other Costs & Margin */}
          <section className="bg-primary text-white rounded-2xl p-8 ambient-shadow">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <BarChart3 size={20} className="text-tertiary-fixed-dim" />
              Outros Custos
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-on-primary-container font-medium text-sm">Impostos</span>
                <span className="font-bold text-lg">{budget.taxes}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-on-primary-container font-medium text-sm">Lucro Esperado</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={Math.round(margin * 100)}
                    onChange={(e) => handleMarginChange(Number(e.target.value) / 100)}
                    className="bg-white/10 outline-none w-16 px-2 py-1 rounded text-right font-bold"
                  />
                  <span className="font-bold text-lg">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-primary-container font-medium text-sm">Valor Total Margem</span>
                <span className="font-bold text-lg text-tertiary-fixed-dim">{Math.round(margin * 100)}%</span>
              </div>
            </div>
            
            <div className="mt-12 p-5 bg-primary-container rounded-xl border border-white/5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-primary-container mb-3">Composição do Preço</p>
              <div className="w-full bg-primary h-2 rounded-full overflow-hidden flex">
                <div className="h-full bg-tertiary-fixed-dim" style={{ width: `${(totalCosts / finalPrice) * 100}%` }} />
                <div className="h-full bg-slate-400" style={{ width: `${((finalPrice - totalCosts) / finalPrice) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-4 text-[9px] font-bold tracking-wider">
                <span className="flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" /> CUSTOS (MAT + M.O)
                </span>
                <span className="flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> MARGEM (SOBRE MAT)
                </span>
              </div>
            </div>
          </section>

          {/* Budget Terms Section */}
          {companyProfile.budgetTerms && (
            <div className={cn(
              "p-8 rounded-3xl border",
              isDark ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <FileText size={20} className="text-primary" />
                <h3 className={cn(
                  "text-lg font-bold",
                  isDark ? "text-white" : "text-zinc-900"
                )}>Termos e Condições</h3>
              </div>
              <p className={cn(
                "text-sm leading-relaxed whitespace-pre-line",
                isDark ? "text-white/70" : "text-zinc-600"
              )}>
                {companyProfile.budgetTerms}
              </p>
            </div>
          )}

          {/* Export Section */}
          <div data-html2canvas-ignore className={`rounded-2xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center gap-4 py-12 ${isDark ? 'bg-white/5 border-white/20' : 'bg-surface-container-high border-outline-variant'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ambient-shadow ${isDark ? 'bg-white/10 text-white' : 'bg-surface-container-lowest text-on-surface-variant'}`}>
              <FileText size={32} />
            </div>
            <div>
              <p className={`font-bold ${isDark ? 'text-white' : 'text-on-surface'}`}>Relatório de Insumos</p>
              <p className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-on-surface-variant'}`}>Gerar PDF para corte e compras</p>
            </div>
            <button 
              onClick={handleExportDetails}
              disabled={isGenerating}
              className={`mt-2 w-full py-3 font-bold rounded-xl ambient-shadow transition-colors disabled:opacity-50 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-surface-container-lowest text-primary hover:bg-white'}`}
            >
              Exportar Detalhes
            </button>
          </div>
        </div>
      </div>
    </motion.div>

    {/* AI Modal */}
    <AnimatePresence>
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "w-full max-w-lg rounded-[32px] p-8 shadow-2xl border",
              isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-zinc-200"
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className={cn(
                  "text-xl font-black tracking-tight",
                  isDark ? "text-white" : "text-zinc-900"
                )}>Gerar com IA</h3>
                <p className={cn(
                  "text-xs font-bold uppercase tracking-widest opacity-50",
                  isDark ? "text-white" : "text-zinc-500"
                )}>Modelo de Orçamento Inteligente</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mb-2 block",
                  isDark ? "text-white/60" : "text-zinc-500"
                )}>O que você deseja orçar?</label>
                <textarea
                  autoFocus
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Armário de cozinha planejado em MDF branco com puxadores embutidos..."
                  className={cn(
                    "w-full h-32 p-4 rounded-2xl text-sm outline-none focus:ring-2 ring-amber-500 transition-all resize-none",
                    isDark ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                  )}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAiModal(false)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all",
                    isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  )}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAiGenerate}
                  disabled={isAiLoading || !aiPrompt}
                  className={cn(
                    "flex-1 py-4 rounded-2xl bg-amber-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100",
                    isAiLoading && "cursor-not-allowed"
                  )}
                >
                  {isAiLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {isAiLoading ? 'Gerando...' : 'Gerar Agora'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Contract Modal */}
    <AnimatePresence>
      {showContractModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] flex flex-col shadow-2xl border",
              isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-zinc-200"
            )}
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                  <FileSignature size={24} />
                </div>
                <div>
                  <h3 className={cn(
                    "text-xl font-black tracking-tight",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>Contrato de Prestação de Serviços</h3>
                  <p className={cn(
                    "text-xs font-bold uppercase tracking-widest opacity-50",
                    isDark ? "text-white" : "text-zinc-500"
                  )}>Gerado automaticamente com IA</p>
                </div>
              </div>
              <button 
                onClick={() => setShowContractModal(false)}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isContractLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                  <Loader2 className="animate-spin text-primary" size={48} />
                  <p className="text-sm font-bold uppercase tracking-widest opacity-50">Redigindo contrato...</p>
                </div>
              ) : (
                <div className={cn(
                  "prose prose-sm max-w-none",
                  isDark ? "prose-invert" : ""
                )}>
                  <textarea
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    className={cn(
                      "w-full h-[500px] p-8 rounded-2xl font-serif text-base leading-relaxed outline-none focus:ring-2 ring-primary transition-all resize-none",
                      isDark ? "bg-white/5 text-white" : "bg-zinc-50 text-zinc-900"
                    )}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-zinc-100 flex gap-4">
              <button
                onClick={() => setShowContractModal(false)}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all",
                  isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                )}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExportContract()}
                disabled={isContractLoading || !contractText}
                className={cn(
                  "flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                )}
              >
                <FileText size={18} />
                Exportar Contrato (PDF)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Proposal Modal */}
    <AnimatePresence>
      {showProposalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[32px] flex flex-col shadow-2xl border",
              isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-zinc-200"
            )}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className={cn(
                    "text-xl font-black tracking-tight",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>Proposta de Orçamento</h3>
                  <p className={cn(
                    "text-xs font-bold uppercase tracking-widest opacity-50",
                    isDark ? "text-white" : "text-zinc-500"
                  )}>Edite o modelo de tabela e exporte para PDF (Você pode clicar nos textos para editar livremente antes de gerar)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProposalModal(false)}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-500 hover:text-zinc-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable Proposal Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-zinc-100 dark:bg-zinc-900 flex justify-center">
              {/* Actual Printable Area */}
              <div 
                ref={proposalRef}
                className="bg-white text-zinc-900 w-full max-w-[800px] shadow-sm"
                style={{ padding: '40px', minHeight: '1131px', boxSizing: 'border-box' }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-10 border-b pb-6 border-zinc-200">
                  <div className="flex items-center gap-4">
                    {companyProfile.logo ? (
                      <img src={companyProfile.logo} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">LOGO</div>
                    )}
                    <div>
                      <h1 className="text-2xl font-black uppercase tracking-tighter" contentEditable suppressContentEditableWarning>{companyProfile.name}</h1>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary" contentEditable suppressContentEditableWarning>Proposta de Orçamento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Data</p>
                    <p className="text-sm font-bold" contentEditable suppressContentEditableWarning>{new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-2">Validade</p>
                    <p className="text-sm font-bold" contentEditable suppressContentEditableWarning>15 dias</p>
                  </div>
                </div>

                {/* Client Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-10 bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Cliente</p>
                    <p className="font-bold text-lg" contentEditable suppressContentEditableWarning>{budget.clientName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Ambiente</p>
                    <p className="font-bold text-lg" contentEditable suppressContentEditableWarning>{budget.environment}</p>
                  </div>
                  {budget.clientPhone && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Telefone / Contato</p>
                      <p className="font-medium text-sm" contentEditable suppressContentEditableWarning>{budget.clientPhone}</p>
                    </div>
                  )}
                  {budget.clientAddress && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Endereço</p>
                      <p className="font-medium text-sm" contentEditable suppressContentEditableWarning>{budget.clientAddress}</p>
                    </div>
                  )}
                </div>

                {/* Materials & Hardware Table */}
                <div className="mb-12">
                  <h2 className="text-lg font-black mb-4 uppercase tracking-tight text-primary border-b-2 border-primary inline-block pb-1" contentEditable suppressContentEditableWarning>Materiais e Ferragens</h2>
                  <table className="w-full text-left border-collapse border border-zinc-200">
                    <thead className="bg-zinc-100">
                      <tr>
                        <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest border border-zinc-200">Descrição do Item</th>
                        <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest border border-zinc-200 w-1/3">Especificação / Acabamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m, i) => (
                        <tr key={i} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium border border-zinc-200" contentEditable suppressContentEditableWarning>{m.description}</td>
                          <td className="py-3 px-4 text-sm border border-zinc-200 italic text-zinc-700" contentEditable suppressContentEditableWarning>{m.spec || '-'}</td>
                        </tr>
                      ))}
                      {/* Empty rows allowed if user wants to type extra items */}
                      <tr>
                         <td className="py-3 px-4 text-sm border border-zinc-200" contentEditable suppressContentEditableWarning></td>
                         <td className="py-3 px-4 text-sm border border-zinc-200" contentEditable suppressContentEditableWarning></td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-zinc-500 mt-2 italic">* Relação de materiais e ferragens que compõem este orçamento, sem detalhamento de quantidades unitárias.</p>
                </div>

                {/* Pricing Block */}
                <div className="mb-12 flex justify-end">
                  <div className="bg-zinc-900 text-white p-6 rounded-2xl min-w-[300px] text-center shadow-lg">
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Valor Total do Orçamento</p>
                     <div className="text-3xl font-black mb-1">
                       <span className="text-lg font-bold opacity-70 mr-1">R$</span>
                       <span contentEditable suppressContentEditableWarning>{finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                  </div>
                </div>

                {/* Terms and Obs */}
                {companyProfile.budgetTerms && (
                  <div className="mb-10 text-justify">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2" contentEditable suppressContentEditableWarning>Observações e Condições</h3>
                    <p className="text-xs leading-relaxed text-zinc-700 whitespace-pre-line" contentEditable suppressContentEditableWarning>
                      {companyProfile.budgetTerms}
                    </p>
                  </div>
                )}
                
                {/* Footer Signatures */}
                <div className="mt-16 pt-8 grid grid-cols-2 gap-12 border-t border-zinc-200">
                   <div className="text-center">
                      <div className="border-b border-zinc-400 mb-2 h-10 w-full"></div>
                      <p className="text-xs font-bold uppercase tracking-widest">{companyProfile.name}</p>
                      <p className="text-[10px] uppercase opacity-50 mt-1">Fornecedor</p>
                   </div>
                   <div className="text-center">
                      <div className="border-b border-zinc-400 mb-2 h-10 w-full"></div>
                      <p className="text-xs font-bold uppercase tracking-widest">{budget.clientName}</p>
                      <p className="text-[10px] uppercase opacity-50 mt-1">Cliente / Aceite</p>
                   </div>
                </div>

              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-zinc-100 flex gap-4 shrink-0">
              <button
                onClick={() => setShowProposalModal(false)}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all",
                  isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                )}
              >
                Cancelar
              </button>
              <button
                onClick={handleExportProposal}
                disabled={isGenerating}
                className={cn(
                  "flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                )}
              >
                <FileText size={18} />
                Exportar Proposta (PDF)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Hidden Section for Exporting Details (Cutting Plan) */}
    <div id="cutting-plan-export" className="hidden">
      <div className={`p-12 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-zinc-900'}`} style={{ width: '800px' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b pb-8 border-zinc-200">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Plano de Corte e Insumos</h1>
            <p className="text-sm font-bold text-primary uppercase tracking-widest">{budget.title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Data de Geração</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Cliente</p>
            <p className="font-bold">{budget.clientName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Ambiente</p>
            <p className="font-bold">{budget.environment}</p>
          </div>
        </div>

        {/* Materials Table */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-tight">Materiais e Ferragens</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900">
                <th className="py-3 text-[10px] font-bold uppercase tracking-widest">Qtd</th>
                <th className="py-3 text-[10px] font-bold uppercase tracking-widest">Unid</th>
                <th className="py-3 text-[10px] font-bold uppercase tracking-widest">Descrição</th>
                <th className="py-3 text-[10px] font-bold uppercase tracking-widest">Especificação</th>
              </tr>
            </thead>
            <tbody>
              {budget.materials.map((m, i) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-4 font-bold">{m.qty}</td>
                  <td className="py-4 text-sm opacity-70">{m.unit}</td>
                  <td className="py-4 font-bold">{m.description}</td>
                  <td className="py-4 text-sm italic opacity-70">{m.spec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Labor Section */}
        {budget.labor && budget.labor.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-tight">Mão de Obra / Produção</h2>
            <div className="grid grid-cols-1 gap-4">
              {budget.labor.map((l, i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{l.role}</p>
                  <p className="text-sm font-medium">{l.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-zinc-200 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Gerado por {companyProfile.name}</p>
        </div>
      </div>
    </div>
  </div>
);
};
