
import React, { useState } from 'react';
import { User, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface Props {
    userId: string;
    onComplete: (username: string) => void;
}

const UsernameModal: React.FC<Props> = ({ userId, onComplete }) => {
    const [username, setUsername] = useState('');
    const [checking, setChecking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    // Validate username format
    const isValidFormat = (name: string) => {
        return /^[a-zA-Z0-9_]{3,20}$/.test(name);
    };

    // Check availability
    const checkAvailability = async (name: string) => {
        if (!isValidFormat(name)) {
            setIsAvailable(null);
            return;
        }

        setChecking(true);
        setError(null);

        const { data, error: err } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', name.toLowerCase())
            .maybeSingle();

        setChecking(false);

        if (err) {
            setError('Erro ao verificar disponibilidade');
            setIsAvailable(null);
        } else {
            setIsAvailable(data === null);
        }
    };

    // Handle input change with debounced check
    const handleChange = (value: string) => {
        const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(cleanValue);
        setIsAvailable(null);
        setError(null);

        if (cleanValue.length >= 3) {
            // Debounce the check
            const timer = setTimeout(() => {
                checkAvailability(cleanValue);
            }, 500);
            return () => clearTimeout(timer);
        }
    };

    // Save username
    const handleSave = async () => {
        if (!isAvailable || !isValidFormat(username)) return;

        setSaving(true);
        setError(null);

        const { error: err } = await supabase
            .from('profiles')
            .update({ username: username.toLowerCase() })
            .eq('id', userId);

        setSaving(false);

        if (err) {
            if (err.code === '23505') {
                setError('Este nome de usuario ja esta em uso');
                setIsAvailable(false);
            } else {
                setError('Erro ao salvar. Tente novamente.');
            }
        } else {
            onComplete(username);
        }
    };

    const getInputBorderClass = () => {
        if (checking) return 'border-neuro-accent';
        if (isAvailable === true) return 'border-green-500';
        if (isAvailable === false) return 'border-red-500';
        return 'border-neuro-700 focus:border-neuro-accent';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neuro-900 border border-neuro-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neuro-accent/20 border border-neuro-accent/50 flex items-center justify-center">
                        <User className="text-neuro-accent" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Escolha seu Username</h2>
                    <p className="text-gray-400 text-sm">
                        Este nome sera exibido no ranking mensal
                    </p>
                </div>

                {/* Input */}
                <div className="mb-6">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder="seu_username"
                            maxLength={20}
                            className={`w-full pl-10 pr-12 py-4 bg-neuro-800 border ${getInputBorderClass()} rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none transition-colors`}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {checking && <Loader2 className="animate-spin text-neuro-accent" size={20} />}
                            {!checking && isAvailable === true && <Check className="text-green-500" size={20} />}
                            {!checking && isAvailable === false && <X className="text-red-500" size={20} />}
                        </div>
                    </div>

                    {/* Hints */}
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                        <span className={username.length >= 3 ? 'text-green-500' : ''}>3-20 caracteres</span>
                        <span className="text-gray-700">|</span>
                        <span>letras, numeros, underscore</span>
                    </div>

                    {/* Status Messages */}
                    {isAvailable === true && (
                        <p className="mt-2 text-sm text-green-500 flex items-center gap-2">
                            <Check size={14} /> Nome disponivel
                        </p>
                    )}
                    {isAvailable === false && !error && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                            <X size={14} /> Nome ja esta em uso
                        </p>
                    )}
                    {error && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle size={14} /> {error}
                        </p>
                    )}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={!isAvailable || saving || !isValidFormat(username)}
                    className={`w-full py-4 rounded-lg font-bold font-mono transition-all flex items-center justify-center gap-2 ${isAvailable && isValidFormat(username)
                            ? 'bg-neuro-accent hover:bg-neuro-accent/90 text-white'
                            : 'bg-neuro-800 text-gray-600 cursor-not-allowed'
                        }`}
                >
                    {saving ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Salvando...
                        </>
                    ) : (
                        'Confirmar Username'
                    )}
                </button>

                <p className="mt-4 text-center text-[10px] text-gray-600">
                    O username nao pode ser alterado depois
                </p>
            </div>
        </div>
    );
};

export default UsernameModal;
