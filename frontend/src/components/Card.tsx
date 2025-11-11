import { Card as AntCard, CardProps } from 'antd';
import { ReactNode } from 'react';

interface CustomCardProps extends CardProps {
  children: ReactNode;
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

export const Card = ({ 
  children, 
  shadow = 'small',
  className = '',
  ...props 
}: CustomCardProps) => {
  const getShadowClass = () => {
    switch (shadow) {
      case 'none':
        return 'shadow-none';
      case 'small':
        return 'shadow-sm';
      case 'medium':
        return 'shadow-md';
      case 'large':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  return (
    <AntCard
      className={`${getShadowClass()} ${className}`}
      {...props}
    >
      {children}
    </AntCard>
  );
};
