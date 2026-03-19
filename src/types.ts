export interface Material {
  description: string;
  spec: string;
  qty: number;
  unitPrice: number;
  unit?: string;
  laborCost?: number;
  laborDescription?: string;
}

export interface CatalogMaterial {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  qty: number;
  thickness?: string;
  image: string;
  trending?: boolean;
}

export interface FixedCost {
  id: string;
  name: string;
  description: string;
  value: number;
}

export interface Labor {
  role: string;
  description: string;
  value: number;
}

export interface Budget {
  id: string;
  ref: string;
  title: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  environment: string;
  materials: Material[];
  labor: Labor[];
  taxes: number;
  margin: number;
  status: 'draft' | 'sent' | 'approved' | 'completed';
  date: string;
}

export interface CompanyProfile {
  name: string;
  logo?: string;
  budgetTerms?: string;
  showDetails?: boolean;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
}
