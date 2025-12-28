
import React from 'react';
import { Color } from '../types';
import { COLORS } from '../constants';
import Peg from './Peg';

interface ColorPickerProps {
  onSelectColor: (color: Color) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onSelectColor, disabled }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">Pick a color</h3>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {COLORS.map((color) => (
          <Peg 
            key={color} 
            color={color} 
            size="md"
            onClick={() => onSelectColor(color)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
