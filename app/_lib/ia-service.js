'use server'

import OpenAI from "openai";
import { CONSTRUTOS } from './construtos';


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Remove blocos de Markdown ```json ... ``` e parseia JSON
 */
function parseJsonFromAI(text) {
  try {
    const cleaned = text.replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\n/g, ' ') // remove quebras de linha
      .replace(/\s{2,}/g, ' ') // substitui múltiplos espaços por um só
      .trim();;
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Erro ao parsear JSON:", e, text);
    return [];
  }
}


export async function gerarHipoteses({ respostasAnamnese }) {
  const prompt = `
Você é um assistente de neuropsicopedagogia, pedagogia, psicologia e psicopedagogia. 
Baseado na seguinte queixa/resumo da Anamnese: "${respostasAnamnese}", 
liste de 2-5 possíveis hipóteses diagnósticas usando como referencia criterios diagnósticos do DSM-5-TR mais recente. Para cada hipótese, sugira ate 3 a 4 formas de avaliações apropriadas e os 3 a 7 construtos a serem verificados.

⚠️ IMPORTANTE:
- Os construtos DEVEM ser escolhidos apenas da lista abaixo:
${Object.values(CONSTRUTOS).flat().join(", ")}

Retorne em JSON assim: 

[
 {
   "id_hipotese": "1", 
   "hipotese": "Hipótese 1", 
   "formas_avaliacao": ["Teste A (motivo)", "Teste B (motivo)"], 
   "construtos": ["construto C", "construto D"], 
   "origem": "Sugestão"
 }
]
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = response.choices?.[0]?.message?.content || "";
    const hipoteses = parseJsonFromAI(text);
    return hipoteses;

  } catch (err) {
    if (err.status === 429) {
      console.error("Limite de requisições excedido:", err);
      throw new Error("Limite de requisições da OpenAI excedido. Tente novamente mais tarde.");
    }
    console.error("Erro ao gerar hipóteses:", err);
    throw err;
  }
}


export async function gerarResumoQueixa(respostasAnamnese, idade) {
  console.log(respostasAnamnese)

  if (!respostasAnamnese || respostasAnamnese.trim().length === 0) {
    return "Nenhuma informação disponível na anamnese.";
  }
  const palavrasValidas = respostasAnamnese.match(/\b[a-zA-Z]{3,}\b/g);
  if (!palavrasValidas || palavrasValidas.length === 0) {
    return ""; // retorna vazio se não houver palavras “legíveis”
  }
  const prompt = `
Analise as seguintes respostas da anamnese de uma criança de ${idade}:
${respostasAnamnese}

Gere um resumo conciso e coerente da queixa principal, incluindo dificuldades percebidas, comportamentos observados e informações relevantes da família ou saúde. 
O resumo deve ser consistente para gerar hipóteses de avaliação neuropsicopedagógica. Não adicione comentarios ou acrescente informaçoes. somente dados relevantes.
Retorne apenas texto, sem JSON.
`
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  })

  return completion.choices[0].message.content.trim()
}

export async function gerarHistorico(respostasAnamnese, dataNascimento) {
  // Se não houver respostas, não gera nada inventado
  if (!respostasAnamnese || respostasAnamnese.trim().length === 0) {
    return "Nenhuma informação disponível na anamnese.";
  }

  const prompt = `
Você é um assistente especializado em relatórios clínicos.
O paciente nasceu em ${dataNascimento}.

Texto original da anamnese (respostas fornecidas):
"""
${respostasAnamnese}
"""

INSTRUÇÕES:
- Reescreva as informações acima como um histórico clínico corrido.
- Construa parágrafos claros e coesos, conectando as ideias.
- Use SOMENTE o que foi escrito na anamnese, sem inventar dados adicionais.
- Não insira queixa principal, dados pessoais, diagnósticos ou recomendações.
- Retorne apenas o texto final em parágrafos, sem listas, títulos ou comentários extras.

Histórico:
  `;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0, // zero = evita invenções
  });

  return completion.choices[0].message.content.trim();
}

