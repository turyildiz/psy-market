// ============================================
// psy.market Database Types
// Matches SPEC.md v1.3 SQL Schema (Section 4.1)
// ============================================

// --- Enums ---

export type UserRole = "user" | "admin" | "super_admin";
export type ProfileType = "personal" | "artist" | "label" | "festival";
export type ListingStatus = "draft" | "pending" | "active" | "sold" | "rejected";
export type ListingCondition = "new" | "like_new" | "good" | "worn" | "vintage";
export type ListingCategory = "clothing" | "accessories" | "gear" | "art" | "other";

// --- Row Types ---

export interface User {
  id: string;
  role: UserRole;
  email_notifications: boolean;
  stripe_account_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  type: ProfileType;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  header_url: string | null;
  location: string | null;
  social_links: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  is_creator: boolean;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  price: number;
  condition: ListingCondition;
  size: string;
  images: string[];
  category: ListingCategory;
  tags: string[];
  ships_to: string[];
  status: ListingStatus;
  admin_notes: string | null;
  is_featured: boolean;
  view_count: number;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  search_vector: unknown;
}

export interface Message {
  id: string;
  listing_id: string;
  thread_id: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  content: string;
  images: string[];
  read: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  country: string;
  venue: string | null;
  website_url: string | null;
  cover_image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VendorEvent {
  id: string;
  profile_id: string;
  event_id: string;
  created_at: string;
}

export interface EventNotification {
  id: string;
  profile_id: string;
  event_id: string;
  notified_at: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  profile_id: string;
  listing_id: string;
  created_at: string;
}

export interface ReservedHandle {
  id: string;
  handle: string;
  email: string;
  reserved_at: string;
  expires_at: string;
  consumed: boolean;
  consumed_at: string | null;
}

// --- Supabase Database Type (for typed client) ---

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "stripe_account_id"> & {
          stripe_account_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<User, "id">>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at" | "is_verified" | "is_suspended" | "header_url"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          is_verified?: boolean;
          is_suspended?: boolean;
          header_url?: string | null;
        };
        Update: Partial<Omit<Profile, "id" | "user_id">>;
        Relationships: [];
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, "id" | "created_at" | "updated_at" | "view_count" | "is_featured" | "admin_notes" | "submitted_at" | "search_vector"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          is_featured?: boolean;
          admin_notes?: string | null;
          submitted_at?: string | null;
        };
        Update: Partial<Omit<Listing, "id" | "profile_id" | "search_vector">>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at" | "read"> & {
          id?: string;
          created_at?: string;
          read?: boolean;
        };
        Update: Partial<Pick<Message, "read">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Event, "id" | "created_by">>;
        Relationships: [];
      };
      vendor_events: {
        Row: VendorEvent;
        Insert: Omit<VendorEvent, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      event_notifications: {
        Row: EventNotification;
        Insert: Omit<EventNotification, "id" | "created_at" | "notified_at"> & {
          id?: string;
          created_at?: string;
          notified_at?: string | null;
        };
        Update: Partial<Pick<EventNotification, "notified_at">>;
        Relationships: [];
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      reserved_handles: {
        Row: ReservedHandle;
        Insert: Omit<ReservedHandle, "id" | "reserved_at" | "expires_at" | "consumed" | "consumed_at"> & {
          id?: string;
          reserved_at?: string;
          expires_at?: string;
          consumed?: boolean;
          consumed_at?: string | null;
        };
        Update: Partial<Pick<ReservedHandle, "consumed" | "consumed_at">>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      profile_type: ProfileType;
      listing_status: ListingStatus;
      listing_condition: ListingCondition;
      listing_category: ListingCategory;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
