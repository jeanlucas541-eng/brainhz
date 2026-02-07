
import React from 'react';
import { Headphones, Moon, Wind, Smartphone, Check, X, ShieldCheck } from 'lucide-react';
import { SessionMode } from '../types';

interface Props {
  mode: SessionMode;
  onConfirm: () => void;
  onCancel: () => void;
}

const PreSessionChecklist: React.FC<Props> = ({ mode, onConfirm, onCancel }) => {
  const isSleepMode = mode === SessionMode.SLEEP || mode === SessionMode.RESTORE;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-neuro-900 border border-neuro-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-neuro-800 border-b border-neuro-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-neuro-accent" />
            Preparação Neural
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Para garantir o arrastamento cerebral efetivo (FFR), siga o protocolo abaixo.
          </p>
        </div>

        {/* Checklist Items */}
        <div className="p-6 space-y-6">
          
          {/* 1. Headphones (Mandatory for Binaural) */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-neuro-800 flex items-center justify-center flex-shrink-0 border border-neuro-700">
              <Headphones className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-200">Fones de Ouvido Estéreo</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Essencial. As batidas binaurais requerem frequências diferentes em cada ouvido para funcionar.
              </p>
            </div>
          </div>

          {/* 2. Environment */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-neuro-800 flex items-center justify-center flex-shrink-0 border border-neuro-700">
              <Wind className="text-neuro-success" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-200">Ambiente Controlado</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Escolha um local calmo. Ajuste a temperatura e avise que não deve ser interrompido pelos próximos minutos.
              </p>
            </div>
          </div>

          {/* 3. Sleep Hygiene (Conditional) */}
          {isSleepMode ? (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Moon className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-200">Higiene do Sono (Crítico)</h3>
                <ul className="text-xs text-gray-400 space-y-1 mt-1 list-disc list-inside">
                  <li>Ative o <strong>Filtro de Luz Azul</strong> do dispositivo.</li>
                  <li>Ative o modo <strong>Não Perturbe</strong> agora.</li>
                  <li>Deite-se em posição confortável (decúbito dorsal).</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-neuro-800 flex items-center justify-center flex-shrink-0 border border-neuro-700">
                <Smartphone className="text-neuro-warning" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-200">Modo Foco</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Coloque o celular no modo silencioso ou "Não Perturbe" para evitar que notificações quebrem o estado de fluxo.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-4 bg-neuro-800 border-t border-neuro-700 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-neuro-700 text-gray-400 hover:bg-neuro-700 hover:text-white transition-colors text-xs font-bold font-mono"
          >
            CANCELAR
          </button>
          <button 
            onClick={onConfirm}
            className="flex-2 w-full py-3 rounded-lg bg-neuro-accent hover:bg-neuro-accent/90 text-white shadow-lg shadow-neuro-accent/20 transition-all text-xs font-bold font-mono flex items-center justify-center gap-2"
          >
            <Check size={16} />
            CONFIRMAR & INICIAR
          </button>
        </div>

      </div>
    </div>
  );
};

export default PreSessionChecklist;
