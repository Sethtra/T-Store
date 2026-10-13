import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getApiErrorMessage } from "../../lib/errors";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await api.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Something went wrong. Please try again.", ["email"]));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-start justify-center px-4 pt-10 pb-16 md:pt-16">
      <div className="w-full max-w-[400px] rise-in">
        <h1 className="text-[2rem] font-semibold tracking-[-0.03em]">Forgot your password?</h1>
        <p className="mt-1.5 text-[var(--color-text-secondary)]">Enter your email and we'll send you a reset link.</p>
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] px-3.5 py-3 text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            {message && (
              <div role="status" className="rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] px-3.5 py-3 text-sm text-[var(--color-success)]">
                {message}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="h-12">
              Send reset link
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm font-medium underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
