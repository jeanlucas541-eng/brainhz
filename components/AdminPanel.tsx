
import React, { useState, useEffect, useRef } from 'react';
import {
   LayoutDashboard, Users, Radio, Mail, BarChart3, Bot,
   Save, Trash2, Search, Send, RefreshCw, TrendingUp,
   Globe, Video, Lightbulb, ExternalLink, ShieldAlert,
   CheckCircle2, AlertCircle, X, Brain, Activity, Plus,
   Sparkles, Wand2, ArrowRight, FileText, Menu
} from 'lucide-react';
import { SESSION_CONFIGS, SessionMode, SessionConfig } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import TerminalOutput from './TerminalOutput';
import { supabase } from '../src/lib/supabase';
import { createCustomProtocol } from '../services/protocolService';

// --- REAL DATA FETCHING ---
interface Props {
   onExit: () => void;
}

const AdminPanel: React.FC<Props> = ({ onExit }) => {
   const [activeTab, setActiveTab] = useState<'DASH' | 'PROTOCOLS' | 'USERS' | 'MARKETING' | 'AI_CMO'>('DASH');
   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State

   const [stats, setStats] = useState({
      totalUsers: 0,
      totalSessions: 0,
      activeUsers: 0,
      mrr: 0,
      retention: [0, 0, 0, 0, 0, 0, 0] // Placeholder for now
   });

   const [sessionDistribution, setSessionDistribution] = useState<{ mode: string, count: number, color: string }[]>([]);

   useEffect(() => {
      fetchDashboardData();
   }, []);

   const fetchDashboardData = async () => {
      // 1. Total Users
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // 2. Total Sessions
      const { count: sessionCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true });

      // 3. Active Users (Last 30 days) - Approximate via profiles.last_login
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: activeCount } = await supabase
         .from('profiles')
         .select('*', { count: 'exact', head: true })
         .gt('last_login', thirtyDaysAgo.toISOString());

      // 4. MRR Calculation (Aproximate)
      // Get all pro users
      // Note: In real app, do this with count filters to avoid downloading all rows if DB is huge.
      // For MVP size, fetching plan column is fine.
      const { data: plans } = await supabase.from('profiles').select('plan');
      let mrr = 0;
      plans?.forEach(p => {
         if (p.plan === 'monthly') mrr += 19.90;
         if (p.plan === 'lifetime') mrr += (199.00 / 12); // Amortized for MRR view or just count huge spikes? Let's use simplified MRR.
      });

      // 5. Session Distribution
      // Requires grouping. Supabase client doesn't do "GROUP BY" easily without RPC.
      // We will fetch all sessions mode column (okay for < 10k sessions).
      const { data: sessions } = await supabase.from('sessions').select('mode');
      const dist: Record<string, number> = {};
      sessions?.forEach(s => {
         dist[s.mode] = (dist[s.mode] || 0) + 1;
      });

      const totalS = sessions?.length || 1;
      const distArray = Object.entries(dist).map(([mode, count]) => ({
         mode,
         count,
         color: mode === 'FOCUS' ? 'bg-neuro-warning' : mode === 'SLEEP' ? 'bg-blue-400' : mode === 'GAMMA' ? 'bg-red-500' : 'bg-neuro-accent'
      })).sort((a, b) => b.count - a.count);

      setStats({
         totalUsers: userCount || 0,
         totalSessions: sessionCount || 0,
         activeUsers: activeCount || 0,
         mrr: Math.floor(mrr),
         retention: [85, 82, 80, 78, 88, 92, 95] // Keep mock for advanced retention graph for now
      });
      setSessionDistribution(distArray);
   };

   // 1. DASHBOARD & ANALYTICS
   const DashboardView = () => (
      <div className="space-y-6 animate-in fade-in duration-300">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
               { label: "Receita Mensal (MRR)", val: `R$ ${stats.mrr.toLocaleString('pt-BR')}`, trend: "+12%", icon: TrendingUp, color: "text-green-400" },
               { label: "Usuários Ativos", val: stats.activeUsers.toString(), trend: "+5%", icon: Users, color: "text-blue-400" },
               { label: "Sessões Totais", val: stats.totalSessions.toString(), trend: "+24%", icon: Radio, color: "text-neuro-accent" },
               { label: "Usuários Totais", val: stats.totalUsers.toString(), trend: "+2%", icon: Activity, color: "text-yellow-500" },
            ].map((stat, i) => (
               <div key={i} className="bg-neuro-800/50 border border-neuro-700 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                     <stat.icon className={`${stat.color}`} size={20} />
                     <span className={`text-xs font-mono ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.trend}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.val}</div>
                  <div className="text-xs text-gray-500 uppercase font-mono">{stat.label}</div>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retention Graph Mockup */}
            <div className="bg-neuro-800/30 border border-neuro-700 p-6 rounded-xl">
               <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 size={16} className="text-neuro-accent" /> Curva de Retenção de Dopamina
               </h3>
               <div className="h-48 flex items-end gap-2">
                  {stats.retention.map((val, i) => (
                     <div key={i} className="flex-1 bg-neuro-700 hover:bg-neuro-accent transition-colors rounded-t-sm relative group" style={{ height: `${val}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-neuro-700 whitespace-nowrap">
                           Semana {i + 1}: {val}%
                        </div>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
                  <span>S1</span><span>S7</span>
               </div>
            </div>

            {/* Distribution */}
            <div className="bg-neuro-800/30 border border-neuro-700 p-6 rounded-xl">
               <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <Brain size={16} className="text-neuro-accent" /> Preferência de Protocolo
               </h3>
               <div className="space-y-4">
                  {sessionDistribution.map((item, i) => (
                     <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-gray-300">{item.mode}</span>
                           <span className="text-gray-500">{item.count} sessões</span>
                        </div>
                        <div className="w-full h-2 bg-neuro-900 rounded-full overflow-hidden">
                           <div className={`h-full ${item.color}`} style={{ width: `${(item.count / (Math.max(stats.totalSessions, 1))) * 100}%` }}></div>
                        </div>
                     </div>
                  ))}
                  {sessionDistribution.length === 0 && <p className="text-xs text-gray-500">Nenhum dado de sessão ainda.</p>}
               </div>
            </div>
         </div>
      </div>
   );

   // 2. PROTOCOL EDITOR
   const ProtocolEditor = () => {
      // Local state for editing (mock + real)
      const [configs, setConfigs] = useState<Record<string, SessionConfig>>(SESSION_CONFIGS);
      const [selectedId, setSelectedId] = useState<string>(SessionMode.FOCUS);
      const [isCreating, setIsCreating] = useState(false);

      // Form State
      const [editForm, setEditForm] = useState<Partial<SessionConfig> & { isPublic?: boolean }>(SESSION_CONFIGS[SessionMode.FOCUS]);

      // AI Generation State
      const [aiPrompt, setAiPrompt] = useState("");
      const [isGenerating, setIsGenerating] = useState(false);

      useEffect(() => {
         if (!isCreating && selectedId) {
            setEditForm(configs[selectedId]);
         }
      }, [selectedId, configs, isCreating]);

      const handleCreateNew = () => {
         setIsCreating(true);
         setSelectedId(""); // Deselect current
         setEditForm({
            label: "Novo Protocolo",
            activity: "descrição da atividade",
            noiseColor: "Pink",
            waveType: "Onda Customizada",
            frequencyRange: [10, 20],
            vibe: "indefinido",
            description: "Descrição curta",
            science: "Explicação científica...",
            recommendedDuration: "20 min",
            benefits: ["Benefício 1"],
            isPublic: true // Default to public for Admin
         });
      };

      const handleSave = async () => {
         if (isCreating) {
            // REAL SAVE TO SUPABASE
            try {
               // Initial user fetch (assuming Admin is logged in context, but we need ID)
               const { data: { user } } = await supabase.auth.getUser();
               if (!user) throw new Error("Usuário não autenticado");

               const newProtocol = await createCustomProtocol({
                  userId: user.id,
                  name: editForm.label || "Protocolo Admin",
                  description: editForm.description,
                  baseMode: SessionMode.FOCUS, // Default base
                  frequencyHz: editForm.frequencyRange?.[0] || 10,
                  durationMinutes: parseInt(editForm.recommendedDuration?.split(' ')[0] || "20"),
                  noiseColor: editForm.noiseColor,
                  aiExplanation: editForm.science,
                  isPublic: editForm.isPublic
               });

               if (newProtocol) {
                  alert("✅ Protocolo Salvo Globalmente!");
                  setIsCreating(false);
                  // Optionally refresh list
               } else {
                  alert("Erro ao salvar protocolo.");
               }
            } catch (err) {
               console.error(err);
               alert("Erro ao conectar com banco de dados.");
            }
         } else {
            // Mock Update for existing system protocols
            setConfigs(prev => ({ ...prev, [selectedId]: { ...prev[selectedId], ...editForm } as SessionConfig }));
            alert("Alterações locais salvas.");
         }
      };

      const generateProtocolWithAI = async () => {
         if (!aiPrompt) return;
         setIsGenerating(true);

         try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            if (!apiKey) {
               console.error("VITE_GOOGLE_API_KEY missing");
               throw new Error("API Key não configurada");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
                Aja como um neurocientista e engenheiro de áudio sênior.
                Crie um protocolo de arrastamento neural (brainwave entrainment) completo baseado neste objetivo do usuário: "${aiPrompt}".
                
                Responda APENAS com um objeto JSON válido (sem markdown, sem \`\`\`) seguindo exatamente esta estrutura:
                {
                    "label": "Nome Criativo e Técnico (ex: Deep Focus Gamma)",
                    "activity": "atividade principal em poucas palavras",
                    "noiseColor": "Pink" ou "White" ou "Brown",
                    "waveType": "Nome da Onda (ex: Theta/Alpha)",
                    "frequencyRange": [min_hz, max_hz],
                    "vibe": "3 adjetivos de atmosfera",
                    "description": "Descrição curta para o card (max 10 palavras)",
                    "science": "Explicação científica robusta sobre o mecanismo de ação (max 30 palavras).",
                    "recommendedDuration": "ex: 20 - 40 min",
                    "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"]
                }
            `;

            const result = await model.generateContent(prompt);
            let text = result.response.text();

            // Clean markdown if present
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            const json = JSON.parse(text);

            setEditForm(prev => ({
               ...prev,
               ...json
            }));

         } catch (e) {
            console.error(e);
            alert("Erro ao gerar protocolo via IA. Tente novamente.");
         } finally {
            setIsGenerating(false);
         }
      };

      return (
         <div className="grid grid-cols-12 gap-6 h-[600px]">
            {/* SIDEBAR LIST */}
            <div className="col-span-3 border-r border-neuro-700 pr-4 flex flex-col">
               <button
                  onClick={handleCreateNew}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 rounded-lg text-xs font-bold font-mono transition-all border ${isCreating ? 'bg-neuro-accent text-white border-neuro-accent' : 'bg-neuro-900 border-neuro-700 text-neuro-accent hover:border-neuro-accent'}`}
               >
                  <Plus size={14} /> NOVO PROTOCOLO
               </button>

               <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                  {(Object.values(configs) as SessionConfig[]).map(config => (
                     <button
                        key={config.id}
                        onClick={() => { setIsCreating(false); setSelectedId(config.id); }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-xs font-mono transition-colors border ${!isCreating && selectedId === config.id ? 'bg-neuro-800 text-white border-neuro-700' : 'bg-transparent text-gray-400 border-transparent hover:bg-neuro-900'}`}
                     >
                        {config.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* EDITOR AREA */}
            <div className="col-span-9 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
               <div className="bg-neuro-800 p-6 rounded-xl border border-neuro-700">

                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-6 border-b border-neuro-700 pb-4">
                     <div className="flex items-center gap-3">
                        {isCreating ? (
                           <div className="p-2 bg-neuro-accent/20 rounded-lg">
                              <Sparkles className="text-neuro-accent" size={20} />
                           </div>
                        ) : (
                           <div className="p-2 bg-gray-700/30 rounded-lg">
                              <Radio className="text-gray-400" size={20} />
                           </div>
                        )}
                        <div>
                           <h3 className="text-lg font-bold text-white">
                              {isCreating ? "Criar Novo Protocolo" : `Editando: ${editForm.label}`}
                           </h3>
                           <p className="text-xs text-gray-500 font-mono">
                              {isCreating ? "Defina os parâmetros manualmente ou use a IA." : `ID: ${selectedId}`}
                           </p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        {!isCreating && <button className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={16} /></button>}
                        <button onClick={handleSave} className="px-6 py-2 bg-neuro-accent hover:bg-neuro-accent/90 text-white text-xs font-bold rounded flex items-center gap-2 transition-all">
                           <Save size={14} /> {isCreating ? "CRIAR PROTOCOLO" : "SALVAR ALTERAÇÕES"}
                        </button>
                     </div>
                  </div>

                  {/* AI GENERATOR (Only visible when creating or empty) */}
                  {isCreating && (
                     <div className="mb-8 bg-neuro-900/50 border border-neuro-accent/30 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <Bot size={100} />
                        </div>
                        <div className="relative z-10">
                           <label className="text-xs font-bold text-neuro-accent uppercase mb-2 flex items-center gap-2">
                              <Wand2 size={12} /> Gerador de Protocolo via IA (Gemini)
                           </label>
                           <div className="flex gap-2">
                              <input
                                 type="text"
                                 value={aiPrompt}
                                 onChange={(e) => setAiPrompt(e.target.value)}
                                 placeholder="Ex: Alívio para TDAH, Meditação Transcendental, Sono Lúcido..."
                                 className="flex-1 bg-neuro-900 border border-neuro-700 rounded-lg px-4 py-2 text-sm text-white focus:border-neuro-accent focus:outline-none"
                              />
                              <button
                                 onClick={generateProtocolWithAI}
                                 disabled={isGenerating || !aiPrompt}
                                 className="px-4 py-2 bg-white text-neuro-900 font-bold text-xs rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                              >
                                 {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                 GERAR
                              </button>
                           </div>
                           <p className="text-[10px] text-gray-500 mt-2">
                              A IA irá pesquisar a base científica e preencher todos os campos técnicos (Hz, Onda, Explicação) automaticamente.
                           </p>
                        </div>
                     </div>
                  )}

                  {/* FORM FIELDS */}
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs text-gray-500 uppercase mb-1">Nome do Protocolo</label>
                           <input
                              type="text"
                              value={editForm.label}
                              onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                              className="w-full bg-neuro-900 border border-neuro-700 rounded p-2 text-sm text-white focus:border-neuro-accent outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-500 uppercase mb-1">Tipo de Onda</label>
                           <input
                              type="text"
                              value={editForm.waveType}
                              onChange={(e) => setEditForm({ ...editForm, waveType: e.target.value })}
                              className="w-full bg-neuro-900 border border-neuro-700 rounded p-2 text-sm text-white focus:border-neuro-accent outline-none"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <label className="block text-xs text-gray-500 uppercase mb-1">Freq. Min (Hz)</label>
                           <input
                              type="number"
                              value={editForm.frequencyRange?.[0]}
                              onChange={(e) => setEditForm({ ...editForm, frequencyRange: [Number(e.target.value), editForm.frequencyRange?.[1] || 0] })}
                              className="w-full bg-neuro-900 border border-neuro-700 rounded p-2 text-sm text-white focus:border-neuro-accent outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-500 uppercase mb-1">Freq. Max (Hz)</label>
                           <input
                              type="number"
                              value={editForm.frequencyRange?.[1]}
                              onChange={(e) => setEditForm({ ...editForm, frequencyRange: [editForm.frequencyRange?.[0] || 0, Number(e.target.value)] })}
                              className="w-full bg-neuro-900 border border-neuro-700 rounded p-2 text-sm text-white focus:border-neuro-accent outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-500 uppercase mb-1">Cor do Ruído</label>
                           <select
                              value={editForm.noiseColor}
                              onChange={(e) => setEditForm({ ...editForm, noiseColor: e.target.value as any })}
                              className="w-full bg-neuro-900 border border-neuro-700 rounded p-2 text-sm text-white focus:border-neuro-accent outline-none"
                           >
                              <option value="Pink">Pink Noise</option>
                              <option value="White">White Noise</option>
                              <option value="Brown">Brown Noise</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">Base Neurocientífica (Science)</label>
                        <textarea
                           value={editForm.science}
                           onChange={(e) => setEditForm({ ...editForm, science: e.target.value })}
                           rows={3}
                           className="w-full bg-neuro-900 border border-neuro-700 rounded p-2 text-sm text-gray-300 focus:border-neuro-accent outline-none"
                        />
                     </div>

                     <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">Benefícios Clínicos (Separar por vírgula)</label>
                        <input
                           type="text"
                           value={editForm.benefits?.join(', ')}
                           onChange={(e) => setEditForm({ ...editForm, benefits: e.target.value.split(',').map(s => s.trim()) })}
                           className="w-full bg-neuro-900 border border-neuro-700 rounded p-2 text-sm text-gray-300 focus:border-neuro-accent outline-none"
                        />
                     </div>

                     {/* PUBLIC TOGGLE FOR ADMIN */}
                     {isCreating && (
                        <div className="flex items-center gap-2 bg-neuro-700/30 p-3 rounded-lg border border-neuro-700">
                           <input
                              type="checkbox"
                              id="isPublic"
                              checked={editForm.isPublic}
                              onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                              className="w-4 h-4 accent-neuro-accent"
                           />
                           <label htmlFor="isPublic" className="text-sm font-bold text-white cursor-pointer select-none">
                              Tornar este protocolo PÚBLICO?
                              <span className="block text-[10px] text-gray-500 font-normal">Todos os usuários da plataforma poderão ver e usar.</span>
                           </label>
                        </div>
                     )}

                     <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">Parâmetros de Áudio (Preview JSON)</label>
                        <div className="font-mono text-[10px] text-green-500 bg-black p-4 rounded border border-neuro-700 opacity-70 overflow-x-auto">
                           {JSON.stringify({
                              noiseColor: editForm.noiseColor,
                              isoPulse: true,
                              binauralOffset: "dynamic",
                              hz: editForm.frequencyRange,
                              isPublic: editForm.isPublic
                           }, null, 2)}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   // 3. AI MARKETING SPECIALIST (The Core Feature)
   const AiMarketingSpecialist = () => {
      const [history, setHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
      const [input, setInput] = useState('');
      const [loading, setLoading] = useState(false);
      const [category, setCategory] = useState<'SEO' | 'VIDEO' | 'EMAIL' | 'PARTNERS'>('SEO');

      // --- Helper to Render nicely formatted Markdown-like text ---
      const renderFormattedResponse = (text: string) => {
         return text.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2"></div>;

            // Headers (###)
            if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
               const content = trimmed.replace(/#/g, '').trim();
               return (
                  <div key={i} className="mt-6 mb-3 border-b border-neuro-700 pb-1">
                     <h3 className="text-lg font-bold text-neuro-accent flex items-center gap-2">
                        {content}
                     </h3>
                  </div>
               );
            }

            // Bullet points
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
               const content = trimmed.substring(1).trim();
               return (
                  <div key={i} className="flex items-start gap-2 ml-2 mb-2">
                     <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                     <p className="text-sm text-gray-300 leading-relaxed">
                        {content.split('**').map((part, j) =>
                           j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                        )}
                     </p>
                  </div>
               );
            }

            // Numbered lists
            if (/^\d+\./.test(trimmed)) {
               return (
                  <div key={i} className="flex items-start gap-2 ml-2 mb-2">
                     <span className="text-sm font-mono text-neuro-accent font-bold mt-0.5">{trimmed.split('.')[0]}.</span>
                     <p className="text-sm text-gray-300 leading-relaxed">
                        {trimmed.split('.').slice(1).join('.').trim().split('**').map((part, j) =>
                           j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                        )}
                     </p>
                  </div>
               );
            }

            // Regular Paragraphs
            return (
               <p key={i} className="text-sm text-gray-300 leading-relaxed mb-2">
                  {line.split('**').map((part, j) =>
                     j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                  )}
               </p>
            );
         });
      };

      const generateMarketingInsight = async () => {
         if (!input.trim()) return;

         setLoading(true);
         const userMsg = input;
         setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
         setInput('');

         try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            if (!apiKey) {
               console.error("VITE_GOOGLE_API_KEY missing");
               throw new Error("API Key não configurada");
            }

            const genAI = new GoogleGenerativeAI(apiKey);

            const systemInstruction = `
               Você é o CMO (Chief Marketing Officer) e Especialista em SEO Sênior da plataforma 'BrainHz', um SaaS de neurociência e biohacking.
               
               Seu objetivo é crescer a base de usuários e aumentar a retenção.
               Seja extremamente técnico em SEO, criativo em campanhas e estratégico em parcerias.

               CATEGORIAS DE RESPOSTA:
               1. SEO: Keywords de cauda longa, estruturas de blog post, meta-descriptions.
               2. VÍDEO: Roteiros para TikTok/Reels/YouTube Shorts com ganchos virais sobre neurociência.
               3. EMAIL: Copywriting persuasivo para campanhas de e-mail (nutrição, recuperação de churn).
               4. PARCERIAS: Sugestões de influencers e marcas para collab.

               Contexto Atual: O protocolo mais usado é FOCUS (Beta). O menos usado é GAMMA. Precisamos vender o plano vitalício.
               
               Responda em Markdown formatado. Use Headers (###), Listas e Negrito para organizar.
            `;

            const model = genAI.getGenerativeModel({
               model: "gemini-2.5-flash",
               systemInstruction: systemInstruction
            });

            const result = await model.generateContent(`[CATEGORIA: ${category}] ${userMsg}`);
            const responseText = result.response.text() || "Sem resposta.";

            setHistory(prev => [...prev, { role: 'model', text: responseText }]);

         } catch (e: any) {
            console.error("AI Error:", e);
            setHistory(prev => [...prev, { role: 'model', text: `Erro ao conectar com a Mente Mestra: ${e.message || 'Erro desconhecido'}` }]);
         } finally {
            setLoading(false);
         }

      };

      return (
         <div className="flex flex-col h-[600px]">
            <div className="flex gap-2 mb-4 overflow-x-auto">
               {[
                  { id: 'SEO', icon: Globe, label: 'Estratégia SEO' },
                  { id: 'VIDEO', icon: Video, label: 'Roteiros Virais' },
                  { id: 'EMAIL', icon: Mail, label: 'Copywriting Email' },
                  { id: 'PARTNERS', icon: Users, label: 'Growth & Parcerias' },
               ].map(cat => (
                  <button
                     key={cat.id}
                     onClick={() => setCategory(cat.id as any)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${category === cat.id ? 'bg-neuro-accent text-white shadow-lg' : 'bg-neuro-800 text-gray-400 border border-neuro-700'}`}
                  >
                     <cat.icon size={14} /> {cat.label}
                  </button>
               ))}
            </div>

            <div className="flex-1 bg-neuro-900 border border-neuro-700 rounded-xl p-4 overflow-y-auto mb-4 custom-scrollbar space-y-6">
               {history.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                     <Lightbulb size={48} className="mb-4" />
                     <p className="text-sm font-mono text-center max-w-xs">
                        "Solicite uma campanha de SEO para 'Ondas Gamma' ou um roteiro de vídeo sobre 'Foco para TDAH'..."
                     </p>
                  </div>
               )}
               {history.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start w-full'}`}>

                     {msg.role === 'user' ? (
                        <div className="max-w-[80%] p-4 rounded-xl text-sm bg-neuro-800 text-white border border-neuro-700 shadow-md">
                           {msg.text}
                        </div>
                     ) : (
                        <div className="w-full max-w-4xl">
                           <div className="flex items-center gap-2 mb-2 ml-1">
                              <Bot size={16} className="text-neuro-accent" />
                              <span className="text-[10px] font-mono text-neuro-accent uppercase tracking-wider">BrainHz Strategy Engine</span>
                           </div>
                           <div className="bg-neuro-800/50 border border-neuro-700 rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                 <FileText size={100} />
                              </div>
                              <div className="relative z-10">
                                 {renderFormattedResponse(msg.text)}
                              </div>
                           </div>
                           <div className="flex justify-end mt-2 gap-2">
                              <button className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                                 <Save size={12} /> Salvar Relatório
                              </button>
                              <button className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                                 <ExternalLink size={12} /> Exportar PDF
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
               {loading && (
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-neuro-800 flex items-center justify-center border border-neuro-700">
                        <Bot size={16} className="text-neuro-accent animate-pulse" />
                     </div>
                     <div className="text-xs font-mono text-gray-500 animate-pulse">
                        Analisando dados de mercado e gerando estratégia...
                     </div>
                  </div>
               )}
            </div>

            <div className="flex gap-2">
               <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateMarketingInsight()}
                  placeholder={`Pergunte ao Especialista de ${category}...`}
                  className="flex-1 bg-neuro-800 border border-neuro-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-neuro-accent"
               />
               <button onClick={generateMarketingInsight} className="p-3 bg-neuro-accent text-white rounded-lg hover:bg-neuro-accent/90">
                  <Send size={18} />
               </button>
            </div>
         </div>
      );
   };

   // 4. USER CRM & EMAIL
   const UserCRM = () => {
      const [users, setUsers] = useState<any[]>([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');

      useEffect(() => {
         fetchUsers();
      }, []);

      const fetchUsers = async () => {
         setLoading(true);
         const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('last_login', { ascending: false });

         if (data) {
            setUsers(data);
         }
         setLoading(false);
      };

      const togglePlan = async (userId: string, currentPlan: string) => {
         // Default to lifetime if free, else free (toggle)
         // In a real app we might want a modal, but this is "God Mode"
         const newPlan = currentPlan === 'lifetime' ? 'free' : 'lifetime';

         // Optimistic UI update could be here, but let's just refetch for safety
         const { error } = await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId);

         if (error) {
            console.error(error);
            alert("Erro ao atualizar plano: " + error.message);
         } else {
            fetchUsers();
            alert(`Plano atualizado para ${newPlan}`);
         }
      };

      const filteredUsers = users.filter(u =>
         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.id.includes(searchTerm)
      );

      const getStatus = (lastLogin: string) => {
         if (!lastLogin) return 'Inactive';
         const days = (new Date().getTime() - new Date(lastLogin).getTime()) / (1000 * 3600 * 24);
         if (days < 7) return 'Active';
         if (days < 30) return 'Churn Risk';
         return 'Inactive';
      };

      return (
         <div className="space-y-6">
            <div className="flex justify-between items-center bg-neuro-800 p-4 rounded-xl border border-neuro-700">
               <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder="Buscar usuário..."
                     className="w-full bg-neuro-900 border border-neuro-700 rounded pl-10 py-2 text-sm text-white focus:outline-none focus:border-neuro-accent"
                  />
               </div>
               <div className="flex gap-2">
                  <button onClick={fetchUsers} className="px-4 py-2 bg-neuro-700 hover:bg-white hover:text-black text-white text-xs font-bold rounded flex items-center gap-2"><RefreshCw size={14} /> REFRESH</button>
                  <button className="px-4 py-2 bg-neuro-accent text-white text-xs font-bold rounded flex items-center gap-2"><Plus size={14} /> NOVO USUÁRIO</button>
               </div>
            </div>

            <div className="bg-neuro-800 border border-neuro-700 rounded-xl overflow-hidden min-h-[400px]">
               <table className="w-full text-left text-sm">
                  <thead className="bg-neuro-900 text-gray-500 font-mono text-xs uppercase">
                     <tr>
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Plano</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Última Sessão</th>
                        <th className="p-4 text-right">Ações</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-neuro-700 text-gray-300">
                     {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando usuários da rede neural...</td></tr>
                     ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                     ) : filteredUsers.map(u => {
                        const status = getStatus(u.last_login);
                        return (
                           <tr key={u.id} className="hover:bg-neuro-700/50">
                              <td className="p-4">
                                 <div className="font-bold text-white truncate max-w-[200px] flex items-center gap-2">
                                    {u.email || u.id}
                                    {u.role === 'admin' && (
                                       <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded border border-red-500/50 font-mono uppercase tracking-wider">
                                          ADMIN
                                       </span>
                                    )}
                                 </div>
                                 <div className="text-xs text-gray-500 font-mono">{u.id.slice(0, 8)}...</div>
                              </td>
                              <td className="p-4">
                                 <span className={`px-2 py-1 rounded border text-xs font-mono uppercase ${u.plan === 'lifetime' ? 'bg-amber-900/30 text-amber-400 border-amber-900' : 'bg-neuro-900 border-neuro-700'}`}>
                                    {u.plan || 'Free'}
                                 </span>
                              </td>
                              <td className="p-4">
                                 <span className={`flex items-center gap-1.5 text-xs font-bold ${status === 'Active' ? 'text-green-500' : status === 'Churn Risk' ? 'text-red-500' : 'text-gray-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-green-500' : status === 'Churn Risk' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                    {status}
                                 </span>
                              </td>
                              <td className="p-4 text-xs font-mono text-gray-400">
                                 {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Nunca'}
                              </td>
                              <td className="p-4 text-right">
                                 <button onClick={() => togglePlan(u.id, u.plan)} className="text-gray-500 hover:text-white mr-3 border border-gray-700 px-2 py-1 rounded hover:bg-neuro-700 transition-all text-xs">
                                    {u.plan === 'lifetime' ? 'Remover Pro' : 'Dar Pro (Lifetime)'}
                                 </button>
                                 <button className="text-neuro-accent hover:text-white text-xs">Ver Perfil</button>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      );
   };



   const ActivityIcon = Activity;

   return (
      <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col md:flex-row">

         {/* SIDEBAR */}
         <aside className="w-full md:w-64 bg-neuro-900 border-r border-neuro-800 flex flex-col">
            <div className="p-6 border-b border-neuro-800 flex items-center gap-2">
               <img src="/LOGO.jpeg" className="w-10 h-10 object-contain rounded-lg" alt="BrainHz Admin" />
               <div>
                  <h1 className="font-bold font-mono tracking-tighter">GOD MODE</h1>
                  <div className="text-[10px] text-red-500 font-mono tracking-widest uppercase">Admin Access</div>
               </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
               <button onClick={() => setActiveTab('DASH')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'DASH' ? 'bg-neuro-800 text-white border border-neuro-700' : 'text-gray-500 hover:text-white hover:bg-neuro-800/50'}`}>
                  <LayoutDashboard size={18} /> Visão Geral
               </button>
               <button onClick={() => setActiveTab('PROTOCOLS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'PROTOCOLS' ? 'bg-neuro-800 text-white border border-neuro-700' : 'text-gray-500 hover:text-white hover:bg-neuro-800/50'}`}>
                  <Radio size={18} /> Editor de Protocolos
               </button>
               <button onClick={() => setActiveTab('USERS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-neuro-800 text-white border border-neuro-700' : 'text-gray-500 hover:text-white hover:bg-neuro-800/50'}`}>
                  <Users size={18} /> CRM & Usuários
               </button>
               <button onClick={() => setActiveTab('AI_CMO')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'AI_CMO' ? 'bg-neuro-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'text-gray-500 hover:text-white hover:bg-neuro-800/50'}`}>
                  <Bot size={18} /> IA Omni-Marketing
               </button>
            </nav>

            <div className="p-4 border-t border-neuro-800">
               <button onClick={onExit} className="w-full flex items-center justify-center gap-2 text-xs font-mono text-gray-500 hover:text-white py-2">
                  <X size={14} /> SAIR DO SISTEMA
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT */}
         <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="h-16 border-b border-neuro-800 bg-neuro-900/50 backdrop-blur flex items-center justify-between px-8">
               <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="text-neuro-accent">{'>'}</span>
                  <span>ADMINISTRATION</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-white font-bold">{activeTab}</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-mono text-green-500">SYSTEM STABLE</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700"></div>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {activeTab === 'DASH' && <DashboardView />}
               {activeTab === 'PROTOCOLS' && <ProtocolEditor />}
               {activeTab === 'USERS' && <UserCRM />}
               {activeTab === 'AI_CMO' && (
                  <div className="max-w-4xl mx-auto">
                     <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Mente Mestra de Marketing</h2>
                        <p className="text-gray-400">Utilize a IA (Gemini 2.5) para gerar estratégias de crescimento, SEO e conteúdo baseadas na neurociência.</p>
                     </div>
                     <AiMarketingSpecialist />
                  </div>
               )}
            </div>
         </main>

      </div>
   );
};

export default AdminPanel;
