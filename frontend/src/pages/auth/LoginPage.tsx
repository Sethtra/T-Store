import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTranslation } from "react-i18next";

const BackgroundElements = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.3, 0.15],
        rotate: [0, 90, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[var(--color-primary)] blur-[120px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.1, 0.2, 0.1],
        rotate: [0, -90, 0]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-500 blur-[120px]"
    />
  </div>
);

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, setUser, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  // Ref guard to prevent React double-firing the Google token handling
  const googleHandled = useRef(false);

  // Handle Google OAuth callback — direct token flow (no API call needed)
  useEffect(() => {
    const googleStatus = searchParams.get("google");

    if (googleStatus === "success") {
      // Guard: only run once even if React re-fires useEffect
      if (googleHandled.current) return;
      googleHandled.current = true;

      const token = searchParams.get("token");
      const userParam = searchParams.get("user");

      if (!token || !userParam) {
        setError(t("auth.error_google_missing", "Google login failed: missing credentials."));
        return;
      }

      try {
        // Decode user data from base64
        const userData = JSON.parse(atob(userParam));

        // Store the Sanctum token and set user state directly — zero API calls
        localStorage.setItem("auth_token", token);
        setUser(userData);

        // Navigate to the correct page based on role
        if (userData.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } catch {
        setError(t("auth.error_google_invalid", "Google login failed: invalid response."));
      }
    } else if (googleStatus === "error") {
      setError(searchParams.get("message") || t("auth.error_google_failed", "Google login failed."));
    }
  }, [searchParams, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password, rememberMe);
      // Get fresh user data to check role
      const user = useAuthStore.getState().user;
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error("Backend Error Details:", err?.response?.data || err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t("auth.error_invalid_credentials", "Invalid email or password");
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-base)] relative overflow-hidden">
      <BackgroundElements />

      {/* Left Panel - Branding/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 z-10">
        <div className="relative z-10 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-[var(--color-primary)]/40 transform rotate-[-10deg] hover:rotate-0 transition-transform duration-500">
              <span className="text-white font-extrabold text-5xl tracking-tighter">T</span>
            </div>
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-[var(--color-text-primary)]">
              {t("auth.welcome_back", "Welcome Back")}
            </h1>
            <p className="text-xl text-[var(--color-text-muted)] leading-relaxed mb-12">
              Discover premium products with our state-of-the-art e-commerce platform. Your next great find is just a sign-in away.
            </p>
            
            {/* Decorative cards */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-5 rounded-2xl bg-[var(--color-bg-elevated)]/50 backdrop-blur-md border border-[var(--color-border)]/50"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">Fast Checkout</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Lightning fast and secure process.</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-5 rounded-2xl bg-[var(--color-bg-elevated)]/50 backdrop-blur-md border border-[var(--color-border)]/50"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">Secure</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Enterprise-grade security.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-[var(--color-bg-elevated)]/70 backdrop-blur-2xl border border-[var(--color-border)]/60 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Form Highlight Effect */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30">
                  <span className="text-white font-bold text-2xl">T</span>
                </div>
              </Link>
              <h1 className="text-3xl font-bold">{t("auth.welcome_back")}</h1>
              <p className="text-[var(--color-text-muted)] mt-2">
                {t("auth.sign_in_to_account")}
              </p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold mb-2">{t("auth.sign_in", "Sign In")}</h2>
              <p className="text-[var(--color-text-muted)]">Please enter your credentials to continue.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-sm font-medium flex items-center gap-3"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <Input
                  label={t("auth.email")}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label={t("auth.password")}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded-md border-2 border-[var(--color-border)] bg-transparent text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0 focus:ring-2 transition-all peer"
                    />
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
                    {t("auth.remember_me")}
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[var(--color-primary)] hover:text-purple-500 transition-colors"
                >
                  {t("auth.forgot_password")}
                </Link>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                isLoading={isLoading}
                className="h-12 text-base font-semibold shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 transition-all rounded-xl mt-4"
              >
                {t("auth.sign_in")}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider rounded-full py-1 border border-[var(--color-border)]/60">
                  {t("auth.or_continue_with")}
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => {
                const backendUrl = import.meta.env.VITE_API_URL || '/api';
                window.location.href = `${backendUrl}/auth/google`;
              }}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border-2 border-[var(--color-border)]/60 bg-[var(--color-bg-surface)]/50 text-[var(--color-text-primary)] font-semibold transition-all duration-200 hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-border)] hover:shadow-md group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("auth.continue_with_google")}
            </button>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-[var(--color-text-muted)] text-sm">
                {t("auth.dont_have_account")}{" "}
                <Link to="/register" className="font-semibold text-[var(--color-primary)] hover:text-purple-500 transition-colors ml-1">
                  {t("auth.create_account")}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
