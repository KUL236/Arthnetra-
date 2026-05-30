'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import '@/i18n/config';

type Mode = 'login' | 'signup' | 'otp';
type OtpStep = 'send' | 'verify';

function AuthPageInner() {
  const { t } = useTranslation();
  const { setUser } = useAppStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('send');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pick up ?error= from OAuth callback redirect
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) setError(decodeURIComponent(oauthError));
  }, [searchParams]);

  // Detect existing session (e.g. after OAuth redirect)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        router.replace('/');
      }
    });
  }, [router, setUser]);

  const resetState = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setOtpStep('send');
    setOtpToken('');
  };

  // ── Login / Signup ──────────────────────────────────────────
  const handleAuth = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        setUser({ id: data.user!.id, email: data.user!.email! });
        router.replace('/');
      } else if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (err) throw err;
        setSuccess('Account created! Please check your email to verify, then log in.');
        setMode('login');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP: Step 1 — send OTP ──────────────────────────────────
  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setSuccess(`OTP sent to ${email}. Check your inbox.`);
      setOtpStep('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP: Step 2 — verify the 6-digit token ─────────────────
  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: otpToken.trim(),
        type: 'email',
      });
      if (err) throw err;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email! });
        router.replace('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (err) throw err;
      // Browser will redirect — no need to setLoading(false)
    } catch {
      setError('Google login failed. Make sure Google is enabled in Supabase Auth settings.');
      setLoading(false);
    }
  };

  const isOtpMode = mode === 'otp';
  const canSubmit = email && (isOtpMode ? true : password.length >= 6);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-5 blur-3xl animate-orb-pulse"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full border border-amber-500/50 flex items-center justify-center animate-pulse-glow">
              <span className="text-amber-400 font-display font-bold">₹</span>
            </div>
            <span className="font-display font-black text-2xl text-gradient-amber">ArthNetra</span>
          </Link>
          <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            {mode === 'login' ? t('auth.welcomeBack') : mode === 'signup' ? t('auth.createAccount') : 'OTP Login'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            India's AI Financial Intelligence Platform
          </p>
        </div>

        <div
          className="p-6 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {/* Mode tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            {(['login', 'signup', 'otp'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => resetState(m)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
                style={{
                  background: mode === m ? 'var(--accent-amber)' : 'transparent',
                  color: mode === m ? '#000' : 'var(--text-muted)',
                }}
              >
                {m === 'otp' ? 'OTP' : m === 'login' ? t('auth.login') : t('auth.signup')}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.email')}
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors focus-within:border-amber-400/50"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
              >
                <Mail size={15} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  disabled={isOtpMode && otpStep === 'verify'}
                />
              </div>
            </div>

            {/* Password — only for login/signup */}
            <AnimatePresence>
              {!isOtpMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    {t('auth.password')}
                  </label>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                  >
                    <Lock size={15} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--text-primary)' }}
                      onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleAuth()}
                    />
                    <button onClick={() => setShowPass(!showPass)} style={{ color: 'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP token input — step 2 only */}
            <AnimatePresence>
              {isOtpMode && otpStep === 'verify' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Enter 6-digit OTP from email
                  </label>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors focus-within:border-amber-400/50"
                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                  >
                    <KeyRound size={15} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="flex-1 bg-transparent text-sm outline-none tracking-widest font-mono"
                      style={{ color: 'var(--text-primary)' }}
                      onKeyDown={(e) => e.key === 'Enter' && otpToken.length === 6 && handleVerifyOtp()}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => { setOtpStep('send'); setOtpToken(''); setSuccess(''); setError(''); }}
                    className="text-xs mt-1.5"
                    style={{ color: 'var(--accent-amber)' }}
                  >
                    ← Change email / Resend OTP
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error / Success */}
            {error && (
              <div className="text-xs p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 text-xs p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                {success}
              </div>
            )}

            {/* Submit button */}
            {isOtpMode ? (
              otpStep === 'send' ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'var(--accent-amber)', color: '#000' }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  Send OTP to Email
                </button>
              ) : (
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpToken.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'var(--accent-amber)', color: '#000' }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  Verify OTP & Login
                </button>
              )
            ) : (
              <button
                onClick={handleAuth}
                disabled={loading || !canSubmit}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'var(--accent-amber)', color: '#000' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {mode === 'login' ? t('auth.login') : t('auth.signup')}
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('auth.orContinueWith')}</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--accent-amber)' }}>← Back to Dashboard</Link>
        </p>
      </motion.div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams() requires it
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 size={32} className="animate-spin text-amber-400" />
      </div>
    }>
      <AuthPageInner />
    </Suspense>
  );
}
