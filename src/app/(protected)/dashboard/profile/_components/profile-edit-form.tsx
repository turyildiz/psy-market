"use client";

import { useState, useTransition, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleSchema } from "@/lib/validators";
import { Camera, Check, X, Loader2, ImagePlus } from "lucide-react";

const FALLBACK_HEADER =
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=80";

type Props = {
  profile: {
    handle: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    header_url: string | null;
    location: string | null;
  };
  userId: string;
};

export function ProfileEditForm({ profile, userId }: Props) {
  const [handle, setHandle] = useState(profile.handle);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [headerUrl, setHeaderUrl] = useState(profile.header_url);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);

  const [handleStatus, setHandleStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [handleError, setHandleError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onHandleChange(value: string) {
    setHandle(value);
    setHandleStatus("idle");
    setHandleError(null);
    setSaved(false);

    if (value === profile.handle) return;
    if (checkTimeout.current) clearTimeout(checkTimeout.current);

    const validation = handleSchema.safeParse(value);
    if (!validation.success) {
      setHandleError(validation.error.issues[0].message);
      return;
    }

    setHandleStatus("checking");
    checkTimeout.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("handle", value)
          .maybeSingle();
        setHandleStatus(data ? "taken" : "available");
        if (data) setHandleError("Handle already taken");
      } catch {
        setHandleStatus("idle");
      }
    }, 400);
  }

  function onAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSaved(false);
  }

  function onHeaderFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeaderFile(file);
    setHeaderPreview(URL.createObjectURL(file));
    setSaved(false);
  }

  async function uploadFile(
    bucket: string,
    path: string,
    file: File
  ): Promise<string> {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  }

  function handleSubmit() {
    if (handleStatus === "taken" || handleError || handleStatus === "checking")
      return;
    setFormError(null);
    setSaved(false);

    startTransition(async () => {
      setIsUploading(true);
      let newAvatarUrl: string | undefined = undefined;
      let newHeaderUrl: string | undefined = undefined;

      try {
        if (avatarFile) {
          const ext = avatarFile.name.split(".").pop() ?? "jpg";
          newAvatarUrl = await uploadFile(
            "avatars",
            `${userId}/avatar.${ext}`,
            avatarFile
          );
          setAvatarUrl(newAvatarUrl);
          setAvatarPreview(null);
          setAvatarFile(null);
        }

        if (headerFile) {
          const ext = headerFile.name.split(".").pop() ?? "jpg";
          newHeaderUrl = await uploadFile(
            "avatars",
            `${userId}/header.${ext}`,
            headerFile
          );
          setHeaderUrl(newHeaderUrl);
          setHeaderPreview(null);
          setHeaderFile(null);
        }
      } catch {
        setFormError("Image upload failed. Please try again.");
        setIsUploading(false);
        return;
      }

      setIsUploading(false);

      const result = await updateProfile({
        handle,
        display_name: displayName,
        bio: bio || undefined,
        location: location || undefined,
        avatar_url: newAvatarUrl,
        header_url: newHeaderUrl,
      });

      if (result.error) {
        setFormError(result.error);
        if (result.error.toLowerCase().includes("handle")) {
          setHandleStatus("taken");
          setHandleError(result.error);
        }
      } else {
        setSaved(true);
      }
    });
  }

  const isBusy = isPending || isUploading;
  const canSave =
    !isBusy &&
    !handleError &&
    handleStatus !== "taken" &&
    handleStatus !== "checking" &&
    displayName.trim().length > 0;

  const currentAvatar =
    avatarPreview ?? avatarUrl ?? "/reference/profile_picture.jpeg";
  const currentHeader = headerPreview ?? headerUrl ?? FALLBACK_HEADER;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header image */}
      <div
        className="relative w-full h-36 cursor-pointer group"
        onClick={() => headerInputRef.current?.click()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentHeader}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <ImagePlus className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-semibold">Change cover</span>
        </div>
        <input
          ref={headerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onHeaderFileChange}
        />
      </div>

      <div className="p-8">
        <h1
          className="text-2xl font-bold text-[var(--text-dark)] mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Edit Profile
        </h1>
        <p className="text-sm text-[var(--text-grey)] mb-8">
          Your public profile on psy.market
        </p>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div
            className="relative group cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
          >
            <div className="p-[3px] rounded-full bg-gradient-to-br from-[var(--brand)] via-orange-300 to-pink-500 shadow-lg">
              <div className="p-[3px] rounded-full bg-white">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentAvatar}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-sm font-semibold text-[var(--brand)] hover:underline"
            >
              Change photo
            </button>
            <p className="text-xs text-[var(--text-grey)] mt-0.5">
              JPG, PNG or GIF · Max 5 MB
            </p>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarFileChange}
          />
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {/* Handle */}
          <div>
            <Label
              htmlFor="handle"
              className="text-sm font-semibold text-[var(--text-dark)]"
            >
              Handle
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-grey)] text-sm font-medium select-none">
                @
              </span>
              <Input
                id="handle"
                value={handle}
                onChange={(e) => onHandleChange(e.target.value)}
                className={`pl-7 pr-9 ${
                  handleStatus === "taken"
                    ? "border-red-400 focus-visible:ring-red-400"
                    : handleStatus === "available"
                    ? "border-green-400 focus-visible:ring-green-400"
                    : ""
                }`}
                maxLength={30}
                autoComplete="off"
              />
              {handleStatus === "checking" && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
              {handleStatus === "available" && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {handleStatus === "taken" && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {handleError ? (
              <p className="text-xs text-red-500 mt-1">{handleError}</p>
            ) : (
              <p className="text-xs text-[var(--text-grey)] mt-1">
                3–30 characters · Letters, numbers, underscores
              </p>
            )}
          </div>

          {/* Display name */}
          <div>
            <Label
              htmlFor="display_name"
              className="text-sm font-semibold text-[var(--text-dark)]"
            >
              Display Name
            </Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSaved(false);
              }}
              className="mt-1.5"
              maxLength={100}
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center">
              <div>
                <Label
                  htmlFor="bio"
                  className="text-sm font-semibold text-[var(--text-dark)]"
                >
                  Bio
                </Label>
                <span className="text-xs text-[var(--text-grey)] ml-2">
                  Shown on your public profile
                </span>
              </div>
              <span
                className={`text-xs ${
                  bio.length > 450
                    ? "text-orange-500 font-semibold"
                    : "text-[var(--text-grey)]"
                }`}
              >
                {bio.length}/500
              </span>
            </div>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setSaved(false);
              }}
              rows={3}
              maxLength={500}
              placeholder="Tell the community about yourself…"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <Label
              htmlFor="location"
              className="text-sm font-semibold text-[var(--text-dark)]"
            >
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setSaved(false);
              }}
              placeholder="Berlin, Germany"
              className="mt-1.5"
              maxLength={100}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <div className="min-h-[20px]">
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            {saved && !formError && (
              <p className="text-sm text-green-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Profile saved
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--brand)] hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            {isBusy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
