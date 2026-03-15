"use client";

import { useState, useTransition } from "react";
import { createListing, updateListing } from "@/lib/actions/listings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ListingFormProps = {
  mode: "create" | "edit";
  listingId?: string;
  initialValues?: {
    title?: string;
    description?: string;
    price?: number;
    condition?: "new" | "like_new" | "good" | "worn" | "vintage";
    size?: string;
    category?: "clothing" | "accessories" | "gear" | "art" | "other";
    images?: string[];
    tags?: string[];
    ships_to?: string[];
    status?: string;
  };
};

export function ListingForm({ mode, listingId, initialValues }: ListingFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [priceEur, setPriceEur] = useState(
    initialValues?.price ? (initialValues.price / 100).toFixed(2) : ""
  );
  const [condition, setCondition] = useState<
    "new" | "like_new" | "good" | "worn" | "vintage"
  >(initialValues?.condition ?? "good");
  const [size, setSize] = useState(initialValues?.size ?? "");
  const [category, setCategory] = useState<
    "clothing" | "accessories" | "gear" | "art" | "other"
  >(initialValues?.category ?? "clothing");
  const [imagesCsv, setImagesCsv] = useState((initialValues?.images ?? []).join(", "));
  const [tagsCsv, setTagsCsv] = useState((initialValues?.tags ?? []).join(", "));
  const [shipsToCsv, setShipsToCsv] = useState(
    (initialValues?.ships_to ?? ["WORLDWIDE"]).join(", ")
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const titleText = mode === "create" ? "Create Listing" : "Edit Listing";

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
        images_csv: imagesCsv,
        tags_csv: tagsCsv,
        ships_to_csv: shipsToCsv,
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
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-8">
      <h2 className="text-2xl font-bold text-[var(--text-dark)] mb-6" style={{ fontFamily: 'var(--font-display)' }}>{titleText}</h2>

      <div className="space-y-5">
        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-[var(--text-dark)] font-semibold text-sm">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="border-gray-300 bg-white text-[var(--text-dark)] focus:border-[var(--brand)] focus:ring-[var(--brand)]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-[var(--text-dark)] font-semibold text-sm">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[var(--text-dark)] focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-[var(--text-dark)] font-semibold text-sm">Price (EUR)</Label>
            <Input id="price" value={priceEur} onChange={(e) => setPriceEur(e.target.value)} className="border-gray-300 bg-white text-[var(--text-dark)]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="size" className="text-[var(--text-dark)] font-semibold text-sm">Size</Label>
            <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} className="border-gray-300 bg-white text-[var(--text-dark)]" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="condition" className="text-[var(--text-dark)] font-semibold text-sm">Condition</Label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as typeof condition)}
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
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-[var(--text-dark)] focus:outline-none focus:border-[var(--brand)]"
            >
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="gear">Gear</option>
              <option value="art">Art</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="images" className="text-[var(--text-dark)] font-semibold text-sm">Image URLs <span className="font-normal text-[var(--text-grey)]">(comma separated)</span></Label>
          <Input
            id="images"
            value={imagesCsv}
            onChange={(e) => setImagesCsv(e.target.value)}
            placeholder="https://... , https://..."
            className="border-gray-300 bg-white text-[var(--text-dark)]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags" className="text-[var(--text-dark)] font-semibold text-sm">Tags <span className="font-normal text-[var(--text-grey)]">(comma separated)</span></Label>
          <Input id="tags" value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} className="border-gray-300 bg-white text-[var(--text-dark)]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shipsTo" className="text-[var(--text-dark)] font-semibold text-sm">Ships To <span className="font-normal text-[var(--text-grey)]">(comma separated country codes)</span></Label>
          <Input
            id="shipsTo"
            value={shipsToCsv}
            onChange={(e) => setShipsToCsv(e.target.value)}
            placeholder="DE, FR, WORLDWIDE"
            className="border-gray-300 bg-white text-[var(--text-dark)]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          {mode === "create" ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction("draft")}
                className="h-10 px-5 rounded-full border-2 border-gray-300 text-[var(--text-dark)] text-sm font-semibold hover:border-gray-400 transition disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction("pending")}
                className="h-10 px-5 rounded-full bg-[var(--brand)] text-white text-sm font-semibold shadow-[var(--shadow-card)] hover:opacity-90 transition disabled:opacity-50"
              >
                Submit For Review
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction("save")}
                className="h-10 px-5 rounded-full border-2 border-gray-300 text-[var(--text-dark)] text-sm font-semibold hover:border-gray-400 transition disabled:opacity-50"
              >
                Save Changes
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction("submit")}
                className="h-10 px-5 rounded-full bg-[var(--brand)] text-white text-sm font-semibold shadow-[var(--shadow-card)] hover:opacity-90 transition disabled:opacity-50"
              >
                Resubmit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

