import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uabuhtrtommkfmlhseul.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYnVodHJ0b21ta2ZtbGhzZXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY2NzUyMCwiZXhwIjoyMDg2MjQzNTIwfQ.sUMyTih7ExSq8OzKJBuQssxXWBBiNTVH4lFnpK4CkV4";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "luna@psy.market", password: "testpass123", handle: "luna_designs", display_name: "Luna Designs", bio: "Handcrafted festival wear from Berlin. Trance is life.", location: "Berlin, DE" },
  { email: "cosmic@psy.market", password: "testpass123", handle: "cosmic_threads", display_name: "Cosmic Threads", bio: "UV reactive clothing for the dancefloor. Ships worldwide.", location: "Amsterdam, NL" },
  { email: "shiva@psy.market", password: "testpass123", handle: "shiva_bazaar", display_name: "Shiva Bazaar", bio: "Vintage finds and festival treasures from the Indian scene.", location: "Goa, IN" },
];

const LISTINGS = [
  {
    sellerHandle: "luna_designs",
    title: "Handwoven UV Reactive Festival Top",
    description: "One-of-a-kind UV reactive festival top handwoven with love in Berlin. Features geometric psy patterns that glow intensely under UV lights. Perfect for Ozora, Boom, or any dancefloor. Made from lightweight, breathable fabric — you won't overheat on stage.",
    price: 8900, condition: "new", size: "S/M", category: "clothing",
    tags: ["uv", "handmade", "berlin", "psytrance", "festival"],
    ships_to: ["DE", "NL", "AT", "CH", "FR", "GB"],
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"],
    is_featured: true,
  },
  {
    sellerHandle: "luna_designs",
    title: "Sacred Geometry Velvet Jacket",
    description: "Stunning deep purple velvet jacket with hand-embroidered sacred geometry on the back. Metatron's Cube and Flower of Life patterns in gold thread. This piece has been to Ozora 2024 and Boom 2024. No signs of wear — it was too precious to wear every day. A true festival heirloom.",
    price: 14500, condition: "like_new", size: "M", category: "clothing",
    tags: ["sacred-geometry", "velvet", "embroidered", "festival"],
    ships_to: ["DE", "NL", "AT", "CH", "WORLDWIDE"],
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
  },
  {
    sellerHandle: "cosmic_threads",
    title: "Moog Subsequent 37 Synthesizer",
    description: "Legendary Moog Subsequent 37 semi-modular synthesizer in excellent condition. Purchased new in 2022, used in a smoke-free studio. All knobs and sliders work perfectly. Includes original power supply and manual. Perfect for that deep psybass or ethereal pad sound. Selling because I upgraded to a larger setup.",
    price: 89900, condition: "good", size: "Full Size", category: "gear",
    tags: ["moog", "synthesizer", "analog", "studio"],
    ships_to: ["NL", "DE", "BE", "FR", "GB"],
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"],
    is_featured: true,
  },
  {
    sellerHandle: "cosmic_threads",
    title: "Handmade Polymer Clay Mushroom Earrings",
    description: "Adorable handmade polymer clay mushroom earrings with red caps and white spots — the perfect forest fairy accessory. Each pair is unique, lightweight, and made with hypoallergenic sterling silver hooks. Great for festivals or everyday wear. Comes in a small fabric gift pouch.",
    price: 1800, condition: "new", size: "One Size", category: "accessories",
    tags: ["handmade", "earrings", "mushroom", "polymer-clay"],
    ships_to: ["WORLDWIDE"],
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
  },
  {
    sellerHandle: "shiva_bazaar",
    title: "Rajasthani Block Print Festival Trousers",
    description: "Authentic Rajasthani hand block printed harem trousers in deep indigo and gold. Bought from a local artisan in Jaipur. Wide, airy fit — ideal for long festival nights. The fabric is a cotton-silk blend that feels incredible in hot weather. These have been worn twice and washed gently.",
    price: 4500, condition: "good", size: "One Size", category: "clothing",
    tags: ["rajasthani", "block-print", "harem", "india", "festival"],
    ships_to: ["IN", "GB", "DE", "NL", "AU", "WORLDWIDE"],
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4d7a?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
  },
  {
    sellerHandle: "shiva_bazaar",
    title: "Handpainted Mandalart Canvas — Large",
    description: "Large 80x80cm canvas with hand-painted mandala in acrylic, featuring psy-inspired geometric patterns and a vibrant colour palette. Created by a Goa-based artist. Makes a beautiful centrepiece for your festival camp or home altar. Signed on the back. Wrapped in protective packaging for shipping.",
    price: 12000, condition: "new", size: "80x80cm", category: "art",
    tags: ["mandala", "art", "handpainted", "goa", "canvas"],
    ships_to: ["WORLDWIDE"],
    images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80"],
    is_featured: true,
  },
  {
    sellerHandle: "luna_designs",
    title: "Labradorite Crystal Pendant Necklace",
    description: "Stunning raw labradorite crystal wrapped in 925 sterling silver wire. The labradorescence on this stone is exceptional — flashes of blue, gold, and green depending on the light. Handcrafted by a Berlin silversmith. Chain length 60cm, adjustable. Perfect for stage or forest.",
    price: 5500, condition: "new", size: "One Size", category: "accessories",
    tags: ["labradorite", "crystal", "silver", "handmade", "necklace"],
    ships_to: ["DE", "AT", "CH", "NL", "FR", "GB", "WORLDWIDE"],
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
  },
  {
    sellerHandle: "cosmic_threads",
    title: "Pioneer DJ DDJ-800 Controller",
    description: "Pioneer DDJ-800 2-channel performance DJ controller in great condition. Used at home and at a few small parties. Serato and rekordbox compatible. Includes original box, power supply, and USB cable. Faders and jog wheels are perfect, no dead buttons. Selling as I'm going back to CDJs.",
    price: 49900, condition: "good", size: "Full Size", category: "gear",
    tags: ["pioneer", "dj", "controller", "rekordbox"],
    ships_to: ["NL", "DE", "BE", "FR"],
    images: ["https://images.unsplash.com/photo-1571266028243-6084d3f6f8f7?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
  },
];

async function seed() {
  console.log("🌱 Seeding psy.market...\n");

  // Create auth users
  const profileIds = {};
  for (const u of USERS) {
    console.log(`Creating user: ${u.email}`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    if (error) {
      console.log(`  ⚠ ${error.message} — skipping`);
      // Try to find existing profile
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, handle")
        .eq("handle", u.handle)
        .single();
      if (existing) profileIds[u.handle] = existing.id;
      continue;
    }

    // Wait for trigger to create profile
    await new Promise((r) => setTimeout(r, 800));

    // Update profile with proper handle + details
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .update({ handle: u.handle, display_name: u.display_name, bio: u.bio, location: u.location })
      .eq("user_id", data.user.id)
      .select("id")
      .single();

    if (pErr) {
      console.log(`  ⚠ Profile update failed: ${pErr.message}`);
    } else {
      profileIds[u.handle] = profile.id;
      console.log(`  ✓ Profile: @${u.handle} (${profile.id})`);
    }
  }

  // Create listings
  console.log("\nCreating listings...");
  for (const l of LISTINGS) {
    const profileId = profileIds[l.sellerHandle];
    if (!profileId) {
      console.log(`  ⚠ No profile for ${l.sellerHandle}, skipping listing: ${l.title}`);
      continue;
    }

    const { error } = await supabase.from("listings").insert({
      profile_id: profileId,
      title: l.title,
      description: l.description,
      price: l.price,
      condition: l.condition,
      size: l.size,
      category: l.category,
      tags: l.tags,
      ships_to: l.ships_to,
      images: l.images,
      status: "active",
      is_featured: l.is_featured,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      console.log(`  ✗ ${l.title}: ${error.message}`);
    } else {
      console.log(`  ✓ ${l.title} (${l.is_featured ? "⭐ featured" : ""})`);
    }
  }

  console.log("\n✅ Done! Test accounts:");
  for (const u of USERS) {
    console.log(`  ${u.email} / testpass123`);
  }
}

seed().catch(console.error);
