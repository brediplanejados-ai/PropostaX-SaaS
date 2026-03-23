import { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { CompanyProfile } from '../types';
import { calcularPlanoDeCorte } from '../lib/calcBredi';
import { Package, Ruler, Hammer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTheme } from '../context/ThemeContext';

// Fix typings for autotable
interface jsPDFCustom extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

const exportarPDF = (dados: any, dimensoes: any, material: string) => {
  const doc = new jsPDF() as jsPDFCustom;
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  // CABEÇALHO
  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241); // Roxo (Primary)
  doc.text("bRedi Planejados - Ordem de Produção", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Data: ${dataHoje} | Módulo: Personalizado | Material: ${material}`, 14, 30);
  doc.text(`Medidas Externas: ${dimensoes.largura}x${dimensoes.altura}x${dimensoes.prof} mm`, 14, 35);

  // TABELA DE PEÇAS (PLANO DE CORTE)
  const colunasPecas = ["Peça", "Qtd", "Comp. (mm)", "Larg. (mm)", "Fita de Borda"];
  const linhasPecas = dados.pecas.map((p: any) => [p.nome, p.qtd, p.comp, p.larg, p.fita]);

  (doc as any).autoTable({
    startY: 45,
    head: [colunasPecas],
    body: linhasPecas,
    headStyles: { fillColor: [99, 102, 241] },
  });

  // TABELA DE FERRAGENS E COMPRA
  const finalY = doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY + 10 : 150;
  doc.setFontSize(14);
  doc.text("Lista de Ferragens e Insumos", 14, finalY);

  const colunasFerragens = ["Item", "Quantidade / Medida"];
  const linhasFerragens = [
    ["Dobradiças", `${dados.ferragens.dobradicas} unidades`],
    ["Parafusos (Est.)", `${dados.ferragens.parafusos} unidades`],
    ["Cantoneiras", `${dados.ferragens.cantoneiras} unidades`],
    ...(dados.ferragens.pinosPrateleira > 0 ? [["Pinos de Prateleira", `${dados.ferragens.pinosPrateleira} unidades`]] : []),
    ["Fita de Borda Total", dados.resumoCompra.fitaBorda],
    ["Área de MDF Estimada", dados.resumoCompra.totalMDF]
  ];

  (doc as any).autoTable({
    startY: finalY + 5,
    head: [colunasFerragens],
    body: linhasFerragens,
    theme: 'grid',
    headStyles: { fillColor: [50, 50, 50] },
  });

  // RODAPÉ
  doc.setFontSize(8);
  doc.text("Gerado por PropostaX Software - bRedi Planejados", 14, 285);

  // DOWNLOAD
  doc.save(`Plano_Corte_bRedi_${Date.now()}.pdf`);
};

// Componente Croqui Visual
const ModuleSketch = ({ dimensoes, material, isDark, numPrateleiras }: { dimensoes: { largura: number, altura: number, prof: number }, material: string, isDark: boolean, numPrateleiras: number }) => {
  const maxW = 320;
  const maxH = 320;
  
  // Impede que o divisor seja zero
  const safeLargura = Math.max(dimensoes.largura, 1);
  const safeAltura = Math.max(dimensoes.altura, 1);
  
  const ratio = Math.min(maxW / safeLargura, maxH / safeAltura);
  const drawW = safeLargura * ratio;
  const drawH = safeAltura * ratio;
  
  const strokeColor = isDark ? "#818cf8" : "#4f46e5";
  const textColor = isDark ? "#c7d2fe" : "#4338ca";

  // Cálculo das prateleiras (linhas horizontais)
  const shelfLines = [];
  if (numPrateleiras > 0) {
    const spacing = drawH / (numPrateleiras + 1);
    for (let i = 1; i <= numPrateleiras; i++) {
      shelfLines.push(spacing * i);
    }
  }

  return (
    <div className={`shadow-xl border transition-all duration-300 flex items-center justify-center rounded-2xl mb-8 flex-shrink-0 ${isDark ? 'bg-[#111111] border-white/10' : 'bg-white border-indigo-100'}`}
         style={{ width: `${maxW + 120}px`, height: `${maxH + 120}px` }}>
      <svg width={drawW + 60} height={drawH + 60} viewBox={`-30 -30 ${drawW + 60} ${drawH + 60}`} className="overflow-visible">
        {/* Corpo do Móvel */}
        <rect x="0" y="0" width={drawW} height={drawH} fill={isDark ? "#1e1e2d" : "#f8fafc"} stroke={strokeColor} strokeWidth="2" rx="2" />
        <rect x="5" y="5" width={Math.max(drawW - 10, 0)} height={Math.max(drawH - 10, 0)} fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
        
        {/* Prateleiras */}
        {shelfLines.map((y, idx) => (
          <line key={idx} x1="5" y1={y} x2={drawW - 5} y2={y} stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
        ))}

        {/* Cota Largura */}
        <line x1="0" y1="-15" x2={drawW} y2="-15" stroke={strokeColor} strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1="0" y1="-20" x2="0" y2="-5" stroke={strokeColor} strokeWidth="1.5" />
        <line x1={drawW} y1="-20" x2={drawW} y2="-5" stroke={strokeColor} strokeWidth="1.5" />
        <text x={drawW / 2} y="-25" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">L: {dimensoes.largura}mm</text>

        {/* Cota Altura */}
        <line x1={drawW + 15} y1="0" x2={drawW + 15} y2={drawH} stroke={strokeColor} strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1={drawW + 5} y1="0" x2={drawW + 20} y2="0" stroke={strokeColor} strokeWidth="1.5" />
        <line x1={drawW + 5} y1={drawH} x2={drawW + 20} y2={drawH} stroke={strokeColor} strokeWidth="1.5" />
        <text x={drawW + 25} y={drawH / 2} textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold" transform={`rotate(90 ${drawW + 25} ${drawH / 2})`}>A: {dimensoes.altura}mm</text>

        {/* Textos Internos */}
        <text x={drawW / 2} y={drawH / 2} textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold" opacity="0.9">P: {dimensoes.prof}mm</text>
        <text x={drawW / 2} y={drawH / 2 + 20} textAnchor="middle" fill={textColor} fontSize="12" opacity="0.6">{material}</text>

        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};


export function ConfiguradorModulos() {
  const { isDark, toggleTheme } = useTheme();
  const [companyProfile] = useState<CompanyProfile>({
    name: 'PropostaX',
    budgetTerms: '',
    showDetails: true,
    cnpj: '',
    address: '',
    phone: '',
    email: ''
  });

  const [dimensoes, setDimensoes] = useState({ largura: 600, altura: 700, prof: 550 });
  const [numPrateleiras, setNumPrateleiras] = useState(1);
  const [material, setMaterial] = useState('Louro Freijó');
  const [plano, setPlano] = useState<ReturnType<typeof calcularPlanoDeCorte> | null>(null);

  const handleGerarPlano = () => {
    const resultado = calcularPlanoDeCorte(dimensoes.largura, dimensoes.altura, dimensoes.prof, numPrateleiras);
    setPlano(resultado);
  };

  return (
    <div className={`min-h-screen pb-24 sm:pb-32 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-surface text-on-surface'}`}>
      <Header 
        isDark={isDark} 
        onThemeToggle={toggleTheme} 
        companyProfile={companyProfile}
      />
      
      <main className="pt-24 h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] flex overflow-hidden">
        {/* SIDEBAR DE CONFIGURAÇÃO */}
        <div className={`w-80 p-6 flex-shrink-0 shadow-lg overflow-y-auto z-10 ${isDark ? 'bg-surface-container-low border-r border-white/5' : 'bg-white border-r border-indigo-50'}`}>
          <h2 className="text-xl font-bold mb-6 text-primary">Configurar Módulo</h2>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Largura (mm)</label>
              <input 
                type="number" 
                value={dimensoes.largura} 
                onChange={(e) => setDimensoes({...dimensoes, largura: Number(e.target.value)})} 
                className={`w-full border rounded p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`} 
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Altura (mm)</label>
              <input 
                type="number" 
                value={dimensoes.altura} 
                onChange={(e) => setDimensoes({...dimensoes, altura: Number(e.target.value)})} 
                className={`w-full border rounded p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`} 
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Profundidade (mm)</label>
              <input 
                type="number" 
                value={dimensoes.prof} 
                onChange={(e) => setDimensoes({...dimensoes, prof: Number(e.target.value)})} 
                className={`w-full border rounded p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`} 
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Prateleiras Internas</label>
              <input 
                type="number" 
                min="0"
                max="10"
                value={numPrateleiras} 
                onChange={(e) => setNumPrateleiras(Number(e.target.value))} 
                className={`w-full border rounded p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`} 
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Material / Cor</label>
              <select 
                value={material} 
                onChange={(e) => setMaterial(e.target.value)}
                className={`w-full border rounded p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isDark ? 'bg-surface border-white/10' : 'bg-white border-gray-300'}`} 
              >
                <option>Louro Freijó</option>
                <option>Cinza Sagrado</option>
                <option>Branco Supremo</option>
                <option>Preto São Gabriel (Tampos)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGerarPlano}
            className="w-full mt-8 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            GERAR PLANO DE CORTE
          </button>
        </div>

        {/* VIEWPORT & PLANO DE CORTE */}
        <div className={`flex-1 flex flex-col items-center overflow-y-auto p-4 sm:p-8 ${isDark ? 'bg-[#050505]' : 'bg-slate-100'}`}>
          
          {/* CROQUI VISUAL COM COTAS */}
          <ModuleSketch dimensoes={dimensoes} material={material} isDark={isDark} numPrateleiras={numPrateleiras} />

          {plano && (
            <div className={`w-full max-w-4xl p-6 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4 ${isDark ? 'bg-surface-container-low' : 'bg-white'}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Ruler className="text-primary" />
                Plano de Corte e Materiais
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lista de Peças */}
                <div className="space-y-4">
                  <h4 className={`text-sm tracking-wider uppercase font-bold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Peças ({plano.pecas.reduce((acc, p) => acc + p.qtd, 0)})</h4>
                  <ul className="space-y-3">
                    {plano.pecas.map((p, idx) => (
                      <li key={idx} className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-[var(--color-on-surface)]">{p.qtd}x {p.nome}</span>
                          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{p.comp} x {p.larg}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={isDark ? 'text-white/60' : 'text-gray-600'}>{p.material}</span>
                          <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Fita: {p.fita}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resumo e Ferragens */}
                <div className="space-y-6">
                  <div>
                    <h4 className={`text-sm tracking-wider uppercase font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                      <Hammer size={16} />
                      Ferragens
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className={`p-3 rounded-xl text-center border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="text-2xl font-bold text-primary">{plano.ferragens.dobradicas}</div>
                        <div className="text-[10px] uppercase tracking-wide">Dobradiças</div>
                      </div>
                      <div className={`p-3 rounded-xl text-center border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="text-2xl font-bold text-primary">{plano.ferragens.parafusos}</div>
                        <div className="text-[10px] uppercase tracking-wide">Parafusos</div>
                      </div>
                      <div className={`p-3 rounded-xl text-center border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="text-2xl font-bold text-primary">{plano.ferragens.cantoneiras}</div>
                        <div className="text-[10px] uppercase tracking-wide">Cantoneiras</div>
                      </div>
                      <div className={`p-3 rounded-xl text-center border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="text-2xl font-bold text-primary">{plano.ferragens.pinosPrateleira}</div>
                        <div className="text-[10px] uppercase tracking-wide">Pinos Prat.</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-sm tracking-wider uppercase font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                      <Package size={16} />
                      Resumo para Compra
                    </h4>
                    <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Chapa MDF Padrão</span>
                        <span className="font-bold text-primary">{plano.resumoCompra.totalMDF}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Fita de Borda</span>
                        <span className="font-bold text-primary">{plano.resumoCompra.fitaBorda}</span>
                      </div>
                    </div>
                  </div>

                  {/* BOTÃO EXPORTAR */}
                  <div className="pt-4">
                    <button 
                      onClick={() => exportarPDF(plano, dimensoes, material)}
                      className="w-full bg-[#10b981] text-white py-3 rounded-xl font-bold hover:bg-[#059669] transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      BAIXAR PDF PARA CORTE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <BottomNav 
        activeTab="modulos" 
        onTabChange={() => {}} 
      />
    </div>
  );
}
