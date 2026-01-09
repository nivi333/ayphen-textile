import { useGlobalTheme } from './theme-provider';

export const useToken = () => {
  const { theme } = useGlobalTheme();
  return theme;
};

// const token = useToken();
// token.colorPrimary
