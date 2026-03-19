-- SQL Schema for PropostaX SaaS (Supabase)
-- Execute this in the Supabase SQL Editor

-- 1. Create Public Schema Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom Types
CREATE TYPE user_status AS ENUM ('ativo', 'suspenso');
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'premium');

-- 3. Create Users Table (Profile linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  plano user_plan DEFAULT 'free'::user_plan,
  status user_status DEFAULT 'ativo'::user_status,
  limite_orcamentos INT DEFAULT 10,
  limite_clientes INT DEFAULT 5,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- User Policies: Can read/update own profile
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to create user profile automatically on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nome, email, plano, limite_orcamentos, limite_clientes)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'free',
    10, -- 10 budgets limit for free
    5   -- 5 clients limit for free
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Create Clients Table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  observacoes TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own clientes"
ON public.clientes
FOR ALL
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

-- 5. Create Budgets Table
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  ambiente TEXT,
  descricao TEXT,
  valor_total DECIMAL(10,2) NOT NULL,
  custo_total DECIMAL(10,2),
  status TEXT DEFAULT 'pendente',
  referencia TEXT,
  dados_json JSONB, -- Stores the materials array, labor, margins, raw data
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own orcamentos"
ON public.orcamentos
FOR ALL
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());
