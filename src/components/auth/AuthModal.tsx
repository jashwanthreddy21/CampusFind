import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'login' 
}) => {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    sendPasswordReset, 
    loginAsGuest 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode whenever initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      onClose();
      resetFormState();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginAsGuest();
      onClose();
      resetFormState();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Guest demo sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await sendPasswordReset(cleanEmail);
        setSuccessMessage('Password reset link sent! Check your inbox to set a new password.');
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          setErrorMessage('No candidate account found with this email.');
        } else {
          setErrorMessage(err?.message || 'Failed to send password reset email.');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both fields.');
        return;
      }

      setIsLoading(true);
      try {
        await signupWithEmail(cleanEmail, password, name.trim() || 'Candidate');
        onClose();
        resetFormState();
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setErrorMessage('An account already exists with this email. Please sign in instead.');
        } else if (err.code === 'auth/weak-password') {
          setErrorMessage('Password should be at least 6 characters.');
        } else if (err.code === 'auth/invalid-email') {
          setErrorMessage('Please enter a valid email address.');
        } else {
          setErrorMessage(err?.message || 'Sign up failed. Please check your credentials.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // login
      setIsLoading(true);
      try {
        await loginWithEmail(cleanEmail, password);
        onClose();
        resetFormState();
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setErrorMessage('Invalid email or password. Please verify and try again.');
        } else {
          setErrorMessage(err?.message || 'Login failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div 
        className="bg-white w-full max-w-md sm:max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              CampusFind Student Portal
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {mode === 'signup' 
              ? 'Create Student Account' 
              : mode === 'forgot'
              ? 'Reset Your Password'
              : 'Welcome Back Candidate'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            {mode === 'signup' 
              ? 'Sign up to bookmark dream colleges, save cutoff rank predictions, and post student reviews.'
              : mode === 'forgot'
              ? 'Enter your registered email address and we will send a password reset link.'
              : 'Sign in to access your synchronized choice lists, cutoffs, and admissions profile.'}
          </p>

          {/* Mode Switch Tabs */}
          {mode !== 'forgot' && (
            <div className="flex bg-white/10 p-1 rounded-xl mt-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(null); }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">
          
          {/* Quick Google Sign In */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                  Or with email
                </span>
              </div>
            </>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Full Name field for Sign Up */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Candidate Name (e.g. Rahul Reddy)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password Field (for login and signup) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMessage(null); }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (only for signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signup' 
                      ? 'Complete Registration' 
                      : mode === 'forgot'
                      ? 'Send Recovery Link'
                      : 'Sign In to Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Alternate Navigation & Quick Guest Demo */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5 text-xs text-slate-500">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                className="text-indigo-600 hover:text-indigo-800 font-bold self-center cursor-pointer"
              >
                ← Back to Sign In
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <span>
                  {mode === 'login' ? "Don't have an account?" : 'Already registered?'}
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer underline ml-0.5"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </span>

                <button
                  type="button"
                  onClick={handleGuestAuth}
                  disabled={isLoading}
                  className="font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Guest Demo
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Security Trust Footnote */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-bit Firestore Protected
          </span>
          <span>EAMCET & JoSAA Admissions</span>
        </div>

      </div>
    </div>
  );
};
