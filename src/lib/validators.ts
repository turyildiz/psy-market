import { z } from "zod";

// Handle (username)
export const handleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(30, "Handle must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Handle can only contain letters, numbers, and underscores"
  );

// Profile
export const profileSchema = z.object({
  handle: handleSchema,
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be at most 100 characters"),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  social_links: z
    .object({
      instagram: z.string().url("Must be a valid URL").optional().or(z.literal("")),
      facebook: z.string().url("Must be a valid URL").optional().or(z.literal("")),
      website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    })
    .optional(),
  is_creator: z.boolean().default(false),
});

// Onboarding (subset of profile)
export const onboardingSchema = z.object({
  handle: handleSchema,
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be at most 100 characters"),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .optional()
    .or(z.literal("")),
});

// Listing
export const listingSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be at most 2,000 characters"),
  price: z
    .number()
    .int("Price must be a whole number (cents)")
    .min(50, "Minimum price is €0.50")
    .max(5_000_000, "Maximum price is €50,000"),
  condition: z.enum(["new", "like_new", "good", "worn", "vintage"]),
  size: z
    .string()
    .min(1, "Size is required")
    .max(20, "Size must be at most 20 characters"),
  images: z
    .array(z.string().url())
    .min(1, "At least 1 image is required")
    .max(5, "Maximum 5 images"),
  category: z.enum(["clothing", "accessories", "gear", "art", "other"]),
  tags: z
    .array(
      z
        .string()
        .max(30, "Each tag must be at most 30 characters")
        .regex(/^[a-zA-Z0-9-]+$/, "Tags can only contain letters, numbers, and hyphens")
    )
    .max(10, "Maximum 10 tags")
    .default([]),
  ships_to: z
    .array(z.string())
    .min(1, "At least one shipping location is required"),
});

// Message
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be at most 2,000 characters"),
  images: z
    .array(z.string().url())
    .max(3, "Maximum 3 images per message")
    .optional(),
});

// Admin rejection
export const rejectionSchema = z.object({
  admin_notes: z
    .string()
    .min(10, "Rejection notes must be at least 10 characters")
    .max(1000, "Rejection notes must be at most 1,000 characters"),
});

// Event (admin-managed)
export const eventSchema = z
  .object({
    name: z
      .string()
      .min(3, "Event name must be at least 3 characters")
      .max(100, "Event name must be at most 100 characters"),
    slug: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens"
      ),
    start_date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)), "Must be a valid date"),
    end_date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)), "Must be a valid date"),
    country: z
      .string()
      .min(2, "Country is required")
      .max(2, "Use ISO country code"),
    venue: z
      .string()
      .max(200, "Venue must be at most 200 characters")
      .optional()
      .or(z.literal("")),
    website_url: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    cover_image_url: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be on or after start date",
    path: ["end_date"],
  });
