import { Button as AntButton, ButtonProps } from 'antd';
import { ReactNode } from 'react';

interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}: CustomButtonProps) => {
  const getButtonType = () => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'danger':
        return 'primary';
      case 'secondary':
      default:
        return 'default';
    }
  };

  const getDanger = () => {
    return variant === 'danger';
  };

  return (
    <AntButton
      type={getButtonType()}
      danger={getDanger()}
      className={`${className}`}
      {...props}
    >
      {children}
    </AntButton>
  );
};
