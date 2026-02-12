"use client";

import { useState, useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  checkHandleAvailability,
  completeOnboarding,
} from "@/lib/actions/onboarding";
import { handleSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OnboardingForm({
  currentDisplayName,
}: {
  currentDisplayName: string;
}) {
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState(
    currentDisplayName === "New User" ? "" : currentDisplayName
  );
  const [location, setLocation] = useState("");
  const [handleStatus, setHandleStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({ checking: false, available: null, error: null });
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const debouncedHandle = useDebounce(handle, 300);

  // Check handle availability on debounced input change
  useEffect(() => {
    if (!debouncedHandle || debouncedHandle.length < 3) {
      setHandleStatus({ checking: false, available: null, error: null });
      return;
    }

    // Client-side validation first
    const validation = handleSchema.safeParse(debouncedHandle);
    if (!validation.success) {
      setHandleStatus({
        checking: false,
        available: false,
        error: validation.error.issues[0].message,
      });
      return;
    }

    setHandleStatus({ checking: true, available: null, error: null });

    checkHandleAvailability(debouncedHandle).then((result) => {
      setHandleStatus({
        checking: false,
        available: result.available,
        error: result.available ? null : (result.error ?? "Handle unavailable"),
      });
    });
  }, [debouncedHandle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!handleStatus.available) {
      setFormError("Please choose an available handle");
      return;
    }

    if (!displayName.trim()) {
      setFormError("Display name is required");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboarding({
        handle,
        display_name: displayName.trim(),
        location: location.trim() || undefined,
      });

      if (result?.error) {
        setFormError(result.error);
      }
    });
  }

  const isFormValid =
    handleStatus.available === true && displayName.trim().length > 0;

  return (
    <Card className="border-[var(--dark-3)] bg-[var(--dark-2)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Complete your profile
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          Choose your unique handle and display name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          {/* Handle */}
          <div className="space-y-2">
            <Label htmlFor="handle" className="text-[var(--text-muted)]">
              Handle <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-grey)]">
                @
              </span>
              <Input
                id="handle"
                type="text"
                placeholder="your_handle"
                value={handle}
                onChange={(e) =>
                  setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                maxLength={30}
                className="bg-[var(--dark-3)] border-[var(--dark-4)] text-white placeholder:text-[var(--text-grey)] pl-8 pr-10"
              />
              {/* Status indicator */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {handleStatus.checking && (
                  <span className="text-[var(--text-grey)] text-sm">...</span>
                )}
                {!handleStatus.checking && handleStatus.available === true && (
                  <span className="text-green-400 text-lg">&#10003;</span>
                )}
                {!handleStatus.checking && handleStatus.available === false && (
                  <span className="text-red-400 text-lg">&#10007;</span>
                )}
              </span>
            </div>
            {handleStatus.error && (
              <p className="text-xs text-red-400">{handleStatus.error}</p>
            )}
            {handleStatus.available && (
              <p className="text-xs text-green-400">Handle is available!</p>
            )}
            <p className="text-xs text-[var(--text-grey)]">
              3-30 characters. Letters, numbers, and underscores only. This will
              be your URL: psy.market/seller/{handle || "..."}
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-[var(--text-muted)]">
              Display Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your public name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              required
              className="bg-[var(--dark-3)] border-[var(--dark-4)] text-white placeholder:text-[var(--text-grey)]"
            />
          </div>

          {/* Location (optional) */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-[var(--text-muted)]">
              Location{" "}
              <span className="text-[var(--text-grey)] font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g. Berlin, Germany"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              className="bg-[var(--dark-3)] border-[var(--dark-4)] text-white placeholder:text-[var(--text-grey)]"
            />
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isPending}
            className="w-full bg-[var(--brand)] hover:bg-[var(--brand-2)] text-white font-semibold disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
