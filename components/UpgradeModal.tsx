
import React from 'react';
import { X, Zap, Brain, Clock, Sparkles, Shield, Crown, Check, Lock, Infinity, Timer } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: (plan: 'monthly' | 'lifetime') => void;
}

const BENEFITS = [
    {
        icon: Brain,
        title: 'Todos os 6 Protocolos',
        desc: 'Gamma, Focus, Study, Creativity, Sleep e Restore',
        science: 'Acesso completo a todas as faixas de frequencia cerebral'
    },
    {
        icon: Clock,
        title: 'Sessoes Ilimitadas',
        desc: 'Sem limite de tempo por sessao',
        science: 'Estudos mostram que 20-40 min sao ideais para neuroplasticidade'
    },
    {
        icon: Timer,
        title: 'Modo Pomodoro',
        desc: 'Ciclos de foco com pausas cientificas',
        science: 'Tecnica comprovada para produtividade sustentavel'
    },
    {
        icon: Sparkles,
        title: 'IA Especialista',
        desc: 'Consultor neural personalizado',
        science: 'Recomendacoes baseadas em seu perfil e objetivos'
    },
    {
        icon: Shield,
        title: 'Protocolos Personalizados',
        desc: 'Crie e salve seus proprios protocolos',
        science: 'Ajuste fino de frequencias para suas necessidades'
    },
    {
        icon: Infinity,
        title: 'Favoritos Ilimitados',
        desc: 'Organize seus protocolos preferidos',
        science: 'Acesso rapido ao que funciona para voce'
    }
];

