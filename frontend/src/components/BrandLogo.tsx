import React from 'react';
import logoUrl from '../assets/brand-logo.png';

interface BrandLogoProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  alt = 'Ayphen Technologies',
  style = {
    height: '100%',
    padding: '7px',
  },
}) => {
  return <img src={logoUrl} alt={alt} style={style} className={`inline-block ${className}`} />;
};
