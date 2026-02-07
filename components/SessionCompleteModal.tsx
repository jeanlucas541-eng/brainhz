
import React, { useEffect, useState } from 'react';
import { SessionMode, SESSION_CONFIGS } from '../types';
import { Trophy, Zap, Share2, Clock, ArrowRight, RotateCcw, ChartBar, X, Sparkles } from 'lucide-react';

interface Props {
    isOpen: boolean;
    mode: SessionMode;
    durationMinutes: number;
    xpEarned: number;
    totalNeuroCores: number;
    streak: number;
    onClose: () => void;
    onNewSession: () => void;
    onViewProgress: () => void;
}

// Motivational messages by mode (no emojis)
const MOTIVATIONAL_MESSAGES: Record<SessionMode, string[]> = {
    [SessionMode.IDLE]: [],
    [SessionMode.GAMMA]: [
        "Processamento cognitivo superior alcançado.",
        "Sincronização global do córtex concluída.",
        "Suas conexões neurais foram fortalecidas.",
        "Estado de hiper-lucidez desbloqueado."
    ],
    [SessionMode.FOCUS]: [
        "Seu córtex pré-frontal agradece.",
        "Concentração de nível profissional atingida.",
        "A desincronização cortical foi dominada.",
        "Foco sustentado com sucesso."
    ],
    [SessionMode.STUDY]: [
        "O estado de Superlearning foi ativado.",
        "Memória consolidada com eficiência máxima.",
        "Absorção de conhecimento otimizada.",
        "Ondas Alpha estabilizadas para retenção."
    ],
    [SessionMode.CREATIVITY]: [
        "O filtro lógico foi temporariamente desativado.",
        "Acesso ao subconsciente concedido.",
        "Novas vias neurais criativas foram abertas.",
        "Pensamento divergente potencializado."
    ],
    [SessionMode.SLEEP]: [
        "Portões sensoriais fechados com sucesso.",
        "Transição para descanso profundo iniciada.",
        "Modo de recuperação neural ativado.",
        "O tálamo recebeu o sinal de desconexão."
    ],
    [SessionMode.RESTORE]: [
        "Sistema glifático ativado para limpeza cerebral.",
        "Ciclo de regeneração Delta concluído.",
        "Reparo tecidual neural em andamento.",
        "Neurotransmissores recalibrando..."
    ]
};

const SessionCompleteModal: React.FC<Props> = ({
    isOpen,
    mode,
    durationMinutes,
    xpEarned,
    totalNeuroCores,
    streak,
    onClose,
    onNewSession,
    onViewProgress
}) => {
    const [showContent, setShowContent] = useState(false);
    const [motivationalMessage, setMotivationalMessage] = useState('');

    const config = SESSION_CONFIGS[mode];

    useEffect(() => {
        if (isOpen) {
            // Delay content appearance for animation
            const timer = setTimeout(() => setShowContent(true), 100);

            // Pick random motivational message
            const messages = MOTIVATIONAL_MESSAGES[mode] || [];
            if (messages.length > 0) {
                setMotivationalMessage(messages[Math.floor(Math.random() * messages.length)]);
            }

            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Particle Effect Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-neuro-accent rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.3 + Math.random() * 0.4
                        }}
                    />
                ))}
            </div>

            {/* Modal Container */}
            <div
                className={`relative w-full max-w-md bg-neuro-900 border border-neuro-700 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-20"
                >
                    <X size={20} />
                </button>

                {/* Glowing Header */}
                <div className="relative bg-gradient-to-b from-neuro-accent/20 to-transparent p-8 text-center">
                    {/* Animated Ring */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 border border-neuro-accent/30 rounded-full animate-ping opacity-20"></div>
                    </div>

                    {/* Trophy Icon */}
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-neuro-800 rounded-full border-2 border-neuro-accent mb-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                        <Sparkles className="text-neuro-accent" size={36} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Sessão Concluída</h2>
                    <p className="text-sm text-neuro-accent font-mono uppercase tracking-wider">
                        {config.label}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="p-6 space-y-6">
                    {/* XP Earned - Hero Stat */}
                    <div className="bg-neuro-800/60 border border-neuro-accent/30 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Zap className="text-neuro-warning" size={24} />
                            <span className="text-4xl font-bold text-white font-mono">+{xpEarned}</span>
                            <span className="text-lg text-gray-400">XP</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                            Experiência Neural Adquirida
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Duration */}
                        <div className="bg-neuro-800/40 rounded-lg p-3 text-center">
                            <Clock className="text-blue-400 mx-auto mb-1" size={18} />
                            <div className="text-lg font-bold text-white font-mono">{durationMinutes}</div>
                            <div className="text-[10px] text-gray-500 uppercase">Minutos</div>
                        </div>

                        {/* NeuroCore */}
                        <div className="bg-neuro-800/40 rounded-lg p-3 text-center border border-neuro-accent/20">
                            <Share2 className="text-neuro-accent mx-auto mb-1" size={18} />
                            <div className="text-lg font-bold text-white font-mono">+1</div>
                            <div className="text-[10px] text-gray-500 uppercase">Conexão</div>
                        </div>

                        {/* Streak */}
                        <div className="bg-neuro-800/40 rounded-lg p-3 text-center">
                            <Trophy className="text-neuro-warning mx-auto mb-1" size={18} />
                            <div className="text-lg font-bold text-white font-mono">{streak}</div>
                            <div className="text-[10px] text-gray-500 uppercase">Streak</div>
                        </div>
                    </div>

                    {/* Motivational Message */}
                    {motivationalMessage && (
                        <div className="text-center py-4 border-t border-b border-neuro-800">
                            <p className="text-sm text-gray-300 italic">
                                "{motivationalMessage}"
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onNewSession}
                            className="w-full bg-neuro-accent hover:bg-neuro-accent/90 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-neuro-accent/20"
                        >
                            <RotateCcw size={18} />
                            Nova Sessão
                        </button>

                        <button
                            onClick={onViewProgress}
                            className="w-full bg-neuro-800 hover:bg-neuro-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-neuro-700"
                        >
                            <ChartBar size={18} />
                            Ver Progresso
                        </button>
                    </div>

                    {/* Total NeuroCores Footer */}
                    <div className="text-center pt-4 border-t border-neuro-800">
                        <p className="text-xs text-gray-500 font-mono">
                            Total de Conexões Neurais: <span className="text-neuro-accent font-bold">{totalNeuroCores}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionCompleteModal;
