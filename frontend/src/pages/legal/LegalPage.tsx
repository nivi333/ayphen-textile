import React from 'react';
import { Typography, Card, Layout } from 'antd';
import { useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const LegalPage: React.FC = () => {
  const location = useLocation();
  // const { token } = theme.useToken();

  const getPageContent = () => {
    const path = location.pathname;

    if (path.includes('privacy')) {
      return {
        title: 'Privacy Policy',
        content: (
          <>
            <Paragraph>Last updated: {new Date().toLocaleDateString()}</Paragraph>
            <Title level={3}>1. Introduction</Title>
            <Paragraph>
              Welcome to Lavoro AI Ferri. We respect your privacy and are committed to protecting
              your personal data. This privacy policy will inform you as to how we look after your
              personal data when you visit our website and tell you about your privacy rights and
              how the law protects you.
            </Paragraph>
            <Title level={3}>2. Data We Collect</Title>
            <Paragraph>
              We may collect, use, store and transfer different kinds of personal data about you
              which we have grouped together follows:
              <ul>
                <li>
                  Identity Data includes first name, last name, username or similar identifier.
                </li>
                <li>
                  Contact Data includes billing address, delivery address, email address and
                  telephone numbers.
                </li>
                <li>
                  Technical Data includes internet protocol (IP) address, your login data, browser
                  type and version.
                </li>
              </ul>
            </Paragraph>
          </>
        ),
      };
    } else if (path.includes('cookie-policy')) {
      return {
        title: 'Cookie Policy',
        content: (
          <>
            <Paragraph>Last updated: {new Date().toLocaleDateString()}</Paragraph>
            <Title level={3}>What are cookies?</Title>
            <Paragraph>
              Cookies are small text files that are used to store small pieces of information. They
              are stored on your device when the website is loaded on your browser.
            </Paragraph>
            <Title level={3}>How do we use cookies?</Title>
            <Paragraph>
              We use cookies for several reasons:
              <ul>
                <li>
                  Necessary cookies: These cookies are essential for you to be able to use some
                  features of our website.
                </li>
                <li>
                  Functionality cookies: These cookies allow our website to remember choices you
                  have made in the past.
                </li>
                <li>
                  Analytics cookies: These cookies collect information about how you use our
                  website.
                </li>
              </ul>
            </Paragraph>
          </>
        ),
      };
    }

    // Default to Terms of Service
    return {
      title: 'Terms of Service',
      content: (
        <>
          <Paragraph>Last updated: {new Date().toLocaleDateString()}</Paragraph>
          <Title level={3}>1. Agreement to Terms</Title>
          <Paragraph>
            By accessing our website, you agree to be bound by these Terms of Service and to comply
            with all applicable laws and regulations.
          </Paragraph>
          <Title level={3}>2. Use License</Title>
          <Paragraph>
            Permission is granted to temporarily download one copy of the materials (information or
            software) on Lavoro AI Ferri's website for personal, non-commercial transitory viewing
            only.
          </Paragraph>
        </>
      ),
    };
  };

  const { title, content } = getPageContent();

  return (
    <MainLayout>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Card>
          <Title level={2}>{title}</Title>
          <Typography>{content}</Typography>
        </Card>
      </Content>
    </MainLayout>
  );
};

export default LegalPage;
