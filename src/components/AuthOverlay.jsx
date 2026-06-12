import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { auth as authApi } from '../services/api';

/* ─── Small shared UI pieces ─────────────────────────── */
const ProgressDots = ({ total, current }) => (
  <div className="flex items-center gap-1.5 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div key={i}
        animate={{ width: i === current ? 20 : 6, background: i < current ? '#818CF8' : i === current ? '#4F46E5' : '#E4E4E0' }}
        transition={{ duration: 0.25 }} className="h-1.5 rounded-full" />
    ))}
  </div>
);
const StepLabel = ({ children }) => <div className="text-[11px] font-bold tracking-wider uppercase text-primary mb-2">{children}</div>;
const AuthTitle = ({ children }) => <h2 className="font-display font-bold text-[24px] md:text-[28px] text-[#111110] tracking-tight leading-tight mb-2">{children}</h2>;
const AuthSub   = ({ children }) => <p className="text-[14px] text-[#8A8A85] leading-relaxed mb-6">{children}</p>;
const BackBtn   = ({ onClick })  => (
  <button onClick={onClick} className="flex items-center gap-1.5 text-[13px] font-medium text-[#8A8A85] mb-6 hover:text-[#111110] transition-colors">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
    Back
  </button>
);
const AuthCta = ({ onClick, children, loading, green, disabled }) => (
  <motion.button type="button" whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.98 }}
    onClick={onClick} disabled={loading || disabled}
    className={`w-full py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 font-body text-[15px] font-bold text-white mb-4 transition-all duration-150 disabled:opacity-55 ${green ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-primary hover:bg-primary-dark hover:shadow-indigo'}`}>
    {loading
      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      : children}
  </motion.button>
);
const Divider = ({ text }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-[#E4E4E0]"/>
    <span className="text-[12px] text-[#AEAEAD] whitespace-nowrap">{text}</span>
    <div className="flex-1 h-px bg-[#E4E4E0]"/>
  </div>
);

const inputCls = `w-full px-4 py-3 border-[1.5px] border-[#CBCBC6] rounded-lg font-body text-[15px] text-[#111110] bg-white placeholder:text-[#AEAEAD] focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.10)] transition-all duration-150 outline-none`;
// Applied on top of inputCls when a field has a validation error.
const inputErrCls = `border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]`;

/* Small inline error message shown directly below a field. */
const FieldError = ({ children }) =>
  children ? (
    <p className="flex items-center gap-1 text-[12px] text-red-500 mt-1.5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 flex-shrink-0">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {children}
    </p>
  ) : null;

const INTERESTS = [
  '💻 Hackathons','🎭 Cultural Fests','🛠️ Workshops','🏆 Competitions',
  '🎙️ Tech Talks','⚽ Sports','🎨 Design','🧠 AI / ML','🚀 Startups','📸 Photography',
];

const LeftPanel = () => (
  <div className="hidden md:flex flex-col justify-between w-[400px] flex-shrink-0 bg-primary px-10 py-10 relative overflow-hidden">
    <div className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.06] -top-20 -right-20 pointer-events-none"/>
    <div className="absolute w-[300px] h-[300px] rounded-full bg-white/[0.06] -bottom-16 -left-16 pointer-events-none"/>
    <div className="flex items-center gap-2.5 relative z-10 font-display font-bold text-[22px] text-white tracking-[-0.4px]">
      <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center text-[18px]">🪺</div>
      FestNest
    </div>
    <div className="relative z-10">
      <h2 className="font-display font-bold text-[30px] text-white leading-[1.18] tracking-[-0.035em] mb-4">
        Every college event,<br/><em className="text-white/65 not-italic">in one place.</em>
      </h2>
      <p className="text-[15px] text-white/70 leading-relaxed mb-8">Stop missing hackathons, fests, and workshops. FestNest brings it all together.</p>
      <div className="flex gap-6">
        {[['230+','Events'],['48k+','Students'],['180+','Colleges']].map(([n,l]) => (
          <div key={l} className="text-center">
            <div className="font-display font-bold text-[22px] text-white mb-0.5">{n}</div>
            <div className="text-[12px] text-white/60">{l}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="text-[12px] text-white/45 relative z-10">© 2025 FestNest · Made in India 🇮🇳</div>
  </div>
);

export default function AuthOverlay() {
  const navigate = useNavigate();
  const { showToast, login, authRequired, setAuthRequired } = useApp();

  const [visible,   setVisible]   = useState(false);
  const [step,      setStep]      = useState(1);
  const [loading,   setLoading]   = useState(false);

  /* ── Controlled form state (no ref-stale bugs) ── */
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw,    setLoginPw]    = useState('');

  /* ── Inline field-level errors (keyed by field name) ── */
  const [fieldErrors, setFieldErrors] = useState({});
  const clearFieldError = (k) => setFieldErrors(prev => (prev[k] ? { ...prev, [k]: '' } : prev));

  /* ── "Email already registered" error shown inline on the signup step (step 3) ── */
  const [emailError, setEmailError] = useState('');

  /* ── OTP ── */
  const [otpDigits, setOtpDigits]   = useState(['','','','','','']);
  const [otpTimer,  setOtpTimer]    = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [otpError,  setOtpError]    = useState('');
  const otpRefs = useRef([]);

  /* ── Password reset flow ── */
  const [resetEmail,       setResetEmail]       = useState('');
  const [resetOtpDigits,   setResetOtpDigits]   = useState(['','','','','','']);
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [resetPwVisible,   setResetPwVisible]   = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);
  const [resetTimer,       setResetTimer]       = useState(120);
  const [resetTimerActive, setResetTimerActive] = useState(false);
  const [resetPwStrength,  setResetPwStrength]  = useState(0);
  const resetOtpRefs = useRef([]);

  /* ── Registration extra ── */
  const [role,      setRole]      = useState('student');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [redirectCount, setRedirectCount] = useState(4);

  /* ── Show overlay when authRequired fires ── */
  useEffect(() => {
    if (authRequired) {
      setVisible(true);
      setStep(1);
      document.body.style.overflow = 'hidden';
    }
  }, [authRequired]);

  /* ── OTP timer ── */
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => {
      setOtpTimer(t => { if (t <= 1) { clearInterval(id); setTimerActive(false); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  /* ── Reset-OTP timer ── */
  useEffect(() => {
    if (!resetTimerActive) return;
    const id = setInterval(() => {
      setResetTimer(t => { if (t <= 1) { clearInterval(id); setResetTimerActive(false); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [resetTimerActive]);

  /* ── Auto-redirect after success ── */
  useEffect(() => {
    if (step !== 6) return;
    setRedirectCount(4);
    const id = setInterval(() => {
      setRedirectCount(c => { if (c <= 1) { clearInterval(id); authDone(); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setAuthRequired(false);
    document.body.style.overflow = '';
  }, [setAuthRequired]);

  const authDone = useCallback(() => {
    setVisible(false);
    setAuthRequired(false);
    document.body.style.overflow = '';
    showToast('Welcome to FestNest! 🎉', 'success');
    navigate(role === 'organizer' ? '/organizer' : '/');
  }, [role, navigate, showToast, setAuthRequired]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && visible) dismiss(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, dismiss]);

  const goTo = (s) => setStep(s);

  const checkPw = (v) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    setPwStrength(score);
  };

  /* ─── STEP 3: Validate form → call sendOtp → go to OTP step ─── */
  const handleSignup = async () => {
    const trimName  = name.trim();
    const trimEmail = email.trim();

    const errs = {};
    if (!trimName) errs.name = 'Please enter your name';
    if (!trimEmail) errs.email = 'Please enter your email address';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) errs.email = 'Please enter a valid email address';
    if (!password) errs.password = 'Please create a password';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!tosAgreed) errs.tos = 'Please agree to the Terms of Service to continue';

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return showToast('Please fix the highlighted fields', 'error');
    }
    setFieldErrors({});
    setEmailError('');

    setLoading(true);
    try {
      const r = await authApi.sendOtp(trimEmail, 'verify_email');
      // Dev mode: backend returns OTP — auto-fill digits
      if (r.data?.otp) {
        const digits = String(r.data.otp).split('').slice(0, 6);
        setOtpDigits([...digits, ...Array(6 - digits.length).fill('')]);
        showToast(`Dev OTP: ${r.data.otp} (auto-filled)`, 'info');
      }
      goTo(4);
      setTimeout(() => { setOtpTimer(120); setTimerActive(true); otpRefs.current[0]?.focus(); }, 350);
    } catch (e) {
      // Email already registered — surface it inline on the email field and offer
      // log-in / reset shortcuts, instead of sending an OTP to a dead end.
      const isDuplicate = e.status === 409 || e.message?.toLowerCase().includes('already');
      if (isDuplicate) {
        setEmailError('An account with this email already exists.');
      } else {
        showToast(e.message || 'Failed to send OTP — please try again', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── STEP 4: Verify OTP → register ─── */
  const verifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6 || otpDigits.some(d => d === ''))
      return showToast('Please enter all 6 digits', 'error');

    setLoading(true);
    try {
      const r = await authApi.register({
        name:     name.trim(),
        email:    email.trim(),
        otp:      code,
        password: password,
        college:  '',
        city:     '',
        role:     role,
      });
      login(r.data.user);
      goTo(5);  // profile setup
    } catch (e) {
      setOtpDigits(['','','','','','']);  // clear boxes on any error so the user can retry
      const msg = e.message || 'Something went wrong — please try again';
      const isDuplicate = e.status === 409 || msg.toLowerCase().includes('already');
      if (isDuplicate) {
        // Shouldn't normally reach here (we check before sending the OTP), but if a
        // 409 still slips through, send the user back to step 3 where the inline
        // "email exists" error and its log-in / reset shortcuts are shown.
        showToast('This email is already registered.', 'error');
        setEmailError('An account with this email already exists.');
        goTo(3);
      } else {
        setOtpError(msg);
        showToast(msg || 'Invalid OTP — please try again', 'error');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Login ─── */
  const handleLogin = async () => {
    const trimEmail = loginEmail.trim();
    const errs = {};
    if (!trimEmail) errs.loginEmail = 'Please enter your email';
    if (!loginPw)   errs.loginPw = 'Please enter your password';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return showToast('Please fix the highlighted fields', 'error');
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const r = await authApi.login(trimEmail, loginPw);
      login(r.data.user);
      setName(r.data.user.name || '');
      if (r.data.user.role === 'organizer') setRole('organizer');
      goTo(6);
    } catch (e) {
      // A 401 (or any stray "session expired" message that slipped through) on a
      // login attempt means wrong credentials — never a real session expiry.
      const isCredentialError =
        e.status === 401 ||
        e.message?.toLowerCase().includes('session') ||
        e.message?.toLowerCase().includes('expired');
      if (isCredentialError) {
        const msg = 'Incorrect email or password.';
        setFieldErrors({ loginEmail: ' ', loginPw: msg }); // highlight both fields inline
        showToast(msg, 'error');
      } else {
        showToast(e.message || 'Login failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Resend OTP ─── */
  const resendOtp = async () => {
    setLoading(true);
    setOtpError('');
    try {
      const r = await authApi.sendOtp(email.trim(), 'verify_email');
      if (r.data?.otp) {
        const digits = String(r.data.otp).split('').slice(0, 6);
        setOtpDigits([...digits, ...Array(6 - digits.length).fill('')]);
        showToast(`Dev OTP: ${r.data.otp} (auto-filled)`, 'info');
      } else {
        setOtpDigits(['','','','','','']);
        showToast('New OTP sent ✓ — use the latest email', 'success');
      }
      setOtpTimer(120);
      setTimerActive(true);
    } catch (e) {
      showToast(e.message || 'Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...otpDigits];
    next[i]     = digit;
    setOtpDigits(next);
    if (digit) setOtpError('');
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      const next = [...otpDigits];
      next[i - 1] = '';
      setOtpDigits(next);
      otpRefs.current[i - 1]?.focus();
    }
    if (e.key === 'Enter') verifyOtp();
  };

  /* OTP paste handler */
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    setOtpDigits([...digits, ...Array(6 - digits.length).fill('')]);
    if (digits.length === 6) setTimeout(() => otpRefs.current[5]?.focus(), 50);
  };

  /* ─── Password reset: OTP box handlers ─── */
  const handleResetOtpInput = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...resetOtpDigits];
    next[i]     = digit;
    setResetOtpDigits(next);
    if (digit && i < 5) resetOtpRefs.current[i + 1]?.focus();
  };
  const handleResetOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !resetOtpDigits[i] && i > 0) {
      const next = [...resetOtpDigits];
      next[i - 1] = '';
      setResetOtpDigits(next);
      resetOtpRefs.current[i - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerifyResetOtp();
  };
  const handleResetOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    setResetOtpDigits([...digits, ...Array(6 - digits.length).fill('')]);
    if (digits.length === 6) setTimeout(() => resetOtpRefs.current[5]?.focus(), 50);
  };

  const checkResetPw = (v) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    setResetPwStrength(score);
  };

  /* ─── FORGOT: request a reset code ─── */
  const handleForgotPassword = async () => {
    const trimEmail = resetEmail.trim();
    if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail))
      return showToast('Please enter a valid email address', 'error');

    setLoading(true);
    try {
      const r = await authApi.forgotPassword(trimEmail);
      // Dev mode: backend returns the OTP — auto-fill it
      if (r.data?.otp) {
        const digits = String(r.data.otp).split('').slice(0, 6);
        setResetOtpDigits([...digits, ...Array(6 - digits.length).fill('')]);
        showToast(`Dev OTP: ${r.data.otp} (auto-filled)`, 'info');
      }
      goTo('reset-otp');
      setResetTimer(120);
      setResetTimerActive(true);
      setTimeout(() => resetOtpRefs.current[0]?.focus(), 350);
    } catch (e) {
      showToast(e.message || 'Failed to send code', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ─── RESET-OTP: confirm all 6 digits, advance to new-password step ─── */
  const handleVerifyResetOtp = () => {
    if (resetOtpDigits.some(d => d === ''))
      return showToast('Please enter all 6 digits', 'error');
    goTo('reset-pw');
  };

  /* ─── RESET-OTP: resend the code ─── */
  const handleResendResetOtp = async () => {
    setLoading(true);
    try {
      const r = await authApi.forgotPassword(resetEmail.trim());
      if (r.data?.otp) {
        const digits = String(r.data.otp).split('').slice(0, 6);
        setResetOtpDigits([...digits, ...Array(6 - digits.length).fill('')]);
        showToast(`Dev OTP: ${r.data.otp} (auto-filled)`, 'info');
      } else {
        setResetOtpDigits(['','','','','','']);
        showToast('Code resent', 'success');
      }
      setResetTimer(120);
      setResetTimerActive(true);
    } catch (e) {
      showToast(e.message || 'Failed to resend code', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ─── RESET-PW: submit the new password ─── */
  const handleResetPassword = async () => {
    if (newPassword.length < 8)
      return showToast('Password must be at least 8 characters', 'error');
    if (newPassword !== confirmPassword)
      return showToast('Passwords do not match', 'error');

    setLoading(true);
    try {
      await authApi.resetPassword(resetEmail.trim(), resetOtpDigits.join(''), newPassword);
      goTo('reset-done');
    } catch (e) {
      const msg = e.message || 'Reset failed. Please try again.';
      showToast(msg, 'error');
      // If the code was rejected, send the user back to re-enter a fresh one
      if (/otp|code|expired/i.test(msg)) {
        setResetOtpDigits(['','','','','','']);
        goTo('reset-otp');
      }
    } finally {
      setLoading(false);
    }
  };

  const pwLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const pwColor = ['', 'bg-red', 'bg-amber', 'bg-amber', 'bg-[#16A34A]'][pwStrength];
  const resetPwLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][resetPwStrength];
  const resetPwColor = ['', 'bg-red', 'bg-amber', 'bg-amber', 'bg-[#16A34A]'][resetPwStrength];
  const fmtTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!visible) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex bg-white md:bg-[#F1F0ED]"
      role="dialog" aria-modal="true" aria-label="Sign in to FestNest">

      <LeftPanel />

      <div className="relative flex-1 flex flex-col overflow-y-auto bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Close */}
        <button onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#F1F0ED] flex items-center justify-center text-[#8A8A85] hover:bg-[#E4E4E0] hover:text-[#111110] transition-all"
          aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        <div className="flex-1 flex items-center justify-center px-5 py-8 md:px-12">
          <div className="w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2 font-display font-bold text-[18px] text-primary tracking-[-0.025em] mb-8">
              <div className="w-7 h-7 bg-primary rounded-[8px] flex items-center justify-center text-white text-sm">🪺</div>
              FestNest
            </div>

            <AnimatePresence mode="wait">

              {/* ─── STEP 1: Entry ─── */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <StepLabel>Welcome</StepLabel>
                  <AuthTitle>Discover events that matter</AuthTitle>
                  <AuthSub>Join 48,000+ students on FestNest — free forever.</AuthSub>
                  <AuthCta onClick={() => goTo(2)}>
                    Create Account — It's Free
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg>
                  </AuthCta>
                  <Divider text="Already have an account?" />
                  <AuthCta onClick={() => goTo('login')}>Log In</AuthCta>
                  <p className="text-center text-[13px] text-[#8A8A85]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[#F1F0ED] text-[11px] font-mono">Esc</kbd> to browse without signing in
                  </p>
                </motion.div>
              )}

              {/* ─── LOGIN ─── */}
              {step === 'login' && (
                <motion.div key="login" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <BackBtn onClick={() => goTo(1)} />
                  <StepLabel>Welcome back</StepLabel>
                  <AuthTitle>Log in to FestNest</AuthTitle>
                  <AuthSub>Continue discovering events across India.</AuthSub>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Email Address</label>
                    <input type="email" value={loginEmail}
                      onChange={e => { setLoginEmail(e.target.value); clearFieldError('loginEmail'); }}
                      placeholder="arjun@nsit.ac.in" autoComplete="email"
                      className={`${inputCls} ${fieldErrors.loginEmail ? inputErrCls : ''}`}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                    <FieldError>{fieldErrors.loginEmail?.trim()}</FieldError>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Password</label>
                    <input type="password" value={loginPw}
                      onChange={e => { setLoginPw(e.target.value); clearFieldError('loginPw'); clearFieldError('loginEmail'); }}
                      placeholder="Your password" autoComplete="current-password"
                      className={`${inputCls} ${fieldErrors.loginPw ? inputErrCls : ''}`}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                    <FieldError>{fieldErrors.loginPw?.trim()}</FieldError>
                  </div>

                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => { setResetEmail(loginEmail); setFieldErrors({}); goTo('forgot'); }}
                      className="text-[13px] font-medium text-primary hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <AuthCta onClick={handleLogin} loading={loading}>
                    {!loading && <>Log In <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg></>}
                  </AuthCta>
                  <p className="text-center text-[14px] text-[#8A8A85]">
                    No account?{' '}
                    <button className="text-primary font-semibold hover:underline" onClick={() => goTo(2)}>Sign up free</button>
                  </p>
                </motion.div>
              )}

              {/* ─── STEP 2: Role ─── */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <BackBtn onClick={() => goTo(1)} />
                  <ProgressDots total={4} current={0} />
                  <StepLabel>Step 1 of 4</StepLabel>
                  <AuthTitle>Who are you?</AuthTitle>
                  <AuthSub>Personalise your FestNest experience from day one.</AuthSub>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { r:'student',   em:'👤', title:'Student',   sub:'Discover & register for events across India' },
                      { r:'organizer', em:'🏫', title:'Organizer', sub:"Host and manage your college's events" },
                    ].map(({ r, em, title, sub }) => (
                      <motion.button key={r} whileHover={{ y:-2 }} whileTap={{ scale:0.97 }}
                        onClick={() => setRole(r)}
                        className={`border-2 rounded-lg p-4 text-center transition-all duration-150 ${role===r ? 'border-primary bg-primary-light shadow-[0_0_0_3px_rgba(79,70,229,0.12)]' : 'border-[#E4E4E0] bg-white hover:border-primary-mid'}`}>
                        <div className="text-[32px] mb-2">{em}</div>
                        <div className={`font-display font-bold text-[14px] mb-1 ${role===r?'text-primary':'text-[#111110]'}`}>{title}</div>
                        <div className="text-[11px] text-[#8A8A85] leading-relaxed">{sub}</div>
                      </motion.button>
                    ))}
                  </div>
                  <AuthCta onClick={() => goTo(3)}>
                    Continue
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg>
                  </AuthCta>
                </motion.div>
              )}

              {/* ─── STEP 3: Signup form ─── */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <BackBtn onClick={() => goTo(2)} />
                  <ProgressDots total={4} current={1} />
                  <StepLabel>Step 2 of 4</StepLabel>
                  <AuthTitle>Create your account</AuthTitle>
                  <AuthSub>Enter your details — we'll send a verification code to your email.</AuthSub>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Full Name</label>
                    <input type="text" value={name}
                      onChange={e => { setName(e.target.value); clearFieldError('name'); }}
                      placeholder="Arjun Kumar" autoComplete="name"
                      className={`${inputCls} ${fieldErrors.name ? inputErrCls : ''}`}
                      onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-email')?.focus()} />
                    <FieldError>{fieldErrors.name}</FieldError>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Email Address</label>
                    <input id="reg-email" type="email" value={email}
                      onChange={e => { setEmail(e.target.value); clearFieldError('email'); setEmailError(''); }}
                      placeholder="arjun@nsit.ac.in" autoComplete="email"
                      className={`${inputCls} ${(fieldErrors.email || emailError) ? inputErrCls : ''}`}
                      onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-pw')?.focus()} />
                    <FieldError>{fieldErrors.email}</FieldError>
                    {emailError && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-[13px] font-semibold text-red-600 mb-2">⚠️ {emailError}</p>
                        <button type="button"
                          onClick={() => { setEmailError(''); setLoginEmail(email.trim()); goTo('login'); }}
                          className="w-full py-2 bg-primary text-white text-[12px] font-bold rounded-lg">
                          Log in instead
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Password</label>
                    <div className="relative">
                      <input id="reg-pw" type={pwVisible ? 'text' : 'password'} value={password}
                        onChange={e => { setPassword(e.target.value); checkPw(e.target.value); clearFieldError('password'); }}
                        placeholder="Min 8 characters" autoComplete="new-password"
                        className={`${inputCls} pr-11 ${fieldErrors.password ? inputErrCls : ''}`}
                        onKeyDown={e => e.key === 'Enter' && handleSignup()} />
                      <button type="button" onClick={() => setPwVisible(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AEAEAD] hover:text-[#8A8A85]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    {pwStrength > 0 && (
                      <>
                        <div className="flex gap-1 mt-2">
                          {[1,2,3,4].map(i => <div key={i} className={`flex-1 h-[3px] rounded-sm transition-all duration-300 ${i<=pwStrength ? pwColor : 'bg-[#E4E4E0]'}`}/>)}
                        </div>
                        <p className={`text-[12px] mt-1 ${pwStrength>=4?'text-[#16A34A]':pwStrength>=2?'text-[#B45309]':'text-[#DC2626]'}`}>
                          {pwLabel} password
                        </p>
                      </>
                    )}
                    <FieldError>{fieldErrors.password}</FieldError>
                  </div>

                  {/* ToS */}
                  <div className="mb-5">
                    <div className="flex items-start gap-2.5 cursor-pointer" onClick={() => { setTosAgreed(v => !v); clearFieldError('tos'); }}>
                      <div className={`w-[18px] h-[18px] flex-shrink-0 mt-0.5 border-2 rounded flex items-center justify-center transition-all ${tosAgreed ? 'bg-primary border-primary' : fieldErrors.tos ? 'border-red-500' : 'border-[#CBCBC6]'}`}>
                        {tosAgreed && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className="text-[13px] text-[#4B4B47] leading-relaxed select-none">
                        I agree to FestNest's <span className="text-primary font-medium">Terms of Service</span> and <span className="text-primary font-medium">Privacy Policy</span>
                      </span>
                    </div>
                    <FieldError>{fieldErrors.tos}</FieldError>
                  </div>

                  <AuthCta onClick={handleSignup} loading={loading}>
                    {!loading && <>Send Verification Code <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg></>}
                  </AuthCta>
                  <p className="text-center text-[14px] text-[#8A8A85]">
                    Already have an account?{' '}
                    <button className="text-primary font-semibold hover:underline" onClick={() => goTo('login')}>Log in</button>
                  </p>
                </motion.div>
              )}

              {/* ─── STEP 4: OTP ─── */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <BackBtn onClick={() => goTo(3)} />
                  <ProgressDots total={4} current={2} />
                  <StepLabel>Step 3 of 4</StepLabel>
                  <AuthTitle>Check your email</AuthTitle>
                  <p className="text-[14px] text-[#8A8A85] leading-relaxed mb-2">
                    We sent a 6-digit code to <strong className="text-[#111110]">{email.trim()}</strong>
                  </p>
                  {/* OTP boxes */}
                  <div className="flex gap-2 justify-center mb-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((d, i) => (
                      <input key={i}
                        ref={el => otpRefs.current[i] = el}
                        className={`otp-box ${d ? 'filled' : ''} ${otpError ? 'border-red-400' : ''}`}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleOtpInput(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        aria-label={`OTP digit ${i + 1}`} />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-center text-[13px] text-red-500 mb-3">{otpError}</p>
                  )}

                  <p className="text-center text-[13px] text-[#8A8A85] mb-5">
                    {timerActive
                      ? <span>Resend in <span className="font-medium text-[#4B4B47]">{fmtTimer(otpTimer)}</span></span>
                      : <button className="text-primary font-semibold hover:underline" onClick={resendOtp}>Resend code</button>}
                  </p>

                  <AuthCta onClick={verifyOtp} loading={loading}>
                    {!loading && <>Verify & Create Account <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg></>}
                  </AuthCta>
                </motion.div>
              )}

              {/* ─── STEP 5: Profile setup ─── */}
              {step === 5 && (
                <motion.div key="s5" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <ProgressDots total={4} current={3} />
                  <StepLabel>Step 4 of 4 — Optional</StepLabel>
                  <AuthTitle>Almost done!</AuthTitle>
                  <AuthSub>Tell us a bit more so we can personalise your feed. You can skip this.</AuthSub>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Your College</label>
                    <input type="text" placeholder="e.g. NSIT Delhi, IIT Bombay…" className={inputCls} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(interest => (
                        <button key={interest} onClick={() => setSelectedInterests(prev => {
                          const next = new Set(prev);
                          next.has(interest) ? next.delete(interest) : next.add(interest);
                          return next;
                        })}
                          className={`px-3.5 py-1.5 rounded-full border text-[13px] font-medium transition-all ${selectedInterests.has(interest) ? 'bg-primary-light border-primary text-primary' : 'bg-white border-[#E4E4E0] text-[#4B4B47] hover:border-primary'}`}>
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AuthCta onClick={() => goTo(6)}>
                    Finish Setup
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg>
                  </AuthCta>
                  <p className="text-center">
                    <button onClick={() => goTo(6)} className="text-[13px] text-[#8A8A85] hover:text-[#4B4B47]">Skip for now →</button>
                  </p>
                </motion.div>
              )}

              {/* ─── STEP 6: Success ─── */}
              {step === 6 && (
                <motion.div key="s6" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.25 }} className="text-center py-4">
                  <motion.div initial={{ scale:0.4, opacity:0 }} animate={{ scale:1, opacity:1 }}
                    transition={{ type:'spring', stiffness:300, damping:20 }}
                    className="w-20 h-20 rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center mx-auto mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9"><polyline points="20 6 9 17 4 12"/></svg>
                  </motion.div>
                  <StepLabel>You're in!</StepLabel>
                  <h2 className="font-display font-bold text-[24px] text-[#111110] tracking-tight mb-2">
                    Welcome, {name.split(' ')[0] || 'there'}! 🎉
                  </h2>
                  <p className="text-[14px] text-[#8A8A85] leading-relaxed mb-7 max-w-[300px] mx-auto">
                    {role === 'organizer'
                      ? 'Your organizer account is ready. Post your first event and reach 48,000+ students!'
                      : 'Your account is ready. Start discovering hackathons, fests, and more!'}
                  </p>
                  <AuthCta onClick={authDone}>
                    {role === 'organizer' ? 'Go to Organizer Dashboard' : 'Explore Events'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg>
                  </AuthCta>
                  <p className="text-[13px] text-[#AEAEAD]">Redirecting in {redirectCount}s…</p>
                </motion.div>
              )}

              {/* ─── FORGOT PASSWORD: enter email ─── */}
              {step === 'forgot' && (
                <motion.div key="forgot" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <BackBtn onClick={() => goTo('login')} />
                  <StepLabel>Password Reset</StepLabel>
                  <AuthTitle>Forgot your password?</AuthTitle>
                  <AuthSub>Enter your registered email and we'll send you a 6-digit reset code.</AuthSub>

                  <div className="mb-5">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Email Address</label>
                    <input type="email" value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="arjun@nsit.ac.in" autoComplete="email"
                      className={inputCls}
                      onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} />
                  </div>

                  <AuthCta onClick={handleForgotPassword} loading={loading}>
                    {!loading && <>Send Reset Code <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg></>}
                  </AuthCta>
                  <p className="text-center text-[14px] text-[#8A8A85]">
                    Remembered it?{' '}
                    <button className="text-primary font-semibold hover:underline" onClick={() => goTo('login')}>Back to login</button>
                  </p>
                </motion.div>
              )}

              {/* ─── RESET: enter OTP ─── */}
              {step === 'reset-otp' && (
                <motion.div key="reset-otp" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <BackBtn onClick={() => goTo('forgot')} />
                  <StepLabel>Password Reset — Step 2</StepLabel>
                  <AuthTitle>Check your email</AuthTitle>
                  <p className="text-[14px] text-[#8A8A85] leading-relaxed mb-5">
                    We sent a 6-digit code to <strong className="text-[#111110]">{resetEmail.trim()}</strong>
                  </p>

                  <div className="flex gap-2 justify-center mb-4" onPaste={handleResetOtpPaste}>
                    {resetOtpDigits.map((d, i) => (
                      <input key={i}
                        ref={el => resetOtpRefs.current[i] = el}
                        className={`otp-box ${d ? 'filled' : ''}`}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleResetOtpInput(i, e.target.value)}
                        onKeyDown={e => handleResetOtpKey(i, e)}
                        aria-label={`Reset code digit ${i + 1}`} />
                    ))}
                  </div>

                  <p className="text-center text-[13px] text-[#8A8A85] mb-5">
                    {resetTimerActive
                      ? <span>Resend in <span className="font-medium text-[#4B4B47]">{fmtTimer(resetTimer)}</span></span>
                      : <button className="text-primary font-semibold hover:underline" onClick={handleResendResetOtp}>Resend code</button>}
                  </p>

                  <AuthCta onClick={handleVerifyResetOtp} loading={loading}>
                    {!loading && <>Verify Code <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg></>}
                  </AuthCta>
                </motion.div>
              )}

              {/* ─── RESET: new password ─── */}
              {step === 'reset-pw' && (
                <motion.div key="reset-pw" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
                  <BackBtn onClick={() => goTo('reset-otp')} />
                  <StepLabel>Password Reset — Step 3</StepLabel>
                  <AuthTitle>Create new password</AuthTitle>
                  <AuthSub>Must be at least 8 characters.</AuthSub>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={resetPwVisible ? 'text' : 'password'} value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); checkResetPw(e.target.value); }}
                        placeholder="Min 8 characters" autoComplete="new-password"
                        className={`${inputCls} pr-11`}
                        onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
                      <button type="button" onClick={() => setResetPwVisible(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AEAEAD] hover:text-[#8A8A85]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    {resetPwStrength > 0 && (
                      <>
                        <div className="flex gap-1 mt-2">
                          {[1,2,3,4].map(i => <div key={i} className={`flex-1 h-[3px] rounded-sm transition-all duration-300 ${i<=resetPwStrength ? resetPwColor : 'bg-[#E4E4E0]'}`}/>)}
                        </div>
                        <p className={`text-[12px] mt-1 ${resetPwStrength>=4?'text-[#16A34A]':resetPwStrength>=2?'text-[#B45309]':'text-[#DC2626]'}`}>
                          {resetPwLabel} password
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mb-5">
                    <label className="block text-[13px] font-semibold text-[#111110] mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input type={confirmPwVisible ? 'text' : 'password'} value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password" autoComplete="new-password"
                        className={`${inputCls} pr-11 ${confirmPassword && newPassword !== confirmPassword ? inputErrCls : ''}`}
                        onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
                      <button type="button" onClick={() => setConfirmPwVisible(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AEAEAD] hover:text-[#8A8A85]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <FieldError>Passwords do not match</FieldError>
                    )}
                  </div>

                  <AuthCta onClick={handleResetPassword} loading={loading}>
                    {!loading && <>Reset Password <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg></>}
                  </AuthCta>
                </motion.div>
              )}

              {/* ─── RESET: success ─── */}
              {step === 'reset-done' && (
                <motion.div key="reset-done" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.25 }} className="text-center py-4">
                  <motion.div initial={{ scale:0.4, opacity:0 }} animate={{ scale:1, opacity:1 }}
                    transition={{ type:'spring', stiffness:300, damping:20 }}
                    className="w-20 h-20 rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center mx-auto mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9"><polyline points="20 6 9 17 4 12"/></svg>
                  </motion.div>
                  <StepLabel>All done!</StepLabel>
                  <h2 className="font-display font-bold text-[24px] text-[#111110] tracking-tight mb-2">
                    Password reset successfully!
                  </h2>
                  <p className="text-[14px] text-[#8A8A85] leading-relaxed mb-7 max-w-[300px] mx-auto">
                    You can now log in with your new password.
                  </p>
                  <AuthCta green onClick={() => {
                    setResetEmail(''); setResetOtpDigits(['','','','','','']);
                    setNewPassword(''); setConfirmPassword('');
                    setResetPwStrength(0); setResetTimerActive(false);
                    goTo('login');
                  }}>
                    Go to Login
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg>
                  </AuthCta>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
