
import React from 'react';
import { GuessResult } from '../types';
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
    <div className={`
        flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative group
        ${isActive
        ? 'bg-white/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] z-10'
        : 'bg-white/5 border-white/5 opacity-80 hover:opacity-100 hover:bg-white/10'}
    `}>
      {/* Active Indicator Line */}
      {isActive && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-l-2xl" />
        </>
      )}

      {/* Attempt Number */}
      <div className="flex items-center gap-2 mr-4 md:mr-6 w-8 justify-center">
        <span className={`text-xs font-mono font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>
          {isActive ? '►' : ''}
        </span>
      </div>

      {/* Pegs */}
      <div className="flex gap-3 md:gap-5 flex-1 justify-center">
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

      {/* Feedback Area */}
      <div className="ml-4 md:ml-8 pl-4 md:pl-6 border-l border-white/10 flex items-center justify-center min-w-[60px]">
        <FeedbackPegs feedback={result.feedback} />
      </div>
    </div>
  );
};

export default Row;
