
import React from 'react';
import { Color } from '../types';
import { COLOR_MAP } from '../constants';

interface PegProps {
  color: Color | null;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const Peg: React.FC<PegProps> = ({ color, size = 'md', active = false, onClick, disabled = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10 md:w-12 md:h-12',
    lg: 'w-14 h-14'
  };

  const baseStyles = "rounded-full transition-all duration-300 flex items-center justify-center relative group";
  const shadowStyles = color ? "shadow-lg scale-100 hover:scale-105" : "bg-slate-800 border-2 border-slate-700/50";
  const activeStyles = active ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110" : "";
  const cursorStyles = disabled ? "cursor-not-allowed" : "cursor-pointer";

  return (
    <div 
      className={`${baseStyles} ${sizeClasses[size]} ${color ? COLOR_MAP[color] : ''} ${shadowStyles} ${activeStyles} ${cursorStyles}`}
      onClick={!disabled ? onClick : undefined}
    >
      {!color && !disabled && (
        <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-slate-600 transition-colors" />
      )}
    </div>
  );
};

export default Peg;
