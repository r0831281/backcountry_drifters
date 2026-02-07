import { useState, useEffect } from 'react';
import { formatPrice } from '../../types';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    const newValue: [number, number] = [Math.min(newMin, localValue[1]), localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    const newValue: [number, number] = [localValue[0], Math.max(newMax, localValue[0])];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Dual-range slider visualization */}
      <div className="relative pt-6 pb-2">
        {/* Track */}
        <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full" />

        {/* Active range */}
        <div
          className="absolute top-6 h-2 bg-forest-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-forest-500
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-shadow
            [&::-webkit-slider-thumb]:hover:shadow-md
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-forest-500
            [&::-moz-range-thumb]:shadow-sm
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-shadow
            [&::-moz-range-thumb]:hover:shadow-md
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-forest-500
            focus-visible:ring-offset-2"
          aria-label="Minimum price"
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-forest-500
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-shadow
            [&::-webkit-slider-thumb]:hover:shadow-md
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-forest-500
            [&::-moz-range-thumb]:shadow-sm
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-shadow
            [&::-moz-range-thumb]:hover:shadow-md
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-forest-500
            focus-visible:ring-offset-2"
          aria-label="Maximum price"
        />
      </div>

      {/* Price range display */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{formatPrice(localValue[0] * 100)}</span>
        <span className="text-gray-400">to</span>
        <span className="font-medium text-gray-700">{formatPrice(localValue[1] * 100)}</span>
      </div>
    </div>
  );
}
