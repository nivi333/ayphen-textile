import { App as AntdApp } from 'antd';
import AppRouter from './router/AppRouter';
import ThemeProvider from './contexts/ThemeContext';
import CookieConsent from './components/common/CookieConsent';

function App() {
  return (
    <ThemeProvider>
      <AntdApp>
        <AppRouter />
        <CookieConsent />
      </AntdApp>
    </ThemeProvider>
  );
}

export default App;
