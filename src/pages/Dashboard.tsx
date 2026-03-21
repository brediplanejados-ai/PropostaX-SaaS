import { useMemo } from 'react';
import { TrendingUp, Wallet, CheckCircle, Clock, Calculator, ArrowUpRight, Target, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { Budget, FixedCost, CompanyProfile } from '../types';

interface DashboardProps {
  budgets: Budget[];
  companyProfile: CompanyProfile;
  fixedCosts: { operacional: FixedCost[], pessoal: FixedCost[] };
  onNavigateToFixedCosts: () => void;
  isDark: boolean;
}

export const Dashboard = ({ budgets, companyProfile, fixedCosts, onNavigateToFixedCosts, isDark }: DashboardProps) => {
  // Business Metrics Calculation
  const metrics = useMemo(() => {
    const approved = budgets.filter(b => b.status === 'approved' || b.status === 'completed');
    const pending = budgets.filter(b => b.status === 'sent' || b.status === 'draft');

    const calcTotal = (buds: Budget[]) => buds.reduce((sum, b) => {
      const costs = b.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0) + (b.labor ? b.labor.reduce((acc, l) => acc + l.value, 0) : 0);
      return sum + (costs * (1 + (b.margin / 100)));
    }, 0);

    const calcCosts = (buds: Budget[]) => buds.reduce((sum, b) => {
      return sum + b.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0) + (b.labor ? b.labor.reduce((acc, l) => acc + l.value, 0) : 0);
    }, 0);

    const revenue = calcTotal(approved);
    const potentialRevenue = calcTotal(pending);
    const costs = calcCosts(approved);
    const grossProfit = revenue - costs;

    return {
      totalRevenue: revenue,
      potentialRevenue,
      totalCosts: costs,
      grossProfit,
      approvedCount: approved.length,
      pendingCount: pending.length,
      winRate: budgets.length > 0 ? Math.round((approved.length / budgets.length) * 100) : 0
    };
  }, [budgets]);

  const totalFixedCosts = useMemo(() => 
    [...fixedCosts.operacional, ...fixedCosts.pessoal].reduce((acc, item) => acc + item.value, 0)
  , [fixedCosts]);

  const dailyFixedCost = totalFixedCosts / 20;

  // Chart Data
  const chartData = [
    { name: 'Lucro Bruto', value: metrics.grossProfit, color: '#10B981' },
    { name: 'Custos Variáveis', value: metrics.totalCosts, color: isDark ? '#334155' : '#94A3B8' },
    { name: 'Custos Fixos', value: totalFixedCosts, color: '#EF4444' }
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    chartData.push({ name: 'Sem Dados', value: 100, color: isDark ? '#1E293B' : '#E2E8F0' });
  }

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
      
      {/* 1. Visão Geral do Negócio */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visão Geral do Negócio</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhamento financeiro e comercial</p>
          </div>
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm w-max">
            <button className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg uppercase tracking-wider">Mês Atual</button>
            <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Geral</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Faturamento */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Wallet size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Faturamento Aprovado</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(metrics.totalRevenue)}</p>
              <div className="flex items-center gap-2 mt-4 text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center"><TrendingUp size={14} className="mr-1"/> 12.5%</span>
                <span className="text-slate-400">vs Mês passado</span>
              </div>
            </div>
          </div>

          {/* Em Andamento */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Clock size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Valor em Negociação</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(metrics.potentialRevenue)}</p>
              <div className="mt-4 text-xs font-bold text-slate-400">
                <span className="text-amber-600 dark:text-amber-500">{metrics.pendingCount}</span> Orçamento(s) pendente(s)
              </div>
            </div>
          </div>

          {/* Taxa de Conversão */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Target size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Taxa de Conversão</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{metrics.winRate}%</p>
              <div className="mt-4 text-xs font-bold text-slate-400 flex items-center gap-1">
                <CheckCircle size={14} className="text-indigo-500" />
                {metrics.approvedCount} aprovados de {budgets.length}
              </div>
            </div>
          </div>

          {/* Lucro Projetado */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <ArrowUpRight size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Lucro Bruto Variável</span>
              </div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(metrics.grossProfit)}</p>
              <div className="mt-4 text-xs font-bold text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                <span>Custos mat:</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(metrics.totalCosts)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Gestão de Projetos / Projetos Recentes */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Projetos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Projetos recentes e andamento</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar projeto..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Ambiente</th>
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {budgets.slice(0, 5).map(b => {
                  const valor = (b.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0) + (b.labor ? b.labor.reduce((acc, l) => acc + l.value, 0) : 0)) * (1 + (b.margin / 100));
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{b.clientName}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{b.environment}</td>
                      <td className="p-4 text-slate-500">{new Date(b.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                          b.status === 'approved' || b.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          b.status === 'draft' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}>
                          {b.status === 'approved' || b.status === 'completed' ? 'Aprovado' : b.status === 'sent' ? 'Pendente' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(valor)}</td>
                    </tr>
                  )
                })}
                {budgets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum projeto recente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Análise e Relatórios */}
      <section>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Análise e Relatórios</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Distribuição financeira detalhada</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fixed Costs Card */}
          <button 
            onClick={onNavigateToFixedCosts}
            className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-left hover:border-indigo-500/50 transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <Calculator size={24} />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Despesas Fixas e Pessoal</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{formatCurrency(totalFixedCosts)}</p>
              <p className="text-sm font-medium text-slate-500 mt-2">Mensal</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Custo Diário da Marcenaria</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-500">{formatCurrency(dailyFixedCost)}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Custo por dia útil (20 dias)</p>
            </div>
          </button>

          {/* Breakdown Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Distribuição Financeira</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Análise de Lucro vs Custos (Projetos Aprovados)</p>
            </div>
            
            <div className="flex-1 flex items-center justify-center min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: isDark ? '#1E293B' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              {chartData.filter(d => d.name !== 'Sem Dados').map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.name}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
};
