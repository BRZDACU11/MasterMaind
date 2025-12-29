
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
  for (let i = 0; i < feedback.black; i++) pegs.push('black');
  for (let i = 0; i < feedback.white; i++) pegs.push('white');
  while (pegs.length < 4) pegs.push('empty');

  return (
    <div className="grid grid-cols-2 gap-1.5 w-10 animate-in fade-in zoom-in duration-500">
      {pegs.map((type, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${type === 'black' ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] border-2 border-white' :
              type === 'white' ? 'bg-transparent border-2 border-slate-400' :
                'bg-slate-800 border-2 border-slate-800'
            }`}
        />
      ))}
    </div>
  );
};

export default FeedbackPegs;
