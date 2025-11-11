import { ReactNode } from 'react';
import { BrandLogo } from '../BrandLogo';

interface AuthLayoutProps {
  children: ReactNode;
  backgroundGradient?: string;
  backgroundDecorations?: ReactNode;
}

// Reusable auth layout component with logo and background
export function AuthLayout({ 
  children, 
  backgroundGradient = 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 50%, #ffffff 100%)',
  backgroundDecorations
}: AuthLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: backgroundGradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Logo in top-left */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        zIndex: 10
      }}>
        <BrandLogo width={170} height={40} />
      </div>
      
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {backgroundDecorations}
      </div>
      
      {/* Main content container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '448px'
      }}>
        {children}
      </div>
    </div>
  );
}
