
export enum SessionMode {
  IDLE = 'IDLE',
  GAMMA = 'GAMMA',
  FOCUS = 'FOCUS',
  STUDY = 'STUDY',
  CREATIVITY = 'CREATIVITY',
  SLEEP = 'SLEEP',
  RESTORE = 'RESTORE'
}

export interface SessionConfig {
  id: SessionMode;
  label: string;
  activity: string;
  noiseColor: 'Pink' | 'White' | 'Brown';
  waveType: string;
  frequencyRange: [number, number]; // Min, Max in Hz
  vibe: string;
  description: string;
  science: string; // Scientific explanation of the mechanism
  recommendedDuration: string; // e.g., "20-40 min"
  benefits: string[]; // List of clinical benefits
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  entrainmentFreq: number; // Current Hz
}

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  durationMinutes: number;
  completedAt: string; // ISO Date
  xpEarned: number;
}

// Colored NeuroCores by wave type
export interface NeuroCoresByMode {
  GAMMA: number;     // Yellow/Gold - Insight
  FOCUS: number;     // Cyan/Blue - Concentration  
  STUDY: number;     // Green - Learning
  CREATIVITY: number; // Pink/Magenta - Creative
  SLEEP: number;     // Purple - Rest
  RESTORE: number;   // Turquoise - Healing
}

export interface UserStats {
  xp: number;
  level: number;
  totalMinutes: number;
  streak: number;
  lastLoginDate: string; // ISO Date string
  achievements: string[];
  neuroCores: number; // Total count (legacy/computed)
  neuroCoresByMode?: NeuroCoresByMode; // Colored cores by wave type
  history: SessionRecord[]; // Log of completed sessions
}

// Default empty cores by mode
export const DEFAULT_NEURO_CORES: NeuroCoresByMode = {
  GAMMA: 0,
  FOCUS: 0,
  STUDY: 0,
  CREATIVITY: 0,
  SLEEP: 0,
  RESTORE: 0
};

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 5000, 10000]; // XP required for next level

export const RANKS = [
  "Iniciado Neural",
  "Neófito",
  "Adepto da Frequência",
  "Sincronizador",
  "Arquiteto Mental",
  "Mestre do Foco",
  "Oráculo Cognitivo",
  "Transcendente"
];

