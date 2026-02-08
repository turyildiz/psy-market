"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Scroll reveal observer
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* ============ TOP BAR ============ */}
      <header className="top-bar">
        <div className="container">
          <a href="#" className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_web.png" alt="Psy.Market" className="logo-img" />
          </a>

          <div className="auth-buttons">
            <button className="btn btn-outline">Log In</button>
            <button className="btn btn-primary">Sign Up</button>
          </div>

          <div
            className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <a href="#">Apparel</a>
          <a href="#">Art &amp; Decor</a>
          <a href="#">Music Gear</a>
          <a href="#">Tickets</a>
          <a href="#">Vintage</a>
          <a href="#">New Arrivals</a>
          <div className="mobile-auth">
            <button className="btn btn-outline" style={{ flex: 1 }}>
              Log In
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }}>
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* ============ DESKTOP NAV ============ */}
      <nav className={`nav-bar ${isScrolled ? "scrolled" : ""}`}>
        <div className="container">
          <a href="#" className="nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_white.png" alt="Psy.Market" />
          </a>
          <ul className="nav-links">
            <li><a href="#">Apparel</a></li>
            <li><a href="#">Art &amp; Decor</a></li>
            <li><a href="#">Music Gear</a></li>
            <li><a href="#">Tickets</a></li>
            <li><a href="#">Vintage</a></li>
            <li><a href="#">New Arrivals</a></li>
          </ul>
        </div>
      </nav>

      {/* ============ NEW HERO SECTION ============ */}
      <section className="hero-new">
        {/* Background */}
        <div className="hero-media-bg" style={{ ['--bg-image' as string]: 'url(/modem.jpg)' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/modem.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'saturate(1.2)',
            animation: 'slowZoom 30s ease-in-out infinite alternate'
          }} />
        </div>
        <div className="hero-gradient-overlay"></div>
        <div className="color-bands"></div>

        {/* Main Content */}
        <div className="hero-main-content">
          <h1 className="hero-headline">
            The <span className="glow-text" data-text="Psytrance">Psytrance</span><br />
            Marketplace
          </h1>

          <p className="hero-tagline">
            Your gateway to visionary art, festival fashion, and unique gear from independent creators worldwide.
          </p>

          <div className="hero-search-minimal">
            <div className="search-input-wrapper">
              <span className="search-icon-minimal">🔍</span>
              <input type="text" className="search-input-minimal" placeholder="What are you looking for?" />
            </div>
            <button className="search-btn-minimal">Search</button>
          </div>
        </div>
      </section>

      {/* ============ 1. TRENDING: FESTIVAL SEASON ============ */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">Trending: Festival Season</h2>
            <a href="#" className="view-all">View All <span>&rarr;</span></a>
          </div>
          <div className="bento-grid reveal">
            {/* Feature Card (Left) */}
            <div className="feature-card">
              <div className="feature-card-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1529651737508-66e99d0e0d44?w=800&q=80')` }}></div>
              <div className="feature-card-overlay"></div>
              <div className="feature-card-content">
                <span className="feature-tag">Curated Collection</span>
                <h3>UV Reactive Festival Wear</h3>
                <p>Glow under blacklight with handcrafted UV-reactive clothing designed for the dancefloor.</p>
              </div>
            </div>
            {/* Small Cards */}
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80" alt="Fractal Hoodie" />
              </div>
              <div className="product-card-info">
                <h4>Fractal Geometry Hoodie</h4>
                <div className="category">Apparel</div>
                <div className="price">$89.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80" alt="Sacred Tee" />
              </div>
              <div className="product-card-info">
                <h4>Sacred Geometry Tee</h4>
                <div className="category">Apparel</div>
                <div className="price">$45.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80" alt="Festival Jacket" />
              </div>
              <div className="product-card-info">
                <h4>Psydelic Flow Jacket</h4>
                <div className="category">Outerwear</div>
                <div className="price">$135.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80" alt="UV Pants" />
              </div>
              <div className="product-card-info">
                <h4>Cosmic Cargo Pants</h4>
                <div className="category">Apparel</div>
                <div className="price">$72.00</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. COMMUNITY SPOTLIGHT ============ */}
      <section className="community-section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">Community Spotlight</h2>
            <a href="#" className="view-all">Meet the Tribe <span>&rarr;</span></a>
          </div>
          <div className="artists-row reveal">
            <div className="artist-card">
              <div className="artist-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" alt="Darkmysterytribe" />
              </div>
              <div className="artist-name">Darkmysterytribe</div>
              <div className="artist-role">Apparel Designer</div>
              <span className="artist-badge badge-grey">Top Rated</span>
            </div>
            <div className="artist-card">
              <div className="artist-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="Vanaghotra Store" />
              </div>
              <div className="artist-name">Vanaghotra Store</div>
              <div className="artist-role">Apparel Designer</div>
              <span className="artist-badge badge-grey">Verified</span>
            </div>
            <div className="artist-card">
              <div className="artist-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" alt="FrequencyLab" />
              </div>
              <div className="artist-name">FrequencyLab</div>
              <div className="artist-role">Synth Builder</div>
              <span className="artist-badge badge-grey">Power Seller</span>
            </div>
            <div className="artist-card">
              <div className="artist-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" alt="Cuevaluna Handmade" />
              </div>
              <div className="artist-name">Cuevaluna Handmade</div>
              <div className="artist-role">Cuevaluna Artesania</div>
              <span className="artist-badge badge-grey">New Arrival</span>
            </div>
            <div className="artist-card">
              <div className="artist-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" alt="Milad Wear" />
              </div>
              <div className="artist-name">Milad Wear</div>
              <div className="artist-role">Apparel Designer</div>
              <span className="artist-badge badge-grey">Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. VISIONARY ART & DECOR ============ */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">Visionary Art &amp; Decor</h2>
            <a href="#" className="view-all">View All <span>&rarr;</span></a>
          </div>
          <div className="bento-grid feature-right reveal">
            {/* Small Cards (Left side) */}
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80" alt="Mandala Print" />
              </div>
              <div className="product-card-info">
                <h4>Mandala Canvas Print</h4>
                <div className="category">Wall Art</div>
                <div className="price">$120.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&q=80" alt="Tapestry" />
              </div>
              <div className="product-card-info">
                <h4>UV Blacklight Tapestry</h4>
                <div className="category">Decor</div>
                <div className="price">$65.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80" alt="Resin Art" />
              </div>
              <div className="product-card-info">
                <h4>Psychedelic Resin Art</h4>
                <div className="category">Sculpture</div>
                <div className="price">$210.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80" alt="LED Decor" />
              </div>
              <div className="product-card-info">
                <h4>Infinity LED Frame</h4>
                <div className="category">Light Art</div>
                <div className="price">$178.00</div>
              </div>
            </div>
            {/* Feature Card (Right) */}
            <div className="feature-card">
              <div className="feature-card-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80')` }}></div>
              <div className="feature-card-overlay"></div>
              <div className="feature-card-content">
                <span className="feature-tag">Artist Spotlight</span>
                <h3>Visionary Art Collection</h3>
                <p>Hand-painted originals and limited prints from the world&apos;s leading psychedelic artists.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4. FESTIVAL RADAR ============ */}
      <section className="festival-section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">Festival Radar</h2>
            <a href="#" className="view-all view-all-light">View Calendar <span>&rarr;</span></a>
          </div>
          <div className="festival-grid reveal">
            <div className="festival-card">
              <div className="festival-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80" alt="Boom Festival" />
                <div className="date-badge">AUG 12-18</div>
              </div>
              <div className="festival-card-info">
                <h3>Boom Festival</h3>
                <div className="location">📍 Idanha-a-Nova, Portugal</div>
              </div>
            </div>
            <div className="festival-card">
              <div className="festival-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80" alt="Ozora Festival" />
                <div className="date-badge">JUL 28 - AUG 3</div>
              </div>
              <div className="festival-card-info">
                <h3>Ozora Festival</h3>
                <div className="location">📍 Ozora, Hungary</div>
              </div>
            </div>
            <div className="festival-card">
              <div className="festival-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80" alt="Universo Paralello" />
                <div className="date-badge">DEC 27 - JAN 3</div>
              </div>
              <div className="festival-card-info">
                <h3>Universo Paralello</h3>
                <div className="location">📍 Bahia, Brazil</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. ESSENTIAL ACCESSORIES ============ */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">Essential Accessories</h2>
            <a href="#" className="view-all">View All <span>&rarr;</span></a>
          </div>
          <div className="bento-grid feature-right reveal">
            {/* Small Cards (Left side) */}
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80" alt="Kaleidoscope Glasses" />
              </div>
              <div className="product-card-info">
                <h4>Kaleidoscope Glasses</h4>
                <div className="category">Eyewear</div>
                <div className="price">$32.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80" alt="Festival Sneakers" />
              </div>
              <div className="product-card-info">
                <h4>UV Glow Sneakers</h4>
                <div className="category">Footwear</div>
                <div className="price">$95.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" alt="Backpack" />
              </div>
              <div className="product-card-info">
                <h4>Hydration Backpack</h4>
                <div className="category">Bags</div>
                <div className="price">$58.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=400&q=80" alt="Crystal Pendant" />
              </div>
              <div className="product-card-info">
                <h4>Amethyst Pendant</h4>
                <div className="category">Jewelry</div>
                <div className="price">$48.00</div>
              </div>
            </div>
            {/* Feature Card (Right) */}
            <div className="feature-card">
              <div className="feature-card-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80')` }}></div>
              <div className="feature-card-overlay"></div>
              <div className="feature-card-content">
                <span className="feature-tag">Must Have</span>
                <h3>Festival Essentials Kit</h3>
                <p>Everything you need for the perfect festival experience — curated by seasoned ravers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_web.png" alt="Psy.Market" className="footer-logo-img" />
              <p className="footer-desc">
                The global marketplace for the psytrance and festival community.
                Connecting creators, artists, and ravers worldwide.
              </p>
            </div>
            <div className="footer-col">
              <h4>Shop</h4>
              <ul>
                <li><a href="#">Music Gear</a></li>
                <li><a href="#">Apparel</a></li>
                <li><a href="#">Art &amp; Decor</a></li>
                <li><a href="#">Festival Tickets</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Selling Guide</a></li>
                <li><a href="#">Community Guidelines</a></li>
                <li><a href="#">Return Policy</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Stay in the Loop</h4>
              <p className="footer-desc" style={{ marginBottom: '16px' }}>
                Get the latest drops, festival updates, and community news.
              </p>
              <div className="newsletter-input">
                <input type="email" placeholder="Your email address" />
                <button>Join</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Psy.Market. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