const UpgradeModal: React.FC<Props> = ({ isOpen, onClose, onUpgrade }) => {
    const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'lifetime'>('lifetime');

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-neuro-900 border border-neuro-700 rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-8">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-neuro-accent to-purple-600 p-6 rounded-t-2xl overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors z-20"
                    >
                        <X size={18} />
                    </button>

                    <div className="absolute top-0 right-0 opacity-10">
                        <Crown size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Zap className="text-white" size={24} />
                            </div>
                            <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full text-white uppercase tracking-wider">
                                Upgrade Disponivel
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                            Desbloqueie o Potencial Completo
                        </h2>
                        <p className="text-white/80 text-sm">
                            Acesso ilimitado a todas as ferramentas de otimizacao cerebral
                        </p>
                    </div>
                </div>

                {/* Science Note */}
                <div className="px-6 py-4 bg-neuro-800/50 border-b border-neuro-700">
                    <p className="text-xs text-gray-400 leading-relaxed text-center">
                        <span className="text-neuro-accent font-bold">Baseado em Ciencia:</span> Pesquisas em neuroacustica demonstram que sessoes de 20-40 minutos
                        com frequencias especificas promovem <span className="text-white">sincronizacao neural</span> e
                        <span className="text-white"> neuroplasticidade</span>. O plano gratuito de 10 minutos oferece apenas uma amostra.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {BENEFITS.map((benefit, i) => (
                        <div
                            key={i}
                            className="flex gap-3 p-4 bg-neuro-800/50 border border-neuro-700 rounded-xl hover:border-neuro-accent/50 transition-colors"
                        >
                            <div className="p-2 bg-neuro-accent/20 rounded-lg h-fit">
                                <benefit.icon className="text-neuro-accent" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                    {benefit.title}
                                    <Check size={14} className="text-neuro-success" />
                                </h4>
                                <p className="text-xs text-gray-400 mb-1">{benefit.desc}</p>
                                <p className="text-[10px] text-neuro-accent/70 italic">{benefit.science}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Free vs Pro Comparison */}
                <div className="px-6 pb-2">
                    <div className="bg-neuro-800 rounded-xl border border-neuro-700 overflow-hidden mb-6">
                        <div className="grid grid-cols-3 text-center text-xs font-mono uppercase tracking-wider">
                            <div className="p-3 bg-neuro-700/50 text-gray-400">Recurso</div>
                            <div className="p-3 bg-neuro-700/50 text-gray-400">Gratis</div>
                            <div className="p-3 bg-neuro-accent/20 text-neuro-accent">Pro</div>
                        </div>
                        <div className="divide-y divide-neuro-700">
                            <div className="grid grid-cols-3 text-center text-xs">
                                <div className="p-3 text-gray-300 text-left pl-4">Duracao</div>
                                <div className="p-3 text-gray-500">10 min</div>
                                <div className="p-3 text-white font-bold">Ilimitado</div>
                            </div>
                            <div className="grid grid-cols-3 text-center text-xs">
                                <div className="p-3 text-gray-300 text-left pl-4">Protocolos</div>
                                <div className="p-3 text-gray-500">2</div>
                                <div className="p-3 text-white font-bold">Todos</div>
                            </div>
                            <div className="grid grid-cols-3 text-center text-xs">
                                <div className="p-3 text-gray-300 text-left pl-4">IA/Pomodoro</div>
                                <div className="p-3 text-red-400"><Lock size={14} className="inline" /></div>
                                <div className="p-3 text-neuro-success"><Check size={14} className="inline" /></div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Monthly Plan */}
                        <div
                            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'monthly'
                                ? 'bg-neuro-800 border-neuro-accent shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                                : 'bg-neuro-900 border-neuro-700 hover:border-neuro-500 opacity-70 hover:opacity-100'
                                }`}
                            onClick={() => setSelectedPlan('monthly')}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-white">Mensal</h4>
                                    <p className="text-xs text-gray-400">Flexibilidade total</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'bg-neuro-accent border-neuro-accent' : 'border-gray-500'}`}>
                                    {selectedPlan === 'monthly' && <Check size={12} className="text-white" />}
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-2xl font-bold text-white">R$ 19,90</span>
                                <span className="text-xs text-gray-500"> /mês</span>
                            </div>
                        </div>

                        {/* Lifetime Plan */}
                        <div
                            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'lifetime'
                                ? 'bg-gradient-to-br from-neuro-900 to-neuro-800 border-neuro-accent shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                                : 'bg-neuro-900 border-neuro-700 hover:border-neuro-500 opacity-70 hover:opacity-100'
                                }`}
                            onClick={() => setSelectedPlan('lifetime')}
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-neuro-accent to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                                MAIS POPULAR
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-white">Vitalício</h4>
                                    <p className="text-xs text-gray-400">Pague uma única vez</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'lifetime' ? 'bg-neuro-accent border-neuro-accent' : 'border-gray-500'}`}>
                                    {selectedPlan === 'lifetime' && <Check size={12} className="text-white" />}
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-2xl font-bold text-white">R$ 199,00</span>
                                <span className="text-xs text-gray-500"> único</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="p-6 pt-2 space-y-3">
                    <button
                        onClick={() => {
                            const link = selectedPlan === 'monthly'
                                ? import.meta.env.VITE_STRIPE_LINK_MONTHLY
                                : import.meta.env.VITE_STRIPE_LINK_LIFETIME;

                            if (link && link.includes('http')) {
                                window.open(link, '_blank');
                            } else {
                                alert("Erro: Link de pagamento não configurado. Contate o suporte.");
                            }
                        }}
                        className="w-full py-4 bg-gradient-to-r from-neuro-accent to-purple-600 hover:from-neuro-accent/90 hover:to-purple-600/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-neuro-accent/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                        <Crown size={20} />
                        {selectedPlan === 'monthly' ? 'ASSINAR POR R$ 19,90' : 'GARANTIR ACESSO VITALÍCIO'}
                    </button>

                    <p className="text-center text-[10px] text-gray-500">
                        Após o pagamento, sua assinatura será ativada em até 24h.
                    </p>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-gray-500 hover:text-white text-xs font-medium transition-colors opacity-70 hover:opacity-100"
                        >
                            Continuar no plano grátis
                        </button>

                        <a href="mailto:suporte@brainhz.app?subject=Já paguei, liberar acesso!" target="_blank" rel="noreferrer" className="text-center text-[10px] text-neuro-accent hover:underline opacity-80">
                            Já pagou? Clique aqui se o acesso não liberar.
                        </a>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default UpgradeModal;
