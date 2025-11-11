import { Alert as AntAlert, AlertProps } from 'antd';
import React from 'react';

export interface AppAlertProps extends AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'error';
}

export const Alert: React.FC<AppAlertProps> = ({ className = '', tone = 'info', ...props }) => {
  return <AntAlert className={className} type={tone} showIcon {...props} />;
};
