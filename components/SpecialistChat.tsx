import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, ChatSession, GenerateContentResult } from "@google/generative-ai";
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
  const chatSessionRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  // Initialize Chat with Context
  useEffect(() => {
    const initChat = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) return;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-pro", // Switch to standard model
        systemInstruction: `
          Você é o 'BrainHz Specialist', um assistente de IA especialista em neurociência e nos protocolos da plataforma BrainHz.
          
          SUA BASE DE CONHECIMENTO (CONTEXTO ESTRITO):
          ${JSON.stringify(SESSION_CONFIGS, null, 2)}

          SEU OBJETIVO:
          1. Explicar a ciência por trás de cada modo (Gamma, Beta, Alpha, Theta, Delta).
          2. Recomendar protocolos baseados no que o usuário diz.
          3. Ser clínico, preciso, porém acessível.
          
          IMPORTANTE:
          Se o usuário pedir para "criar" ou "ativar" um protocolo, explique que você pode sugerir a configuração ideal (Hz, Cor, Tempo), mas ele deve clicar manualmente no card por enquanto.
        `
      });

      chatSessionRef.current = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 500,
        },
      });
    };

    if (!chatSessionRef.current) {
      initChat();
    }
  }, []);

  const handleSend = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;

    if (!textToSend.trim()) return;

    // Optimistic UI Update
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Lazy init if not ready
      if (!chatSessionRef.current) {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          chatSessionRef.current = model.startChat({});
        } else {
          throw new Error("API Key missing");
        }
      }

      const result = await chatSessionRef.current.sendMessage(textToSend);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: Date.now()
      }]);

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Erro de conexão neural. Tente novamente em instantes.",
        timestamp: Date.now()
      }]);
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