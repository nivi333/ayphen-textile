import { Tag as AntTag, TagProps } from 'antd';
import React from 'react';

export interface TagBadgeProps extends TagProps {
  tone?: 'default' | 'success' | 'warning' | 'error';
}

export const Tag: React.FC<TagBadgeProps> = ({ className = '', tone = 'default', ...props }) => {
  const color =
    tone === 'success' ? 'green' : tone === 'warning' ? 'orange' : tone === 'error' ? 'red' : undefined;
  return <AntTag color={color} className={className} {...props} />;
};
