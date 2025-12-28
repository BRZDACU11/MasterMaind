
import React from 'react';
import { Color, GuessResult } from '../types';
import Peg from './Peg';
import FeedbackPegs from './FeedbackPegs';

interface RowProps {
  attemptIndex: number;
  result: GuessResult;
  isActive: boolean;
  onPegClick?: (slotIndex: number) => void;
  selectedSlot?: number | null;
}

const Row: React.FC<RowProps> = ({ result, isActive, onPegClick, selectedSlot }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
      isActive ? 'bg-slate-900/80 shadow-xl border border-slate-700/50 translate-x-1' : 'opacity-60 grayscale-[0.5]'
    }`}>
      <div className="flex items-center gap-2 mr-4">
        <span className="text-xs font-mono text-slate-500 w-5">
          {isActive ? '→' : ''}
        </span>
      </div>
      
      <div className="flex gap-4 md:gap-6">
        {result.guess.map((color, idx) => (
          <Peg 
            key={idx} 
            color={color} 
            active={isActive && selectedSlot === idx}
            onClick={() => isActive && onPegClick?.(idx)}
            disabled={!isActive}
          />
        ))}
      </div>

      <div className="ml-8 md:ml-12 border-l border-slate-800 pl-6">
        <FeedbackPegs feedback={result.feedback} />
      </div>
    </div>
  );
};

export default Row;
