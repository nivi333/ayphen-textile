import { Input as AntInput, InputProps } from 'antd';
import React from 'react';

export interface TextInputProps extends InputProps {
  tone?: 'default' | 'muted';
}

export const Input: React.FC<TextInputProps> = ({ className = '', tone = 'default', ...props }) => {
  const toneClass = tone === 'muted' ? 'text-muted' : '';
  return <AntInput className={`${toneClass} ${className}`} {...props} />;
};
