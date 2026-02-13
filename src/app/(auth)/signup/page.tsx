"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

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

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  if (success) {
    return (
      <Card className="border-[var(--dark-3)] bg-[var(--dark-2)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Check your email
          </CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            We&apos;ve sent a confirmation link to{" "}
            <span className="text-white font-medium">{email}</span>. Click the
            link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/?auth=login"
            className="text-sm text-[var(--brand)] hover:underline font-medium"
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--dark-3)] bg-[var(--dark-2)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Join psy.market
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          Create your account and start exploring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSignup} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--text-muted)]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[var(--dark-3)] border-[var(--dark-4)] text-white placeholder:text-[var(--text-grey)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[var(--text-muted)]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-[var(--dark-3)] border-[var(--dark-4)] text-white placeholder:text-[var(--text-grey)]"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[var(--text-muted)]"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-[var(--dark-3)] border-[var(--dark-4)] text-white placeholder:text-[var(--text-grey)]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--brand)] hover:bg-[var(--brand-2)] text-white font-semibold"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--dark-4)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--dark-2)] px-2 text-[var(--text-grey)]">
              or
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignup}
          className="w-full border-[var(--dark-4)] bg-[var(--dark-3)] text-white hover:bg-[var(--dark-4)]"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-[var(--text-grey)]">
          Already have an account?{" "}
          <Link
            href="/?auth=login"
            className="text-[var(--brand)] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
