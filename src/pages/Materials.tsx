import { useState, useMemo } from 'react';
import { Search, Filter, Package, TrendingUp, Camera, Plus, Trash2, Layers, Wrench, Settings, Ruler, Hand, DoorOpen, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Material, CatalogMaterial } from '../types';

const CATEGORIES = [
  'Todas',
  'Chapas',
  'Ferragens',
  'Acessórios',
  'Fita de Bordas',
  'Puxadores',
  'Dobradiças',
  'Corrediças'
];

const UNITS = ['Chapa', 'Rolo', 'Unid', 'Par', 'Cento', 'Metro', 'Kg'];

const CATEGORY_ICONS: Record<string, any> = {
  'Todas': Package,
  'Chapas': Layers,
  'Ferragens': Wrench,
  'Acessórios': Settings,
  'Fita de Bordas': Ruler,
  'Puxadores': Hand,
  'Dobradiças': DoorOpen,
  'Corrediças': ArrowRightLeft
};

export const Materials = ({ 
  isDark, 
  catalogMaterials, 
  onCatalogChange 
}: { 
  isDark: boolean,
  catalogMaterials: CatalogMaterial[],
  onCatalogChange: (materials: CatalogMaterial[]) => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const handleUnitChange = (id: string, newUnit: string) => {
    onCatalogChange(catalogMaterials.map(m => m.id === id ? { ...m, unit: newUnit } : m));
  };

  const handleQtyChange = (id: string, newQty: number) => {
    onCatalogChange(catalogMaterials.map(m => m.id === id ? { ...m, qty: newQty } : m));
  };

  const handleUpdateMaterial = (id: string, updates: Partial<CatalogMaterial>) => {
    onCatalogChange(catalogMaterials.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleAddMaterial = (category: string) => {
    const newMaterial: CatalogMaterial = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Material',
      category,
      price: 0,
      unit: 'Unid',
      qty: 1,
      thickness: '',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
    };
    onCatalogChange([newMaterial, ...catalogMaterials]);
  };

  const handleRemoveMaterial = (id: string) => {
    onCatalogChange(catalogMaterials.filter(m => m.id !== id));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onCatalogChange(catalogMaterials.map(m => m.id === id ? { ...m, image: base64String } : m));
    };
    reader.readAsDataURL(file);
  };

  const filteredMaterials = useMemo(() => {
    return catalogMaterials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || material.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, catalogMaterials]);

  const groupedMaterials = useMemo<Record<string, CatalogMaterial[]>>(() => {
    const groups: Record<string, CatalogMaterial[]> = {};
    filteredMaterials.forEach(material => {
      if (!groups[material.category]) {
        groups[material.category] = [];
      }
      groups[material.category].push(material);
    });
    return groups;
  }, [filteredMaterials]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Catálogo de Materiais</h1>
          <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} font-medium`}>Consulte preços e especificações dos insumos.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
            <input 
              type="text"
              placeholder="Buscar material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-xl text-sm w-full sm:w-64 outline-none transition-all ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:ring-1 ring-emerald-500' 
                  : 'bg-white border-zinc-200 text-zinc-900 focus:ring-1 ring-emerald-500 border'
              }`}
            />
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => {
          const Icon = CATEGORY_ICONS[category] || Package;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : isDark
                    ? 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Icon size={14} />
              {category}
            </button>
          );
        })}
      </div>

      {/* Materials Grid */}
      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {Object.keys(groupedMaterials).map(category => {
            const items = groupedMaterials[category];
            return (
              <motion.section 
                key={category}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    {(() => {
                      const Icon = CATEGORY_ICONS[category] || Package;
                      return <Icon size={20} className={isDark ? 'text-zinc-400' : 'text-zinc-500'} />;
                    })()}
                    <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{category}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                      {items.length} {items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddMaterial(category)}
                    className={`p-2 rounded-xl transition-all active:scale-95 ${
                      isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                    title="Adicionar novo material nesta categoria"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map(material => (
                  <motion.div
                    key={material.id}
                    layout
                    className={`group rounded-2xl overflow-hidden border transition-all hover:shadow-xl ${
                      isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-100 hover:border-zinc-200'
                    }`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-zinc-100">
                      <img 
                        src={material.image} 
                        alt={material.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                          <Camera size={24} />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(material.id, file);
                            }}
                          />
                        </label>
                      </div>
                      {material.trending && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg pointer-events-none">
                          <TrendingUp size={12} />
                          EM ALTA
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <input
                          type="text"
                          value={material.name}
                          onChange={(e) => handleUpdateMaterial(material.id, { name: e.target.value })}
                          className={`font-bold text-sm leading-tight flex-1 bg-transparent outline-none focus:ring-1 ring-emerald-500 rounded px-1 ${
                            isDark ? 'text-white' : 'text-zinc-900'
                          }`}
                        />
                        <div className="flex items-center gap-1">
                          <label className={`cursor-pointer p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
                          }`} title="Alterar imagem">
                            <Camera size={16} />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(material.id, file);
                              }}
                            />
                          </label>
                          <button
                            onClick={() => handleRemoveMaterial(material.id)}
                            className={`p-2 rounded-lg transition-colors text-red-500 ${
                              isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                            }`}
                            title="Excluir material"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Espessura
                          </label>
                          <input 
                            type="text"
                            placeholder="Ex: 15mm"
                            value={material.thickness || ''}
                            onChange={(e) => handleUpdateMaterial(material.id, { thickness: e.target.value })}
                            className={`text-xs font-bold bg-transparent outline-none w-full transition-colors focus:ring-1 ring-emerald-500 rounded px-1 ${
                              isDark ? 'text-white' : 'text-zinc-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Qtd
                          </label>
                          <input 
                            type="number"
                            min="1"
                            value={material.qty}
                            onChange={(e) => handleQtyChange(material.id, Number(e.target.value))}
                            className={`text-xs font-bold bg-transparent outline-none w-full transition-colors focus:ring-1 ring-emerald-500 rounded px-1 ${
                              isDark ? 'text-white' : 'text-zinc-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Unidade
                          </label>
                          <select 
                            value={material.unit}
                            onChange={(e) => handleUnitChange(material.id, e.target.value)}
                            className={`text-xs font-bold bg-transparent outline-none cursor-pointer transition-colors w-full ${
                              isDark ? 'text-white hover:text-emerald-400' : 'text-zinc-900 hover:text-emerald-600'
                            }`}
                          >
                            {UNITS.map(unit => (
                              <option key={unit} value={unit} className={isDark ? 'bg-zinc-900' : 'bg-white'}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="text-right">
                          <span className={`block text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Preço / {material.unit}</span>
                          <div className="flex items-center justify-end gap-1">
                            <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>R$</span>
                            <input 
                              type="number"
                              step="0.01"
                              value={material.price}
                              onChange={(e) => handleUpdateMaterial(material.id, { price: Number(e.target.value) })}
                              className={`text-lg font-black bg-transparent outline-none w-24 text-right focus:ring-1 ring-emerald-500 rounded px-1 ${
                                isDark ? 'text-emerald-400' : 'text-emerald-600'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}
        </AnimatePresence>

        {Object.keys(groupedMaterials).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-zinc-900 text-zinc-700' : 'bg-zinc-50 text-zinc-300'}`}>
              <Search size={32} />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Nenhum material encontrado</h3>
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Tente ajustar sua busca ou filtro de categoria.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
