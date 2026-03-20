import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserProfile = {
  nome: string;
  plano: 'free' | 'pro' | 'premium';
  limite_orcamentos: number;
  limite_clientes: number;
  status: 'ativo' | 'suspenso';
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, isAdmin: false, session: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase.from('admins').select('id').eq('id', userId).single();
    if (data) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    if (data) setProfile(data as UserProfile);

    // Check admin status securely bypassing recursion
    await checkAdminStatus(userId);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
