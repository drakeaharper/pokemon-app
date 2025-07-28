import React from 'react';
import { getTypeColor } from '../utils/typeColors';

interface TypePillProps {
  typeName: string;
  size?: 'sm' | 'md' | 'lg';
}

const TypePill: React.FC<TypePillProps> = ({ typeName, size = 'md' }) => {
  const typeColor = getTypeColor(typeName);
  
  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // Convert hex color to RGB for opacity manipulation
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(typeColor);
  const transparentBg = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : typeColor;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .type-pill-${typeName} {
            background-color: ${typeColor};
            color: white;
            border-color: ${typeColor};
          }
          
          .dark .type-pill-${typeName} {
            background-color: ${transparentBg} !important;
            color: ${typeColor} !important;
            border-color: ${typeColor} !important;
          }
        `
      }} />
      <span
        className={`
          type-pill-${typeName}
          inline-block rounded-full font-medium capitalize transition-all duration-200
          ${sizeClasses[size]}
          border-2
        `}
      >
        {typeName}
      </span>
    </>
  );
};

export default TypePill;