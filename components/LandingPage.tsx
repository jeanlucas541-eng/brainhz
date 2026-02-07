
import React, { useState } from 'react';
import { Play, Zap, Shield, Brain, Activity, ArrowRight, Lock, CheckCircle2, Waves, FileText, Microscope, ExternalLink, Star, Crown, Infinity, XCircle, Quote, HelpCircle, ChevronDown, ChevronUp, Target, TrendingUp, Cpu } from 'lucide-react';
import FrequencyVisualizer from './FrequencyVisualizer';
import BrainMatrix from './BrainMatrix';

interface Props {
  onEnter: () => void;
  onAdminEnter?: () => void;
}

const LandingPage: React.FC<Props> = ({ onEnter, onAdminEnter }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const SCIENTIFIC_DATA = [
    {
      wave: "Gamma",
      hz: "40 Hz",
      focus: "Cognição Superior & Memória",
      desc: "A frequência de ligação sensorial. Onde a mágica da consciência acontece.",
      study: "MIT Picower Institute (2016/2019): Iaccarino et al.",
      finding: "A indução sensorial em 40Hz (GENUS) demonstrou reduzir placas amiloides e melhorar a função cognitiva em modelos neurodegenerativos, ativando a microglia (sistema imune cerebral).",
      color: "text-red-500",
      borderColor: "border-red-500/30"
    },
    {
      wave: "Beta",
      hz: "14 - 30 Hz",
      focus: "Foco Analítico & Lógica",
      desc: "O estado de vigília ativa. Ideal para resolução de problemas e execução.",
      study: "Journal of Neurotherapy (2004): Egner & Gruzelier",
      finding: "Protocolos de Neurofeedback para aumentar SMR (Low Beta) resultaram em melhorias significativas na atenção sustentada e tempos de reação em tarefas complexas.",
      color: "text-neuro-warning",
      borderColor: "border-neuro-warning/30"
    },
    {
      wave: "Alpha",
      hz: "8 - 12 Hz",
      focus: "Estado de Fluxo & Relaxamento",
      desc: "A ponte entre o consciente e o subconsciente. O modo 'repouso alerta'.",
      study: "Frontiers in Human Neuroscience (2011): Hanslmayr et al.",
      finding: "A sincronização Alpha previne a interferência de estímulos distratores (Gating Sensorial), correlacionando-se diretamente com o aumento da performance de memória e redução de cortisol.",
      color: "text-neuro-accent",
      borderColor: "border-neuro-accent/30"
    },
    {
      wave: "Theta",
      hz: "4 - 8 Hz",
      focus: "Criatividade & Meditação",
      desc: "O limiar do sono e o domínio da visualização interna vívida.",
      study: "Cognitive Processing (2010): Braboszcz & Delorme",
      finding: "O aumento da potência Theta na linha média frontal é um marcador biológico consistente de estados meditativos profundos e processamento emocional não-linear.",
      color: "text-green-400",
      borderColor: "border-green-400/30"
    },
    {
      wave: "Delta",
      hz: "0.5 - 4 Hz",
      focus: "Regeneração & Sono Profundo",
      desc: "Inconsciência total. O momento de reparo físico e limpeza neural.",
      study: "Science (2013): Xie et al. (Sistema Glifático)",
      finding: "Durante o sono de ondas lentas (Delta), o espaço intersticial do cérebro aumenta em 60%, permitindo que o líquido cefalorraquidiano remova neurotoxinas acumuladas durante a vigília.",
      color: "text-blue-400",
      borderColor: "border-blue-400/30"
    }
  ];

  const TESTIMONIALS = [
    {
      name: "Lucas M.",
      role: "Aprovado Auditor da Receita Federal",
      quote: "A batalha de um concurseiro é 80% mental. O 'Foco Beta' blindou minha mente contra o celular. Consegui aumentar minhas horas líquidas de 4h para 7h diárias em 3 semanas de uso. É como colocar antolhos cognitivos.",
      badge: "Concurso Público",
      stars: 5
    },
    {
      name: "Dra. Juliana S.",
      role: "Residente em Neurologia (USP)",
      quote: "Cética no início, mas a literatura sobre 40Hz (Gamma) é sólida. Uso o protocolo antes dos plantões para 'ligar' o cérebro e o Delta para apagar depois. Essencial para estudantes de medicina que dormem pouco e precisam reter muito.",
      badge: "Medicina",
      stars: 5
    },
    {
      name: "Roberto K.",
      role: "Engenharia Aeronáutica (ITA)",
      quote: "Cálculo vetorial e Física avançada exigem abstração pura. O ruído marrom com ondas Theta me coloca num estado de 'Flow' onde as equações simplesmente fazem sentido. É biohacking real para quem precisa de processamento lógico pesado.",
      badge: "Alta Performance",
      stars: 5
    }
  ];

  const FAQS = [
    {
      q: "Preciso usar fones de ouvido?",
      a: "Para os protocolos Binaurais, sim. A mágica acontece na diferença de frequência específica enviada para cada ouvido (ex: 300Hz na esquerda, 310Hz na direita). Para tons Isocrônicos, caixas de som de alta fidelidade funcionam, mas fones de cancelamento de ruído garantem imersão total."
    },
    {
      q: "Por que existe 'Gamificação' em uma ferramenta científica?",
      a: "Não é apenas um jogo. Utilizamos princípios de Condicionamento Operante (Skinner) para hackear o sistema de recompensa dopaminérgico do cérebro. O 'Streak' explora a aversão à perda para garantir a consistência necessária para a neuroplasticidade (mielinização), enquanto o XP fornece o feedback imediato necessário para entrar em Estado de Flow."
    },
    {
      q: "Existe alguma contraindicação?",
      a: "Sim. O arrastamento neural não é recomendado para portadores de epilepsia ou pessoas propensas a convulsões, devido à estimulação rítmica. Portadores de marca-passo ou com arritmias graves também devem consultar um médico. Gestantes devem evitar frequências muito baixas (sub-graves intensos)."
    },
    {
      q: "Posso ouvir enquanto estudo ou trabalho?",
      a: "Absolutamente. Os modos 'Foco Beta' (para lógica/exatas) e 'Alpha Flow' (para leitura/humanas) foram desenhados para serem 'planos de fundo'. Já o Theta e Gamma podem ser intensos demais para multitarefa e funcionam melhor em sessões dedicadas de visualização ou resolução de problemas complexos."
    },
    {
      q: "Quanto tempo demora para fazer efeito?",
      a: "O fenômeno FFR (Frequency Following Response) geralmente inicia a sincronização cortical entre 5 a 7 minutos de exposição contínua. Recomendamos sessões de no mínimo 20 minutos (1 Pomodoro) para estabilizar o estado desejado."
    },
    {
      q: "O áudio funciona offline?",
      a: "Sim. No plano 'Arquiteto' e 'Transcendente', a plataforma utiliza tecnologia PWA (Progressive Web App) que armazena os sintetizadores no cache do seu navegador, permitindo uso em modo avião para foco total."
    }
  ];

  const PLANS = [
    {
      name: "Iniciado",
      price: "0",
      period: "para sempre",
      desc: "Acesso limitado para testes rápidos de frequência.",
      features: [
        { text: "Acesso a Ondas Alpha e Beta", included: true },
        { text: "Sessões de 5 minutos (Demo)", included: true },
        { text: "Sem acesso à IA Especialista", included: false },
        { text: "Visualizador de Frequência Básico", included: true },
        { text: "Qualidade de Áudio Standard", included: true }
      ],
      icon: Star,
      color: "text-gray-300",
      border: "border-neuro-700",
      bg: "bg-neuro-900",
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Arquiteto",
      price: "19,90",
      period: "mês",
      desc: "O toolkit completo para biohacking cognitivo diário.",
      features: [
        { text: "Todos os 6 Protocolos", included: true },
        { text: "Tempo de Sessão Ilimitado", included: true },
        { text: "Consultor IA BrainHz Ilimitado", included: true },
        { text: "Áudio High-Fidelity (320kbps/Lossless)", included: true },
        { text: "Mixagem de Camadas Personalizada", included: true },
        { text: "Acesso Offline (PWA)", included: true }
      ],
      icon: Crown,
      color: "text-neuro-accent",
      border: "border-neuro-accent",
      bg: "bg-neuro-800/80",
      cta: "Assinar Pro",
      popular: true
    },
    {
      name: "Transcendente",
      price: "199",
      period: "vitalício",
      desc: "Acesso perpétuo e recursos experimentais exclusivos.",
      features: [
        { text: "Acesso Vitalício (Pagamento Único)", included: true },
        { text: "Tudo do Plano Arquiteto", included: true },
        { text: "Early Access a novos Neuro-Drivers", included: true },
        { text: "Badge Exclusiva no Perfil", included: true },
        { text: "Suporte Prioritário 24/7", included: true }
      ],
      icon: Infinity,
      color: "text-white",
      border: "border-purple-400",
      bg: "bg-gradient-to-b from-purple-900/40 to-neuro-900",
      cta: "Obter Acesso Vitalício",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-neuro-900 text-white font-sans selection:bg-neuro-accent selection:text-white overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neuro-accent/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[30%] bg-purple-900/10 blur-[100px] rounded-full"></div>
        <div className="scanline"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neuro-900/80 backdrop-blur-md border-b border-neuro-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/LOGO.jpeg" alt="BrainHz Logo" className="h-12 w-auto object-contain rounded-lg" />
            <span className="font-mono font-bold text-xl tracking-tighter">Brain<span className="text-neuro-accent">Hz</span></span>
          </div>
          <div className="flex gap-4">
            <button onClick={onEnter} className="hidden md:block px-4 py-2 text-sm font-mono text-gray-400 hover:text-white transition-colors">
              [ LOGIN ]
            </button>
            <button
              onClick={onEnter}
              className="px-5 py-2 bg-white text-black text-sm font-bold font-mono rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              ACESSAR <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Centered with BrainMatrix Background */}
      <section className="relative z-10 pt-32 pb-32 px-6 min-h-screen flex flex-col justify-center items-center overflow-hidden">

        {/* 3D BRAIN BACKGROUND - Keeping the element you liked */}
        <div className="absolute inset-0 z-0 opacity-40 scale-125 md:scale-100 pointer-events-none mix-blend-screen">
          <BrainMatrix activeNodes={150} />
        </div>

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-neuro-900 via-neuro-900/30 to-transparent z-0"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neuro-900/80 border border-neuro-700 text-xs text-neuro-accent font-mono mb-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-neuro-success animate-pulse"></span>
            PROTOCOLOS V.2.4 ONLINE
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <span className="block font-mono text-2xl md:text-3xl text-gray-500 mb-2 tracking-[0.2em] font-normal uppercase">
              Domine a Química
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neuro-accent via-white to-gray-400 drop-shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              Do Seu Próprio Cérebro.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Não é meditação. É <strong className="text-white font-mono bg-neuro-800 px-2 py-0.5 rounded text-base border border-neuro-700">neuro-engenharia</strong>. Utilize frequências isocrônicas e binaurais clinicamente validadas para induzir Foco Profundo, Sono Reparador ou Criatividade em questão de minutos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button
              onClick={onEnter}
              className="w-full sm:w-auto px-10 py-4 bg-neuro-accent hover:bg-neuro-accent/90 text-white font-bold font-mono tracking-wider rounded-lg shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Zap size={20} />
              INICIAR BIOHACKING
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <ChevronDown className="text-gray-500" />
        </div>
      </section>

      {/* 3D Platform Preview (The "Inside Look") */}
      <section className="relative -mt-20 z-20 px-6">
        <div className="relative max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500 perspective-[2000px]">
          {/* Glow behind the mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-neuro-accent/20 blur-[80px] rounded-full"></div>

          {/* The Mockup Container with Tilt */}
          <div
            className="relative bg-neuro-900 border border-neuro-700 rounded-xl overflow-hidden shadow-2xl transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out group"
            style={{ transformStyle: 'preserve-3d', transform: 'rotateX(20deg) scale(0.95)' }}
          >
            {/* Header Mockup */}
            <div className="h-12 bg-neuro-800 border-b border-neuro-700 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="flex-1 text-center text-[10px] font-mono text-gray-600">brainhz_session_active.tsx</div>
            </div>

            {/* UI Content Simulation */}
            <div className="grid grid-cols-12 h-[500px] bg-neuro-900">

              {/* Sidebar Sim */}
              <div className="col-span-3 border-r border-neuro-700 p-4 space-y-3 hidden md:block bg-neuro-900/50">
                <div className="h-8 bg-neuro-800 rounded w-3/4 mb-6"></div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 rounded border border-neuro-700/50 flex items-center px-3 gap-3 opacity-50">
                    <div className="w-6 h-6 rounded bg-neuro-700"></div>
                    <div className="w-16 h-2 rounded bg-neuro-700"></div>
                  </div>
                ))}
              </div>

              {/* Main Dashboard Sim */}
              <div className="col-span-12 md:col-span-9 relative flex flex-col">
                {/* Live Visualizer Background in the Mockup */}
                <div className="absolute inset-0 opacity-40">
                  <FrequencyVisualizer isActive={true} color="#8b5cf6" speed={15} volume={0.5} fullScreen={true} />
                </div>

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[1px]">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neuro-accent/30 bg-neuro-accent/10 text-neuro-accent font-mono text-xs mb-4">
                    <Activity size={12} /> ONDA GAMMA (40Hz) ATIVA
                  </div>
                  <h3 className="text-6xl font-mono font-bold text-white tracking-tighter mb-2 tabular-nums">14:59</h3>
                  <p className="text-gray-400 text-sm tracking-widest uppercase mb-8 font-mono">Sincronizando Hemisférios</p>

                  <div className="flex gap-4 opacity-80">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/40"><Play size={20} fill="white" /></div>
                  </div>
                </div>

                {/* Bottom Controls Sim */}
                <div className="h-20 border-t border-neuro-700 bg-neuro-900/80 backdrop-blur-md flex items-center px-6 justify-between">
                  <div className="flex gap-4">
                    <div className="w-32 h-1 bg-neuro-700 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-neuro-accent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-neuro-900 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* SCIENTIFIC SPECTRUM */}
      <section className="py-24 px-6 bg-neuro-900 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neuro-800 border border-neuro-700 text-xs text-gray-400 font-mono mb-4">
              <Microscope size={12} className="text-neuro-accent" />
              EVIDÊNCIA CLÍNICA
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Espectro de Frequências & Estudos</h2>
            <p className="text-gray-400">
              Cada protocolo BrainHz é calibrado com base em literatura neurocientífica revisada por pares.
            </p>
          </div>

          <div className="space-y-6">
            {SCIENTIFIC_DATA.map((item, index) => (
              <div key={index} className={`relative p-6 md:p-8 rounded-2xl bg-neuro-800/40 border ${item.borderColor} backdrop-blur-sm hover:bg-neuro-800 transition-all group`}>

                {/* Hz Badge */}
                <div className="absolute top-6 right-6 font-mono text-xl md:text-2xl font-bold opacity-20 group-hover:opacity-50 transition-opacity">
                  {item.hz}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <h3 className={`text-2xl font-bold mb-1 ${item.color} font-mono`}>{item.wave}</h3>
                    <p className="text-xs font-mono text-white/80 uppercase tracking-widest">{item.focus}</p>
                  </div>

                  <div className="md:w-3/4 space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="bg-neuro-900/50 rounded-lg p-4 border border-neuro-700/50 flex gap-3 items-start">
                      <FileText size={16} className={`mt-1 flex-shrink-0 ${item.color}`} />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wide font-mono">Referência Científica</p>
                        <p className="text-sm font-semibold text-white mb-2">{item.study}</p>
                        <p className="text-xs text-gray-400 italic">"{item.finding}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* GAMIFICATION NEUROBIOLOGY */}
      <section className="py-24 px-6 bg-neuro-800/10 border-t border-neuro-800 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neuro-800 border border-neuro-700 text-xs text-gray-400 font-mono mb-4">
                <Cpu size={12} className="text-neuro-accent" />
                CONDICIONAMENTO OPERANTE
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Neurobiologia do Hábito:<br />Por que a "Gamificação"?</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Não se trata de entretenimento. É engenharia comportamental. Para estudantes de medicina e concurseiros, a motivação é um recurso finito. Nosso sistema utiliza <strong className="text-white">loops de recompensa dopaminérgica</strong> para automatizar a disciplina.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-neuro-900 rounded-lg border border-neuro-700 h-fit">
                    <TrendingUp className="text-neuro-success" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Mielinização via Repetição (Streak)</h3>
                    <p className="text-sm text-gray-500">O contador de dias (Streak) utiliza a aversão à perda para forçar a repetição diária. Neurônios que disparam juntos, conectam-se (Lei de Hebb), revestindo os axônios com mielina e tornando o foco automático.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 bg-neuro-900 rounded-lg border border-neuro-700 h-fit">
                    <Target className="text-neuro-warning" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Feedback Imediato para Flow</h3>
                    <p className="text-sm text-gray-500">O Estado de Flow exige feedback instantâneo. Nossas barras de XP e progresso visual fornecem a micro-dose de dopamina necessária para manter o córtex pré-frontal engajado em tarefas tediosas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-neuro-accent/20 blur-[60px] rounded-full"></div>
              <div className="relative bg-neuro-900 border border-neuro-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-neuro-800">
                  <span className="font-mono text-xs text-gray-500 uppercase">Sinapses em Tempo Real</span>
                  <Activity className="text-neuro-accent" size={16} />
                </div>

                {/* 3D Brain Matrix */}
                <div className="h-64 w-full bg-black/50 rounded-lg border border-neuro-800 relative overflow-hidden mb-4">
                  <BrainMatrix activeNodes={64} />
                </div>

                <div className="mt-6 bg-neuro-800/50 p-4 rounded-lg border border-neuro-700/50">
                  <p className="text-xs text-gray-300 italic">
                    "A antecipação da recompensa (subir de nível) libera tanta dopamina quanto a recompensa em si, mantendo o usuário em estado de alerta focado."
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2 text-right">- Sapolsky, Stanford Univ.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS (RELATOS) */}
      <section className="py-24 px-6 bg-neuro-800/20 border-y border-neuro-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Relatos da Comunidade</h2>
            <p className="text-gray-400">Performance real de quem vive sob alta pressão cognitiva.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-neuro-900 p-8 rounded-2xl border border-neuro-700 relative hover:border-neuro-accent transition-colors group">
                <Quote className="absolute top-6 left-6 text-neuro-700 group-hover:text-neuro-accent/20 transition-colors" size={40} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-1 text-yellow-500 mb-4">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>

                  <p className="text-gray-300 italic text-sm leading-relaxed">
                    "{t.quote}"
                  </p>

                  <div className="pt-4 border-t border-neuro-800 flex flex-col">
                    <span className="font-bold text-white">{t.name}</span>
                    <span className="text-xs text-gray-500 font-mono mb-2">{t.role}</span>
                    <span className="inline-block self-start px-2 py-1 rounded bg-neuro-800 border border-neuro-700 text-[10px] text-neuro-accent font-bold uppercase tracking-wider">
                      {t.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section className="py-24 px-6 bg-neuro-900 border-t border-neuro-800 relative overflow-hidden">
        {/* Decorative elements for Pricing */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neuro-accent/5 blur-[100px] rounded-full"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos de Acesso</h2>
            <p className="text-gray-400">Escolha o nível de sincronização ideal para sua jornada cognitiva.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <div
                  key={i}
                  className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${plan.border} ${plan.bg} ${plan.popular ? 'shadow-[0_0_30px_rgba(139,92,246,0.15)] scale-105 z-10' : 'hover:border-gray-600'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-neuro-accent text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                      Mais Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-black/30 border border-white/10 ${plan.color}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${plan.color}`}>{plan.name}</h3>
                    <p className="text-sm text-gray-400 h-10">{plan.desc}</p>
                  </div>

                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-sm text-gray-500 font-mono">R$</span>
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500">/{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className={`flex items-start gap-3 text-sm ${feat.included ? 'text-gray-300' : 'text-gray-600 line-through'}`}>
                        {feat.included ? (
                          <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${plan.color}`} />
                        ) : (
                          <XCircle size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                        )}
                        <span>{feat.text}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onEnter}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${plan.popular
                      ? 'bg-neuro-accent hover:bg-neuro-accent/90 text-white shadow-lg'
                      : 'bg-neuro-800 hover:bg-white hover:text-black text-white border border-neuro-700'
                      }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 bg-neuro-900 border-t border-neuro-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neuro-800 border border-neuro-700 text-xs text-gray-400 font-mono mb-4">
              <HelpCircle size={12} className="text-white" />
              DÚVIDAS COMUNS
            </div>
            <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className={`border rounded-lg bg-neuro-800/30 transition-all duration-300 overflow-hidden ${isOpen ? 'border-neuro-accent/50 bg-neuro-800/80' : 'border-neuro-700 hover:border-gray-500'}`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                  >
                    <span className={`font-bold ${isOpen ? 'text-white' : 'text-gray-300'}`}>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} className="text-neuro-accent" /> : <ChevronDown size={20} className="text-gray-500" />}
                  </button>
                  <div
                    className={`px-5 text-gray-400 text-sm leading-relaxed transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature List */}
      <section className="py-20 px-6 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 border-t border-neuro-800">
        <div className="flex-1 space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            O Sistema Operacional <br />
            Para Sua Mente.
          </h2>
          <div className="space-y-4">
            {[
              "Foco Profundo (Ondas Beta) para trabalho lógico.",
              "Super Aprendizado (Ondas Alpha) para retenção.",
              "Sono Reparador (Ondas Delta) com bloqueio sensorial.",
              "Gamificação para acompanhar seu progresso neural.",
              "IA Especialista para recomendar protocolos.",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-neuro-accent flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onEnter}
            className="mt-6 px-8 py-3 border border-neuro-700 hover:border-neuro-accent hover:bg-neuro-accent/10 rounded-lg transition-all text-white font-mono text-sm"
          >
            ACESSAR SISTEMA &rarr;
          </button>
        </div>
        <div className="flex-1 w-full">
          <div className="bg-neuro-800 rounded-2xl p-6 border border-neuro-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Lock size={100} />
            </div>
            <h3 className="font-mono text-sm text-neuro-accent mb-4 uppercase tracking-widest">Matriz de Acesso</h3>
            <div className="space-y-3 font-mono text-xs text-green-500/80">
              <p>{'>'} Initializing connection...</p>
              <p>{'>'} User detected.</p>
              <p>{'>'} Loading profile: Guest</p>
              <p>{'>'} Optimizing audio engine...</p>
              <p className="animate-pulse">{'>'} READY_</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-gray-600 font-mono border-t border-neuro-800 relative">
        <p>© 2024 BrainHz Neural Technologies. All rights reserved.</p>
        <p className="mt-2">Use fones de ouvido para experiência binaural completa.</p>

        {/* Hidden Admin Trigger */}
        <button
          onClick={() => onAdminEnter && onAdminEnter()}
          className="absolute bottom-4 right-4 text-[9px] text-neuro-900 hover:text-gray-700 font-mono opacity-50 transition-colors"
          title="Admin Access"
        >
          [SYS_ADMIN]
        </button>
      </footer>
    </div>
  );
};

export default LandingPage;
