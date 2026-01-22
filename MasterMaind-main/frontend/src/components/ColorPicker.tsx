
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
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-6">
        {COLORS.map((color) => (
          <Peg
            key={color}
            color={color}
            size="lg"
            onClick={() => onSelectColor(color)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
