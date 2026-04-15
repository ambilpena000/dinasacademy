import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  className?: string;
  color?: 'blue' | 'purple' | 'green';
}

export function ProgressBar({ value, showLabel = true, className = '', color = 'blue' }: ProgressBarProps) {
  const colors = {
    blue: 'bg-[#2563EB]',
    purple: 'bg-[#3B82F6]',
    green: 'bg-green-500'
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">{value}%</span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}