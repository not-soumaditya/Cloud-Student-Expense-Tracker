import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  HiXMark, 
  HiShieldCheck, 
  HiLockClosed, 
  HiEnvelope, 
  HiUser, 
  HiQrCode,
  HiKey
} from 'react-icons/hi2';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, verifyMfa, setupMfa, enableMfa } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'mfa_verify' | 'mfa_setup'
  
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setTotpCode('');
      setPartialToken(null);
      setMfaData(null);
      setLoading(false);
    }
  }, [isOpen, initialMode]);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [totpCode, setTotpCode] = useState('');
  
  // MFA flow state
  const [partialToken, setPartialToken] = useState(null);
  const [mfaData, setMfaData] = useState(null); // { secret, qr_code }
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('student');
    setTotpCode('');
    setPartialToken(null);
    setMfaData(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.mfaRequired) {
        setPartialToken(res.partialToken);
        setMode('mfa_verify');
        toast('MFA is required. Enter your 6-digit authenticator code.', { icon: '🔐' });
      } else {
        toast.success(`Welcome back, ${res.user.name}!`);
        handleClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyMfa({ partialToken, totpCode });
      toast.success(`MFA verified! Welcome, ${res.user.name}`);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid 6-digit TOTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register({ name, email, password, role });
      toast.success(`Account created as ${role}!`);
      // Ask if they want to setup MFA right away
      setMode('mfa_setup_prompt');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const startMfaSetup = async () => {
    setLoading(true);
    try {
      const data = await setupMfa();
      setMfaData(data);
      setMode('mfa_setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await enableMfa(totpCode);
      toast.success('Two-factor authentication (MFA) enabled successfully!');
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid TOTP code. Could not enable MFA.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md my-auto max-h-[90vh] flex flex-col overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <HiShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === 'login' && 'Sign In to Your Account'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'mfa_verify' && 'Two-Factor Authentication'}
              {mode === 'mfa_setup_prompt' && 'Secure Your Account'}
              {mode === 'mfa_setup' && 'Set Up Google Authenticator'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <HiEnvelope className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@vit.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                  >
                    Register now
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <HiUser className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alice Sharma"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <HiEnvelope className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@vit.ac.in"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Application Role (RBAC)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                      role === 'student'
                        ? 'bg-violet-50 dark:bg-violet-500/20 border-violet-500 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    🎓 Student (View & Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('supervisor')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                      role === 'supervisor'
                        ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    👑 Supervisor (Full CRUD)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 transition disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MFA VERIFY (DURING LOGIN) */}
          {mode === 'mfa_verify' && (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <HiKey className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enter the 6-digit TOTP code from Google Authenticator
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}

          {/* MFA SETUP PROMPT (AFTER REGISTER) */}
          {mode === 'mfa_setup_prompt' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HiShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account Registered Successfully!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Would you like to enable Multi-Factor Authentication (TOTP) now using Google or Microsoft Authenticator?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={startMfaSetup}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow transition"
                >
                  Enable 2FA (Recommended)
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {/* MFA SETUP SCAN QR */}
          {mode === 'mfa_setup' && mfaData && (
            <form onSubmit={handleEnableMfa} className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scan this QR code with <strong>Google Authenticator</strong> or enter the secret key manually:
                </p>
                
                {/* QR Code Image */}
                <div className="flex justify-center p-3 bg-white rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 max-w-[200px] mx-auto">
                  <img src={mfaData.qr_code} alt="MFA QR Code" className="w-40 h-40" />
                </div>

                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 break-all select-all">
                  Secret: {mfaData.secret}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 text-center">
                  Enter 6-digit Code from Authenticator
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-xl font-mono tracking-widest py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Activating...' : 'Verify & Activate MFA'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
