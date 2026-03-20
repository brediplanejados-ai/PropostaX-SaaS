import React, { useState } from 'react';
import { X, User, Phone, MapPin, Home, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Budget } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: Budget) => void;
  isDark: boolean;
}

export const NewClientModal = ({ isOpen, onClose, onAdd, isDark }: NewClientModalProps) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    environment: '',
    title: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: Budget = {
      id: crypto.randomUUID(),
      ref: `#ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      title: formData.title || `Orçamento - ${formData.environment}`,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      environment: formData.environment,
      materials: [],
      labor: [],
      taxes: 0,
      margin: 0.60,
      status: 'draft',
      date: new Date().toISOString().split('T')[0]
    };
    onAdd(newBudget);
    onClose();
    setFormData({ clientName: '', clientPhone: '', clientAddress: '', environment: '', title: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${
              isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
            }`}
          >
            <div className={`p-6 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Novo Cliente & Orçamento</h2>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Inicie um novo projeto preenchendo os dados abaixo.</p>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Nome do Cliente
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    <input
                      required
                      type="text"
                      placeholder="Ex: João Silva"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                        isDark 
                          ? 'bg-zinc-800 border-zinc-700 text-white focus:ring-1 ring-emerald-500' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-1 ring-emerald-500 border'
                      }`}
                    />
                  </div>
                </div>

                {/* Cellphone */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Celular
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    <input
                      required
                      type="tel"
                      placeholder="Ex: (11) 98765-4321"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                        isDark 
                          ? 'bg-zinc-800 border-zinc-700 text-white focus:ring-1 ring-emerald-500' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-1 ring-emerald-500 border'
                      }`}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    <input
                      required
                      type="text"
                      placeholder="Ex: Rua das Flores, 123"
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                        isDark 
                          ? 'bg-zinc-800 border-zinc-700 text-white focus:ring-1 ring-emerald-500' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-1 ring-emerald-500 border'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Environment */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Ambiente
                    </label>
                    <div className="relative">
                      <Home className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <input
                        required
                        type="text"
                        placeholder="Ex: Cozinha"
                        value={formData.environment}
                        onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                          isDark 
                            ? 'bg-zinc-800 border-zinc-700 text-white focus:ring-1 ring-emerald-500' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-1 ring-emerald-500 border'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Title (Optional) */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Título do Projeto
                    </label>
                    <div className="relative">
                      <Plus className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <input
                        type="text"
                        placeholder="Ex: Armário Planejado"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                          isDark 
                            ? 'bg-zinc-800 border-zinc-700 text-white focus:ring-1 ring-emerald-500' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-1 ring-emerald-500 border'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Criar Orçamento
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
