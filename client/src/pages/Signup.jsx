import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const { user, signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname 
    ? `${location.state.from.pathname}${location.state.from.search || ''}` 
    : '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const mapFirebaseError = (errCode) => {
    switch (errCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing.';
      case 'auth/network-request-failed':
        return 'Network failure. Please check your internet connection.';
      default:
        return 'Failed to create account. Please check your details and try again.';
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter a password.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      await signup(email.trim(), password, fullName.trim());
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      setGoogleLoading(true);
      await googleLogin();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google Signup error:', err);
      setError(mapFirebaseError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isFormDisabled = loading || googleLoading;

  return (
    <div className="auth-page grid-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-card fade-up">
        {/* LOGO & TITLE */}
        <div className="auth-header">
          <div className="auth-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
            <div className="logo-icon">⚡</div>
            <span>Hack<span className="logo-accent">Sprint</span></span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join HackSprint to unlock AI interview prep & solutions</p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="auth-alert auth-alert--error fade-in">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* SIGNUP FORM */}
        <form onSubmit={handleSignup} className="auth-form" noValidate>
          {/* FULL NAME */}
          <div className="auth-field">
            <label htmlFor="fullName">Full Name</label>
            <div className="auth-input-wrap">
              <span className="input-icon">👤</span>
              <input
                id="fullName"
                type="text"
                placeholder="Arjun Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isFormDisabled}
                autoComplete="name"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <div className="auth-input-wrap">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormDisabled}
                autoComplete="email"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="input-icon">🔑</span>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isFormDisabled}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isFormDisabled}
          >
            {loading ? (
              <div className="btn-loading-content">
                <span className="btn-spinner" />
                <span>Loading...</span>
              </div>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* GOOGLE SIGNUP */}
        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={isFormDisabled}
        >
          {googleLoading ? (
            <div className="btn-loading-content">
              <span className="btn-spinner" />
              <span>Connecting Google...</span>
            </div>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* BOTTOM LINK */}
        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login" state={{ from: location.state?.from }} className="auth-footer-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
