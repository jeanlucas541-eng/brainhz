import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, FunctionDeclaration, Type, Tool } from "@google/genai";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, MessageSquarePlus, Save } from 'lucide-react';
import { SESSION_CONFIGS, SessionMode } from '../types';
import { createCustomProtocol, CustomProtocol } from '../services/protocolService';
import { useAuth } from '../src/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface SpecialistChatProps {
  onRecommend?: (mode: SessionMode, explanation: string) => void;
  onProtocolCreated?: (protocol: CustomProtocol) => void;
}

const SUGGESTIONS = [
  { label: "Foco Intenso", text: "Preciso de um protocolo para foco intenso e trabalho profundo agora." },
  { label: "Combater Insonia", text: "Estou com dificuldade para dormir. Qual o melhor protocolo?" },
  { label: "Reduzir Ansiedade", text: "Estou me sentindo muito ansioso e preciso relaxar. O que sugere?" },
  { label: "Criar Protocolo", text: "Crie um protocolo personalizado para minha rotina de estudos." },
  { label: "Modo Estudo", text: "Tenho muita coisa para ler e estudar. Me ajude a concentrar." },
];

const SpecialistChat: React.FC<SpecialistChatProps> = ({ onRecommend, onProtocolCreated }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'model',
      text: 'Ola. Sou a **IA Especialista da BrainHz**.\n\nTenho acesso completo aos protocolos clinicos. Posso criar um **plano personalizado** para sua rotina. Me diga como voce esta se sentindo ou qual seu objetivo agora.\n\nSe eu sugerir um protocolo, posso ativa-lo automaticamente para voce. Ou posso **criar um protocolo customizado** e salvar no seu perfil.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Define Function Tool for Gemini - Activate existing protocol
  const activateProtocolTool: FunctionDeclaration = {
    name: "activate_protocol",
    description: "Ativa um protocolo existente e redireciona o usuario para a tela de protocolos. Use isso quando o usuario pedir uma recomendacao rapida.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: {
          type: Type.STRING,
          enum: Object.values(SessionMode).filter(m => m !== SessionMode.IDLE),
          description: "O modo de sessao a ser ativado (GAMMA, FOCUS, STUDY, CREATIVITY, SLEEP, RESTORE)."
        },
        explanation: {
          type: Type.STRING,
          description: "Uma explicacao curta e motivadora de por que este protocolo foi escolhido para o usuario."
        }
      },
      required: ["mode", "explanation"]
    }
  };

  // Define Function Tool for Gemini - Create custom protocol
  const createCustomProtocolTool: FunctionDeclaration = {
    name: "create_custom_protocol",
    description: "Cria um protocolo personalizado e salva no perfil do usuario. Use isso quando o usuario pedir para CRIAR, PERSONALIZAR ou MONTAR um protocolo especifico para suas necessidades.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Nome curto e descritivo para o protocolo (ex: 'Foco para Estudos', 'Relaxamento Noturno')"
        },
        description: {
          type: Type.STRING,
          description: "Descricao do proposito do protocolo"
        },
        base_mode: {
          type: Type.STRING,
          enum: Object.values(SessionMode).filter(m => m !== SessionMode.IDLE),
          description: "O modo base para o protocolo (GAMMA, FOCUS, STUDY, CREATIVITY, SLEEP, RESTORE)"
        },
        frequency_hz: {
          type: Type.NUMBER,
          description: "Frequencia de arrastamento em Hz (ex: 10 para Alpha, 40 para Gamma, 4 para Theta)"
        },
        duration_minutes: {
          type: Type.NUMBER,
          description: "Duracao recomendada em minutos (padrao: 20)"
        },
        noise_color: {
          type: Type.STRING,
          enum: ["Pink", "White", "Brown"],
          description: "Cor do ruido de fundo (Pink para suavidade, Brown para profundidade, White para neutralidade)"
        },
        explanation: {
          type: Type.STRING,
          description: "Explicacao de por que este protocolo foi criado assim para o usuario"
        }
      },
      required: ["name", "base_mode", "frequency_hz", "explanation"]
    }
  };

  // Initialize Chat with Context
  useEffect(() => {
    const initChat = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) {
        console.error("API Key não encontrada. Verifique VITE_GOOGLE_API_KEY.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const contextData = JSON.stringify(SESSION_CONFIGS, null, 2);

      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          tools: [{ functionDeclarations: [activateProtocolTool, createCustomProtocolTool] }],
          systemInstruction: `
            Voce e o 'BrainHz Specialist', um assistente de IA especialista em neurociencia e nos protocolos da plataforma BrainHz.
            
            SUA BASE DE CONHECIMENTO (CONTEXTO ESTRITO):
            ${contextData}

            VOCE TEM DUAS FERRAMENTAS:

            1. **activate_protocol**: Use para ATIVAR um protocolo existente rapidamente.
               - Use quando o usuario pedir recomendacao rapida ("estou cansado", "preciso focar agora")
            
            2. **create_custom_protocol**: Use para CRIAR e SALVAR um protocolo personalizado.
               - Use quando o usuario pedir para CRIAR, PERSONALIZAR, MONTAR um protocolo
               - Use quando o usuario descrever uma rotina especifica
               - Defina a frequencia Hz baseado no objetivo:
                 * Gamma (30-100 Hz): Insight, cognicao de pico
                 * Beta (13-30 Hz): Foco ativo, alerta
                 * Alpha (8-13 Hz): Relaxamento, criatividade
                 * Theta (4-8 Hz): Meditacao, sono leve, aprendizado
                 * Delta (0.5-4 Hz): Sono profundo, recuperacao
               - Escolha noise_color apropriado: Brown para profundidade, Pink para suavidade

            SUAS FUNCOES:
            1. Explicar a ciencia por tras de cada modo.
            2. Criar planos personalizados usando as ferramentas.
            
            Ao usar as ferramentas, a explicacao deve ser em segunda pessoa ("Preparei este protocolo para voce...").

            TOM DE VOZ:
            Clinico, preciso, porem acessivel.
            
            Fale sempre em Portugues.
          `,
        },
      });
    };

    if (!chatSessionRef.current) {
      initChat();
    }
  }, []);

  const handleSend = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;

    if (!textToSend.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessageStream({ message: textToSend });

      let fullText = '';
      const modelMsgId = (Date.now() + 1).toString();
      let hasAddedMsg = false;

      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;

        // Handle Function Calls
        if (c.candidates && c.candidates[0].content.parts) {
          for (const part of c.candidates[0].content.parts) {
            if (part.functionCall) {
              const fc = part.functionCall;

              // Handle activate_protocol
              if (fc.name === 'activate_protocol' && onRecommend) {
                const args = fc.args as any;
                // Execute Action
                onRecommend(args.mode as SessionMode, args.explanation);

                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  role: 'model',
                  text: `Ativando protocolo **${args.mode}** conforme seu plano personalizado...`,
                  timestamp: Date.now()
                }]);

                setIsLoading(false);
                return; // Stop processing stream if redirected
              }

              // Handle create_custom_protocol
              if (fc.name === 'create_custom_protocol' && user) {
                const args = fc.args as any;

                // Save to Supabase
                const newProtocol = await createCustomProtocol({
                  userId: user.id,
                  name: args.name,
                  description: args.description,
                  baseMode: args.base_mode as SessionMode,
                  frequencyHz: args.frequency_hz,
                  durationMinutes: args.duration_minutes || 20,
                  noiseColor: args.noise_color || 'Brown',
                  aiExplanation: args.explanation
                });

                if (newProtocol) {
                  // Notify parent component
                  if (onProtocolCreated) {
                    onProtocolCreated(newProtocol);
                  }

                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Protocolo **"${args.name}"** criado e salvo com sucesso!\n\n**Configuracao:**\n- Modo Base: ${args.base_mode}\n- Frequencia: ${args.frequency_hz} Hz\n- Duracao: ${args.duration_minutes || 20} minutos\n- Ruido: ${args.noise_color || 'Brown'}\n\n${args.explanation}\n\nVoce pode encontrar este protocolo na aba **Protocolos > Meus Protocolos**.`,
                    timestamp: Date.now()
                  }]);
                } else {
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Erro ao salvar o protocolo. Por favor, tente novamente.`,
                    timestamp: Date.now()
                  }]);
                }

                setIsLoading(false);
                return;
              }
            }
          }
        }

        // Handle Text
        if (c.text) {
          fullText += c.text;
          if (!hasAddedMsg) {
            setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: fullText, timestamp: Date.now() }]);
            hasAddedMsg = true;
          } else {
            setMessages(prev =>
              prev.map(m => m.id === modelMsgId ? { ...m, text: fullText } : m)
            );
          }
        }
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Erro ao conectar com o servidor neural. Verifique sua conexão.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render Markdown-like text structure
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();

      // List Items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <div key={i} className="flex items-start gap-2 ml-1 mb-1.5">
            <span className="text-neuro-accent mt-1.5 w-1.5 h-1.5 rounded-full bg-neuro-accent flex-shrink-0"></span>
            <span className="leading-relaxed">
              {content.split('**').map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
              )}
            </span>
          </div>
        );
      }

      // Numbered Lists
      if (/^\d+\./.test(trimmed)) {
        const [num, ...rest] = trimmed.split('.');
        const content = rest.join('.').trim();
        return (
          <div key={i} className="flex items-start gap-2 ml-1 mb-1.5">
            <span className="font-mono text-neuro-accent font-bold mt-0.5">{num}.</span>
            <span className="leading-relaxed">
              {content.split('**').map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
              )}
            </span>
          </div>
        );
      }

      // Headers (###)
      if (trimmed.startsWith('###')) {
        return <h4 key={i} className="text-neuro-accent font-bold mt-4 mb-2 text-base">{trimmed.replace(/#/g, '').trim()}</h4>
      }

      // Paragraphs
      if (trimmed === '') return <div key={i} className="h-2"></div>;

      return (
        <p key={i} className="mb-2 leading-relaxed">
          {line.split('**').map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-in fade-in duration-500 h-[600px] flex flex-col bg-neuro-900 border border-neuro-700 rounded-xl overflow-hidden shadow-2xl">

      {/* Header */}
      <div className="bg-neuro-800/80 backdrop-blur-md p-4 border-b border-neuro-700 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-neuro-accent to-purple-800 p-2 rounded-lg shadow-lg shadow-neuro-accent/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight">Consultor BrainHz</h3>
            <p className="text-[10px] text-neuro-success font-mono flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-neuro-success rounded-full animate-pulse"></span>
              Neural Link Ativo
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-neuro-900/50 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start group`}>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg mt-1 ${msg.role === 'user'
              ? 'bg-neuro-700 text-gray-300'
              : 'bg-neuro-800 border border-neuro-700 text-neuro-accent'
              }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-5 py-4 text-sm shadow-md transition-all duration-200 ${msg.role === 'user'
                ? 'bg-neuro-accent text-white rounded-tr-sm'
                : 'bg-neuro-800 border border-neuro-700/50 text-gray-300 rounded-tl-sm hover:border-neuro-700'
                }`}>

                {renderFormattedText(msg.text)}

              </div>
              {/* Timestamp */}
              <span className="text-[10px] text-gray-600 font-mono mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 ml-12 animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-neuro-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-neuro-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-neuro-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-neuro-accent/70 font-mono">Processando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips (Visible if conversation is short) */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto custom-scrollbar">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s.text)}
              className="whitespace-nowrap flex items-center gap-2 bg-neuro-800/80 backdrop-blur-sm border border-neuro-700 hover:border-neuro-accent text-xs text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neuro-accent/10"
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-neuro-800 border-t border-neuro-700">
        <div className="flex gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Crie um plano para eu focar no trabalho agora."
            rows={1}
            className="flex-1 bg-neuro-900 border border-neuro-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neuro-accent focus:ring-1 focus:ring-neuro-accent transition-all resize-none custom-scrollbar"
            disabled={isLoading}
            style={{ minHeight: '46px', maxHeight: '100px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-neuro-accent hover:bg-neuro-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-neuro-accent/20"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
          <AlertCircle size={10} />
          <span>BrainHz AI fornece orientações baseadas em padrões, não diagnósticos médicos.</span>
        </p>
      </div>
    </div>
  );
};

export default SpecialistChat;