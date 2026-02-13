"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./auth-modal";

type ModalMode = null | "login" | "signup" | "check-email";

interface AuthModalContextValue {
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  openLogin: () => {},
  openSignup: () => {},
  close: () => {},
});

export function useLoginModal() {
  return useContext(AuthModalContext);
}

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ModalMode>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resetForm = useCallback(() => {
    setError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }, []);

  const openLogin = useCallback(() => { resetForm(); setMode("login"); }, [resetForm]);
  const openSignup = useCallback(() => { resetForm(); setMode("signup"); }, [resetForm]);
  const close = useCallback(() => { setMode(null); resetForm(); }, [resetForm]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    close();
    router.refresh();
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setMode("check-email");
  }

  async function handleGoogleSignup() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <AuthModalContext.Provider value={{ openLogin, openSignup, close }}>
      {children}

      {/* ===== LOGIN MODAL ===== */}
      {mode === "login" && (
        <AuthModal onClose={close}>
          <div className="w-full max-w-md p-8">
            <div className="mb-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Psy.Market" className="h-16 w-auto" />
            </div>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">
                Please enter your details to sign in to your account.
              </p>
            </div>
            <form onSubmit={handleEmailLogin} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none"
                  id="login-email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300" htmlFor="login-password">
                    Password
                  </label>
                  <a className="text-sm font-medium text-orange-500 hover:text-orange-400 transition" href="#">
                    Forgot password?
                  </a>
                </div>
                <input
                  className="w-full px-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none"
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded transition duration-200 text-lg uppercase tracking-wider hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={openSignup}
                className="text-orange-500 hover:text-orange-400 font-medium transition"
              >
                Sign up
              </button>
            </p>
          </div>
        </AuthModal>
      )}

      {/* ===== SIGNUP MODAL ===== */}
      {mode === "signup" && (
        <AuthModal onClose={close}>
          <div className="w-full max-w-md p-8">
            <div className="mb-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Psy.Market" className="h-16 w-auto" />
            </div>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">Join psy.market</h1>
              <p className="text-gray-400">
                Create your account and start exploring.
              </p>
            </div>
            <form onSubmit={handleEmailSignup} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-email">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none"
                  id="signup-email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-password">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none"
                  id="signup-password"
                  name="password"
                  placeholder="At least 6 characters"
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-confirm">
                  Confirm Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none"
                  id="signup-confirm"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  required
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded transition duration-200 text-lg uppercase tracking-wider hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white font-medium hover:bg-zinc-800 transition duration-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={openLogin}
                className="text-orange-500 hover:text-orange-400 font-medium transition"
              >
                Sign in
              </button>
            </p>
          </div>
        </AuthModal>
      )}

      {/* ===== CHECK EMAIL CONFIRMATION ===== */}
      {mode === "check-email" && (
        <AuthModal onClose={close}>
          <div className="w-full max-w-md p-8 text-center">
            <div className="mb-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Psy.Market" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
            <p className="text-gray-400 mb-6">
              We&apos;ve sent a confirmation link to{" "}
              <span className="text-white font-medium">{email}</span>.
              Click the link to activate your account.
            </p>
            <button
              type="button"
              onClick={openLogin}
              className="text-sm text-orange-500 hover:text-orange-400 font-medium transition"
            >
              Back to login
            </button>
          </div>
        </AuthModal>
      )}
    </AuthModalContext.Provider>
  );
}
