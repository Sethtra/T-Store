import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTranslation } from "react-i18next";
import type { User } from "../../types/user";

type GoogleExchangeResponse = {
  token: string;
  user: User;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as ApiError;
  return apiError.response?.data?.message || apiError.message || fallback;
};

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, setUser, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Where to go after signing in: ?redirect=/path (same-site paths only), else role home.
  const redirectParam = searchParams.get("redirect");
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : null;

  // Ref guard to prevent React double-firing the Google callback handling.
  const googleHandled = useRef(false);

  // Handle Google OAuth callback code exchange.
  useEffect(() => {
    const googleStatus = searchParams.get("google");

    if (googleStatus === "success") {
      // Guard: only run once even if React re-fires useEffect.
      if (googleHandled.current) return;
      googleHandled.current = true;

      const code = searchParams.get("code");

      if (!code) {
        setError(t("auth.error_google_missing", "Google login failed: missing credentials."));
        window.history.replaceState({}, document.title, "/login");
        return;
      }

      const exchangeGoogleCode = async () => {
        setIsGoogleLoading(true);
        setError("");

        try {
          const response = await api.post<GoogleExchangeResponse>("/auth/google/exchange", { code });
          const { token, user } = response.data;

          if (!token || !user) {
            setError(t("auth.error_google_invalid", "Google login failed: invalid response."));
            window.history.replaceState({}, document.title, "/login");
            return;
          }

          localStorage.setItem("auth_token", token);
          setUser(user);
          let stored: string | null = null;
          try {
            stored = sessionStorage.getItem("post_login_redirect");
            sessionStorage.removeItem("post_login_redirect");
          } catch {
            /* storage unavailable */
          }
          const back = stored && stored.startsWith("/") && !stored.startsWith("//") ? stored : null;
          navigate(back || (user.role === "admin" ? "/admin" : "/"), { replace: true });
        } catch (err) {
          setError(getErrorMessage(err, t("auth.error_google_invalid", "Google login failed: invalid response.")));
          window.history.replaceState({}, document.title, "/login");
        } finally {
          setIsGoogleLoading(false);
        }
      };

      void exchangeGoogleCode();
    } else if (googleStatus === "error") {
      setError(searchParams.get("message") || t("auth.error_google_failed", "Google login failed."));
      window.history.replaceState({}, document.title, "/login");
    }
  }, [navigate, searchParams, setUser, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password, rememberMe);
      // Get fresh user data to check role
      const user = useAuthStore.getState().user;
      navigate(safeRedirect || (user?.role === "admin" ? "/admin" : "/"), { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Backend Error Details:", apiError.response?.data || err);
      setError(getErrorMessage(err, t("auth.error_invalid_credentials", "Invalid email or password")));
    }
  };


  return (
    <div className="flex flex-1 items-start justify-center px-4 pt-10 pb-16 md:pt-16">
      <div className="w-full max-w-[400px] rise-in">
        <h1 className="text-[2rem] font-semibold tracking-[-0.03em]">{t("auth.welcome_back")}</h1>
        <p className="mt-1.5 text-[var(--color-text-secondary)]">{t("auth.sign_in_to_account")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate={false}>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] px-3.5 py-3 text-sm text-[var(--color-error)]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <Input
            label={t("auth.email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <Input
              label={t("auth.password")}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-3 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-[4px] accent-[var(--color-text-primary)]"
                />
                {t("auth.remember_me")}
              </label>
              <Link to="/forgot-password" className="text-sm font-medium underline underline-offset-4 hover:text-[var(--color-text-secondary)]">
                {t("auth.forgot_password")}
              </Link>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading || isGoogleLoading} className="h-12">
            {t("auth.sign_in")}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          {t("auth.or_continue_with")}
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <button
          type="button"
          disabled={isGoogleLoading}
          onClick={() => {
            try {
              if (safeRedirect) sessionStorage.setItem("post_login_redirect", safeRedirect);
            } catch {
              /* storage unavailable */
            }
            const backendUrl = import.meta.env.VITE_API_URL || "/api";
            window.location.href = `${backendUrl}/auth/google`;
          }}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-hover)] font-semibold transition-colors hover:border-[var(--color-text-primary)] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t("auth.continue_with_google")}
        </button>

        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          {t("auth.dont_have_account")}{" "}
          <Link
            to={safeRedirect ? `/register?redirect=${encodeURIComponent(safeRedirect)}` : "/register"}
            className="font-semibold text-[var(--color-text-primary)] underline underline-offset-4"
          >
            {t("auth.create_account")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
