import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Users, CreditCard, Activity, ArrowUpRight, Search, ShieldAlert, CheckCircle2, Ban, Sun, Moon, LogOut } from 'lucide-react';

interface Subscriber {
  id: string;
  nome: string;
  email: string;
  plano: string;
  status: string;
  data_criacao: string;
}

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (isAdmin) {
      fetchSubscribers();
    }
  }, [isAdmin]);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('data_criacao', { ascending: false });
    
    if (data) {
      setSubscribers(data as Subscriber[]);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from('users').update({ status: newStatus }).eq('id', id);
    setSubscribers(subs => subs.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handlePlanChange = async (id: string, newPlan: string) => {
    await supabase.from('users').update({ plano: newPlan }).eq('id', id);
    setSubscribers(subs => subs.map(s => s.id === id ? { ...s, plano: newPlan } : s));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-4">
          <ShieldAlert size={64} className="mx-auto text-red-500" />
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-on-surface-variant">Você não tem permissão para acessar o Painel de Controle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              PX
            </div>
            <div>
              <h1 className="text-xl font-bold">PropostaX Admin</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestão de Assinantes & Billing</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4 mr-2">
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-xl transition-colors active:scale-95 ${isDark ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Alternar Tema"
              >
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <button 
                onClick={async () => await supabase.auth.signOut()}
                className="p-2 rounded-xl transition-colors active:scale-95 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                title="Sair do Painel Adm (Logout)"
              >
                <LogOut size={20} />
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold">{user?.email}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
              <Users size={20} /> <h3 className="font-semibold">Assinantes</h3>
            </div>
            <p className="text-3xl font-bold">{subscribers.length}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-500 mb-2">
              <Activity size={20} /> <h3 className="font-semibold text-slate-500 dark:text-slate-400">Ativos</h3>
            </div>
            <p className="text-3xl font-bold">{subscribers.filter(s => s.status === 'ativo').length}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 text-indigo-500 mb-2">
              <CreditCard size={20} /> <h3 className="font-semibold text-slate-500 dark:text-slate-400">Receita MRR</h3>
            </div>
            <p className="text-3xl font-bold">
              R$ {subscribers.reduce((acc, s) => acc + (s.plano === 'pro' ? 49.9 : s.plano === 'premium' ? 99.9 : 0), 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 text-red-500 mb-2">
              <ArrowUpRight size={20} /> <h3 className="font-semibold text-slate-500 dark:text-slate-400">Inadimplentes</h3>
            </div>
            <p className="text-3xl font-bold">{subscribers.filter(s => s.status === 'inadimplente').length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold">Controle de Usuários</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-semibold">Usuário</th>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Plano</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Data Cadastro</th>
                  <th className="p-4 font-semibold text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium">{sub.nome || 'Usuario Sem Nome'}</td>
                    <td className="p-4 text-slate-500">{sub.email}</td>
                    <td className="p-4">
                      <select 
                        value={sub.plano}
                        onChange={(e) => handlePlanChange(sub.id, e.target.value)}
                        className="bg-transparent font-semibold cursor-pointer outline-none border-none uppercase text-xs tracking-wider"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select 
                        value={sub.status}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                        className={`font-semibold text-xs px-2 py-1 rounded-full uppercase tracking-wider cursor-pointer outline-none ${
                          sub.status === 'ativo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          sub.status === 'inadimplente' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                          'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inadimplente">Inadimplente</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(sub.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                       {sub.status !== 'ativo' ? (
                          <button onClick={() => handleStatusChange(sub.id, 'ativo')} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" title="Ativar Conta">
                            <CheckCircle2 size={18} />
                          </button>
                       ) : (
                          <button onClick={() => handleStatusChange(sub.id, 'suspenso')} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Suspender Conta">
                            <Ban size={18} />
                          </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
