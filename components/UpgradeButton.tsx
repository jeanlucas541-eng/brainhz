
import React from 'react';
import { Crown } from 'lucide-react';

interface Props {
    onClick: () => void;
    variant?: 'header' | 'inline' | 'card';
}

const UpgradeButton: React.FC<Props> = ({ onClick, variant = 'header' }) => {
    if (variant === 'header') {
        return (
            <button
                onClick={onClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-neuro-accent to-purple-600 hover:from-neuro-accent/90 hover:to-purple-600/90 text-white text-xs font-bold font-mono rounded-full shadow-lg shadow-neuro-accent/20 transition-all transform hover:scale-105"
            >
                <Crown size={14} />
                UPGRADE
            </button>
        );
    }

    if (variant === 'inline') {
        return (
            <button
                onClick={onClick}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-neuro-accent/20 hover:bg-neuro-accent/30 text-neuro-accent text-xs font-bold rounded-lg transition-colors"
            >
                <Crown size={12} />
                Pro
            </button>
        );
    }

    // Card variant
    return (
        <button
            onClick={onClick}
            className="w-full py-3 bg-gradient-to-r from-neuro-accent to-purple-600 hover:from-neuro-accent/90 hover:to-purple-600/90 text-white font-bold rounded-lg shadow-lg shadow-neuro-accent/20 transition-all flex items-center justify-center gap-2"
        >
            <Crown size={16} />
            FAZER UPGRADE
        </button>
    );
};

export default UpgradeButton;
