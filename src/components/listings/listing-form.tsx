"use client";

import { useState, useTransition } from "react";
import { createListing, updateListing } from "@/lib/actions/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="max-w-3xl mx-auto border-[var(--dark-3)] bg-[var(--dark-2)] text-white">
      <CardHeader>
        <CardTitle>{titleText}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-28 rounded-md border border-[var(--dark-4)] bg-[var(--dark-3)] px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (EUR)</Label>
            <Input id="price" value={priceEur} onChange={(e) => setPriceEur(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as typeof condition)}
              className="w-full h-9 rounded-md border border-[var(--dark-4)] bg-[var(--dark-3)] px-3 text-sm"
            >
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="worn">Worn</option>
              <option value="vintage">Vintage</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full h-9 rounded-md border border-[var(--dark-4)] bg-[var(--dark-3)] px-3 text-sm"
            >
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="gear">Gear</option>
              <option value="art">Art</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">Image URLs (comma separated)</Label>
          <Input
            id="images"
            value={imagesCsv}
            onChange={(e) => setImagesCsv(e.target.value)}
            placeholder="https://... , https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipsTo">Ships To (comma separated country codes)</Label>
          <Input
            id="shipsTo"
            value={shipsToCsv}
            onChange={(e) => setShipsToCsv(e.target.value)}
            placeholder="DE, FR, WORLDWIDE"
          />
        </div>

        <div className="flex gap-2">
          {mode === "create" ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => runAction("draft")}
              >
                Save Draft
              </Button>
              <Button type="button" disabled={isPending} onClick={() => runAction("pending")}>
                Submit For Review
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => runAction("save")}
              >
                Save Changes
              </Button>
              <Button type="button" disabled={isPending} onClick={() => runAction("submit")}>
                Resubmit
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

