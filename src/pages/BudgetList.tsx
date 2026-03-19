import { motion } from 'motion/react';
import { Plus, Search, User, Calendar, MapPin, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { Budget } from '../types';
import { cn } from '../lib/utils';

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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-on-surface'}`}>Meus Orçamentos</h2>
          <p className={`font-medium ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>Gerencie seus clientes e projetos</p>
        </div>
        <button 
          onClick={onNewBudget}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold ambient-shadow hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className={`p-4 rounded-2xl flex items-center gap-3 ${isDark ? 'bg-white/5' : 'bg-surface-container-low'}`}>
        <Search size={20} className={isDark ? 'text-white/40' : 'text-on-surface-variant'} />
        <input 
          type="text" 
          placeholder="Pesquisar por cliente, ambiente ou referência..." 
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <motion.div
            key={budget.id}
            whileHover={{ y: -4 }}
            onClick={() => onSelectBudget(budget.id)}
            className={cn(
              "p-6 rounded-3xl border cursor-pointer transition-all ambient-shadow group relative",
              isDark ? "bg-zinc-900 border-zinc-800 hover:border-primary/50" : "bg-white border-zinc-100 hover:border-primary/50"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                isDark ? "bg-primary/10 text-primary" : "bg-primary/5 text-primary"
              )}>
                <User size={24} />
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  budget.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
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
                    "p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100",
                    isDark ? "hover:bg-error/20 text-error" : "hover:bg-error/10 text-error"
                  )}
                  title="Apagar Orçamento"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className={cn(
              "text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors",
              isDark ? "text-white" : "text-on-surface"
            )}>
              {budget.clientName}
            </h3>
            <p className={cn(
              "text-sm font-bold mb-4",
              isDark ? "text-primary" : "text-primary"
            )}>
              {budget.environment}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium opacity-60">
                <Calendar size={14} />
                <span>{budget.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium opacity-60">
                <MapPin size={14} />
                <span className="truncate">{budget.clientAddress}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-dashed border-outline-variant/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Valor Total</p>
                <p className={cn(
                  "text-lg font-extrabold tracking-tighter",
                  isDark ? "text-white" : "text-on-surface"
                )}>
                  R$ {budget.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                isDark ? "bg-white/5 group-hover:bg-primary group-hover:text-white" : "bg-zinc-50 group-hover:bg-primary group-hover:text-white"
              )}>
                <ChevronRight size={18} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
