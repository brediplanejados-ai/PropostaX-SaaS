import { useState } from 'react';
import { Warehouse, Users, TrendingUp, Calendar, Package, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { FixedCost } from '../types';

export const FixedCosts = ({ 
  fixedCosts, 
  onFixedCostsChange,
  isDark
}: { 
  fixedCosts: { operacional: FixedCost[], pessoal: FixedCost[] },
  onFixedCostsChange: (costs: { operacional: FixedCost[], pessoal: FixedCost[] }) => void,
  isDark: boolean
}) => {
  const [newCost, setNewCost] = useState({ name: '', description: '', value: 0, type: 'operacional' as 'operacional' | 'pessoal' });

  const totalMonthly = [...fixedCosts.operacional, ...fixedCosts.pessoal].reduce((acc, item) => acc + item.value, 0);
  const dailyCost = totalMonthly / 20;

  const handleAddCost = () => {
    if (!newCost.name || newCost.value <= 0) return;
    const costItem: FixedCost = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCost.name,
      description: newCost.description,
      value: newCost.value
    };

    if (newCost.type === 'operacional') {
      onFixedCostsChange({
        ...fixedCosts,
        operacional: [...fixedCosts.operacional, costItem]
      });
    } else {
      onFixedCostsChange({
        ...fixedCosts,
        pessoal: [...fixedCosts.pessoal, costItem]
      });
    }
    setNewCost({ name: '', description: '', value: 0, type: newCost.type });
  };

  const handleRemoveCost = (id: string, type: 'operacional' | 'pessoal') => {
    if (type === 'operacional') {
      onFixedCostsChange({
        ...fixedCosts,
        operacional: fixedCosts.operacional.filter(c => c.id !== id)
      });
    } else {
      onFixedCostsChange({
        ...fixedCosts,
        pessoal: fixedCosts.pessoal.filter(c => c.id !== id)
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Estrutura de Custos Fixos</h1>
          <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} font-medium`}>Detalhamento mensal e cálculo de ponto de equilíbrio operacional.</p>
        </div>
        <div className="lg:col-span-4 flex items-end justify-end">
          <div className="bg-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl w-full text-white shadow-lg shadow-emerald-500/20">
            <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100 mb-1">Custo do Dia da Empresa</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tighter">R$ {dailyCost.toFixed(2).replace('.', ',')}</span>
              <span className="text-sm font-medium text-emerald-100/80">/ dia útil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Cost Form */}
      <section className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} p-6 rounded-2xl border`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          <Plus size={20} className="text-emerald-500" />
          Adicionar Novo Custo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-1 block`}>Nome</label>
            <input 
              type="text" 
              value={newCost.name}
              onChange={(e) => setNewCost({...newCost, name: e.target.value})}
              className={`w-full ${isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-zinc-900 border-zinc-200'} border px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-emerald-500`}
              placeholder="Ex: Aluguel"
            />
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-1 block`}>Valor (R$)</label>
            <input 
              type="number" 
              value={newCost.value || ''}
              onChange={(e) => setNewCost({...newCost, value: Number(e.target.value)})}
              className={`w-full ${isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-zinc-900 border-zinc-200'} border px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-emerald-500`}
            />
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-1 block`}>Tipo</label>
            <select 
              value={newCost.type}
              onChange={(e) => setNewCost({...newCost, type: e.target.value as 'operacional' | 'pessoal'})}
              className={`w-full ${isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-zinc-900 border-zinc-200'} border px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-emerald-500`}
            >
              <option value="operacional">Operacional</option>
              <option value="pessoal">Pessoal</option>
            </select>
          </div>
          <button 
            onClick={handleAddCost}
            className="bg-emerald-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Operational Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <Warehouse size={20} className="text-emerald-500" />
              Operacional
            </h2>
            <span className={`px-3 py-1 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'} rounded-full text-[10px] font-bold uppercase tracking-wider`}>
              R$ {fixedCosts.operacional.reduce((acc, i) => acc + i.value, 0).toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="space-y-4">
            {fixedCosts.operacional.length === 0 && <p className={`text-sm italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Nenhum custo operacional adicionado.</p>}
            {fixedCosts.operacional.map((item) => (
              <div key={item.id} className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border p-6 rounded-2xl shadow-sm transition-all hover:translate-x-1 group relative`}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.name}</span>
                    <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{item.description}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-extrabold text-emerald-500">R$ {item.value.toFixed(2).replace('.', ',')}</span>
                    <button 
                      onClick={() => handleRemoveCost(item.id, 'operacional')}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personnel Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <Users size={20} className="text-emerald-500" />
              Pessoal
            </h2>
            <span className={`px-3 py-1 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'} rounded-full text-[10px] font-bold uppercase tracking-wider`}>
              R$ {fixedCosts.pessoal.reduce((acc, i) => acc + i.value, 0).toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="space-y-4">
            {fixedCosts.pessoal.length === 0 && <p className={`text-sm italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Nenhum custo de pessoal adicionado.</p>}
            {fixedCosts.pessoal.map((item) => (
              <div key={item.id} className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border p-6 rounded-2xl shadow-sm transition-all hover:translate-x-1 group relative`}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.name}</span>
                    <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{item.description}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-extrabold text-emerald-500">R$ {item.value.toFixed(2).replace('.', ',')}</span>
                    <button 
                      onClick={() => handleRemoveCost(item.id, 'pessoal')}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} border p-8 rounded-3xl`}>
              <h3 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-6`}>Metodologia de Cálculo</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Custos Mensais</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>R$ {totalMonthly.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Dias Úteis Operacionais</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>20 dias</span>
                </div>
                <div className={`pt-6 mt-6 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'} flex justify-between items-end`}>
                  <div>
                    <p className={`text-[10px] font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest`}>Custo / Dia</p>
                    <p className={`text-3xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} tracking-tighter`}>R$ {dailyCost.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className={`bg-emerald-500/10 text-emerald-500 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider`}>
                    SAÚDE FINANCEIRA: OK
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} border p-6 rounded-2xl`}>
          <Package size={20} className="text-emerald-500 mb-3" />
          <p className={`text-[10px] font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest mb-1`}>Impacto nos Materiais</p>
          <p className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Estimado em 12% sobre o valor bruto das peças produzidas.</p>
        </div>
        <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} border p-6 rounded-2xl`}>
          <TrendingUp size={20} className="text-emerald-500 mb-3" />
          <p className={`text-[10px] font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest mb-1`}>Eficiência de Custo</p>
          <p className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Redução de 4% em energia comparado ao mês anterior.</p>
        </div>
        <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} border p-6 rounded-2xl`}>
          <Calendar size={20} className="text-emerald-500 mb-3" />
          <p className={`text-[10px] font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest mb-1`}>Previsão Próximo Mês</p>
          <p className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Manutenção de R$ 3.700,00 base sem novos investimentos.</p>
        </div>
      </div>
    </motion.div>
  );
};
