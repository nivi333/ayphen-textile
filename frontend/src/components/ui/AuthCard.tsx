import { ReactNode } from 'react';
import { Card } from 'antd';

interface AuthCardProps {
  children: ReactNode;
  heading?: string;
}

// Reusable auth card component with logo and title
export function AuthCard({ children, heading }: AuthCardProps) {
  return (
    <div style={{ maxWidth: '448px', margin: '0 auto' }}>
      <Card 
        style={{
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: 'none',
        }}
      >
        {/* Page heading inside card */}
        {heading && (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                color: '#1f2937',
                fontWeight: 400,
                margin: 0,
                fontSize: '20px',
                textAlign: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              {heading}
            </h3>
          </div>
        )}

        {children}
      </Card>
    </div>
  );
}
