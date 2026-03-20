import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Crown } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(isAdminLogin ? '/admin' : '/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 relative">
      <button 
        onClick={() => setIsAdminLogin(!isAdminLogin)}
        className={`absolute top-6 right-6 p-3 rounded-full transition-all ${isAdminLogin ? 'bg-amber-100 text-amber-500 shadow-lg' : 'text-zinc-300 hover:text-zinc-400'}`}
        title="Admin Mode"
      >
        <Crown size={20} />
      </button>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-zinc-100">
        <h1 className="text-3xl font-black text-center mb-2 tracking-tighter text-zinc-900">
          {isAdminLogin ? 'SaaS Admin' : 'PropostaX'}
        </h1>
        <p className="text-center text-sm font-bold uppercase tracking-widest text-primary mb-8">
          {isAdminLogin ? 'Acesso Restrito ao Painel' : 'Acesse a sua conta'}
        </p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium mb-6">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 block">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl outline-none focus:ring-2 ring-primary transition-all text-sm"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 block">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl outline-none focus:ring-2 ring-primary transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase shadow-lg shadow-primary/20 tracking-wider flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
          </button>
        </form>
        
        <p className="text-center text-xs font-medium text-zinc-500 mt-8">
          Não tem uma conta? <Link to="/register" className="text-primary font-bold hover:underline">Cadastre-se grátis</Link>
        </p>
      </div>
    </div>
  );
};
