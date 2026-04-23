"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

type Seller = {
  handle: string;
  display_name: string;
  bio: string | null;
  location: string | null;
  image_url: string | null;
};

export function FeaturedSellerCarousel({ sellers }: { sellers: Seller[] }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = useCallback((index: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 300);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + sellers.length) % sellers.length), [current, sellers.length, goTo]);
  const next = useCallback(() => goTo((current + 1) % sellers.length), [current, sellers.length, goTo]);

  useEffect(() => {
    if (sellers.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, sellers.length]);

  if (!sellers.length) return null;

  const seller = sellers[current];

  return (
    <div className="feature-card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background image with fade */}
      <div
        className="feature-card-bg"
        style={{
          backgroundImage: seller.image_url ? `url('${seller.image_url}')` : "none",
          backgroundPosition: "center top",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          backgroundColor: seller.image_url ? undefined : "#1a1a2e",
        }}
      />
      <div className="feature-card-overlay" />

      {/* Content */}
      <Link
        href={`/${seller.handle}`}
        className="feature-card-content"
        style={{ textDecoration: "none", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-in-out" }}
      >
        <span className="feature-tag">Featured Seller</span>
        <h3>{seller.display_name}</h3>
        {seller.bio && <p>{seller.bio.length > 120 ? seller.bio.slice(0, 120) + "…" : seller.bio}</p>}
      </Link>

      {/* Arrows — only show if more than 1 seller */}
      {sellers.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%",
              width: 36, height: 36, color: "white", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next"
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%",
              width: 36, height: 36, color: "white", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
            }}
          >
            ›
          </button>

          {/* Dots */}
          <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
            {sellers.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === current ? "var(--brand)" : "rgba(255,255,255,0.5)",
                  border: "none", padding: 0, cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
