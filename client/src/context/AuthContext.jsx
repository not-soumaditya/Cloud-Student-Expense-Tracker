import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import AuthModal from '../components/AuthModal';
import { 
  generateBase32Secret, 
  getOtpAuthUrl, 
  generateQRCodeDataUrl, 
  verifyTOTPCode 
} from '../utils/totp';

const AuthContext = createContext();

// Helper to get local user registry (for standalone/Vercel offline fallback)
function getLocalUsers() {
  try {
    const raw = localStorage.getItem('mfa_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem('mfa_registered_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local users', e);
  }
}

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

  // Complete login with user and token
  const completeAuth = (userData, userToken) => {
    const finalUser = userData ? { ...userData, mfa_enabled: Boolean(userData.mfa_enabled) } : null;
    setUser(finalUser);
    setToken(userToken);
  };

  // Register user
  const register = async ({ name, email, password, role = 'student', autoLogin = true }) => {
    try {
      const res = await API.post('/auth/register', { name, email, password, role });
      const regUser = { ...res.data.user, mfa_enabled: Boolean(res.data.user?.mfa_enabled) };
      if (autoLogin) {
        setUser(regUser);
        setToken(res.data.token);
      }
      return {
        user: regUser,
        token: res.data.token,
        isLiveApi: true
      };
    } catch (err) {
      // If network error / backend offline (e.g. static Vercel deployment)
      if (!err.response || err.code === 'ERR_NETWORK') {
        const localUsers = getLocalUsers();
        const existing = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          throw new Error('A user with this email already exists.');
        }

        const newUser = {
          id: Date.now(),
          name,
          email,
          role: role === 'supervisor' ? 'supervisor' : 'student',
          password, // stored locally for client-side demo
          mfa_enabled: false,
          mfa_secret: null,
          created_at: new Date().toISOString()
        };
        localUsers.push(newUser);
        saveLocalUsers(localUsers);

        const dummyToken = `demo_jwt_${newUser.id}_${Date.now()}`;
        if (autoLogin) {
          setUser(newUser);
          setToken(dummyToken);
        }
        return {
          user: newUser,
          token: dummyToken,
          isLiveApi: false
        };
      }
      throw err;
    }
  };

  // Login user
  const login = async ({ email, password }) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.mfa_required) {
        return {
          mfaRequired: true,
          partialToken: res.data.partial_token,
          user: { ...res.data.user, mfa_enabled: true },
          isLiveApi: true
        };
      }
      const finalUser = { ...res.data.user, mfa_enabled: Boolean(res.data.user?.mfa_enabled) };
      setUser(finalUser);
      setToken(res.data.token);
      return { mfaRequired: false, user: finalUser, isLiveApi: true };
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const localUsers = getLocalUsers();
        let found = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // If no user found in local storage, allow a quick login for demonstration
        if (!found) {
          found = {
            id: Date.now(),
            name: email.split('@')[0] || 'Student User',
            email,
            password,
            role: 'student',
            mfa_enabled: false,
            mfa_secret: null
          };
          localUsers.push(found);
          saveLocalUsers(localUsers);
        }

        if (found.password && found.password !== password) {
          throw new Error('Invalid email or password.');
        }

        if (found.mfa_enabled) {
          return {
            mfaRequired: true,
            partialToken: `local_partial_${found.id}`,
            user: { ...found, mfa_enabled: true },
            secret: found.mfa_secret,
            isLiveApi: false
          };
        }

        const dummyToken = `demo_jwt_${found.id}_${Date.now()}`;
        setUser(found);
        setToken(dummyToken);
        return { mfaRequired: false, user: found, isLiveApi: false };
      }
      throw err;
    }
  };

  // Verify TOTP code during login
  const verifyMfa = async ({ partialToken, totpCode, secret, userId }) => {
    const cleanedCode = (totpCode || '').toString().trim().replace(/[\s-]/g, '');

    try {
      const res = await API.post('/auth/verify-mfa', {
        partial_token: partialToken,
        totp_code: cleanedCode,
      });
      const verifiedUser = { ...res.data.user, mfa_enabled: true };
      setUser(verifiedUser);
      setToken(res.data.token);
      return { ...res.data, user: verifiedUser };
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK' || partialToken?.startsWith('local_partial_')) {
        const localUsers = getLocalUsers();
        const userObj = localUsers.find(u => 
          u.id === userId || `local_partial_${u.id}` === partialToken
        );
        const secretToUse = secret || userObj?.mfa_secret;

        if (!secretToUse) {
          throw new Error('MFA secret not found for user');
        }

        const isValid = await verifyTOTPCode(cleanedCode, secretToUse, 2);
        if (!isValid) {
          throw new Error('Invalid 6-digit TOTP code. Please check Google Authenticator.');
        }

        const fullToken = `demo_jwt_${userObj ? userObj.id : Date.now()}_${Date.now()}`;
        const activeUser = {
          ...(userObj || {}),
          id: userObj ? userObj.id : (userId || Date.now()),
          email: userObj?.email || 'student@vit.ac.in',
          name: userObj?.name || 'Student User',
          role: userObj?.role || 'student',
          mfa_enabled: true
        };
        setUser(activeUser);
        setToken(fullToken);
        return {
          message: 'MFA verification successful',
          user: activeUser,
          token: fullToken
        };
      }
      throw err;
    }
  };

  // Initiate MFA setup: generate secret & QR code
  const setupMfa = async (customToken, customEmail) => {
    const activeToken = customToken || token;
    const activeEmail = customEmail || user?.email || 'student@vit.ac.in';

    try {
      const config = activeToken ? { headers: { Authorization: `Bearer ${activeToken}` } } : {};
      const res = await API.post('/auth/setup-mfa', {}, config);
      return res.data;
    } catch (err) {
      // Offline fallback: generate live QR code and Base32 secret directly
      const secret = generateBase32Secret(16);
      const otpauthUrl = getOtpAuthUrl(activeEmail, secret);
      const qrCodeDataUrl = await generateQRCodeDataUrl(otpauthUrl);
      return {
        message: 'MFA setup initiated. Scan the QR code with Google Authenticator.',
        secret,
        qr_code: qrCodeDataUrl,
        otpauth_url: otpauthUrl,
        isFallback: true
      };
    }
  };

  // Enable MFA: verify first TOTP code
  const enableMfa = async (totpCode, currentSecret, customToken, customUserId) => {
    const activeToken = customToken || token;
    const activeUserId = customUserId || user?.id;
    const cleanedCode = (totpCode || '').toString().trim().replace(/[\s-]/g, '');

    try {
      const config = activeToken ? { headers: { Authorization: `Bearer ${activeToken}` } } : {};
      const res = await API.post('/auth/enable-mfa', { totp_code: cleanedCode }, config);
      setUser(prev => prev ? { ...prev, mfa_enabled: true } : res.data.user);
      return res.data;
    } catch (err) {
      // Offline fallback verification
      if (!currentSecret) {
        throw new Error('MFA secret missing. Please restart MFA setup.');
      }

      const isValid = await verifyTOTPCode(cleanedCode, currentSecret, 2);
      if (!isValid) {
        throw new Error('Invalid 6-digit TOTP code. Please check Google Authenticator.');
      }

      // Save to local registry
      const localUsers = getLocalUsers();
      const idx = localUsers.findIndex(u => u.id === activeUserId || u.email === user?.email);
      if (idx !== -1) {
        localUsers[idx].mfa_enabled = true;
        localUsers[idx].mfa_secret = currentSecret;
        saveLocalUsers(localUsers);
      }

      setUser(prev => prev ? { ...prev, mfa_enabled: true } : { id: activeUserId, mfa_enabled: true });
      return {
        message: 'MFA enabled successfully!',
        user: { ...(user || {}), mfa_enabled: true }
      };
    }
  };

  // Emergency 2FA Reset using account password
  const resetMfa = async ({ email, password }) => {
    try {
      const res = await API.post('/auth/reset-mfa', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      return res.data;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const localUsers = getLocalUsers();
        const idx = localUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx === -1) {
          throw new Error('User not found.');
        }
        if (localUsers[idx].password && localUsers[idx].password !== password) {
          throw new Error('Incorrect password. Cannot reset 2FA.');
        }

        localUsers[idx].mfa_enabled = false;
        localUsers[idx].mfa_secret = null;
        saveLocalUsers(localUsers);

        const fullToken = `demo_jwt_${localUsers[idx].id}_${Date.now()}`;
        const updatedUser = { ...localUsers[idx], mfa_enabled: false };
        setUser(updatedUser);
        setToken(fullToken);
        return {
          message: '2FA has been successfully reset. You are now logged in.',
          user: updatedUser,
          token: fullToken
        };
      }
      throw err;
    }
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
        resetMfa,
        completeAuth,
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
