import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/constants";

export function SiteFooter() {
  return (
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
              {NAV_CATEGORIES.slice(0, 4).map((cat) => (
                <li key={cat.href}>
                  <Link href={cat.href}>{cat.label}</Link>
                </li>
              ))}
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
            <p className="footer-desc" style={{ marginBottom: "16px" }}>
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
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
