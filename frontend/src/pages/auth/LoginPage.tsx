import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTranslation } from "react-i18next";

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
    <div className="min-h-screen flex items-center justify-center py-12 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold">{t("auth.welcome_back")}</h1>
            <p className="text-[var(--color-text-muted)] mt-2">
              {t("auth.sign_in_to_account")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-lg text-[var(--color-error)] text-sm">
                {error}
              </div>
            )}

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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text-muted)]">
                  {t("auth.remember_me")}
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              {t("auth.sign_in")}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
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
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-medium transition-[background-color,border-color,box-shadow] duration-200 hover:bg-[var(--color-bg-surface)] hover:shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("auth.continue_with_google")}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
                {t("auth.dont_have_account")}
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link to="/register">
            <Button variant="outline" fullWidth>
              {t("auth.create_account")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
