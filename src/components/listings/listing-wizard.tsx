"use client";

import { useState, useTransition, useRef } from "react";
import { createListing, updateListing } from "@/lib/actions/listings";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Condition = "new" | "like_new" | "good" | "worn" | "vintage";
type Category = "clothing" | "accessories" | "gear" | "art" | "other";

type WizardProps = {
  mode: "create" | "edit";
  listingId?: string;
  initialValues?: {
    title?: string;
    description?: string;
    price?: number;
    condition?: Condition;
    size?: string;
    category?: Category;
    images?: string[];
    tags?: string[];
    ships_to?: string[];
    status?: string;
  };
};

const SHIPPING_OPTIONS = [
  { code: "WORLDWIDE", label: "Worldwide" },
  { code: "DE", label: "Germany" },
  { code: "AT", label: "Austria" },
  { code: "CH", label: "Switzerland" },
  { code: "NL", label: "Netherlands" },
  { code: "FR", label: "France" },
  { code: "IT", label: "Italy" },
  { code: "ES", label: "Spain" },
  { code: "PT", label: "Portugal" },
  { code: "PL", label: "Poland" },
  { code: "CZ", label: "Czech Republic" },
  { code: "HU", label: "Hungary" },
  { code: "EU", label: "All EU Countries" },
  { code: "UK", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "LOCAL", label: "Local Pickup Only" },
];

