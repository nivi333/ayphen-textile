import { ReactNode } from 'react';

interface AnimatedBackgroundProps {
  variant?: 'login' | 'register' | 'forgot-password';
  children?: ReactNode;
}

export default function AnimatedBackground({ variant = 'login', children }: AnimatedBackgroundProps) {
  const getColorScheme = () => {
    switch (variant) {
      case 'register':
        return {
          primary: '#7b5fc9',
          secondary: '#a2d8e5',
          accent: '#e879f9',
        };
      case 'forgot-password':
        return {
          primary: '#fb923c',
          secondary: '#f59e0b',
          accent: '#fbbf24',
        };
      default: // login
        return {
          primary: '#7b5fc9',
          secondary: '#a2d8e5',
          accent: '#c084fc',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(90deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
          75% { transform: translateY(-30px) rotate(270deg); }
        }
        
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(360deg); }
          25% { transform: translateY(30px) rotate(270deg); }
          50% { transform: translateY(15px) rotate(180deg); }
          75% { transform: translateY(25px) rotate(90deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        
        @keyframes drift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(0px); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }
      `}</style>

      {/* Large floating circles */}
      <div style={{
        position: 'absolute',
        top: '-160px',
        right: '-160px',
        width: '320px',
        height: '320px',
        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
        borderRadius: '50%',
        opacity: 0.1,
        filter: 'blur(40px)',
        animation: 'float 20s ease-in-out infinite, pulse 8s ease-in-out infinite'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '-160px',
        left: '-160px',
        width: '320px',
        height: '320px',
        background: `linear-gradient(45deg, ${colors.secondary}, ${colors.primary})`,
        borderRadius: '50%',
        opacity: 0.1,
        filter: 'blur(40px)',
        animation: 'floatReverse 25s ease-in-out infinite, pulse 10s ease-in-out infinite'
      }}></div>

      {/* Medium floating elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '120px',
        height: '120px',
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        opacity: 0.08,
        filter: 'blur(20px)',
        animation: 'float 15s ease-in-out infinite, drift 12s ease-in-out infinite'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '30%',
        right: '15%',
        width: '80px',
        height: '80px',
        background: `linear-gradient(225deg, ${colors.secondary}, ${colors.accent})`,
        borderRadius: '50%',
        opacity: 0.1,
        filter: 'blur(15px)',
        animation: 'floatReverse 18s ease-in-out infinite, drift 8s ease-in-out infinite reverse'
      }}></div>

      {/* Small decorative elements */}
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '5%',
        width: '40px',
        height: '40px',
        background: colors.primary,
        borderRadius: '50%',
        opacity: 0.06,
        animation: 'float 10s ease-in-out infinite, fadeInOut 6s ease-in-out infinite'
      }}></div>

      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: '60px',
        height: '60px',
        background: colors.accent,
        borderRadius: '20% 80% 80% 20% / 20% 20% 80% 80%',
        opacity: 0.05,
        animation: 'floatReverse 14s ease-in-out infinite, fadeInOut 9s ease-in-out infinite'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '20%',
        width: '30px',
        height: '30px',
        background: colors.secondary,
        borderRadius: '50%',
        opacity: 0.08,
        animation: 'float 12s ease-in-out infinite, drift 7s ease-in-out infinite'
      }}></div>

      {/* Gradient overlay for depth */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,255,255,0.02) 100%)`,
        pointerEvents: 'none'
      }}></div>

      {children}
    </>
  );
}
