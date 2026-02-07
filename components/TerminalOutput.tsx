import React from 'react';

interface Props {
  text: string;
  title: string;
  type: 'prompt' | 'insight';
}

const TerminalOutput: React.FC<Props> = ({ text, title, type }) => {
  return (
    <div className={`font-mono text-xs md:text-sm p-4 rounded border border-neuro-700 ${type === 'prompt' ? 'bg-neuro-800/30 text-gray-400' : 'bg-neuro-800 text-neuro-success'}`}>
      <div className="flex items-center gap-2 mb-2 border-b border-neuro-700 pb-1">
        <div className={`w-2 h-2 rounded-full ${type === 'prompt' ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`}></div>
        <span className="uppercase tracking-widest opacity-70">{title}</span>
      </div>
      <p className="leading-relaxed whitespace-pre-wrap opacity-90">
        {type === 'prompt' && <span className="text-neuro-accent mr-2">{'>'}</span>}
        {text}
        <span className="animate-pulse ml-1">_</span>
      </p>
    </div>
  );
};

export default TerminalOutput;