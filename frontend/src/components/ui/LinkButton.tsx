import { Button } from 'antd';
import { ReactNode } from 'react';

interface LinkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  className?: string;
}

// Reusable link button component with no border styling
export function LinkButton({ children, onClick, href, target, className }: LinkButtonProps) {
  const handleClick = () => {
    if (href) {
      if (target === '_blank') {
        window.open(href, 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Button 
      type="link" 
      style={{ 
        padding: 0, 
        height: 'auto', 
        fontWeight: 500,
        color: '#7b5fc9',
        fontSize: '12px',
        border: 'none',
        boxShadow: 'none',
        textDecoration: 'none',
      }}
      className={`no-border-link ${className || ''}`}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