const STEP_LABELS = ["Basics", "Photos", "Delivery"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-[var(--brand)] text-white"
                    : isDone
                    ? "bg-[var(--brand)] text-white opacity-60"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-[var(--text-dark)]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${isDone ? "bg-[var(--brand)] opacity-40" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ListingWizard({ mode, listingId, initialValues }: WizardProps) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [priceEur, setPriceEur] = useState(
    initialValues?.price ? (initialValues.price / 100).toFixed(2) : ""
  );
  const [condition, setCondition] = useState<Condition>(initialValues?.condition ?? "good");
  const [size, setSize] = useState(initialValues?.size ?? "");
  const [category, setCategory] = useState<Category>(initialValues?.category ?? "clothing");

  // Step 2 state
  const [images, setImages] = useState<string[]>(initialValues?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 state
  const [shipsTo, setShipsTo] = useState<string[]>(
    initialValues?.ships_to ?? ["WORLDWIDE"]
  );
  const [tagsCsv, setTagsCsv] = useState((initialValues?.tags ?? []).join(", "));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Step 1 validation
  function step1Valid() {
    return title.trim().length >= 5 && description.trim().length >= 20 && Number(priceEur) >= 0.5 && size.trim().length > 0;
  }

  // Step 2 validation
  function step2Valid() {
    return images.length >= 1;
  }

  async function handleFileUpload(files: FileList) {
    if (images.length + files.length > 5) {
      setUploadError("Maximum 5 images allowed");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Each image must be under 5MB");
        continue;
      }
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setUploadError(`Upload failed: ${error.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(data.path);

      uploaded.push(urlData.publicUrl);
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function toggleShipping(code: string) {
    setShipsTo((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function runAction(intent: "draft" | "pending" | "save" | "submit") {
    setError(null);
    startTransition(async () => {
      const payload = {
        title,
        description,
        price_eur: priceEur,
        condition,
        size,
        category,
        images_csv: images.join(", "),
        tags_csv: tagsCsv,
        ships_to_csv: shipsTo.join(", "),
      };

      if (mode === "create") {
        const result = await createListing(payload, intent as "draft" | "pending");
        if (result?.error) setError(result.error);
        return;
      }

      if (!listingId) {
        setError("Missing listing id");
        return;
      }
      const result = await updateListing(listingId, payload, intent as "save" | "submit");
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-8">
      <h2
        className="text-2xl font-bold text-[var(--text-dark)] mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {mode === "create" ? "Create Listing" : "Edit Listing"}
      </h2>

      <StepIndicator current={step} />

      {/* ── Step 1: Basics ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[var(--text-dark)] font-semibold text-sm">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hand-painted festival jacket"
              className="border-gray-300 bg-white text-[var(--text-dark)] focus:border-[var(--brand)]"
            />
            <p className="text-xs text-gray-400">{title.length}/100 — minimum 5 characters</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[var(--text-dark)] font-semibold text-sm">
              Description <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item — material, size details, story, condition notes..."
              rows={5}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[var(--text-dark)] focus:outline-none focus:border-[var(--brand)] resize-none"
            />
            <p className="text-xs text-gray-400">{description.length}/2000 — minimum 20 characters</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-[var(--text-dark)] font-semibold text-sm">
                Price (EUR) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                <Input
                  id="price"
                  type="number"
                  min="0.50"
                  step="0.01"
                  value={priceEur}
                  onChange={(e) => setPriceEur(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 border-gray-300 bg-white text-[var(--text-dark)]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size" className="text-[var(--text-dark)] font-semibold text-sm">
                Size <span className="text-red-500">*</span>
              </Label>
              <Input
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. M, L, 42, One Size"
                className="border-gray-300 bg-white text-[var(--text-dark)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="condition" className="text-[var(--text-dark)] font-semibold text-sm">Condition</Label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-[var(--text-dark)] focus:outline-none focus:border-[var(--brand)]"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="worn">Worn</option>
                <option value="vintage">Vintage</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-[var(--text-dark)] font-semibold text-sm">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-[var(--text-dark)] focus:outline-none focus:border-[var(--brand)]"
              >
                <option value="clothing">Fashion & Wear</option>
                <option value="accessories">Jewelry & Accessories</option>
                <option value="gear">Festival Gear</option>
                <option value="art">Deco & Art</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!step1Valid()}
              onClick={() => setStep(2)}
              className="h-10 px-6 rounded-full bg-[var(--brand)] text-white text-sm font-semibold shadow-[var(--shadow-card)] hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Photos →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Photos ── */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            Add 1–5 photos. First photo will be the cover. Max 5MB each.
          </p>

          {/* Upload area */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              uploading
                ? "border-gray-200 bg-gray-50 cursor-wait"
                : images.length >= 5
                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                : "border-gray-300 hover:border-[var(--brand)] hover:bg-orange-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading || images.length >= 5}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-600">
                  {images.length >= 5 ? "Maximum photos reached" : "Click to upload photos"}
                </p>
                <p className="text-xs text-gray-400">{images.length}/5 photos added</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {uploadError}
            </div>
          )}

          {/* Image previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((url, i) => (
                <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[var(--brand)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-10 px-5 rounded-full border-2 border-gray-300 text-[var(--text-dark)] text-sm font-semibold hover:border-gray-400 transition"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!step2Valid()}
              onClick={() => setStep(3)}
              className="h-10 px-6 rounded-full bg-[var(--brand)] text-white text-sm font-semibold shadow-[var(--shadow-card)] hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Delivery →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Delivery & Submit ── */}
      {step === 3 && (
        <div className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[var(--text-dark)] font-semibold text-sm">
              Where do you ship? <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-400">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SHIPPING_OPTIONS.map(({ code, label }) => {
                const checked = shipsTo.includes(code);
                return (
                  <label
                    key={code}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      checked
                        ? "border-[var(--brand)] bg-orange-50/50 text-[var(--text-dark)] font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleShipping(code)}
                      className="accent-[var(--brand)] w-4 h-4"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-[var(--text-dark)] font-semibold text-sm">
              Tags <span className="font-normal text-gray-400">(optional, comma separated)</span>
            </Label>
            <Input
              id="tags"
              value={tagsCsv}
              onChange={(e) => setTagsCsv(e.target.value)}
              placeholder="e.g. handmade, festival, psychedelic"
              className="border-gray-300 bg-white text-[var(--text-dark)]"
            />
            <p className="text-xs text-gray-400">Max 10 tags, letters and hyphens only</p>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-10 px-5 rounded-full border-2 border-gray-300 text-[var(--text-dark)] text-sm font-semibold hover:border-gray-400 transition"
            >
              ← Back
            </button>
            <div className="flex gap-3">
              {mode === "create" ? (
                <>
                  <button
                    type="button"
                    disabled={isPending || shipsTo.length === 0}
                    onClick={() => runAction("draft")}
                    className="h-10 px-5 rounded-full border-2 border-gray-300 text-[var(--text-dark)] text-sm font-semibold hover:border-gray-400 transition disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={isPending || shipsTo.length === 0}
                    onClick={() => runAction("pending")}
                    className="h-10 px-6 rounded-full bg-[var(--brand)] text-white text-sm font-semibold shadow-[var(--shadow-card)] hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isPending ? "Submitting..." : "Submit for Review"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isPending || shipsTo.length === 0}
                    onClick={() => runAction("save")}
                    className="h-10 px-5 rounded-full border-2 border-gray-300 text-[var(--text-dark)] text-sm font-semibold hover:border-gray-400 transition disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    disabled={isPending || shipsTo.length === 0}
                    onClick={() => runAction("submit")}
                    className="h-10 px-6 rounded-full bg-[var(--brand)] text-white text-sm font-semibold shadow-[var(--shadow-card)] hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isPending ? "Submitting..." : "Resubmit"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
