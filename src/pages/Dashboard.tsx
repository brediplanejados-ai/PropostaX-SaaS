import { useMemo } from 'react';
import { TrendingDown, Wallet, FileText, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MOCK_MATERIALS } from '../data';
import { motion } from 'motion/react';
import { Material, FixedCost } from '../types';

export const Dashboard = ({ 
  materials, 
  fixedCosts,
  onNavigateToFixedCosts,
  isDark
}: { 
  materials: Material[],
  fixedCosts: { operacional: FixedCost[], pessoal: FixedCost[] },
  onNavigateToFixedCosts: () => void,
  isDark: boolean
}) => {
  const materialCosts = useMemo(() => 
    materials.reduce((acc, m) => acc + (m.qty * m.unitPrice), 0)
  , [materials]);

  const totalFixedCosts = useMemo(() => 
    [...fixedCosts.operacional, ...fixedCosts.pessoal].reduce((acc, item) => acc + item.value, 0)
  , [fixedCosts]);

  // Daily cost of the workshop (fixed costs / 20 working days)
  const dailyFixedCost = totalFixedCosts / 20;
  
  // Average Budget - let's use a 70% margin as a standard for the dashboard display
  const averageBudget = materialCosts > 0 ? materialCosts * 1.7 : 0;
  const totalCost = materialCosts + totalFixedCosts;

  const distributionData = useMemo(() => {
    const total = materialCosts + totalFixedCosts;
    if (total === 0) {
      return [
        { name: 'Sem Dados', value: 100, color: isDark ? '#3f3f46' : '#e2e8f0' }
      ];
    }
    return [
      { name: 'Materiais', value: (materialCosts / total) * 100, color: '#88d982' },
      { name: 'Custos Fixos', value: (totalFixedCosts / total) * 100, color: isDark ? '#52525b' : '#94a3b8' },
    ];
  }, [materialCosts, totalFixedCosts, isDark]);

  const marginPercentage = averageBudget > 0 ? Math.round(((averageBudget - materialCosts) / averageBudget) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className={`font-headline text-3xl font-extrabold tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>PropostaX</h2>
            <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} font-medium`}>Orçamento é Gestão de Marcenaria</p>
          </div>
          <button className={`px-4 py-2 ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'} text-sm font-semibold rounded-xl`}>
            Últimos 30 dias
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Stat Card */}
          <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[240px]`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/5'} rounded-full -translate-y-1/2 translate-x-1/4 -z-0`} />
            <div className="relative z-10">
              <span className={`${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold text-[10px] uppercase tracking-widest mb-2 block`}>Custo Diário Operacional</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-headline font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'}`}>R$ {dailyFixedCost.toFixed(2).replace('.', ',')}</span>
                {dailyFixedCost > 0 && (
                  <span className="text-emerald-500 font-bold text-sm flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                    <TrendingDown size={14} className="mr-1" />
                    -2.4%
                  </span>
                )}
              </div>
            </div>
            <div className="relative z-10 flex gap-4 items-end">
              <div className={`flex-1 h-2 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} rounded-full overflow-hidden`}>
                <div className="h-full bg-emerald-500" style={{ width: dailyFixedCost > 0 ? '65%' : '0%' }} />
              </div>
              <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold uppercase tracking-wider`}>Meta: R$ 250,00</p>
            </div>
          </div>

          {/* Secondary Stat Cards Stack */}
          <div className="flex flex-col gap-6">
            <button 
              onClick={onNavigateToFixedCosts}
              className={`${isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-zinc-100 hover:bg-zinc-50'} border p-6 rounded-2xl shadow-sm flex items-center justify-between text-left transition-all`}
            >
              <div>
                <span className={`${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold text-[10px] uppercase tracking-widest mb-1 block`}>Total de Custos Fixos</span>
                <span className={`text-xl font-headline font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>R$ {totalFixedCosts.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className={`w-12 h-12 ${isDark ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50/50 text-emerald-600'} rounded-xl flex items-center justify-center`}>
                <Wallet size={20} />
              </div>
            </button>
            <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border p-6 rounded-2xl shadow-sm flex items-center justify-between`}>
              <div>
                <span className={`${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold text-[10px] uppercase tracking-widest mb-1 block`}>Custo de Materiais</span>
                <span className={`text-xl font-headline font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>R$ {materialCosts.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className={`w-12 h-12 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-50 text-zinc-600'} rounded-xl flex items-center justify-center`}>
                <Package size={20} />
              </div>
            </div>
            <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border p-6 rounded-2xl shadow-sm flex items-center justify-between`}>
              <div>
                <span className={`${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold text-[10px] uppercase tracking-widest mb-1 block`}>Orçamento Médio</span>
                <span className={`text-xl font-headline font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>R$ {averageBudget.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className={`w-12 h-12 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-50 text-zinc-600'} rounded-xl flex items-center justify-center`}>
                <FileText size={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Chart */}
        <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} border p-8 rounded-2xl`}>
          <h3 className={`font-headline font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Distribuição de Custos</h3>
          <div className="h-48 relative flex items-center justify-center mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-extrabold font-headline ${isDark ? 'text-white' : 'text-zinc-900'}`}>{marginPercentage}%</span>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Margem</span>
            </div>
          </div>
          <div className="space-y-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.name}</span>
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{Math.round(item.value)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
