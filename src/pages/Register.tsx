import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-zinc-100">
        <h1 className="text-3xl font-black text-center mb-2 tracking-tighter text-zinc-900">PropostaX</h1>
        <p className="text-center text-sm font-bold uppercase tracking-widest text-primary mb-8">Crie sua Conta</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium mb-6">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm font-medium mb-6">Conta criada com sucesso! Redirecionando...</div>}
        
        {!success && (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 block">Nome da Empresa / Profissional</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl outline-none focus:ring-2 ring-primary transition-all text-sm"
                placeholder="Sua Marcenaria"
              />
            </div>
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
              {loading ? <Loader2 className="animate-spin" /> : 'Cadastrar'}
            </button>
          </form>
        )}
        
        <p className="text-center text-xs font-medium text-zinc-500 mt-8">
          Já possui conta? <Link to="/login" className="text-primary font-bold hover:underline">Fazer login</Link>
        </p>
      </div>
    </div>
  );
};
