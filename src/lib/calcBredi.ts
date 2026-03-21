/**
 * Motor de Cálculo bRedi - Versão 1.0
 * Converte Dimensões Externas em Plano de Corte e Materiais
 */

export const calcularPlanoDeCorte = (largura: number, altura: number, profundidade: number, espessuraMDF = 15) => {
  // Configurações Técnicas de Marcenaria
  // const recuoFundo = 15;        // mm para dentro do móvel (removido temporariamente caso cause no-unused-vars)
  const folgaPorta = 3;         // folga total (1.5mm de cada lado)
  const espessuraFundo = 6;     // MDF de fundo
  const larguraTravessa = 100;  // Travessas de sustentação (ripas)

  // 1. CÁLCULO DAS PEÇAS (ESTRUTURA)
  const pecas = [
    { 
      nome: "Lateral", 
      qtd: 2, 
      comp: altura, 
      larg: profundidade, 
      fita: "4 lados",
      material: "MDF Cor Selecionada"
    },
    { 
      nome: "Base/Chapéu", 
      qtd: 2, 
      comp: largura - (espessuraMDF * 2), 
      larg: profundidade, 
      fita: "1 lado (frontal)",
      material: "MDF Cor Selecionada"
    },
    { 
      nome: "Travessa Estrutural", 
      qtd: 2, 
      comp: largura - (espessuraMDF * 2), 
      larg: larguraTravessa, 
      fita: "Sem fita",
      material: "MDF Branco (Economia)"
    },
    { 
      nome: "Fundo", 
      qtd: 1, 
      comp: altura - 6, 
      larg: largura - 6, 
      fita: "Sem fita",
      material: `MDF ${espessuraFundo}mm`
    },
    { 
      nome: "Porta", 
      qtd: 1, 
      comp: altura - folgaPorta, 
      larg: largura - folgaPorta, 
      fita: "4 lados",
      material: "MDF Externo"
    }
  ];

  // 2. CÁLCULO DE FERRAGENS (LÓGICA AUTOMÁTICA)
  const ferragens = {
    dobradicas: altura > 900 ? 3 : 2, // Se maior que 90cm, usa 3 dobradiças
    parafusos: (pecas.length * 4) + 10, // Estimativa de montagem
    cantoneiras: 4 // Para fixação na parede
  };

  // 3. CÁLCULO DE FITA DE BORDA (METRAGEM LINEAR)
  // Cálculo simplificado: soma dos perímetros das peças que recebem fita
  const metrosFita = pecas.reduce((total, p) => {
    if (p.fita === "4 lados") return total + (((p.comp * 2) + (p.larg * 2)) / 1000);
    if (p.fita === "1 lado (frontal)") return total + (p.comp / 1000);
    return total;
  }, 0).toFixed(2);

  return {
    pecas,
    ferragens,
    resumoCompra: {
      totalMDF: ((altura * largura) / 1000000).toFixed(2) + " m²",
      fitaBorda: metrosFita + " metros"
    }
  };
};
