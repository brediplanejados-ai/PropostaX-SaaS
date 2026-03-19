import { GoogleGenAI, Type } from "@google/genai";
import { Budget, Material, Labor, CompanyProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateBudgetWithAI = async (prompt: string, currentBudget: Budget): Promise<Partial<Budget>> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `
      Você é um assistente especializado em marcenaria e orçamentos de móveis planejados.
      O usuário quer gerar um orçamento baseado no seguinte pedido: "${prompt}".
      
      Dados atuais do orçamento (para contexto):
      Cliente: ${currentBudget.clientName}
      Ambiente: ${currentBudget.environment}
      
      Gere um orçamento detalhado incluindo:
      1. Materiais necessários (descrição, especificação, quantidade, preço unitário estimado, unidade).
      2. Mão de obra necessária (função, descrição, valor estimado).
      3. Uma descrição curta e profissional para o título do orçamento.
      
      Retorne APENAS um JSON válido seguindo esta estrutura:
      {
        "title": "string",
        "materials": [
          {
            "description": "string",
            "spec": "string",
            "qty": number,
            "unitPrice": number,
            "unit": "string",
            "laborCost": number,
            "laborDescription": "string"
          }
        ],
        "labor": [
          {
            "role": "string",
            "description": "string",
            "value": number
          }
        ]
      }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          materials: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                spec: { type: Type.STRING },
                qty: { type: Type.NUMBER },
                unitPrice: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                laborCost: { type: Type.NUMBER },
                laborDescription: { type: Type.STRING }
              },
              required: ["description", "qty", "unitPrice"]
            }
          },
          labor: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                description: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["role", "value"]
            }
          }
        },
        required: ["title", "materials", "labor"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
};

export const generateContractWithAI = async (budget: Budget, companyProfile: CompanyProfile, totalPrice: number): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `
      Você é um assistente jurídico especializado em contratos de prestação de serviços de marcenaria.
      Gere um contrato de prestação de serviços profissional e completo baseado nos seguintes dados:
      
      CONTRATADA (Empresa):
      Nome: ${companyProfile.name}
      CNPJ: ${companyProfile.cnpj}
      Endereço: ${companyProfile.address}
      Telefone: ${companyProfile.phone}
      Email: ${companyProfile.email}
      
      CONTRATANTE (Cliente):
      Nome: ${budget.clientName}
      Ambiente: ${budget.environment}
      
      DETALHES DO PROJETO:
      Título: ${budget.title}
      Valor Total: R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      
      ITENS DO ORÇAMENTO:
      ${budget.materials.map(m => `- ${m.qty}x ${m.description} (${m.spec})`).join('\n')}
      
      O contrato deve incluir cláusulas sobre:
      1. Objeto do contrato
      2. Valor e forma de pagamento
      3. Prazo de entrega e montagem
      4. Obrigações da contratada e do contratante
      5. Garantia e assistência técnica
      6. Rescisão e foro
      
      Retorne o contrato formatado em Markdown, pronto para ser exibido e exportado.
    `,
  });

  return response.text || '';
};
