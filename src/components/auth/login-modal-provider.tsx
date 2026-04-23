"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./auth-modal";

type ModalMode = null | "login" | "signup" | "check-email";

function getAuthModalModeFromUrl(): ModalMode {
  if (typeof window === "undefined") return null;
  const auth = new URLSearchParams(window.location.search).get("auth");
  if (auth === "login" || auth === "signup") {
    return auth;
  }
  return null;
}

function getAuthErrorFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const error = new URLSearchParams(window.location.search).get("error");
  if (error === "auth") {
    return "Authentication failed. Please try again.";
  }
  return null;
}

function getNextPathFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }
  return next;
}

function clearAuthQueryParams(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("auth");
  url.searchParams.delete("next");
  url.searchParams.delete("error");
  const query = url.searchParams.toString();
  const nextUrl = `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

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
  const router = useRouter();
  const [mode, setMode] = useState<ModalMode>(() => getAuthModalModeFromUrl());
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken" | "reserved_for_you">("idle");
  const [handleMessage, setHandleMessage] = useState("");
  const [error, setError] = useState<string | null>(() => getAuthErrorFromUrl());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(() => getNextPathFromUrl());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!handle || handle.length < 3) {
      setHandleStatus("idle");
      setHandleMessage("");
      return;
    }
    setHandleStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ handle, email });
        const res = await fetch(`/api/check-handle?${params}`);
        if (!res.ok) throw new Error("check failed");
        const data = await res.json();
        if (data.available) {
          setHandleStatus(data.reserved_for_you ? "reserved_for_you" : "available");
          setHandleMessage(data.reserved_for_you ? "Reserved for you!" : "");
        } else {
          setHandleStatus("taken");
          setHandleMessage(data.message ?? "Not available");
        }
      } catch (err) {
        console.error("handle check failed:", err);
        setHandleStatus("idle");
        setHandleMessage("");
      }
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, email]);

  const resetForm = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
    setHandle("");
    setHandleStatus("idle");
    setHandleMessage("");
    setLoading(false);
    setLoginSuccess(false);
    setSignupStep(1);
  }, []);

  const openLogin = useCallback(() => {
    resetForm();
    setReturnTo(getNextPathFromUrl());
    setMode("login");
  }, [resetForm]);
  const openSignup = useCallback(() => {
    resetForm();
    setReturnTo(getNextPathFromUrl());
    setMode("signup");
  }, [resetForm]);
  const close = useCallback(() => {
    setMode(null);
    setReturnTo(null);
    resetForm();
    clearAuthQueryParams();
  }, [resetForm]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const destination = returnTo ?? "/dashboard";
    setLoginSuccess(true);
    clearAuthQueryParams();
    setTimeout(() => router.push(destination), 800);
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = "Display name is required";
    if (!handle || handle.length < 3) errs.handle = "Handle must be at least 3 characters";
    else if (handleStatus === "taken") errs.handle = handleMessage || "That handle is not available";
    else if (handleStatus === "checking") errs.handle = "Please wait…";
    if (!email) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (password && confirmPassword && password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: displayName.trim(), handle: handle.toLowerCase().trim() },
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
            <form onSubmit={handleEmailLogin} className="space-y-5" noValidate>
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
                  className={`w-full px-4 py-3 rounded bg-zinc-900 border text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none ${fieldErrors.email ? "border-orange-500" : "border-zinc-800"}`}
                  id="login-email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
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
                  className={`w-full px-4 py-3 rounded bg-zinc-900 border text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none ${fieldErrors.password ? "border-orange-500" : "border-zinc-800"}`}
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                />
                {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
              </div>

              <button
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded transition duration-200 text-lg uppercase tracking-wider hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || loginSuccess}
              >
                {loginSuccess ? "Welcome back ✓" : loading ? "Logging in..." : "Log In"}
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
            <div className="mb-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Psy.Market" className="h-14 w-auto" />
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1 rounded-full bg-orange-500" />
              <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${signupStep === 2 ? "bg-orange-500" : "bg-zinc-700"}`} />
            </div>

            {signupStep === 1 ? (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Create your identity</h1>
                  <p className="text-gray-400 text-sm">Choose your name and a unique handle.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const errs: Record<string, string> = {};
                    if (!displayName.trim()) errs.displayName = "Display name is required";
                    if (!handle || handle.length < 3) errs.handle = "Handle must be at least 3 characters";
                    else if (handleStatus === "taken") errs.handle = handleMessage || "That handle is not available";
                    else if (handleStatus === "checking") errs.handle = "Please wait…";
                    else if (handleStatus === "idle") errs.handle = "Please enter a handle";
                    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
                    setFieldErrors({});
                    setSignupStep(2);
                  }}
                  className="space-y-4"
                  noValidate
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-displayname">
                      Display Name
                    </label>
                    <input
                      className={`w-full px-4 py-3 rounded bg-zinc-900 border text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none ${fieldErrors.displayName ? "border-orange-500" : "border-zinc-800"}`}
                      id="signup-displayname"
                      placeholder="Your name"
                      type="text"
                      maxLength={50}
                      autoFocus
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); setFieldErrors((p) => ({ ...p, displayName: "" })); }}
                    />
                    {fieldErrors.displayName && <p className="mt-1 text-xs text-orange-400">{fieldErrors.displayName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-handle">
                      Handle
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-gray-500 select-none">@</span>
                      <input
                        className={`w-full pl-8 pr-10 py-3 rounded bg-zinc-900 border text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none ${fieldErrors.handle ? "border-orange-500" : "border-zinc-800"}`}
                        id="signup-handle"
                        placeholder="yourhandle"
                        type="text"
                        maxLength={30}
                        value={handle}
                        onChange={(e) => { setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setFieldErrors((p) => ({ ...p, handle: "" })); }}
                      />
                      <span className="absolute right-3 text-lg">
                        {handleStatus === "checking" && <span className="text-gray-400 text-sm animate-pulse">...</span>}
                        {(handleStatus === "available" || handleStatus === "reserved_for_you") && <span className="text-green-400">✓</span>}
                        {handleStatus === "taken" && <span className="text-orange-400">✗</span>}
                      </span>
                    </div>
                    {fieldErrors.handle
                      ? <p className="mt-1 text-xs text-orange-400">{fieldErrors.handle}</p>
                      : handleStatus === "taken"
                        ? <p className="mt-1 text-xs text-orange-400">{handleMessage}</p>
                        : (handleStatus === "available" || handleStatus === "reserved_for_you")
                          ? <p className="mt-1 text-xs text-green-400">{handleStatus === "reserved_for_you" ? "Reserved for you!" : "Available"}</p>
                          : <p className="mt-1 text-xs text-gray-500">psy.market/@{handle || "yourhandle"}</p>
                    }
                  </div>

                  <button
                    className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded transition duration-200 text-base uppercase tracking-wider hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    type="submit"
                    disabled={handleStatus === "taken"}
                  >
                    Continue
                  </button>
                </form>

              </>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Secure your account</h1>
                  <p className="text-gray-400 text-sm">
                    Almost there,{" "}
                    <span className="text-orange-400">@{handle}</span>.
                  </p>
                </div>

                <form onSubmit={handleEmailSignup} className="space-y-4" noValidate>
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
                      className={`w-full px-4 py-3 rounded bg-zinc-900 border text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none ${fieldErrors.email ? "border-orange-500" : "border-zinc-800"}`}
                      id="signup-email"
                      placeholder="name@example.com"
                      type="email"
                      autoFocus
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                    />
                    {fieldErrors.email && <p className="mt-1 text-xs text-orange-400">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-password">
                      Password
                    </label>
                    <input
                      className={`w-full px-4 py-3 rounded bg-zinc-900 border text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none ${fieldErrors.password ? "border-orange-500" : "border-zinc-800"}`}
                      id="signup-password"
                      placeholder="At least 6 characters"
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                    />
                    {fieldErrors.password && <p className="mt-1 text-xs text-orange-400">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-confirm">
                      Confirm Password
                    </label>
                    <input
                      className={`w-full px-4 py-3 rounded bg-zinc-900 border text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 outline-none ${fieldErrors.confirmPassword ? "border-orange-500" : "border-zinc-800"}`}
                      id="signup-confirm"
                      placeholder="Repeat your password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    />
                    {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-orange-400">{fieldErrors.confirmPassword}</p>}
                  </div>

                  <button
                    className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded transition duration-200 text-base uppercase tracking-wider hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSignupStep(1); setFieldErrors({}); setError(null); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-300 transition py-1"
                  >
                    ← Back
                  </button>
                </form>
              </>
            )}

            <p className="mt-5 text-center text-sm text-gray-400">
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
