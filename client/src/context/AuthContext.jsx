import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import AuthModal from '../components/AuthModal';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const register = async ({ name, email, password, role = 'student' }) => {
    const res = await API.post('/auth/register', { name, email, password, role });
    setUser(res.data.user);
    setToken(res.data.token);
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.mfa_required) {
      return {
        mfaRequired: true,
        partialToken: res.data.partial_token,
        user: res.data.user,
      };
    }
    setUser(res.data.user);
    setToken(res.data.token);
    return { mfaRequired: false, user: res.data.user };
  };

  const verifyMfa = async ({ partialToken, totpCode }) => {
    const res = await API.post('/auth/verify-mfa', {
      partial_token: partialToken,
      totp_code: totpCode,
    });
    setUser(res.data.user);
    setToken(res.data.token);
    return res.data;
  };

  const setupMfa = async () => {
    const res = await API.post('/auth/setup-mfa');
    return res.data;
  };

  const enableMfa = async (totpCode) => {
    const res = await API.post('/auth/enable-mfa', { totp_code: totpCode });
    setUser((prev) => ({ ...prev, mfa_enabled: true }));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isSupervisor: user?.role === 'supervisor' || user?.role === 'admin',
        register,
        login,
        verifyMfa,
        setupMfa,
        enableMfa,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
