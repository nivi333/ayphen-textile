import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography } from 'antd';

const { Text, Link } = Typography;

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent is already recorded in local storage
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);

    // Call API to record consent if user is logged in
    // logic to be added
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        right: 24,
        zIndex: 1000,
        maxWidth: 600,
        margin: '0 auto',
        animation: 'slideUp 0.5s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <Card
        styles={{ body: { padding: '16px 24px' } }}
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1 }}>
            <Text strong>We use cookies</Text>
            <div style={{ marginTop: 4 }}>
              <Text type='secondary' style={{ fontSize: 13 }}>
                We use cookies to enhance your experience. By continuing to visit this site you
                agree to our use of cookies.{' '}
                <Link href='/legal/privacy' target='_blank'>
                  Privacy Policy
                </Link>
              </Text>
            </div>
          </div>
          <Space>
            <Button size='small' onClick={handleDecline}>
              Decline
            </Button>
            <Button type='primary' size='small' onClick={handleAccept}>
              Accept
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
