import { useState, useMemo } from 'react';
import { TrendingUp, Wallet, CheckCircle, Clock, Calculator, ArrowUpRight, Target, Search, Eye, EyeOff, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { motion } from 'motion/react';
import { Budget, FixedCost, CompanyProfile } from '../types';

// Sparkline component for metric trends
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    // If all values are zero, center the line vertically (height / 2)
    const allZero = data.every(v => v === 0);
    const y = allZero ? height / 2 : height - ((val - min) / (range || 1)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 mt-2 opacity-50 overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0 ${height} ${points.split(' ').map((p, i) => (i === 0 ? 'M' : 'L') + p).join(' ')}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M 0 ${height} ${points.split(' ').map((p, i) => (i === 0 ? 'M' : 'L') + p).join(' ')} V ${height} H 0 Z`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
    </svg>
  );
};

interface DashboardProps {
  budgets: Budget[];
  companyProfile: CompanyProfile;
  fixedCosts: { operacional: FixedCost[], pessoal: FixedCost[] };
  onNavigateToFixedCosts: () => void;
  isDark: boolean;
}

export const Dashboard = ({ budgets, companyProfile, fixedCosts, onNavigateToFixedCosts, isDark }: DashboardProps) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    return localStorage.getItem('isPrivacyMode') === 'true';
  });

  const togglePrivacyMode = () => {
    const newValue = !isPrivacyMode;
    setIsPrivacyMode(newValue);
    localStorage.setItem('isPrivacyMode', String(newValue));
  };

  const privacyBlur = isPrivacyMode ? "blur-[8px] select-none pointer-events-none" : "";
  const privacyTransition = "transition-[filter] duration-300";

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

  // Calculate trends for sparklines
  const trends = useMemo(() => {
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleDateString('pt-BR', { month: 'short' })
      };
    });

    const getMonthlyValue = (buds: Budget[], month: number, year: number, type: 'revenue' | 'potential' | 'profit' | 'winrate') => {
      const monthlyBuds = buds.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      if (type === 'winrate') {
        const approved = monthlyBuds.filter(b => b.status === 'approved' || b.status === 'completed').length;
        return monthlyBuds.length > 0 ? (approved / monthlyBuds.length) * 100 : 0;
      }

      const calcTotal = (budsList: Budget[]) => budsList.reduce((sum, b) => {
        const costs = b.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0) + (b.labor ? b.labor.reduce((acc, l) => acc + l.value, 0) : 0);
        return sum + (costs * (1 + (b.margin / 100)));
      }, 0);

      const calcCosts = (budsList: Budget[]) => budsList.reduce((sum, b) => {
        return sum + b.materials.reduce((acc, m) => acc + (m.qty * m.unitPrice) + (m.laborCost || 0), 0) + (b.labor ? b.labor.reduce((acc, l) => acc + l.value, 0) : 0);
      }, 0);

      if (type === 'revenue') {
        const approved = monthlyBuds.filter(b => b.status === 'approved' || b.status === 'completed');
        return calcTotal(approved);
      }
      if (type === 'potential') {
        const pending = monthlyBuds.filter(b => b.status === 'sent' || b.status === 'draft');
        return calcTotal(pending);
      }
      if (type === 'profit') {
        const approved = monthlyBuds.filter(b => b.status === 'approved' || b.status === 'completed');
        return calcTotal(approved) - calcCosts(approved);
      }
      return 0;
    };

    const getPercentageChange = (values: number[]) => {
      const current = values[values.length - 1];
      const previous = values[values.length - 2];
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      revenue: lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'revenue')),
      potential: lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'potential')),
      winrate: lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'winrate')),
      profit: lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'profit')),
      changes: {
        revenue: getPercentageChange(lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'revenue'))),
        potential: getPercentageChange(lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'potential'))),
        winrate: getPercentageChange(lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'winrate'))),
        profit: getPercentageChange(lastSixMonths.map(m => getMonthlyValue(budgets, m.month, m.year, 'profit')))
      }
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
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePrivacyMode}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm"
              title="Alternar Privacidade"
            >
              {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
              <span className="text-sm font-medium hidden sm:inline">Privacidade</span>
            </button>
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm w-max">
              <button className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg uppercase tracking-wider">Mês Atual</button>
              <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Geral</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Faturamento */}
          <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={12} className="text-slate-400" />
                  Faturamento Aprovado
                </h3>
                {trends.changes.revenue !== 0 && (
                  <div className="bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center ring-1 ring-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <TrendingUp size={10} /> {trends.changes.revenue > 0 ? '+' : ''}{trends.changes.revenue.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
              <p className={`text-3xl font-black text-white ${privacyTransition} ${privacyBlur}`}>
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <div className="mt-4">
                <Sparkline data={trends.revenue} color="#10B981" />
              </div>
            </div>
          </div>

          {/* Em Andamento */}
          <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-slate-400" />
                  Valor em Negociação
                </h3>
                {trends.changes.potential !== 0 ? (
                  <span className={`px-2 py-0.5 rounded-full ${trends.changes.potential > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'} text-[10px] font-black tracking-wider uppercase`}>
                    {trends.changes.potential > 0 ? '+' : ''}{trends.changes.potential.toFixed(0)}%
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black tracking-wider uppercase">Pending</span>
                )}
              </div>
              <p className={`text-3xl font-black text-white ${privacyTransition} ${privacyBlur}`}>
                {formatCurrency(metrics.potentialRevenue)}
              </p>
              <div className="mt-4">
                <Sparkline data={trends.potential} color="#F59E0B" />
              </div>
            </div>
          </div>

          {/* Taxa de Conversão */}
          <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} className="text-slate-400" />
                  Taxa de Conversão
                </h3>
                {trends.changes.winrate !== 0 && (
                  <span className={`px-2 py-0.5 rounded-full ${trends.changes.winrate > 0 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-red-500/10 text-red-500'} text-[10px] font-black tracking-wider shadow-sm ${trends.changes.winrate > 0 ? 'shadow-indigo-500/20' : 'shadow-red-500/20'}`}>
                    {trends.changes.winrate > 0 ? '+' : ''}{trends.changes.winrate.toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-white mt-1">{metrics.winRate}%</p>
              <div className="mt-4">
                <Sparkline data={trends.winrate} color="#6366F1" />
              </div>
            </div>
          </div>

          {/* Lucro Projetado */}
          <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={12} className="text-slate-400" />
                  Lucro Bruto Variável
                </h3>
                {trends.changes.profit !== 0 && (
                  <span className={`px-2 py-0.5 rounded-full ${trends.changes.profit > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} text-[10px] font-black tracking-wider shadow-sm ${trends.changes.profit > 0 ? 'shadow-emerald-500/20' : 'shadow-red-500/20'}`}>
                    {trends.changes.profit > 0 ? '+' : ''}{trends.changes.profit.toFixed(0)}%
                  </span>
                )}
              </div>
              <p className={`text-3xl font-black text-white mt-1 ${privacyTransition} ${privacyBlur}`}>
                {formatCurrency(metrics.grossProfit)}
              </p>
              <div className="mt-4">
                <Sparkline data={trends.profit} color="#10B981" />
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
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar projetos..." 
              className="w-full pl-12 pr-4 py-3 bg-[#121214] border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg transition-all"
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
                    <tr key={b.id} className="hover:bg-white/5 transition-colors border-b border-white/[0.02] last:border-0 group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 overflow-hidden border border-white/10">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{b.clientName}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Cliente VIP</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">{b.environment}</td>
                      <td className="p-4 text-slate-500 font-medium">15 Out 2023</td>
                      <td className="p-4">
                        <span className={`inline-block text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                          b.status === 'approved' || b.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {b.status === 'approved' || b.status === 'completed' ? 'APROVADO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-white">
                        <span className={`${privacyTransition} ${privacyBlur}`}>
                          {formatCurrency(valor)}
                        </span>
                      </td>
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
              <p className={`text-4xl font-black text-slate-900 dark:text-white ${privacyTransition} ${privacyBlur}`}>
                {formatCurrency(totalFixedCosts)}
              </p>
              <p className="text-sm font-medium text-slate-500 mt-2">Mensal</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Custo Diário da Marcenaria</p>
              <p className={`text-xl font-bold text-amber-600 dark:text-amber-500 ${privacyTransition} ${privacyBlur}`}>
                {formatCurrency(dailyFixedCost)}
              </p>
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                    <Label
                      value={formatCurrency(metrics.totalRevenue)}
                      position="center"
                      fill="#fff"
                      style={{ fontSize: '18px', fontWeight: '900' }}
                    />
                    <Label
                      value="Total"
                      position="center"
                      dy={20}
                      fill="#64748b"
                      style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
                    />
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => isPrivacyMode ? '***' : formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#121214', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-white/5">
              {chartData.filter(d => d.name !== 'Sem Dados').map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{item.name}</p>
                    <p className={`text-xs font-bold text-white ${privacyTransition} ${privacyBlur}`}>
                      {formatCurrency(item.value)}
                    </p>
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