export const SESSION_CONFIGS: Record<SessionMode, SessionConfig> = {
  [SessionMode.IDLE]: {
    id: SessionMode.IDLE,
    label: "Aguardando",
    activity: "Inativo",
    noiseColor: "White",
    waveType: "None",
    frequencyRange: [0, 0],
    vibe: "Neutro",
    description: "Selecione um protocolo para iniciar a calibração.",
    science: "O sistema aguarda input. Em estado de repouso (Default Mode Network), o cérebro oscila erraticamente entre Alpha (relaxamento) e Beta (pensamento ruminal), desperdiçando energia metabólica sem um foco definido.",
    recommendedDuration: "N/A",
    benefits: []
  },
  [SessionMode.GAMMA]: {
    id: SessionMode.GAMMA,
    label: "Gamma Insight (40Hz)",
    activity: "processamento cognitivo superior e síntese",
    noiseColor: "White",
    waveType: "Onda Gamma",
    frequencyRange: [40, 40],
    vibe: "elétrico, hiper-lúcido, transcendente",
    description: "Sincronização global do córtex para resolução complexa.",
    science: "Gamma (40Hz) é responsável pela 'Sincronização de Ligação' (Binding Problem), o mecanismo que unifica inputs sensoriais fragmentados em uma percepção consciente coerente. Estudos recentes indicam que o arrastamento em 40Hz estimula a microglia (sistema imune cerebral), promovendo a limpeza de placas amiloides e potencializando a neuroplasticidade sináptica.",
    recommendedDuration: "15 - 20 min",
    benefits: [
      "Integração sensorial de alta velocidade",
      "Processamento 'Top-Down' (foco voluntário)",
      "Potencialização da memória de trabalho"
    ]
  },
  [SessionMode.FOCUS]: {
    id: SessionMode.FOCUS,
    label: "Foco Beta (14-30Hz)",
    activity: "raciocínio lógico e execução linear",
    noiseColor: "Pink",
    waveType: "Onda Beta",
    frequencyRange: [14, 30],
    vibe: "futurista, fluxo constante, alerta",
    description: "Supressão de sonolência e aumento da excitabilidade cortical.",
    science: "Ondas Beta indicam um estado de desincronização cortical saudável, necessário para processamento ativo de dados externos. O arrastamento nesta faixa aumenta a norepinefrina, suprimindo frequências lentas (Theta/Delta) que causam desatenção. É o estado bioelétrico ideal para tarefas baseadas em regras, codificação e lógica matemática.",
    recommendedDuration: "30 - 45 min (Blocos Pomodoro)",
    benefits: [
      "Aumento da taxa de disparo neuronal",
      "Melhora na atenção seletiva sustentada",
      "Redução do tempo de reação cognitiva"
    ]
  },
  [SessionMode.STUDY]: {
    id: SessionMode.STUDY,
    label: "Alpha Flow (8-12Hz)",
    activity: "superaprendizado e consolidação",
    noiseColor: "Pink",
    waveType: "Onda Alpha",
    frequencyRange: [8, 12],
    vibe: "calmo, expansivo, equilibrado",
    description: "Estado de relaxamento alerta para absorção máxima.",
    science: "Alpha é o ritmo dominante do 'Repouso Alerta'. Ele funciona como um mecanismo de inibição ativa (Gating), filtrando ruídos sensoriais irrelevantes para proteger o processamento interno. Ao induzir Alpha, facilitamos o estado de 'Superlearning' (metodologia Lozanov), onde a mente absorve novas informações com menor resistência cognitiva e menor estresse (redução de cortisol).",
    recommendedDuration: "20 - 60 min",
    benefits: [
      "Otimização da consolidação da memória",
      "Redução da ansiedade de desempenho",
      "Coordenação mental calma e lúcida"
    ]
  },
  [SessionMode.CREATIVITY]: {
    id: SessionMode.CREATIVITY,
    label: "Theta Criativo (4-8Hz)",
    activity: "pensamento lateral e visualização",
    noiseColor: "Pink",
    waveType: "Onda Theta",
    frequencyRange: [4, 8],
    vibe: "onírico, flutuante, inspirador",
    description: "Acesso ao subconsciente e estado hipnagógico.",
    science: "Theta predomina no estado hipnagógico (limiar entre vigília e sono) e durante o sono REM. O arrastamento Theta desativa temporariamente o córtex pré-frontal dorsolateral (o 'filtro lógico'), permitindo associações livres, pensamento divergente e acesso a memórias de longo prazo normalmente inacessíveis. É o domínio da intuição profunda.",
    recommendedDuration: "15 - 30 min",
    benefits: [
      "Pensamento divergente (fora da caixa)",
      "Visualização mental hiper-vívida",
      "Liberação de bloqueios criativos lógicos"
    ]
  },
  [SessionMode.SLEEP]: {
    id: SessionMode.SLEEP,
    label: "Sono Profundo (4Hz)",
    activity: "indução hipnótica e sedação",
    noiseColor: "Brown",
    waveType: "Onda Theta/Delta",
    frequencyRange: [4, 4],
    vibe: "pesado, acolhedor, hipnótico",
    description: "Desconexão sensorial e bloqueio talâmico.",
    science: "A fronteira de 4Hz marca a transição para a desconexão sensorial. O uso de Ruído Marrom (espectro 1/f²) cria um 'cobertor sônico' que mascara transientes auditivos. O pulso rítmico lento sinaliza ao Tálamo para fechar os portões sensoriais (Thalamic Gating), impedindo que estímulos externos alcancem o córtex, facilitando a transição para o sono NREM.",
    recommendedDuration: "30 - 90 min (Ciclo de sono)",
    benefits: [
      "Facilitação do bloqueio sensorial (Gating)",
      "Redução da latência do sono",
      "Sincronização respiratória e cardíaca"
    ]
  },
  [SessionMode.RESTORE]: {
    id: SessionMode.RESTORE,
    label: "Regeneração Delta (0.5-3Hz)",
    activity: "limpeza glifática e reparo celular",
    noiseColor: "Brown",
    waveType: "Onda Delta",
    frequencyRange: [0.5, 3],
    vibe: "submerso, lento, curativo",
    description: "Sono de ondas lentas (SWS) para recuperação biológica.",
    science: "Delta representa a oscilação mais lenta e de maior amplitude, ocorrendo no sono NREM profundo (Estágio 3). Durante este estado, o Sistema Glifático (sistema de limpeza de resíduos do cérebro) torna-se 60% mais ativo, removendo neurotoxinas como beta-amiloide. Simultaneamente, ocorre o pico de liberação de Hormônio do Crescimento (HGH) para reparo tecidual.",
    recommendedDuration: "45 min - Noite toda",
    benefits: [
      "Ativação máxima do Sistema Glifático",
      "Liberação de HGH e reparo físico",
      "Reset completo dos neurotransmissores"
    ]
  }
};
