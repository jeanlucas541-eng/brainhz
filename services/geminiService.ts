import { GoogleGenAI } from "@google/genai";
import { SessionConfig } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSessionInsight = async (config: SessionConfig): Promise<string> => {
  const client = createClient();
  if (!client) return "Erro de configuração da API.";

  const prompt = `
    Você é uma IA especialista em neurociência e psicoacústica.
    O usuário acabou de iniciar uma sessão de áudio com os seguintes parâmetros:
    
    ATIVIDADE: ${config.activity}
    RUÍDO: ${config.noiseColor} Noise
    FREQUÊNCIA ALVO: ${config.waveType} (${config.frequencyRange[0]}-${config.frequencyRange[1]}Hz)
    VIBE: ${config.vibe}

    Gere um parágrafo curto, técnico mas encorajador (máximo 40 palavras), explicando cientificamente por que essa combinação específica de ruído e frequência ajuda nessa atividade específica. Fale diretamente com o usuário em Português.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Iniciando sincronização neural...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Protocolo iniciado. Calibrando frequências...";
  }
};

export const constructPromptFromTemplate = (config: SessionConfig): string => {
  return `"Paisagem sonora psicoacústica funcional projetada para arrastamento neural (neuro-entrainment) e ${config.activity}. Estrutura: Ambiente estilo Drone contínuo e em loop, sem mudanças bruscas de volume, sem vocais e sem batidas de percussão marcadas. Camadas: Base de ruído ${config.noiseColor} Noise para mascaramento auditivo combinada com oscilação rítmica de ${config.waveType} no estilo pulso isocrônico. Instrumentação: Sintetizadores modulares analógicos, pads de onda senoidal pura e ressonância de sub-graves profunda. Atmosfera: Clínica, alta fidelidade, imersiva e ${config.vibe}. Mixagem: Campo estéreo amplo para simulação binaural."`;
};