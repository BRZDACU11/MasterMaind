
import React from 'react';
import { Color } from '../types';
import { COLOR_MAP } from '../constants';

interface PegProps {
  color: Color | null;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const Peg: React.FC<PegProps> = ({ color, active, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center 
        transition-all duration-300 outline-none cursor-pointer
        ${!color ? 'bg-white/10 border-2 border-dashed border-white/40 hover:border-white/60 hover:bg-white/20' : ''}
        ${active ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''}
        ${color ? 'shadow-lg' : ''}
        ${!disabled && !color ? 'hover:bg-white/10 hover:scale-105' : ''}
      `}
    >
      {color && (
        <>
          <div className={`w-full h-full rounded-full ${COLOR_MAP[color]} shadow-inner`} />
          {/* Glossy Reflection */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2/3 h-1/4 bg-gradient-to-b from-white/60 to-transparent rounded-full opacity-70" />
          {/* Inner Glow */}
          <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${COLOR_MAP[color]}`} />
        </>
      )}

      {!color && active && (
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      )}
    </button>
  );
};

export default Peg;
