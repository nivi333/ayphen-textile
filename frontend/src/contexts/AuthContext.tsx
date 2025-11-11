import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, Company, AuthTokens, LoginCredentials } from '../types/auth';
import { AuthStorage } from '../utils/storage';

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens; companies: Company[] } }
  | { type: 'LOGOUT' }
  | { type: 'SET_CURRENT_COMPANY'; payload: Company }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthTokens }
  | { type: 'INITIALIZE_AUTH'; payload: { user: User | null; tokens: AuthTokens | null; companies: Company[]; currentCompany: Company | null } };

// Initial state
const initialState: AuthState = {
  user: null,
  companies: [],
  currentCompany: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        companies: action.payload.companies,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'SET_CURRENT_COMPANY':
      return {
        ...state,
        currentCompany: action.payload,
      };
    
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        tokens: action.payload,
      };
    
    case 'INITIALIZE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        companies: action.payload.companies,
        currentCompany: action.payload.currentCompany,
        isAuthenticated: !!(action.payload.user && action.payload.tokens),
        isLoading: false,
      };
    
    default:
      return state;
  }
}

// Auth Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  switchCompany: (company: Company) => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const user = AuthStorage.getUser();
      const tokens = AuthStorage.getTokens();
      const companies = AuthStorage.getCompanies();
      const currentCompany = AuthStorage.getCurrentCompany();

      dispatch({
        type: 'INITIALIZE_AUTH',
        payload: { user, tokens, companies, currentCompany },
      });
    };

    initializeAuth();
  }, []);

  // Mock login function (replace with actual API call)
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response data
      const mockUser: User = {
        id: '1',
        email: credentials.emailOrPhone,
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN',
      };

      const mockTokens: AuthTokens = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      const mockCompanies: Company[] = [
        {
          id: '1',
          name: 'Textile Corp',
          slug: 'textile-corp',
          industry: 'Textile Manufacturing',
          role: 'OWNER',
        },
        {
          id: '2',
          name: 'Garment Ltd',
          slug: 'garment-ltd',
          industry: 'Garment Manufacturing',
          role: 'ADMIN',
        },
      ];

      // Store in storage
      AuthStorage.setUser(mockUser);
      AuthStorage.setTokens(mockTokens);
      AuthStorage.setCompanies(mockCompanies);
      AuthStorage.setCurrentCompany(mockCompanies[0]);

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: mockUser, tokens: mockTokens, companies: mockCompanies },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Login failed. Please try again.' });
    }
  };

  // Mock register function (replace with actual API call)
  const register = async (userData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful registration
      // In a real app, this would call your backend API
      console.log('Registration data:', userData);
      
      // No need to store user data since they'll need to verify email first
      // Just return success for now
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Registration failed. Please try again.' });
      throw error;
    }
  };

  const logout = () => {
    AuthStorage.clearAll();
    dispatch({ type: 'LOGOUT' });
  };

  const switchCompany = (company: Company) => {
    AuthStorage.setCurrentCompany(company);
    dispatch({ type: 'SET_CURRENT_COMPANY', payload: company });
  };

  const refreshToken = async () => {
    try {
      // Mock refresh token API call
      const newTokens: AuthTokens = {
        accessToken: 'new_mock_access_token',
        refreshToken: 'new_mock_refresh_token',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
      };

      AuthStorage.setTokens(newTokens);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: newTokens });
    } catch {
      logout();
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    switchCompany,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
