import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, User, Calendar, MapPin, ChevronRight, Trash2, Filter, Inbox } from 'lucide-react';
import { Budget } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const BudgetList = ({ 
  budgets, 
  onSelectBudget, 
  onNewBudget,
  onDeleteBudget,
  isDark 
}: { 
  budgets: Budget[], 
  onSelectBudget: (id: string) => void,
  onNewBudget: () => void,
  onDeleteBudget: (id: string) => void,
  isDark: boolean 
}) => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  
  const limitReached = profile ? budgets.length >= profile.limite_orcamentos : false;

  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => {
      const matchesSearch = 
        budget.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        budget.environment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        budget.ref.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'approved' && budget.status === 'approved') ||
        (statusFilter === 'pending' && budget.status !== 'approved');
      
      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchQuery, statusFilter]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className={cn(
            "text-4xl font-black tracking-tight mb-2",
            isDark ? "text-white" : "text-zinc-900"
          )}>
            Meus <span className="text-primary">Orçamentos</span>
          </h2>
          <p className={cn(
            "font-medium",
            isDark ? "text-white/50" : "text-zinc-500"
          )}>
            Gerencie seus clientes e projetos em um só lugar
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button 
            onClick={limitReached ? undefined : onNewBudget}
            disabled={limitReached}
            className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs ambient-shadow transition-all active:scale-95 hover:scale-105",
              limitReached 
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" 
                : "bg-primary text-white hover:shadow-primary/20 hover:shadow-2xl"
            )}
          >
            <Plus size={18} />
            Novo Cliente
          </button>
          
          {limitReached && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20"
            >
              Limite Atingido: Faça Upgrade
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className={cn(
          "flex-1 p-1 rounded-2xl flex items-center gap-3 border transition-all duration-300",
          isDark 
            ? "bg-white/5 border-white/5 focus-within:border-primary/50" 
            : "bg-zinc-100 border-zinc-200 focus-within:border-primary/50"
        )}>
          <div className="pl-4 text-zinc-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por cliente, ambiente ou referência..." 
            className="bg-transparent outline-none w-full py-4 text-sm font-medium"
          />
        </div>

        <div className={cn(
          "flex p-1 rounded-2xl gap-1 border",
          isDark ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200"
        )}>
          {(['all', 'pending', 'approved'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === filter
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              {filter === 'all' ? 'Tudo' : filter === 'pending' ? 'Pendentes' : 'Aprovados'}
            </button>
          ))}
        </div>
      </div>

      {filteredBudgets.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mb-6",
            isDark ? "bg-white/5 text-white/20" : "bg-zinc-100 text-zinc-300"
          )}>
            <Inbox size={40} />
          </div>
          <h3 className={cn(
            "text-xl font-bold mb-2",
            isDark ? "text-white" : "text-zinc-900"
          )}>Nenhum orçamento encontrado</h3>
          <p className={cn(
            "text-sm max-w-xs",
            isDark ? "text-white/40" : "text-zinc-500"
          )}>Não encontramos nenhum resultado para sua busca ou filtro atual.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBudgets.map((budget) => (
              <motion.div
                layout
                key={budget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -8 }}
                onClick={() => onSelectBudget(budget.id)}
                className={cn(
                  "p-8 rounded-[32px] border cursor-pointer transition-all duration-300 group relative",
                  isDark 
                    ? "bg-zinc-900/50 border-white/5 hover:border-primary/30 hover:bg-zinc-900" 
                    : "bg-white border-zinc-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                    isDark ? "bg-primary/10 text-primary" : "bg-primary/5 text-primary"
                  )}>
                    <User size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      budget.status === 'approved' 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {budget.status === 'approved' ? 'Aprovado' : 'Pendente'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Tem certeza que deseja apagar este orçamento?')) {
                          onDeleteBudget(budget.id);
                        }
                      }}
                      className={cn(
                        "p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                        isDark ? "hover:bg-error/20 text-error" : "hover:bg-error/10 text-error"
                      )}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={cn(
                    "text-2xl font-black tracking-tight mb-1 group-hover:text-primary transition-colors",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    {budget.clientName}
                  </h3>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest">
                    {budget.environment}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                    <span>{budget.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <span className="truncate">{budget.clientAddress}</span>
                  </div>
                </div>

                <div className={cn(
                  "mt-8 pt-8 border-t border-dashed flex items-center justify-between",
                  isDark ? "border-white/10" : "border-zinc-100"
                )}>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Valor Total</p>
                    <p className={cn(
                      "text-2xl font-black tracking-tighter",
                      isDark ? "text-white" : "text-zinc-900"
                    )}>
                      <span className="text-sm mr-1 opacity-50">R$</span>
                      {budget.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isDark 
                      ? "bg-white/5 group-hover:bg-primary group-hover:text-white group-hover:rotate-45" 
                      : "bg-zinc-50 group-hover:bg-primary group-hover:text-white group-hover:rotate-45"
                  )}>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
