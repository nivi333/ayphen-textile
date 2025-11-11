import React from 'react';
import logoUrl from '../assets/lavoro-ai-ferri.png';

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', width = 48, height = 48, alt = 'Lavoro AI Ferri' }) => {
  return (
    <img
      src={logoUrl}
      alt={alt}
      width={width}
      height={height}
      className={`inline-block ${className}`}
    />
  );
};
