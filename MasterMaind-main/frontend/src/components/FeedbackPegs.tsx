
import React from 'react';
import { Feedback } from '../types';

interface FeedbackPegsProps {
  feedback: Feedback | null;
}

const FeedbackPegs: React.FC<FeedbackPegsProps> = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="grid grid-cols-2 gap-1.5 w-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-800/50 border border-slate-700/50" />
        ))}
      </div>
    );
  }

  const pegs = [];
  for (let i = 0; i < feedback.black; i++) pegs.push('white'); // Exact Match -> White
  for (let i = 0; i < feedback.white; i++) pegs.push('black'); // Color Match -> Black
  while (pegs.length < 4) pegs.push('empty');

  return (
    <div className="grid grid-cols-2 gap-1.5 w-10 animate-in fade-in zoom-in duration-500">
      {pegs.map((type, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full shadow-sm transition-all duration-300 border
            ${type === 'black'
              ? 'bg-slate-950 border-slate-800 shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]'
              : type === 'white'
                ? 'bg-slate-100 border-white shadow-[0_0_5px_rgba(255,255,255,0.5)]'
                : 'bg-white/5 border-white/10'
            }`}
        />
      ))}
    </div>
  );
};

export default FeedbackPegs;
